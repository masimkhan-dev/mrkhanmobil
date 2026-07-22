import { createFileRoute, Link } from "@tanstack/react-router";
import { services, deviceServices, repairServices, getIconComponent } from "@/config/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SectionHeader } from "./index";
import { business } from "@/config/business";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listPublicServices } from "@/lib/cms.functions";

const servicesQuery = {
  queryKey: ["public-services"],
  queryFn: () => listPublicServices(),
  staleTime: 1000 * 60 * 10, // Cache services list for 10 minutes
};

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => {
    const siteUrl = process.env.SITE_URL || business.url;
    return {
      meta: [
        { title: `Repair Services | ${business.name}` },
        {
          name: "description",
          content:
            "Complete list of mobile phone repair services — iPhone, Samsung, Google Pixel, Android — battery, screen, charging port, water damage and more. 12-month warranty on every repair.",
        },
        { property: "og:title", content: "All Repair Services" },
        { property: "og:description", content: "Every device, every issue — one warranty." },
        { property: "og:url", content: `${siteUrl}/services` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/services` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.title,
              url: `${siteUrl}/services/${s.slug}`,
            })),
          }),
        },
      ],
    };
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { data: dbServices } = useSuspenseQuery(servicesQuery);

  const rawItems = dbServices && dbServices.length > 0 ? dbServices : services;
  const items = rawItems.map((s: any) => {
    if (typeof s.icon === "string") {
      return {
        ...s,
        priceFrom: s.price_from || s.priceFrom,
        icon: getIconComponent(s.icon),
      };
    }
    return s;
  });

  const deviceServicesList = items.filter((s: any) => s.category === "device");
  const repairServicesList = items.filter((s: any) => s.category === "repair");

  return (
    <>
      <section className="py-16 md:py-24 border-b border-border bg-surface">
        <div className="container-x text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">Services</p>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-6xl tracking-tight">
            Every repair, one warranty.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose your device or the problem you're having — get a fixed price in seconds.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x">
          <SectionHeader eyebrow="By device" title="Device repair" />
          <Grid items={deviceServicesList} />
        </div>
      </section>

      <section className="py-16 bg-surface border-y border-border">
        <div className="container-x">
          <SectionHeader eyebrow="By problem" title="Repair types" />
          <Grid items={repairServicesList} />
        </div>
      </section>
    </>
  );
}

function Grid({ items }: { items: any[] }) {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="group">
          <Card className="h-full hover:border-accent/40 hover:shadow-[var(--shadow-elegant)] transition-all">
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-lg bg-accent/10 text-accent grid place-items-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.short}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  From <span className="text-foreground font-semibold">{s.priceFrom}</span> ·{" "}
                  {s.turnaround}
                </span>
                <ChevronRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
