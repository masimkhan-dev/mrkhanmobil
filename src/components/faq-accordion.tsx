import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicFaqs } from "@/lib/cms.functions";

export const faqs = [
  {
    q: "How long does a phone repair take?",
    a: "Most screen and battery repairs are completed in 30 minutes to 2 hours. Complex board-level work can take 24–72 hours — we'll confirm timings after our free diagnostic.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes — every repair comes with a genuine 12-month warranty on parts and labour. If the issue returns within the warranty period, we fix it free of charge.",
  },
  {
    q: "Do you use genuine parts?",
    a: "We use OEM-grade and genuine-grade parts on every repair. For premium iPhone and Samsung repairs we also offer certified original panels on request.",
  },
  {
    q: "Will I lose my data?",
    a: "No. We never wipe your device without written permission. For software repairs and data recovery, we take every precaution to protect your data.",
  },
  {
    q: "Do you repair water-damaged devices?",
    a: "Yes — we run an ultrasonic clean and component-level diagnostic on water-damaged devices. If we can't recover it, you don't pay.",
  },
  {
    q: "How does mail-in repair work?",
    a: "Book online, pack your device, and our courier collects. We diagnose, quote, repair, quality-check and return it — fully insured, with free UK return delivery.",
  },
  {
    q: "Do you come to my home?",
    a: "Yes — our engineers cover Liverpool, Manchester, Wirral, St Helens, Southport and Bootle for on-site repair. Book a home visit and we come to you.",
  },
  {
    q: "What if you can't fix my device?",
    a: "No fix, no fee. If we can't repair your device, you pay nothing (unless you've asked us to source a specific part in advance).",
  },
];

export function FaqAccordion({ limit }: { limit?: number }) {
  const getFaqs = useServerFn(listPublicFaqs);
  const { data: dbFaqs } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: () => getFaqs(),
    staleTime: 1000 * 60 * 10, // Cache FAQs for 10 minutes
  });

  const rawItems = dbFaqs && dbFaqs.length > 0 ? dbFaqs : faqs;
  const mapped = rawItems.map(
    (f: { question?: string; q?: string; answer?: string; a?: string }) => ({
      q: f.question || f.q || "",
      a: f.answer || f.a || "",
    }),
  );
  const items = limit ? mapped.slice(0, limit) : mapped;

  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {items.map((f, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="rounded-xl border border-border/80 bg-card px-5 py-1.5 transition-colors"
        >
          <AccordionTrigger className="text-left text-base font-medium py-3.5 hover:no-underline text-foreground">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
