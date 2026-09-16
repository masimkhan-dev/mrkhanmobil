import { createFileRoute } from "@tanstack/react-router";
import { FaqAccordion, faqs } from "@/components/faq-accordion";
import { business } from "@/config/business";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Phone Repair FAQs | MR. KHAN Liverpool" },
      {
        name: "description",
        content:
          "Common questions about mobile phone repairs in Liverpool. Turnaround times, 12-month warranty, replacement parts, data safety, and pricing answered.",
      },
      { property: "og:title", content: "Phone Repair FAQs | MR. KHAN Liverpool" },
      {
        property: "og:description",
        content:
          "Common questions about mobile phone repairs in Liverpool. Turnaround times, 12-month warranty, replacement parts, data safety, and pricing answered.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/faq" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/faq" }],
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
              name: "FAQs",
              item: "https://www.mrkhanmobiles.co.uk/faq",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Support</p>
        <h1 className="mt-2 font-display font-bold text-4xl md:text-5xl">
          Frequently Asked Questions — Phone Repair Liverpool
        </h1>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </div>
    </section>
  ),
});
