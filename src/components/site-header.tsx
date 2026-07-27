import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle, Star, ShieldCheck } from "lucide-react";
import { business, telLink, whatsappLink } from "@/config/business";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";

// Used by the mobile nav drawer (desktop nav renders its own items inline).
const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/locations", label: "Locations" },
  { to: "/home-repair", label: "Home Service" },
  { to: "/mail-in", label: "Mail-in" },
  { to: "/track", label: "Track Repair" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Wrench, Home as HomeIcon, Package, Smartphone, Battery, Droplets, Zap, Camera, ShieldCheck as ShieldIcon } from "lucide-react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-[#050B1A] text-slate-300 text-xs py-2 border-b border-slate-800/80 hidden sm:block">
        <div className="container-x flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium text-[11px] tracking-wide">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> 6-Month Warranty</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> 4.9 Google Rating ({business.rating.reviews}+ reviews)</span>
            <span>📍 83, 85 London Rd, Liverpool</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={telLink()} className="hover:text-white font-semibold flex items-center gap-1.5 text-xs">
              <Phone className="h-3 w-3 text-blue-400" /> {business.phone}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-emerald-300 text-emerald-400 font-semibold flex items-center gap-1 text-xs">
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/90 border-b border-border/80 transition-all">
        <div className="container-x flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-1">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/80 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200 shadow-sm shrink-0">
              <img
                src={logoImg}
                alt="MR. KHAN Repair Experts Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5">
                {business.name}
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Repair Experts
              </div>
            </div>
          </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-semibold" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all outline-none">
              <span>Services</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
                Popular Repairs
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "screen-repair" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl">
                  <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Screen Replacement</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "battery-replacement" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl">
                  <Battery className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Battery Replacement</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "water-damage" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl">
                  <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Water Damage Diagnostics</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "charging-port" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Charging Port Fix</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "rear-camera" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl">
                  <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Camera Repair</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild>
                <Link to="/services" className="font-semibold text-blue-600 dark:text-blue-400 cursor-pointer rounded-xl">
                  Browse All Services →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Service Ways Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all outline-none">
              <span>Repair Options</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 p-2 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
                How We Serve You
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/book" search={{ service: "walk_in" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-semibold text-xs">Walk-in Repair</div>
                    <div className="text-[10px] text-muted-foreground">Liverpool Workshop (30-60 mins)</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/home-repair" className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <HomeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-semibold text-xs">Home Service</div>
                    <div className="text-[10px] text-muted-foreground">Doorstep or office repair</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/mail-in" className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-semibold text-xs">Mail-in Repair</div>
                    <div className="text-[10px] text-muted-foreground">Free return UK courier</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/locations"
            className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-semibold" }}
          >
            Locations
          </Link>
          <Link
            to="/track"
            className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-semibold" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Track Repair
            </span>
          </Link>
          <Link
            to="/reviews"
            className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-semibold" }}
          >
            Reviews
          </Link>
          <Link
            to="/contact"
            className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-semibold" }}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={telLink()}
            className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <Phone className="h-3.5 w-3.5 text-accent" />
            {business.phone}
          </a>

          {signedIn && (
            <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5 text-xs">
              <Link to="/admin">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Admin
              </Link>
            </Button>
          )}

          <Button
            asChild
            size="sm"
            className="rounded-full px-5 py-2 font-semibold shadow-sm transition-all duration-200"
          >
            <Link to="/book">Book Repair</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full hover:bg-muted/80 flex items-center justify-center border border-border/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 md:top-20 inset-x-0 bg-background border-b border-border shadow-2xl z-50 p-6 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="flex flex-col gap-4 text-base font-medium">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-4 rounded-xl hover:bg-muted font-semibold"
                  activeProps={{ className: "bg-muted font-bold text-indigo-600 dark:text-indigo-400" }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>

                <div className="py-2 border-y border-border/60 my-1 space-y-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold px-4">
                    Popular Services
                  </div>
                  <Link
                    to="/services/$slug"
                    params={{ slug: "screen-repair" }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-muted text-sm font-medium"
                  >
                    <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Screen Replacement
                  </Link>
                  <Link
                    to="/services/$slug"
                    params={{ slug: "battery-replacement" }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-muted text-sm font-medium"
                  >
                    <Battery className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Battery Replacement
                  </Link>
                  <Link
                    to="/services"
                    onClick={() => setOpen(false)}
                    className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 px-4 pt-1"
                  >
                    View All Services →
                  </Link>
                </div>

                <Link
                  to="/locations"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-4 rounded-xl hover:bg-muted"
                  activeProps={{ className: "bg-muted font-bold text-indigo-600 dark:text-indigo-400" }}
                >
                  Locations
                </Link>
                <Link
                  to="/track"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-4 rounded-xl hover:bg-muted flex items-center justify-between"
                  activeProps={{ className: "bg-muted font-bold text-indigo-600 dark:text-indigo-400" }}
                >
                  <span>Track Repair Status</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </Link>
                <Link
                  to="/reviews"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-4 rounded-xl hover:bg-muted"
                  activeProps={{ className: "bg-muted font-bold text-indigo-600 dark:text-indigo-400" }}
                >
                  Customer Reviews
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-4 rounded-xl hover:bg-muted"
                  activeProps={{ className: "bg-muted font-bold text-indigo-600 dark:text-indigo-400" }}
                >
                  Contact & Support
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
                <Button asChild size="lg" className="w-full justify-center rounded-xl font-bold min-h-[48px]">
                  <Link to="/book" onClick={() => setOpen(false)}>
                    Book a Repair Now
                  </Link>
                </Button>
                <a
                  href={telLink()}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted min-h-[44px]"
                >
                  <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Call Us: {business.phone}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}

export function StickyMobileBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border/80 pb-safe">
      <div className="grid grid-cols-3 gap-2 p-2 px-3">
        <a
          href={telLink()}
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] active:scale-95 transition-transform"
        >
          <Phone className="h-4 w-4 text-indigo-400" /> Call
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold min-h-[44px] active:scale-95 transition-transform shadow-sm"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <Link
          to="/book"
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold min-h-[44px] active:scale-95 transition-transform shadow-sm"
        >
          <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> Book
        </Link>
      </div>
    </div>
  );
}
