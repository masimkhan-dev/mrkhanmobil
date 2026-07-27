import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { business } from "@/config/business";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: `6-Month Warranty | ${business.name}` },
      {
        name: "description",
        content:
          "Every repair backed by our 6-month warranty on parts and labour. Here's what's covered — and what isn't.",
      },
      { property: "og:url", content: "/warranty" },
    ],
    links: [{ rel: "canonical", href: "/warranty" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <ShieldCheck className="h-12 w-12 text-accent" />
        <h1 className="mt-4 font-display font-bold text-4xl md:text-6xl">6-month warranty</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every repair carried out by {business.name} is covered for 6 months, parts and labour.
        </p>

        <h2 className="mt-14 font-display font-semibold text-2xl">What's covered</h2>
        <ul className="mt-4 space-y-3">
          {[
            "Failure of the replaced part (screen, battery, charging port, etc.)",
            "Poor workmanship of the specific repair",
            "Manufacturer defects on parts we've fitted",
            "Free re-repair for any warranty-covered fault",
          ].map((p) => (
            <li key={p} className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> <span>{p}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-display font-semibold text-2xl">What's not covered</h2>
        <ul className="mt-4 space-y-3 text-muted-foreground">
          <li>• Accidental damage after repair (drops, cracks, water)</li>
          <li>• Software issues unrelated to the repair</li>
          <li>• Repairs performed by another party after ours</li>
          <li>• Existing/latent motherboard issues not caused by our work</li>
        </ul>

        <p className="mt-12 text-sm text-muted-foreground">
          To claim your warranty, contact us with your booking reference and proof of repair. We'll
          re-book you in — no charge.
        </p>
      </div>
    </section>
  ),
});
