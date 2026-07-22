import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { services } from "@/config/services";
import { blogPosts } from "./blog";
import { listPublishedCities } from "@/lib/city-pages.functions";

const BASE_URL = process.env.SITE_URL || "https://mrkhan-repairs.co.uk";

const staticPaths = [
  "/",
  "/services",
  "/locations",
  "/home-repair",
  "/mail-in",
  "/warranty",
  "/reviews",
  "/gallery",
  "/blog",
  "/faq",
  "/about",
  "/contact",
  "/track",
  "/book",
  "/privacy",
  "/terms",
  "/cookies",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const cities = await listPublishedCities().catch(() => []);
        const entries: { path: string; priority?: string; changefreq?: string }[] = [
          ...staticPaths.map((p) => ({
            path: p,
            changefreq: "weekly",
            priority: p === "/" ? "1.0" : "0.7",
          })),
          ...services.map((s) => ({
            path: `/services/${s.slug}`,
            changefreq: "monthly",
            priority: "0.8",
          })),
          ...cities.map((c) => ({
            path: `/repairs/${c.slug}`,
            changefreq: "monthly",
            priority: "0.8",
          })),
          ...blogPosts.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          })),
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
