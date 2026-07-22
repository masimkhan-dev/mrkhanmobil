import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";
import { Home, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/home-repair")({
  head: () => ({
    meta: [
      { title: `Home Repair Service | ${business.name}` },
      {
        name: "description",
        content:
          "We come to you. Same-day mobile phone repair at your home across Liverpool, Manchester, Wirral and the North West.",
      },
      { property: "og:url", content: "/home-repair" },
    ],
    links: [{ rel: "canonical", href: "/home-repair" }],
  }),
  component: () => (
    <>
      <section className="py-16 md:py-24 bg-surface border-b border-border">
        <div className="container-x max-w-3xl">
          <Home className="h-10 w-10 text-accent" />
          <h1 className="mt-4 font-display font-bold text-4xl md:text-6xl">Home repair service</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Book a certified engineer to come to your home. Repairs done at your kitchen table — no
            time off work, no travel.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full">
            <Link to="/book">Book a home visit</Link>
          </Button>
        </div>
      </section>
      <section className="py-16">
        <div className="container-x grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Feature
            icon={MapPin}
            title="North West coverage"
            desc="Liverpool, Manchester, Wirral, Bootle, St Helens, Southport, Birkenhead."
          />
          <Feature
            icon={Clock}
            title="Same-day slots"
            desc="Book by 12 noon for same-day; otherwise next-day guaranteed."
          />
          <Feature
            icon={ShieldCheck}
            title="12-month warranty"
            desc="Same warranty as our in-store repairs — fully covered."
          />
        </div>
      </section>
    </>
  ),
});

function Feature({ icon: Icon, title, desc }: { icon: typeof Home; title: string; desc: string }) {
  return (
    <div className="text-center p-6">
      <Icon className="h-8 w-8 text-accent mx-auto" />
      <h3 className="mt-4 font-display font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
