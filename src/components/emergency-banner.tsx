import { telLink } from "@/config/business";
import { Zap, Phone, Clock } from "lucide-react";

export function EmergencyBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-2.5 px-4 text-xs sm:text-sm font-semibold shadow-inner">
      <div className="container-x flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-yellow-300" />
            <strong>Broken Today?</strong> Most Screen &amp; Battery Repairs Done Within 60 Minutes!
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1 text-blue-100 font-normal">
            <Clock className="h-3.5 w-3.5" /> Open Today Until 7:00 PM
          </span>
          <a
            href={telLink()}
            className="inline-flex items-center gap-1 bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors"
          >
            <Phone className="h-3 w-3" /> Call Now 07707 733038
          </a>
        </div>
      </div>
    </div>
  );
}
