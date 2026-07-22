import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateBookingRef } from "./booking-ref";
import { rateLimitMiddleware } from "./rate-limit";

const BookingSchema = z.object({
  device_type: z.string().min(1).max(50),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  problem: z.string().min(1).max(500),
  service_type: z.enum(["walk_in", "home_visit", "mail_in"]),
  preferred_date: z.string().optional().nullable(),
  preferred_time: z.string().max(20).optional().nullable(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email().max(255),
  phone: z.string().min(6).max(30),
  address: z.string().max(300).optional().nullable(),
  postcode: z.string().max(20).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([rateLimitMiddleware])
  .inputValidator((data: unknown) => BookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Retry ref collision (extremely unlikely with 32^6 space).
    for (let attempt = 0; attempt < 5; attempt++) {
      const booking_ref = generateBookingRef();
      const { data: row, error } = await supabaseAdmin
        .from("bookings")
        .insert({ ...data, booking_ref })
        .select("booking_ref")
        .single();
      if (!error && row) return { booking_ref: row.booking_ref };
      if (error && !String(error.message).includes("bookings_booking_ref_key")) {
        throw new Error(error.message);
      }
    }
    throw new Error("Could not generate a unique reference, please try again.");
  });

const LeadSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(255).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  device: z.string().max(80).optional().or(z.literal("")),
  source: z.string().max(40).default("contact_form"),
});

export const createLead = createServerFn({ method: "POST" })
  .middleware([rateLimitMiddleware])
  .inputValidator((data: unknown) => LeadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      message: data.message || null,
      device: data.device || null,
      source: data.source,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const NewsletterSchema = z.object({ email: z.string().email().max(255) });
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .middleware([rateLimitMiddleware])
  .inputValidator((data: unknown) => NewsletterSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    if (error && !String(error.message).includes("duplicate key")) throw new Error(error.message);
    return { ok: true };
  });

const TrackSchema = z.object({ ref: z.string().min(4).max(20) });
export const trackBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => TrackSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("bookings")
      .select(
        "booking_ref, device_type, brand, model, service_type, status, status_note, updated_at, created_at",
      )
      .eq("booking_ref", data.ref.toUpperCase())
      .maybeSingle();
    if (!row) return { found: false as const };
    return { found: true as const, booking: row };
  });
