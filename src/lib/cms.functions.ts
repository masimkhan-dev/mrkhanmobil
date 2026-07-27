import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, assertAdminOrStaff } from "@/lib/auth-guards";
import { z } from "zod";

/** Keys that are safe to expose to the public (unauthenticated) client. */
const PUBLIC_SETTINGS_KEYS = [
  "business",
  "address",
  "hours",
  "social",
  "branding",
  "announcement",
] as const;

/* ============ SITE SETTINGS ============ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SettingsMap = Record<string, any>;

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("key, value")
    .in("key", PUBLIC_SETTINGS_KEYS);
  const out: SettingsMap = {};
  for (const row of data ?? []) out[row.key] = row.value;
  return out;
});

export const getAllSiteSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await context.supabase.from("site_settings").select("*").order("key");
    if (error) throw new Error(error.message);
    const out: Record<string, any> = {};
    for (const row of data ?? []) out[row.key] = row.value;
    return out;
  });

const SiteSettingKeySchema = z.enum([
  "business",
  "address",
  "hours",
  "social",
  "branding",
  "analytics",
  "announcement",
]);

const BusinessSettingSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().max(100).optional().nullable(),
  legalName: z.string().max(150).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  phoneRaw: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  whatsappNumber: z.string().max(30).optional().nullable(),
  email: z.string().email().max(255).or(z.literal("")).optional().nullable(),
});

const AddressSettingSchema = z.object({
  line1: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  postcode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
});

const HoursSettingSchema = z.array(
  z.object({
    day: z.string().max(30),
    hours: z.string().max(60),
  }),
);

const SocialSettingSchema = z.object({
  facebook: z.string().url().max(255).or(z.literal("")).optional().nullable(),
  instagram: z.string().url().max(255).or(z.literal("")).optional().nullable(),
  tiktok: z.string().url().max(255).or(z.literal("")).optional().nullable(),
  google: z.string().url().max(255).or(z.literal("")).optional().nullable(),
});

const BrandingSettingSchema = z.object({
  logoUrl: z.string().url().max(500).or(z.literal("")).optional().nullable(),
  faviconUrl: z.string().url().max(500).or(z.literal("")).optional().nullable(),
  primaryColor: z.string().max(30).optional().nullable(),
});

const AnalyticsSettingSchema = z.object({
  gaId: z.string().max(30).optional().nullable(),
  gtmId: z.string().max(30).optional().nullable(),
  metaPixelId: z.string().max(30).optional().nullable(),
});

const AnnouncementSettingSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().max(200).optional().nullable(),
  link: z.string().max(200).optional().nullable(),
});

export const updateSiteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const input = z
      .object({
        key: SiteSettingKeySchema,
        value: z.any(),
      })
      .parse(d);

    switch (input.key) {
      case "business":
        BusinessSettingSchema.parse(input.value);
        break;
      case "address":
        AddressSettingSchema.parse(input.value);
        break;
      case "hours":
        HoursSettingSchema.parse(input.value);
        break;
      case "social":
        SocialSettingSchema.parse(input.value);
        break;
      case "branding":
        BrandingSettingSchema.parse(input.value);
        break;
      case "analytics":
        AnalyticsSettingSchema.parse(input.value);
        break;
      case "announcement":
        AnnouncementSettingSchema.parse(input.value);
        break;
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert(
        { key: data.key, value: data.value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ public list helpers (typed per-table) ============ */

/* ============ SERVICES ============ */
export const listPublicServices = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const listAdminServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { data, error } = await context.supabase.from("services").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ServiceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  short: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(30).default("repair"),
  icon: z.string().max(40).default("Smartphone"),
  price_from: z.string().max(30).optional().nullable(),
  turnaround: z.string().max(60).optional().nullable(),
  estimated_time: z.string().max(60).optional().nullable(),
  warranty: z.string().max(60).optional().nullable(),
  features: z.array(z.string()).default([]),
  sort_order: z.number().int().default(100),
  active: z.boolean().default(true),
});
export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ServiceSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("services").update(payload).eq("id", data.id)
      : await context.supabase.from("services").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ DEVICE BRANDS + MODELS ============ */
export const listBrandsWithModels = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: brands } = await supabaseAdmin
    .from("device_brands")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  const { data: models } = await supabaseAdmin
    .from("device_models")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return (brands ?? []).map((b: any) => ({
    ...b,
    models: (models ?? []).filter((m: any) => m.brand_id === b.id),
  }));
});

export const listAllBrandsWithModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { data: brands } = await context.supabase
      .from("device_brands")
      .select("*")
      .order("sort_order");
    const { data: models } = await context.supabase
      .from("device_models")
      .select("*")
      .order("sort_order");
    return (brands ?? []).map((b: any) => ({
      ...b,
      models: (models ?? []).filter((m: any) => m.brand_id === b.id),
    }));
  });

const BrandSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(60),
  name: z.string().min(1).max(80),
  sort_order: z.number().int().default(100),
  active: z.boolean().default(true),
});
export const upsertBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BrandSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("device_brands").update(payload).eq("id", data.id)
      : await context.supabase.from("device_brands").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("device_brands").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const ModelSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  sort_order: z.number().int().default(100),
  active: z.boolean().default(true),
});
export const upsertModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ModelSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("device_models").update(payload).eq("id", data.id)
      : await context.supabase.from("device_models").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("device_models").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ REPAIR TYPES ============ */
export const listPublicRepairTypes = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("repair_types")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const listAdminRepairTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { data, error } = await context.supabase
      .from("repair_types")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const RepairTypeSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(60),
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(40).default("Wrench"),
  sort_order: z.number().int().default(100),
  active: z.boolean().default(true),
});
export const upsertRepairType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RepairTypeSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("repair_types").update(payload).eq("id", data.id)
      : await context.supabase.from("repair_types").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteRepairType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("repair_types").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ REVIEWS ============ */
export const listPublicReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const listAdminReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { data, error } = await context.supabase.from("reviews").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ReviewSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().min(1).max(80),
  rating: z.number().int().min(1).max(5).default(5),
  body: z.string().min(1).max(1000),
  location: z.string().max(80).optional().nullable(),
  source: z.string().max(30).default("google"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(100),
});
export const upsertReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReviewSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("reviews").update(payload).eq("id", data.id)
      : await context.supabase.from("reviews").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ FAQs ============ */
export const listPublicFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const listAdminFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { data, error } = await context.supabase.from("faqs").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const FaqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
  category: z.string().max(40).default("general"),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});
export const upsertFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FaqSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("faqs").update(payload).eq("id", data.id)
      : await context.supabase.from("faqs").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ GALLERY ============ */
export const listPublicGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const listAdminGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrStaff(context.userId);
    const { data, error } = await context.supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const GallerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url().max(500),
  category: z.string().max(40).default("general"),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});
export const upsertGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GallerySchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await context.supabase.from("gallery_items").update(payload).eq("id", data.id)
      : await context.supabase.from("gallery_items").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await context.supabase.from("gallery_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ BOOKING TIMELINE ============ */
export const listBookingEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ booking_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdminOrStaff(context.userId);
    const { data: events, error } = await context.supabase
      .from("booking_events")
      .select("*")
      .eq("booking_id", data.booking_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return events ?? [];
  });
