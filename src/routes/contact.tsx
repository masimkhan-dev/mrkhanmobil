import { createFileRoute } from "@tanstack/react-router";
import { business, telLink, whatsappLink } from "@/config/business";
import { QuoteForm } from "@/components/quote-form";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact Us | ${business.name}` },
      {
        name: "description",
        content: `Contact ${business.name} — call, WhatsApp, email or drop in. UK-wide mail-in repair, same-day service in the North West.`,
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Get in touch
          </p>
          <h1 className="mt-2 font-display font-bold text-4xl md:text-5xl">We're here to help</h1>
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
        <div>
          <QuoteForm source="contact_page" />
        </div>
      </div>
    </section>
  ),
});
