import { createFileRoute, Link } from "@tanstack/react-router";
import { business, telLink } from "@/config/business";
import {
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy | MR. KHAN Mobile Repair" },
      {
        name: "description",
        content:
          "Our returns and refund policy for repair services and retail accessories. 14-day returns for faulty goods. Warranty repairs covered.",
      },
      { property: "og:title", content: "Returns & Refund Policy | MR. KHAN Mobile Repair" },
      {
        property: "og:description",
        content:
          "Our returns and refund policy for repair services and retail accessories. 14-day returns for faulty goods. Warranty repairs covered.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/refunds" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/refunds" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <div className="p-3 rounded-2xl bg-accent/10 text-accent w-fit mb-4">
          <RefreshCw className="h-8 w-8" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl">Returns & Refund Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 2026 · {business.legalName}
        </p>

        <div className="mt-10 space-y-10 text-foreground/90 leading-relaxed text-sm sm:text-base">
          <p>
            At <strong>{business.name}</strong>, customer satisfaction and transparent quality are
            our top priorities. This policy explains our returns and refund terms for repair
            services and retail accessories under UK Consumer Rights law.
          </p>

          {/* 1. Repair Service Refund & Warranty Claims */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" /> 1. Repair Services & Warranty Refunds
            </h2>
            <p className="text-muted-foreground">
              Every repair is backed by our <strong>12-Month Parts & Labour Warranty</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Free Re-Repair:</strong> If a fitted part develops a technical fault within
                12 months, we will re-repair or replace the component free of charge.
              </li>
              <li>
                <strong>Refund Condition:</strong> If we are unable to resolve a defective
                replacement part under warranty after diagnostic attempt, a full or partial refund
                for the repair charge will be issued.
              </li>
              <li>
                <strong>No Fix, No Fee:</strong> If we diagnose a standard hardware fault as
                unrepairable upon initial inspection, no repair fee is charged.
              </li>
              <li>
                <strong>Exclusions:</strong> Refunds or free re-repairs are not provided for
                accidental drops, physical screen cracks, liquid ingress occurring after repair
                completion, or unauthorized third-party tampering.
              </li>
            </ul>
          </div>

          {/* 2. Retail Accessories Return Policy */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" /> 2. Retail Accessories & Products
            </h2>
            <p className="text-muted-foreground">
              For phone cases, chargers, screen protectors, cables, and electronic accessories
              purchased in-store or online:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>14-Day Return Window:</strong> Unopened, unused retail items in original
                packaging can be returned within 14 days of purchase with receipt for an exchange or
                full refund.
              </li>
              <li>
                <strong>Faulty Products:</strong> If an accessory is defective upon purchase, bring
                it back within 30 days for an immediate replacement or full refund.
              </li>
              <li>
                <strong>Exclusions:</strong> Fitted screen protectors, opened hygiene-sensitive
                items, or clearance accessories damaged through misuse are non-refundable.
              </li>
            </ul>
          </div>

          {/* 3. How to Request a Return or Refund */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" /> 3. Return Procedure
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
              <li>
                Bring your device or accessory to our Liverpool workshop with your booking reference
                receipt.
              </li>
              <li>
                For mail-in repairs, contact customer support prior to posting back a warranty claim
                device.
              </li>
              <li>
                Approved refunds are issued to the original payment method (Cash or Card) within 3–5
                business days.
              </li>
            </ol>
          </div>

          {/* Contact Details */}
          <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
            <h3 className="font-display font-semibold text-lg">Need Assistance With a Return?</h3>
            <p className="text-sm text-muted-foreground">
              Our customer service team is ready to assist with any warranty or return enquiry:
            </p>
            <ul className="space-y-2.5 text-sm font-medium text-foreground pt-1">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href={telLink()} className="hover:underline">
                  {business.phone}
                </a>
              </li>
              {business.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a href={`mailto:${business.email}`} className="hover:underline">
                    {business.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {business.address.line1}, {business.address.city}, {business.address.postcode}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  ),
});
