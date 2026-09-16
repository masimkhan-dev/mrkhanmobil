import { createServerFn } from "@tanstack/react-start";
import type { Json } from "@/integrations/supabase/types";

const PUBLIC_SETTINGS_KEYS = [
  "business",
  "address",
  "hours",
  "social",
  "branding",
  "announcement",
] as const;

/** Public business settings used by the website shell. Financial settings stay private. */
export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("key, value")
    .in("key", PUBLIC_SETTINGS_KEYS);
  if (error) throw new Error(error.message);
  const settings: Record<string, Json> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return settings;
});

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

export const listPublicReviews = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("published", true)
      .order("sort_order");
    if (error || !data || data.length === 0) {
      const { REAL_GOOGLE_REVIEWS } = await import("@/config/reviews");
      return REAL_GOOGLE_REVIEWS;
    }
    return data;
  } catch {
    const { REAL_GOOGLE_REVIEWS } = await import("@/config/reviews");
    return REAL_GOOGLE_REVIEWS;
  }
});

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
