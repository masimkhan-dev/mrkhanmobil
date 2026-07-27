import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdminOrStaff, assertAdmin } from "@/lib/auth-guards";
import { z } from "zod";

// --- Role resolver -----------------------------------------------------------

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);

    const roles = (data ?? []).map((r: { role: string }) => r.role);
    const hasAccess = roles.includes("admin") || roles.includes("staff");

    return {
      userId: context.userId,
      email: context.claims.email ?? null,
      roles,
      isAdmin: roles.includes("admin"),
      isStaff: roles.includes("staff"),
      // hasAccess is false when the user exists in auth but has no role yet.
      // The admin UI shows an "Awaiting Approval" screen in this case.
      hasAccess,
    };
  });

// --- Dashboard stats ---------------------------------------------------------

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();

    const [allB, todayB, weekB, pendingB, inProgressB, readyB, completedB, cancelledB, leads, subs] =
      await Promise.all([
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", startOfDay),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", startOfWeek),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).in("status", ["diagnosing", "waiting_parts", "repair_started"]),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "ready_for_collection"),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).in("status", ["completed", "delivered"]),
        supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
        supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);

    return {
      bookings: {
        total: allB.count ?? 0,
        today: todayB.count ?? 0,
        week: weekB.count ?? 0,
        pending: pendingB.count ?? 0,
        inProgress: inProgressB.count ?? 0,
        ready: readyB.count ?? 0,
        completed: completedB.count ?? 0,
        cancelled: cancelledB.count ?? 0,
      },
      leads: leads.count ?? 0,
      subscribers: subs.count ?? 0,
    };
  });

// --- Bookings ----------------------------------------------------------------

/**
 * List columns projected for the bookings table view.
 * Full booking detail (notes, address, etc.) is fetched separately via
 * getBookingById when the admin opens the detail sheet.
 * This keeps list payload small and avoids transmitting unnecessary PII.
 */
const BOOKING_LIST_COLUMNS =
  "id, booking_ref, first_name, last_name, phone, email, brand, model, problem, service_type, status, status_note, created_at, updated_at";

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(BOOKING_LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBookingById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdminOrStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const UpdateBookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "pending",
    "diagnosing",
    "waiting_parts",
    "repair_started",
    "ready_for_collection",
    "completed",
    "delivered",
    "cancelled",
  ]),
  status_note: z.string().max(1000).optional().nullable(),
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateBookingSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdminOrStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: data.status,
        status_note: data.status_note ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("booking_events").insert({
      booking_id: data.id,
      status: data.status,
      note: data.status_note ?? null,
      author_id: context.userId,
      author_email: context.claims.email ?? null,
    });
    return { ok: true };
  });

// --- Leads -------------------------------------------------------------------

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const DeleteLeadSchema = z.object({ id: z.string().uuid() });
export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteLeadSchema.parse(d))
  .handler(async ({ context, data }) => {
    // Delete is admin-only; staff can view but not permanently delete leads.
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Newsletter subscribers --------------------------------------------------

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Subscriber list is admin-only PII.
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
