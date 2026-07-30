import { useEffect, useState } from "react";
import { business } from "@/config/business";
import { Phone, MapPin, Clock, Shield } from "lucide-react";

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const day = now.toLocaleDateString("en-GB", { weekday: "long" });
    const hour = now.getHours();
    const todayObj = business.hours.find((h) => h.day === day);
    if (!todayObj || !todayObj.hours) {
      setIsOpen(false);
      return;
    }
    const [openStr, closeStr] = todayObj.hours.split(" – ");
    if (!openStr || !closeStr) {
      setIsOpen(false);
      return;
    }
    const parseHour = (str: string) => {
      const parts = str.trim().split(" ");
      const [h] = parts[0].split(":");
      let parsed = parseInt(h, 10);
      if (parts[1] === "PM" && parsed !== 12) parsed += 12;
      if (parts[1] === "AM" && parsed === 12) parsed = 0;
      return parsed;
    };
    const openHour = parseHour(openStr);
    const closeHour = parseHour(closeStr);
    setIsOpen(hour >= openHour && hour < closeHour);
  }, []);

  return (
    <>
      {/* Desktop Announcement Bar */}
      <div className="w-full bg-[#171717] text-white text-[13px] py-2 px-4 hidden md:block border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:+447707733038"
              className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-red-500" />
              07707 733038
            </a>
            <span className="flex items-center gap-1.5 text-white/80">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              83-85 London Road, Liverpool
            </span>
            <span className="flex items-center gap-1.5 text-white/80 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {isOpen ? "🟢 Open Now" : "🔴 Closed"}
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              12-Month Warranty
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://wa.me/447707733038"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              WhatsApp
            </a>
            <a
              href={business.social.facebook || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Facebook
            </a>
            <a
              href={business.social.instagram || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Announcement Bar (Slimmer: 28px height) */}
      <div className="w-full bg-[#171717] text-white text-[11px] h-[28px] px-3 flex items-center justify-between md:hidden border-b border-white/10">
        <a
          href="tel:+447707733038"
          className="flex items-center gap-1 hover:text-red-400 transition-colors font-medium"
        >
          <Phone className="w-3 h-3 text-red-500" />
          07707 733038
        </a>
        <span className="flex items-center gap-1 text-white/90 font-medium">
          <Clock className="w-3 h-3" />
          {isOpen ? "🟢 Open Now" : "🔴 Closed"}
        </span>
      </div>
    </>
  );
}
