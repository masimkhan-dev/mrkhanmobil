import React from "react";
import { whatsappLink } from "@/config/business";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm shadow-xl hover:bg-[#20bd5a] hover:scale-105 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle className="h-5 w-5 fill-current text-white shrink-0 group-hover:rotate-12 transition-transform duration-200" />
      <span className="hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}
