import { business } from "@/config/business";
import { Phone, MapPin, Navigation } from "lucide-react";

export function TopBar() {
  return (
    <>
      {/* Desktop info bar — Row 1 */}
      <div className="w-full bg-[#07101d] text-white text-[13px] hidden md:block border-b border-white/10">
        <div className="container-x flex items-center justify-between h-9">
          {/* Left: location info */}
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-white/80">
              <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
              Phone Repairs in Liverpool &middot; {business.address.line1}, {business.address.city}{" "}
              {business.address.postcode}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-5">
            <a
              href={`tel:${business.phoneRaw}`}
              className="flex items-center gap-1.5 font-semibold hover:text-brand-hover transition-colors"
              aria-label={`Call MR. KHAN on ${business.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-brand shrink-0" />
              Call {business.phone}
            </a>
            <a
              href={business.social.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
              aria-label="Get directions to MR. KHAN on Google Maps"
            >
              <Navigation className="w-3 h-3" />
              Get Directions
            </a>
            <span className="text-white/20 select-none">|</span>
            <a
              href={business.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="MR. KHAN on Facebook"
            >
              Facebook
            </a>
            <a
              href={business.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="MR. KHAN on Instagram"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Mobile info bar — slim strip */}
      <div className="w-full bg-[#07101d] text-white text-[11px] h-[26px] px-3 flex items-center justify-between md:hidden border-b border-white/10">
        <a
          href={`tel:${business.phoneRaw}`}
          className="flex items-center gap-1 font-semibold hover:text-brand-hover transition-colors"
          aria-label={`Call MR. KHAN on ${business.phone}`}
        >
          <Phone className="w-3 h-3 text-brand" />
          {business.phone}
        </a>
        <span className="flex items-center gap-1 text-white/70">
          <MapPin className="w-3 h-3 text-brand" />
          {business.address.line1}, {business.address.city}
        </span>
      </div>
    </>
  );
}
