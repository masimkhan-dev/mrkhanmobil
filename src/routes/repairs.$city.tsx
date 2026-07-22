import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { deviceServices } from "@/config/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MapPin, ShieldCheck, Clock, Award } from "lucide-react";
import { business } from "@/config/business";
import { QuoteForm } from "@/components/quote-form";
import { getCityBySlug, type CityPage } from "@/lib/city-pages.functions";

const cityQuery = (slug: string) => ({
  queryKey: ["city-page", slug],
  queryFn: () => getCityBySlug({ data: { slug } }),
  staleTime: 1000 * 60 * 10, // Cache city page details for 10 minutes
});

export const Route = createFileRoute("/repairs/$city")({
  loader: async ({ params, context }) => {
    const c = await context.queryClient.ensureQueryData(cityQuery(params.city));
    if (!c) throw notFound();
    return c as CityPage;
  },
  head: ({ loaderData, params }) => {
    const siteUrl = process.env.SITE_URL || "https://mrkhan-repairs.co.uk";
    return {
      meta: loaderData
        ? [
            {
              title:
                loaderData.meta_title || `Phone Repair in ${loaderData.name} | ${business.name}`,
            },
            {
              name: "description",
              content:
                loaderData.meta_description ||
                `${loaderData.intro} Same-day iPhone, Samsung & Android repair in ${loaderData.name} with a 12-month warranty.`,
            },
            {
              property: "og:title",
              content: loaderData.meta_title || `Repairs in ${loaderData.name}`,
            },
            {
              property: "og:description",
              content: loaderData.meta_description || loaderData.intro,
            },
            { property: "og:url", content: `${siteUrl}/repairs/${params.city}` },
          ]
        : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
      links: [{ rel: "canonical", href: `${siteUrl}/repairs/${params.city}` }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: `${business.name} — ${loaderData.name}`,
                areaServed: loaderData.name,
                telephone: business.phone,
              }),
            },
          ]
        : [],
    };
  },
  component: CityPageView,
  notFoundComponent: () => <div className="py-24 text-center">Location not found</div>,
});

function CityPageView() {
  const { city } = Route.useParams();
  const { data: c } = useSuspenseQuery(cityQuery(city));
  const router = useRouter();
  if (!c) {
    router.invalidate();
    return null;
  }
  return (
    <>
      <section className="py-16 md:py-24 border-b border-border bg-surface">
        <div className="container-x max-w-4xl">
          <div className="inline-flex items-center gap-1.5 text-sm text-accent">
            <MapPin className="h-4 w-4" /> {c.name}
          </div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-6xl tracking-tight">
            {c.h1 || `Phone repair in ${c.name}`}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{c.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/book">Book a repair</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/home-repair">Home visit in {c.name}</Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> 12-mo warranty
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" /> Same-day
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" /> No fix, no fee
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            {c.body && (
              <div className="prose prose-neutral max-w-none mb-10 whitespace-pre-line text-foreground/90">
                {c.body}
              </div>
            )}
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Popular repairs in {c.name}
            </h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {deviceServices.slice(0, 6).map((s) => (
                <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
                  <Card className="hover:border-accent/40 transition">
                    <CardContent className="p-5 flex items-center gap-3">
                      <s.icon className="h-5 w-5 text-accent" />
                      <div>
                        <div className="font-semibold text-sm">{s.title}</div>
                        <div className="text-xs text-muted-foreground">From {s.priceFrom}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <h2 className="mt-14 font-display font-bold text-2xl md:text-3xl">
              Why customers in {c.name} choose us
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                `Local team covering the ${c.postcodes} postcodes`,
                "Walk-in, on-site home visit, or free courier collection",
                "Fixed-price quote before any repair",
                "12-month warranty on parts and labour",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <QuoteForm source={`city:${c.slug}`} />
          </aside>
        </div>
      </section>
    </>
  );
}
