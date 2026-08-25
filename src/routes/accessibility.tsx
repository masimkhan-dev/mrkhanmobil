import { createFileRoute } from "@tanstack/react-router";
import { business, telLink } from "@/config/business";
import { Phone, Mail, MapPin, Accessibility } from "lucide-react";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement | MR. KHAN Mobile Repair" },
      {
        name: "description",
        content:
          "MR. KHAN is committed to making our website accessible to everyone. WCAG 2.1 AA standards. Contact us for assistance.",
      },
      { property: "og:title", content: "Accessibility Statement | MR. KHAN Mobile Repair" },
      {
        property: "og:description",
        content:
          "MR. KHAN is committed to making our website accessible to everyone. WCAG 2.1 AA standards. Contact us for assistance.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/accessibility" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/accessibility" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <div className="p-3 rounded-2xl bg-accent/10 text-accent w-fit mb-4">
          <Accessibility className="h-8 w-8" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl">Accessibility Statement</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {business.name} is committed to ensuring digital accessibility for people with
          disabilities. We are continually improving the user experience for everyone and applying
          the relevant accessibility standards.
        </p>

        <div className="prose prose-lg mt-10 max-w-none text-foreground/85 space-y-6">
          <div>
            <h2 className="font-display font-semibold text-2xl text-foreground mb-3">
              Conformance Status
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We aim to meet the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**
              standards. These guidelines define how to make web content more accessible for people
              with disabilities, more user-friendly for everyone, and compatible with assistive
              technologies.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-2xl text-foreground mb-3">
              Measures We Take
            </h2>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
              <li>Include accessibility features in our design and development workflow</li>
              <li>Provide keyboard navigation support and visible focus indicators</li>
              <li>Ensure clear contrast ratios between text and background elements</li>
              <li>Include alternative text descriptions for key images</li>
              <li>Maintain semantic HTML markup for screen reader tools</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-4">
            <h2 className="font-display font-semibold text-xl text-foreground">
              Feedback & Contact
            </h2>
            <p className="text-sm text-muted-foreground">
              If you experience any difficulty accessing information on our website or require
              content in an alternative format (such as large print or audio), please get in touch:
            </p>

            <ul className="space-y-3 text-sm font-medium">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href={telLink()} className="hover:underline text-foreground">
                  {business.phone}
                </a>
              </li>
              {business.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a href={`mailto:${business.email}`} className="hover:underline text-foreground">
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

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Alternative formats of our content are available on request.
              <br />
              Last updated: July 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  ),
});
