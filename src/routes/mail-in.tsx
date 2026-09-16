import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Truck, Wrench, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";

export const Route = createFileRoute("/mail-in")({
  head: () => {
    const siteUrl = process.env.SITE_URL || business.url;
    return {
      meta: [
        { title: "UK Mail-In Mobile Phone Repair | Tracked Courier | MR KHAN" },
        {
          name: "description",
          content:
            "Post your phone to MR KHAN Liverpool for expert repair. Free return courier delivery, fully insured and tracked end-to-end across the UK with a 12-month warranty.",
        },
        { property: "og:title", content: "UK Mail-In Mobile Phone Repair | MR KHAN" },
        {
          property: "og:description",
          content:
            "Tracked & insured mail-in mobile repair service across the UK with a 12-month warranty.",
        },
        { property: "og:url", content: `${siteUrl}/mail-in` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/mail-in` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
              {
                "@type": "ListItem",
                position: 2,
                name: "Mail-in Repair",
                item: `${siteUrl}/mail-in`,
              },
            ],
          }),
        },
      ],
    };
  },
  component: () => (
    <>
      <section className="py-16 md:py-24 bg-surface border-b border-border">
        <div className="container-x max-w-3xl">
          <Package className="h-10 w-10 text-accent" />
          <h1 className="mt-4 font-display font-bold text-4xl md:text-6xl">
            UK Mail-In Mobile Phone Repair
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Anywhere in the UK. Free tracked &amp; insured return delivery on every mail-in repair.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full">
            <Link to="/contact">Contact us about mail-in repair</Link>
          </Button>
        </div>
      </section>
      <section className="py-20">
        <div className="container-x max-w-4xl">
          <h2 className="text-center font-display font-bold text-2xl md:text-3xl mb-12 text-[#111318]">
            How our mail-in repair works
          </h2>
          <ol className="grid gap-8 md:grid-cols-2">
            {[
              {
                n: "01",
                icon: Package,
                title: "Book online",
                d: "Choose your device and describe the issue. We email your booking pack.",
              },
              {
                n: "02",
                icon: Truck,
                title: "Post it to us",
                d: "Pack securely and post — or arrange a Royal Mail collection.",
              },
              {
                n: "03",
                icon: Wrench,
                title: "We repair",
                d: "Fixed price, free diagnostic. We contact you before starting.",
              },
              {
                n: "04",
                icon: ShieldCheck,
                title: "Quality check & return",
                d: "Tested, cleaned and returned free of charge — tracked & insured.",
              },
            ].map((s) => (
              <li key={s.n} className="border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-display font-bold text-muted-foreground/40">
                    {s.n}
                  </div>
                  <s.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-xl">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  ),
});
