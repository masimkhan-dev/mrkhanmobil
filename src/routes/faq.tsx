import { createFileRoute } from "@tanstack/react-router";
import { FaqAccordion, faqs } from "@/components/faq-accordion";
import { business } from "@/config/business";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ | ${business.name}` },
      {
        name: "description",
        content:
          "Common questions on turnaround, warranty, parts, data safety, mail-in and home repair.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
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
          Frequently asked questions
        </h1>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </div>
    </section>
  ),
});
