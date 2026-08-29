import { Link } from "@tanstack/react-router";
import { MessageCircle, ChevronRight } from "lucide-react";
import type { Service } from "@/config/services";
import { buildRepairQuoteMessage } from "@/config/services";
import { whatsappLink } from "@/config/business";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

interface ServiceCardProps {
  service: Service;
  selectedDevice?: string;
  className?: string;
}

export function ServiceCard({
  service,
  selectedDevice = "Apple iPhone",
  className = "",
}: ServiceCardProps) {
  const Icon = service.icon;
  const waMessage = buildRepairQuoteMessage({
    device: selectedDevice,
    service: service.title,
    price: service.priceFrom,
  });
  const waLink = whatsappLink(waMessage);

  return (
    <div
      className={`flex flex-col justify-between p-5 sm:p-6 rounded-[14px] bg-white border border-[#e3e5e8] hover:border-brand/40 hover:shadow-md transition-all ${className}`}
    >
      <div>
        {/* Icon & Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="h-11 w-11 rounded-[10px] bg-[#f7f7f5] border border-[#e3e5e8] grid place-items-center shrink-0">
            <Icon className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-[17px] text-[#111318] leading-snug">
              {service.title}
            </h3>
            <p className="text-xs text-[#5f6670] mt-0.5">{service.turnaround}</p>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-sm text-[#5f6670] leading-relaxed mb-4">{service.short}</p>

        {/* Price Section */}
        <div className="pt-3 pb-2 border-t border-[#e3e5e8]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#5f6670] font-semibold">
              Estimated Pricing
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              inc. VAT &amp; fitting
            </span>
          </div>
          <div className="font-display font-extrabold text-[1.4rem] text-[#111318] leading-tight mt-1">
            {service.priceFrom}
          </div>
          {/* Price-transparency Note */}
          <p className="mt-1 text-[11px] text-[#5f6670] leading-snug">
            Final price depends on device model and part choice — confirmed before repair.
          </p>
        </div>
      </div>

      {/* Actions: Get Quote on WhatsApp + Details link */}
      <div className="mt-4 pt-3 border-t border-[#e3e5e8] space-y-2">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get a ${service.title} quote on WhatsApp for ${selectedDevice}`}
          onClick={() =>
            trackFunnelEvent("book_click", {
              location: "repair_finder",
              device: selectedDevice,
              service: service.title,
              price: service.priceFrom,
            })
          }
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] active:opacity-95 transition-colors shadow-sm min-h-[46px]"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Get Quote on WhatsApp &rarr;
        </a>

        <div className="text-center">
          <Link
            to="/services/$slug"
            params={{ slug: service.slug }}
            className="inline-flex items-center gap-1 text-xs text-[#5f6670] hover:text-brand font-medium py-1 transition-colors"
          >
            View repair details <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
