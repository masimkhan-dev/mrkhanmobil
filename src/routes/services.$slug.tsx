import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getService, services, getIconComponent } from "@/config/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft, Clock, ShieldCheck, Tag } from "lucide-react";
import { business } from "@/config/business";
import { QuoteForm } from "@/components/quote-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listPublicServices } from "@/lib/cms.functions";

const servicesQuery = {
  queryKey: ["public-services"],
  queryFn: () => listPublicServices(),
  staleTime: 1000 * 60 * 10, // Cache services list for 10 minutes
};

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params, context }) => {
    const servicesData = await context.queryClient.ensureQueryData(servicesQuery);
    const dbService = servicesData?.find((s: any) => s.slug === params.slug);
    if (dbService) {
      return {
        ...dbService,
        priceFrom: dbService.price_from || "",
        category: dbService.category,
        icon:
          typeof dbService.icon === "string" ? getIconComponent(dbService.icon) : dbService.icon,
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
    const siteUrl = process.env.SITE_URL || business.url;
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.title} | ${business.name}` },
            {
              name: "description",
              content: `${loaderData.description || ""} From ${loaderData.priceFrom} · ${loaderData.turnaround || ""}. 12-month warranty.`,
            },
            { property: "og:title", content: `${loaderData.title} — ${business.name}` },
            { property: "og:description", content: loaderData.short || undefined },
            { property: "og:url", content: `${siteUrl}/services/${params.slug}` },
            { property: "og:type", content: "product" },
          ]
        : [],
      links: [{ rel: "canonical", href: `${siteUrl}/services/${params.slug}` }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                serviceType: loaderData.title,
                provider: { "@type": "LocalBusiness", name: business.name },
                areaServed: "United Kingdom",
                description: loaderData.description || undefined,
                offers: {
                  "@type": "Offer",
                  priceCurrency: "GBP",
                  price: (loaderData.priceFrom || "").replace("£", ""),
                },
              }),
            },
          ]
        : [],
    };
  },
  component: ServiceDetail,
  notFoundComponent: () => <div className="py-24 text-center">Service not found</div>,
});

function ServiceDetail() {
  const s = Route.useLoaderData();
  const { data: dbServices } = useSuspenseQuery(servicesQuery);
  if (!s) return null;
  return (
    <>
      <section className="py-16 md:py-20 border-b border-border bg-surface">
        <div className="container-x">
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" /> All services
          </Link>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="h-14 w-14 rounded-xl bg-accent text-accent-foreground grid place-items-center mb-6">
                <s.icon className="h-7 w-7" />
              </div>
              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">
                {s.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {s.description}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/book">Book this repair</Link>
              </Button>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl">
            <Stat icon={Tag} label="From" value={s.priceFrom} />
            <Stat icon={Clock} label="Turnaround" value={s.turnaround || ""} />
            <Stat icon={ShieldCheck} label="Warranty" value="12 months" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl">What's included</h2>
            <ul className="mt-6 space-y-3">
              {s.features.map((f: string) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-14 font-display font-bold text-2xl md:text-3xl">Related services</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {(() => {
                const rawItems = dbServices && dbServices.length > 0 ? dbServices : services;
                const items = rawItems.map((x: any) => {
                  if (typeof x.icon === "string") {
                    return {
                      ...x,
                      priceFrom: x.price_from || x.priceFrom,
                      icon: getIconComponent(x.icon),
                    };
                  }
                  return x;
                });
                return items
                  .filter((r: any) => r.slug !== s.slug)
                  .slice(0, 4)
                  .map((r) => (
                    <Link key={r.slug} to="/services/$slug" params={{ slug: r.slug }}>
                      <Card className="hover:border-accent/40 transition">
                        <CardContent className="p-5 flex items-center gap-3">
                          <r.icon className="h-5 w-5 text-accent" />
                          <div>
                            <div className="font-semibold text-sm">{r.title}</div>
                            <div className="text-xs text-muted-foreground">From {r.priceFrom}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ));
              })()}
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <QuoteForm source={`service:${s.slug}`} />
          </aside>
        </div>
      </section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <Icon className="h-4 w-4 text-accent" />
      <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display font-semibold">{value}</div>
    </div>
  );
}
