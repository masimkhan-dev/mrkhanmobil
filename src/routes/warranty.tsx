import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, Phone, Mail } from "lucide-react";
import { business, telLink } from "@/config/business";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "12-Month Repair Warranty | MR. KHAN Mobile Repair Liverpool" },
      {
        name: "description",
        content:
          "All repairs covered by our 12-month parts & labour warranty. Free re-repair if the same issue returns. Trusted phone repair in Liverpool.",
      },
      {
        property: "og:title",
        content: "12-Month Repair Warranty | MR. KHAN Mobile Repair Liverpool",
      },
      {
        property: "og:description",
        content:
          "All repairs covered by our 12-month parts & labour warranty. Free re-repair if the same issue returns. Trusted phone repair in Liverpool.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/warranty" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/warranty" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <ShieldCheck className="h-12 w-12 text-accent" />
        <h1 className="mt-4 font-display font-bold text-4xl md:text-6xl">12-month warranty</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every repair carried out by {business.name} is covered for 12 months, parts and labour.
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

        <div className="mt-12 p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
          <h3 className="font-display font-semibold text-lg">How to claim your warranty</h3>
          <p className="text-sm text-muted-foreground">
            To make a warranty claim, contact us with your booking reference and proof of repair.
            We'll inspect your device and re-repair it free of charge.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-sm font-semibold">
            <a
              href={telLink()}
              className="inline-flex items-center gap-1.5 text-accent hover:underline"
            >
              <Phone className="h-4 w-4" /> Call {business.phone}
            </a>
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="inline-flex items-center gap-1.5 text-accent hover:underline"
              >
                <Mail className="h-4 w-4" /> Email {business.email}
              </a>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          For full terms and conditions, please see our{" "}
          <Link to="/terms" className="text-accent underline hover:text-accent/80 font-medium">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </section>
  ),
});
