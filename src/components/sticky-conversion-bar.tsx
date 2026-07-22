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
          className="fixed z-40 pointer-events-none inset-x-0 bottom-0 sm:bottom-auto sm:top-24 sm:right-6 sm:left-auto"
        >
          {/* Mobile Bottom Floating Bar */}
          <div className="sm:hidden pointer-events-auto w-full bg-card/95 backdrop-blur-md border-t border-border/80 p-3 px-4 shadow-2xl flex items-center justify-between gap-2.5">
            <div className="leading-tight">
              <div className="text-xs font-bold text-foreground">Same-Day Repair</div>
              <div className="text-[10px] text-muted-foreground">12-Month Warranty</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full h-9 px-3 text-xs font-semibold"
              >
                <a href={telLink()}>
                  <Phone className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                  Call
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                <Link
                  to="/book"
                  onClick={() => trackFunnelEvent("book_click", { location: "sticky_bar_mobile" })}
                >
                  Book Repair
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop Top-Right Persistent Floating Pill */}
          <div className="hidden sm:flex pointer-events-auto bg-card/95 backdrop-blur-md border border-border/80 rounded-full p-2 pl-4 shadow-xl items-center gap-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-foreground">Ready to fix?</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="rounded-full h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <a href={telLink()}>
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                  Call Now
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
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
