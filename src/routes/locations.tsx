import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { business } from "@/config/business";
import { listPublishedCities } from "@/lib/city-pages.functions";

const citiesQuery = {
  queryKey: ["published-cities"],
  queryFn: () => listPublishedCities(),
  staleTime: 1000 * 60 * 10, // Cache locations for 10 minutes
};

export const Route = createFileRoute("/locations")({
  loader: ({ context }) => context.queryClient.ensureQueryData(citiesQuery),
  head: () => {
    return {
      meta: [
        { title: "Phone Repair Near Me Liverpool | MR. KHAN" },
        {
          name: "description",
          content:
            "Same-day phone repairs in Liverpool, Wirral, Southport & surrounding areas. Walk-ins welcome. 12-month warranty. Book online.",
        },
        { property: "og:title", content: "Phone Repair Near Me Liverpool | MR. KHAN" },
        {
          property: "og:description",
          content:
            "Same-day phone repairs in Liverpool, Wirral, Southport & surrounding areas. Walk-ins welcome. 12-month warranty. Book online.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/locations" },
      ],
      links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/locations" }],
    };
  },
  component: LocationsPage,
});

function LocationsPage() {
  const { data: cities } = useSuspenseQuery(citiesQuery);
  return (
    <>
      <section className="py-16 md:py-24 border-b border-border bg-surface">
        <div className="container-x text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">Locations</p>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-6xl">
            We repair across the North West
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Walk-in, home service or mail-in — trusted repairs where you need them.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link key={c.slug} to="/repairs/$city" params={{ city: c.slug }}>
              <Card className="h-full hover:border-accent/40 hover:shadow-[var(--shadow-elegant)] transition">
                <CardContent className="p-6">
                  <MapPin className="h-6 w-6 text-accent" />
                  <h3 className="mt-4 font-display font-semibold text-xl">Repairs in {c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.postcodes}</p>
                  <p className="text-sm mt-3 text-foreground/80">{c.intro}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
