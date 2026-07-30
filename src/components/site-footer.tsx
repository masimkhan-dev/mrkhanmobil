import { Link } from "@tanstack/react-router";
import { business, telLink, whatsappLink } from "@/config/business";
import { Phone, MessageCircle, MapPin, Clock, Navigation } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function SiteFooter() {
  const directionsUrl = business.social.google;

  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="container-x py-12 max-w-4xl mx-auto">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-11 w-11 rounded-xl overflow-hidden bg-white border border-white/20 flex items-center justify-center p-0.5 shadow-sm">
                <img
                  src={logoImg}
                  alt="MR. KHAN Repair Experts Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-display font-bold text-base leading-tight">
                  {business.name}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-semibold">
                  Repair Experts
                </div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/75 leading-relaxed">
              Professional phone repairs in Liverpool with a 12-month warranty.
            </p>
          </div>

          {/* Quick Contact & Hours */}
          <div className="space-y-3.5">
            <h3 className="text-xs uppercase tracking-wider text-primary-foreground/50 font-bold">
              Contact & Hours
            </h3>
            <ul className="space-y-2.5 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a
                  href={telLink()}
                  className="hover:text-primary-foreground font-medium transition"
                >
                  {business.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-accent shrink-0" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary-foreground font-medium transition"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-primary-foreground/80">
                  {business.hours.map((h) => (
                    <div key={h.day} className="flex justify-between gap-2">
                      <span className="font-medium text-primary-foreground/70">{h.day}:</span>
                      <span>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </li>
            </ul>
          </div>

          {/* Address & Directions */}
          <div className="space-y-3.5">
            <h3 className="text-xs uppercase tracking-wider text-primary-foreground/50 font-bold">
              Find Our Workshop
            </h3>
            <ul className="space-y-3.5 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <div>{business.address.line1}</div>
                  <div className="text-xs text-primary-foreground/70">
                    {business.address.city}, {business.address.postcode}
                  </div>
                  <div className="mt-1 text-[11px] text-accent font-medium">
                    📍 Co-located inside Liverpool Post Office
                  </div>
                </div>
              </li>
              <li>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition shadow-sm"
                >
                  <Navigation className="h-3 w-3" /> Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment & Trust Bar */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-wrap justify-between items-center gap-4 text-xs text-primary-foreground/70">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-primary-foreground">Accepted Payments:</span>
            <span className="px-2 py-1 rounded bg-white/10 text-[11px]">Apple Pay</span>
            <span className="px-2 py-1 rounded bg-white/10 text-[11px]">Google Pay</span>
            <span className="px-2 py-1 rounded bg-white/10 text-[11px]">Visa / Mastercard</span>
            <span className="px-2 py-1 rounded bg-white/10 text-[11px]">Cash</span>
          </div>
          <div className="text-xs text-primary-foreground/60">
            Liverpool Repair Workshop · 12-Month Warranty Included
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/60">
          <div>
            <div>
              © {new Date().getFullYear()} {business.legalName}. Registered in England & Wales. All
              rights reserved.
            </div>
            {(business.companyNumber || business.vatNumber || business.icoReference) && (
              <div className="text-[11px] text-primary-foreground/50 mt-1">
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
            <Link to="/privacy" className="hover:text-primary-foreground transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground transition">
              Terms & Conditions
            </Link>
            <Link to="/refunds" className="hover:text-primary-foreground transition">
              Returns & Refund Policy
            </Link>
            <Link to="/accessibility" className="hover:text-primary-foreground transition">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
