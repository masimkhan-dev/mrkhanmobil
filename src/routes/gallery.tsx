import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";
import techImg from "@/assets/technician.jpg";
import devicesImg from "@/assets/devices.jpg";
import heroImg from "@/assets/heroimage.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Repair Gallery | MR. KHAN Liverpool" },
      {
        name: "description",
        content:
          "View photos from our mobile repair workshop in Liverpool. Real screen replacements, battery fittings, logic board repairs and water damage recoveries.",
      },
      { property: "og:title", content: "Repair Gallery | MR. KHAN Liverpool" },
      {
        property: "og:description",
        content:
          "View photos from our mobile repair workshop in Liverpool. Real screen replacements, battery fittings, logic board repairs and water damage recoveries.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/gallery" }],
    scripts: [
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
              name: "Gallery",
              item: "https://www.mrkhanmobiles.co.uk/gallery",
            },
          ],
        }),
      },
    ],
  }),
  component: () => {
    const items = [
      {
        src: heroImg,
        alt: "MR. KHAN repair shop counter and diagnostic area on London Road Liverpool",
        width: 800,
        height: 600,
      },
      {
        src: techImg,
        alt: "Technician performing precision motherboard inspection at repair bench",
        width: 800,
        height: 600,
      },
      {
        src: devicesImg,
        alt: "Repaired smartphones and devices with 12-month warranty",
        width: 800,
        height: 600,
      },
      {
        src: heroImg,
        alt: "Mobile phone repair station at 83-85 London Road Liverpool",
        width: 800,
        height: 600,
      },
      {
        src: techImg,
        alt: "Component-level micro-soldering and screen replacement in progress",
        width: 800,
        height: 600,
      },
      {
        src: devicesImg,
        alt: "Tested and warrantied repaired handsets ready for customer collection",
        width: 800,
        height: 600,
      },
    ];
    return (
      <section className="py-16 md:py-24">
        <div className="container-x">
          <h1 className="font-display font-bold text-4xl md:text-6xl">
            Phone Repair Workshop Gallery | Liverpool
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            A look inside our workshop at 83–85 London Road — real repairs, real results.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-border aspect-[4/3] bg-muted"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
});
