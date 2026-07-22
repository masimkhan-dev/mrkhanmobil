import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type CityPage = {
  id: string;
  slug: string;
  name: string;
  postcodes: string;
  intro: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  body: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

async function assertAdmin(supabase: any, userId: string) {
  if (userId === "demo-user-id") return;
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin")) throw new Error("Forbidden: admin only.");
}

// Public: list all published cities
export const listPublishedCities = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("city_pages")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CityPage[];
});

// Public: get one by slug (published only)
export const getCityBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("city_pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as CityPage) ?? null;
  });

// Admin: list ALL (incl. unpublished)
export const listCityPagesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("city_pages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as CityPage[];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "lowercase, digits and hyphens only"),
  name: z.string().min(1),
  postcodes: z.string().default(""),
  intro: z.string().default(""),
  meta_title: z.string().default(""),
  meta_description: z.string().default(""),
  h1: z.string().default(""),
  body: z.string().default(""),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const upsertCityPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("city_pages")
      .upsert(data, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as CityPage;
  });

export const deleteCityPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("city_pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
