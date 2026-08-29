import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, MessageCircle, Phone, Wrench } from "lucide-react";
import { services, getIconComponent, buildRepairQuoteMessage } from "@/config/services";
import { listPublicServices } from "@/lib/cms.functions";
import { business, telLink, whatsappLink } from "@/config/business";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import type React from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

const servicesQuery = queryOptions({
  queryKey: ["public-services"],
  queryFn: () => listPublicServices(),
  staleTime: 1000 * 60 * 10,
});

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      {
        title: "Mobile Repair Services Liverpool | Screen, Battery, Water Damage | MR. KHAN",
      },
      {
        name: "description",
        content:
          "Full range of phone, tablet and laptop repairs in Liverpool. iPhone screen replacement, Samsung battery, charging port repair, water damage. 12-month warranty.",
      },
      {
        property: "og:title",
        content: "Mobile Repair Services Liverpool | MR. KHAN",
      },
      {
        property: "og:description",
        content:
          "Full range of phone, tablet and laptop repairs in Liverpool. iPhone screen replacement, Samsung battery, charging port repair. 12-month warranty.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/services" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Mobile Repair Services",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.title,
              description: s.short,
              url: `https://www.mrkhanmobiles.co.uk/services/${s.slug}`,
            },
          })),
        }),
      },
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
          ],
        }),
      },
    ],
  }),
  component: ServicesPage,
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface RenderedService {
  slug: string;
  title: string;
  short: string;
  priceFrom: string | number;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
  description?: string;
  turnaround?: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ServicesPage() {
  const { data: dbServices } = useSuspenseQuery(servicesQuery);

  const rawItems = dbServices && dbServices.length > 0 ? dbServices : services;
  const items: RenderedService[] = rawItems.map((raw) => {
    const s = raw as Record<string, unknown>;
    const iconVal = s.icon;
    const resolvedIcon =
      typeof iconVal === "string"
        ? getIconComponent(iconVal)
        : (iconVal as React.ComponentType<{ className?: string }>) || Wrench;

    return {
      slug: String(s.slug || ""),
      title: String(s.title || ""),
      short: String(s.short || s.description || ""),
      priceFrom: (s.price_from || s.priceFrom || "£25") as string | number,
      icon: resolvedIcon,
      category: String(s.category || "repair"),
      description: String(s.description || ""),
      turnaround: String(s.turnaround || "Same day"),
    };
  });

  const deviceList = items.filter((s) => s.category === "device");
  const repairList = items.filter((s) => s.category === "repair");

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#07101d] text-white py-16 sm:py-24 border-b border-white/10">
        <div className="container-x max-w-3xl text-center mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand mb-4">
            Our Services
          </p>
          <h1 className="font-display font-extrabold text-[2.4rem] sm:text-[3.2rem] tracking-tight text-white">
            Every repair, one warranty.
          </h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
            Choose your device or the problem — get a clear price before any work begins.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappLink("Hi MR. KHAN, I need a repair quote.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-[#25d366] text-white font-semibold text-base hover:bg-[#1da851] transition-colors min-h-[52px]"
            >
              <MessageCircle className="h-5 w-5" />
              Get a Quote on WhatsApp
            </a>
            <a
              href={telLink()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] border border-white/20 bg-white/10 text-white font-semibold text-base hover:bg-white/20 transition-colors min-h-[52px]"
            >
              <Phone className="h-5 w-5" />
              Call {business.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── By Device ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#f7f7f5]">
        <div className="container-x">
          <PageSectionHeader
            eyebrow="By Device"
            title="Device repair"
            description="Select your device brand to see all available repairs and pricing."
          />
          <ServiceGrid items={deviceList} />
        </div>
      </section>

      {/* ── By Problem ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#e3e5e8]">
        <div className="container-x">
          <PageSectionHeader
            eyebrow="By Problem"
            title="Repair types"
            description="Know what's wrong? Find the right repair service below."
          />
          <ServiceGrid items={repairList} />
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#07101d] text-white border-t border-white/10">
        <div className="container-x max-w-2xl text-center space-y-4">
          <h2 className="font-display font-extrabold text-[1.8rem] sm:text-[2.2rem] tracking-tight">
            Not sure which repair you need?
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Message or call us and we'll point you in the right direction — no obligation.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-[8px] bg-brand text-white font-semibold text-base hover:bg-brand-hover transition-colors min-h-[52px]"
            >
              Contact the Shop
            </Link>
            <a
              href={whatsappLink("Hi MR. KHAN, I'm not sure which repair I need.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-[#25d366] text-white font-semibold text-base hover:bg-[#1da851] transition-colors min-h-[52px]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Service Grid ──────────────────────────────────────────────────────────────

function ServiceGrid({ items }: { items: RenderedService[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => {
        const Icon = s.icon;
        const waMessage = buildRepairQuoteMessage({
          service: s.title,
          price: String(s.priceFrom),
        });
        const waQuoteLink = whatsappLink(waMessage);

        return (
          <div
            key={s.slug}
            className="group flex flex-col justify-between p-5 rounded-[14px] bg-white border border-[#e3e5e8] hover:border-brand/30 hover:shadow-sm transition-all"
          >
            <div>
              <Link to="/services/$slug" params={{ slug: s.slug }} className="flex flex-col flex-1">
                {/* Icon */}
                <div className="h-11 w-11 rounded-[10px] bg-[#f7f7f5] border border-[#e3e5e8] grid place-items-center mb-4 group-hover:bg-brand-subtle group-hover:border-brand/30 transition-colors">
                  <Icon className="h-5 w-5 text-[#5f6670] group-hover:text-brand transition-colors" />
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-[17px] text-[#111318] group-hover:text-brand transition-colors">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#5f6670] leading-snug">{s.short}</p>

                {/* Price Section */}
                <div className="mt-4 pt-3 border-t border-[#e3e5e8]">
                  <div className="text-[11px] uppercase tracking-wider text-[#5f6670] font-semibold">
                    Estimated Pricing
                  </div>
                  <div className="font-display font-extrabold text-[1.3rem] text-[#111318] mt-0.5">
                    {s.priceFrom}
                  </div>
                  <p className="mt-1 text-[11px] text-[#5f6670] leading-snug">
                    Final price depends on the device model, part option and condition. We’ll
                    confirm before repair.
                  </p>
                </div>
              </Link>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-[#e3e5e8] space-y-2">
              <a
                href={waQuoteLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get a ${s.title} quote on WhatsApp`}
                onClick={() =>
                  trackFunnelEvent("book_click", {
                    location: "services_page",
                    service: s.title,
                    price: s.priceFrom,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[8px] bg-[#25d366] text-white hover:bg-[#1da851] font-bold text-xs transition-colors min-h-[42px] shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Get Quote on WhatsApp &rarr;
              </a>

              <div className="text-center">
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="inline-flex items-center gap-1 text-xs text-[#5f6670] hover:text-brand font-medium py-1 transition-colors"
                >
                  View full details <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function PageSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-brand mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display font-extrabold text-[1.7rem] sm:text-[2.1rem] tracking-tight text-[#111318]">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-[15px] text-[#5f6670] leading-relaxed">{description}</p>
      )}
    </div>
  );
}
