import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Wrench, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telLink } from "@/config/business";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

export function StickyConversionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      // Appear past hero section (approx 450px down)
      const shouldShow = window.scrollY > 450;
      setVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed z-40 pointer-events-none top-20 right-4 sm:top-24 sm:right-6 left-auto hidden sm:block"
        >
          {/* Persistent Floating Pill */}
          <div className="pointer-events-auto bg-[#050B1A]/95 backdrop-blur-md border border-white/10 rounded-2xl p-2 pl-4 shadow-xl flex items-center gap-3 text-white">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-white">Ready to fix?</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="rounded-xl h-8 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"
              >
                <a href={telLink()}>
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                  Call Now
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-xl h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
              >
                <Link
                  to="/book"
                  onClick={() => trackFunnelEvent("book_click", { location: "sticky_bar_desktop" })}
                >
                  <Wrench className="h-3.5 w-3.5 mr-1.5" />
                  Book Repair
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
