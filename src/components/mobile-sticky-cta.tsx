import { Phone, MessageCircle } from "lucide-react";
import { telLink, whatsappLink } from "@/config/business";

export function MobileStickyCTA() {
  const waLink = whatsappLink("Hi MR. KHAN, I'd like to book a repair.");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex h-16 pb-[env(safe-area-inset-bottom)] bg-white border-t border-[#e3e5e8] shadow-lg"
      role="navigation"
      aria-label="Quick contact"
    >
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 bg-[#25d366] text-white font-semibold text-sm active:opacity-90 transition-opacity min-h-[44px]"
        aria-label="Message MR. KHAN on WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>
      <a
        href={telLink()}
        className="flex-1 flex items-center justify-center gap-2 bg-brand text-white font-semibold text-sm active:bg-brand-active transition-colors min-h-[44px]"
        aria-label="Call MR. KHAN"
      >
        <Phone className="w-5 h-5 text-white" />
        Call Now
      </a>
    </div>
  );
}
