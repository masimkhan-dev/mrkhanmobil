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
    return {
      meta: [
        { title: "Phone Repair Services Liverpool | Screen, Battery & More | MR. KHAN" },
        {
          name: "description",
          content:
            "Expert screen, battery & charging port repairs in Liverpool. Transparent pricing after free check. 12-month warranty. Book online or WhatsApp.",
        },
        { property: "og:title", content: "Phone Repair Services Liverpool | Screen, Battery & More | MR. KHAN" },
        {
          property: "og:description",
          content:
            "Expert screen, battery & charging port repairs in Liverpool. Transparent pricing after free check. 12-month warranty. Book online or WhatsApp.",
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
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.title,
              url: `https://www.mrkhanmobiles.co.uk/services/${s.slug}`,
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much does phone screen repair cost in Liverpool?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Repair costs vary by device model and damage type. At MR. KHAN, we offer a free diagnosis and transparent quote before any work begins. Use our instant cost estimator or contact us on WhatsApp for a quick price.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer a warranty on phone repairs?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all repairs at MR. KHAN come with a 12-month warranty covering parts and labour. If the same issue reoccurs, we will fix it free of charge.",
                },
              },
              {
                "@type": "Question",
                name: "How long does a phone repair take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most screen and battery repairs are completed within 30 to 60 minutes. Complex issues may take longer. We offer same-day service for walk-in customers at our Liverpool workshop.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to book an appointment?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No appointment is needed for walk-in repairs. Simply visit us at 83-85 London Road, Liverpool. We are open 7 days a week. You can also book a home visit or mail-in repair via WhatsApp.",
                },
              },
              {
                "@type": "Question",
                name: "What phone brands do you repair?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We repair all major brands including iPhone, Samsung Galaxy, Google Pixel, Huawei, Xiaomi, Oppo, OnePlus, Honor, Sony, Nokia, and Motorola.",
                },
              },
              {
                "@type": "Question",
                name: "Is my data safe during repair?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We take data privacy seriously. Your personal data is never accessed or copied except when necessary to test repair functionality. We recommend backing up your device before repair as a precaution.",
                },
              },
            ],
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
