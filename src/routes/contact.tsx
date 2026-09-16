import { createFileRoute } from "@tanstack/react-router";
import { business, telLink, whatsappLink } from "@/config/business";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact MR. KHAN Mobile Repair | Liverpool" },
      {
        name: "description",
        content:
          "Visit our Liverpool workshop at 83-85 London Road or message us on WhatsApp. Open 7 days a week, 8am–9pm. Same-day repairs.",
      },
      { property: "og:title", content: "Contact MR. KHAN Mobile Repair | Liverpool" },
      {
        property: "og:description",
        content:
          "Visit our Liverpool workshop at 83-85 London Road or message us on WhatsApp. Open 7 days a week, 8am–9pm. Same-day repairs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/contact" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/contact" }],
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
              name: "Contact",
              item: "https://www.mrkhanmobiles.co.uk/contact",
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Get in touch
          </p>
          <h1 className="mt-2 font-display font-bold text-4xl md:text-5xl">
            Contact MR. KHAN — Phone Repair Liverpool
          </h1>
          <p className="mt-4 text-muted-foreground">
            Reach us however works best — we usually reply within the hour during business hours.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex gap-3">
              <Phone className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
                <a href={telLink()} className="font-semibold">
                  {business.phone}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  WhatsApp
                </div>
                <a href={whatsappLink()} className="font-semibold">
                  Message us
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <a href={`mailto:${business.email}`} className="font-semibold">
                  {business.email}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Visit</div>
                <div className="font-semibold">
                  {business.address.line1}, {business.address.city} {business.address.postcode}
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <Clock className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Hours</div>
                <div className="text-sm mt-1 space-y-0.5">
                  {business.hours.map((h) => (
                    <div key={h.day} className="flex gap-3">
                      <span className="w-24 text-muted-foreground">{h.day}</span>
                      <span>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  ),
});
