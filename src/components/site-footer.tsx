import { Link } from "@tanstack/react-router";
import { business, telLink, whatsappLink } from "@/config/business";
import { Phone, MessageCircle, MapPin, Mail, Navigation } from "lucide-react";
import logoImg from "@/assets/logo.webp";

const repairLinks = [
  { label: "iPhone Repair", slug: "iphone-repair" },
  { label: "Samsung Repair", slug: "samsung-repair" },
  { label: "Screen Replacement", slug: "screen-replacement" },
  { label: "Battery Replacement", slug: "battery-replacement" },
  { label: "Charging Port Repair", slug: "charging-port" },
] as const;

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Repair Warranty", to: "/warranty" },
  { label: "Locations", to: "/locations" },
  { label: "Call-Out / Home Visit", to: "/home-repair" },
  { label: "Mail-In Repair", to: "/mail-in" },
  { label: "Buy & Sell Phones", to: "/buy-sell" },
  { label: "Customer Reviews", to: "/reviews" },
  { label: "FAQs", to: "/faq" },
  { label: "Contact Us", to: "/contact" },
] as const;

export function SiteFooter() {
  const directionsUrl = business.social.google;

  return (
    <footer className="mt-0 border-t border-[#e3e5e8] bg-[#07101d] text-white" role="contentinfo">
      {/* Main footer grid */}
      <div className="container-x py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Business */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-5">
            {/* Logo */}
            <Link
              to="/"
              aria-label="MR. KHAN — return to homepage"
              className="inline-flex items-center group"
            >
              <img
                src={logoImg}
                alt="MR. KHAN Liverpool"
                width={240}
                height={64}
                className="h-14 sm:h-16 w-auto max-w-[240px] object-contain shrink-0 transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>

            {/* Legal name */}
            <p className="text-sm text-white/60 leading-relaxed">{business.legalName}</p>

            {/* Address */}
            <address className="not-italic space-y-1.5 text-sm text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <div>{business.address.line1}</div>
                  <div>
                    {business.address.city}, {business.address.postcode}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand shrink-0" />
                <a href={telLink()} className="hover:text-white transition-colors font-medium">
                  {business.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:text-white transition-colors">
                  {business.email}
                </a>
              </div>
            </address>

            {/* Directions */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors border border-white/10 min-h-[40px]"
            >
              <Navigation className="h-3.5 w-3.5" />
              Get Directions
            </a>
          </div>

          {/* Column 2: Repairs */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Repairs</p>
            <ul className="space-y-2.5">
              {repairLinks.map((l) => (
                <li key={l.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: l.slug }}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/services"
                  className="text-sm text-brand hover:text-white transition-colors font-semibold"
                >
                  All Repair Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Explore</p>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Contact</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={telLink()}
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label={`Call MR. KHAN on ${business.phone}`}
                >
                  <Phone className="h-4 w-4 text-brand shrink-0" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                  aria-label="Message MR. KHAN on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 text-[#25d366] shrink-0" />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-brand shrink-0" />
                  {business.email}
                </a>
              </li>
            </ul>

            {/* Opening hours */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2">
                Opening Hours
              </div>
              <div className="space-y-1 text-xs text-white/60">
                {business.hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-2">
                    <span className="text-white/50 w-20 shrink-0">{h.day}</span>
                    <span>{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment strip */}
      <div className="border-t border-white/10">
        <div className="container-x py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white/70">Accepted payments:</span>
            {["Apple Pay", "Google Pay", "Visa / Mastercard", "Cash"].map((p) => (
              <span
                key={p}
                className="px-2 py-1 rounded bg-white/8 border border-white/10 text-[11px]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <div>
            <div>
              © {new Date().getFullYear()} {business.legalName}. Registered in England &amp; Wales.
              All rights reserved.
            </div>
            {(business.companyNumber || business.vatNumber || business.icoReference) && (
              <div className="text-[11px] text-white/30 mt-1">
                {[
                  business.companyNumber && `Company No: ${business.companyNumber}`,
                  business.vatNumber && `VAT No: ${business.vatNumber}`,
                  business.icoReference && `ICO Ref: ${business.icoReference}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/refunds" className="hover:text-white transition-colors">
              Returns &amp; Refunds
            </Link>
            <Link to="/accessibility" className="hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
