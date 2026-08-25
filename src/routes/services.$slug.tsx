import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getService, services, getIconComponent, buildRepairQuoteMessage } from "@/config/services";
import { listPublicServices } from "@/lib/cms.functions";
import { business, telLink, whatsappLink } from "@/config/business";
import { useSuspenseQuery } from "@tanstack/react-query";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tag,
  Wrench,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const servicesQuery = {
  queryKey: ["public-services"],
  queryFn: () => listPublicServices(),
  staleTime: 1000 * 60 * 10,
};

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params, context }) => {
    const servicesData = await context.queryClient.ensureQueryData(servicesQuery);
    const dbService = servicesData?.find((service) => service.slug === params.slug);
    if (dbService) {
      return {
        ...dbService,
        priceFrom: dbService.price_from || "",
        category: dbService.category,
        icon:
          typeof dbService.icon === "string"
            ? getIconComponent(dbService.icon)
            : dbService.icon,
        features: Array.isArray(dbService.features)
          ? (dbService.features as string[])
          : typeof dbService.features === "string"
            ? (JSON.parse(dbService.features || "[]") as string[])
            : [],
      };
    }
    const s = getService(params.slug);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData, params }) => {
    const formattedSlug = params.slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const pageTitle = `${formattedSlug} Repair Liverpool | MR. KHAN`;
    const pageDescription = `${formattedSlug} repair in Liverpool. Clear advice before we begin. 12-month warranty. Visit our London Road shop or message us on WhatsApp.`;

    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: pageDescription },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: pageDescription },
        { property: "og:type", content: "website" },
        {
          property: "og:url",
          content: `https://www.mrkhanmobiles.co.uk/services/${params.slug}`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://www.mrkhanmobiles.co.uk/services/${params.slug}`,
        },
      ],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.mrkhanmobiles.co.uk/",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Services",
                    item: "https://www.mrkhanmobiles.co.uk/services",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: loaderData.title,
                    item: `https://www.mrkhanmobiles.co.uk/services/${params.slug}`,
                  },
                ],
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                serviceType: loaderData.title,
                provider: { "@type": "LocalBusiness", name: business.name },
                areaServed: "United Kingdom",
                description: loaderData.description || undefined,
              }),
            },
          ]
        : [],
    };
  },
  component: ServiceDetail,
  notFoundComponent: () => (
    <div className="py-24 text-center text-[#5f6670]">Service not found</div>
  ),
});

// ── Component ─────────────────────────────────────────────────────────────────

function ServiceDetail() {
  const s = Route.useLoaderData();
  const { data: dbServices } = useSuspenseQuery(servicesQuery);
  if (!s) return null;

  const Icon = (s.icon || Wrench) as React.ComponentType<{ className?: string }>;

  // Related services (exclude current, max 4)
  const allItems =
    dbServices && dbServices.length > 0
      ? dbServices.map((service) => ({
          ...service,
          priceFrom: service.price_from || "",
          icon: getIconComponent(service.icon || "smartphone"),
        }))
      : services;
  const related = allItems.filter((r) => r.slug !== s.slug).slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#07101d] text-white pt-14 pb-16 sm:pt-20 sm:pb-20 border-b border-white/10">
        <div className="container-x">
          {/* Breadcrumb */}
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            All services
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              {/* Icon */}
              <div className="h-14 w-14 rounded-[12px] bg-[#e21b23]/15 border border-[#e21b23]/30 grid place-items-center mb-6">
                <Icon className="h-7 w-7 text-[#e21b23]" />
              </div>
              {/* Title */}
              <h1 className="font-display font-extrabold text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] tracking-tight text-white leading-tight">
                {s.title}
              </h1>
              {/* Description */}
              {s.description && (
                <p className="mt-4 text-lg text-slate-300 max-w-2xl leading-relaxed">
                  {s.description}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch min-w-[220px]">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-[8px] bg-[#e21b23] text-white font-semibold text-sm hover:bg-[#c41018] transition-colors min-h-[52px]"
              >
                Contact Us About This Repair
              </Link>
              <a
                href={whatsappLink(
                  buildRepairQuoteMessage({
                    service: s.title,
                    price: String(s.priceFrom || "Price on assessment"),
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get a ${s.title} quote on WhatsApp`}
                onClick={() =>
                  trackFunnelEvent("book_click", {
                    location: "service_detail_hero",
                    service: s.title,
                    price: s.priceFrom,
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors min-h-[52px]"
              >
                <MessageCircle className="h-4 w-4" />
                Get Quote on WhatsApp &rarr;
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-10 max-w-xl">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Tag} label="Estimated Price" value={String(s.priceFrom || "Price on assessment")} />
              <StatCard icon={Clock} label="Turnaround" value={s.turnaround || "Same day"} />
              <StatCard icon={ShieldCheck} label="Warranty" value="12 months" />
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-snug">
              Final price depends on the device model, part option and condition. We’ll confirm before repair.
            </p>
          </div>
        </div>
      </section>

      {/* ── What's included ────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white border-b border-[#e3e5e8]">
        <div className="container-x max-w-4xl">
          <h2 className="font-display font-extrabold text-[1.7rem] sm:text-[2.1rem] text-[#111318] tracking-tight">
            What's included
          </h2>
          {s.features && s.features.length > 0 ? (
            <ul className="mt-7 grid sm:grid-cols-2 gap-3">
              {s.features.map((f: string) => (
                <li
                  key={f}
                  className="flex items-start gap-3 p-4 rounded-[12px] bg-[#f7f7f5] border border-[#e3e5e8]"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#e21b23] shrink-0 mt-0.5" />
                  <span className="text-[15px] text-[#111318] leading-snug">{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-[#5f6670]">
              Contact us for full details on what this repair includes.
            </p>
          )}
        </div>
      </section>

      {/* ── Contact strip ─────────────────────────────────────────────────── */}
      <section className="py-10 bg-[#f7f7f5] border-b border-[#e3e5e8]">
        <div className="container-x max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-[14px] bg-white border border-[#e3e5e8]">
            <div>
              <div className="font-display font-bold text-[18px] text-[#111318]">
                Ready to get this repaired?
              </div>
              <p className="text-sm text-[#5f6670] mt-1">
                Visit us at {business.address.line1}, {business.address.city} or contact us
                first.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <a
                href={telLink()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#e3e5e8] bg-white text-[#111318] font-semibold text-sm hover:bg-[#f7f7f5] transition-colors min-h-[48px]"
              >
                <Phone className="h-4 w-4 text-[#e21b23]" />
                {business.phone}
              </a>
              <a
                href={whatsappLink(
                  buildRepairQuoteMessage({
                    service: s.title,
                    price: String(s.priceFrom || "Price on assessment"),
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get a ${s.title} quote on WhatsApp`}
                onClick={() =>
                  trackFunnelEvent("book_click", {
                    location: "service_detail_banner",
                    service: s.title,
                    price: s.priceFrom,
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors min-h-[48px]"
              >
                <MessageCircle className="h-4 w-4" />
                Get Quote on WhatsApp &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related services ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-14 sm:py-20 bg-white">
          <div className="container-x max-w-4xl">
            <h2 className="font-display font-extrabold text-[1.7rem] sm:text-[2.1rem] text-[#111318] tracking-tight">
              Related services
            </h2>
            <div className="mt-7 grid sm:grid-cols-2 gap-4">
              {related.map((r) => {
                const RelIcon = r.icon as React.ComponentType<{ className?: string }>;
                return (
                  <Link
                    key={r.slug}
                    to="/services/$slug"
                    params={{ slug: r.slug }}
                    className="group flex items-center gap-4 p-4 rounded-[12px] border border-[#e3e5e8] bg-[#f7f7f5] hover:border-[#e21b23]/30 hover:bg-white transition-all"
                  >
                    <div className="h-10 w-10 rounded-[8px] bg-white border border-[#e3e5e8] grid place-items-center shrink-0 group-hover:bg-[#e21b23]/10 group-hover:border-[#e21b23]/20 transition-colors">
                      <RelIcon className="h-4.5 w-4.5 text-[#5f6670] group-hover:text-[#e21b23] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] text-[#111318]">{r.title}</div>
                      <div className="text-xs text-[#5f6670] mt-0.5">
                        From {r.priceFrom || "£25"}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#5f6670] group-hover:text-[#e21b23] shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-[12px] bg-white/10 border border-white/15 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-[#e21b23]" />
      <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        {label}
      </div>
      <div className="mt-0.5 font-display font-bold text-white text-[15px]">{value}</div>
    </div>
  );
}
