import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Phone, ChevronDown, Wrench, Home as HomeIcon, Package, Smartphone, Battery, Droplets, Zap, Camera, ShieldCheck } from "lucide-react";
import { business, telLink } from "@/config/business";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-border/80 shadow-sm transition-all">
      <div className="container-x flex h-20 items-center justify-between gap-4">
        {/* Brand Logo - Bigger UK High-Street Style */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-red-500 rounded-xl p-1 shrink-0">
          <div className="h-[40px] md:h-[52px] w-auto overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <img
              src={logoImg}
              alt="MR. KHAN Repair Experts Logo"
              width={52}
              height={52}
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-xl md:text-2xl tracking-tight text-foreground flex items-center gap-1.5">
              {business.name}
              <span className="inline-block h-2 w-2 rounded-full bg-[#E21B23] animate-pulse" />
            </div>
            <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Liverpool's Trusted Repair Experts
            </div>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-bold" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all outline-none">
              <span>Services</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 p-2 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
                Popular Brand Repairs
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "iphone-repair" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Smartphone className="h-4 w-4 text-[#E21B23]" />
                  <span className="font-medium text-xs">iPhone Repair</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "samsung-repair" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-xs">Samsung Repair</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/$slug" params={{ slug: "google-pixel-repair" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-xs">Google Pixel Repair</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services" className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Smartphone className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-xs">Huawei / Xiaomi / Oppo / OnePlus</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild>
                <Link to="/services" className="font-bold text-[#E21B23] hover:text-red-700 cursor-pointer rounded-xl text-xs py-2">
                  View All Services →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Repair Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all outline-none">
              <span>Repair Options</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
                Ways To Repair
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/services" params={{}} search={{ service: "walk_in" }} className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Wrench className="h-4 w-4 text-[#E21B23]" />
                  <div>
                    <div className="font-semibold text-xs">Walk-in Repair</div>
                    <div className="text-[10px] text-muted-foreground">London Road Workshop (30-60 mins)</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/home-repair" className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <HomeIcon className="h-4 w-4 text-[#E21B23]" />
                  <div>
                    <div className="font-semibold text-xs">Home Repair</div>
                    <div className="text-[10px] text-muted-foreground">Doorstep callout across Liverpool</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/mail-in" className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2">
                  <Package className="h-4 w-4 text-[#E21B23]" />
                  <div>
                    <div className="font-semibold text-xs">Mail-in Repair</div>
                    <div className="text-[10px] text-muted-foreground">Post to us with free return shipping</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild>
                <Link to="/track" className="flex items-center gap-2.5 cursor-pointer rounded-xl py-2 font-semibold text-xs text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Track Your Repair →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/locations"
            className="px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-bold" }}
          >
            Locations
          </Link>
          <Link
            to="/reviews"
            className="px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-bold" }}
          >
            Reviews
          </Link>
          <Link
            to="/contact"
            className="px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all"
            activeProps={{ className: "text-foreground bg-muted font-bold" }}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+447707733038"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-all shrink-0"
          >
            <Phone className="h-3.5 w-3.5 text-[#E21B23]" />
            07707 733038
          </a>

          {signedIn && (
            <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5 text-xs">
              <Link to="/admin">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Admin
              </Link>
            </Button>
          )}

          <a
            href="/book"
            className="bg-[#E21B23] text-white hover:bg-red-700 font-bold px-6 py-2.5 rounded-full text-xs animate-pulse-glow transition-all shadow-md shrink-0"
          >
            Book Repair
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full hover:bg-muted/80 flex items-center justify-center border border-border/80 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay Menu Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 inset-x-0 bottom-0 bg-background border-t border-border shadow-2xl z-50 p-6 lg:hidden flex flex-col justify-between overflow-y-auto"
            >
              <div className="flex flex-col gap-3 text-base font-semibold">
                {/* Phone Call Button at TOP of mobile menu */}
                <a
                  href="tel:+447707733038"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-input bg-muted/50 text-sm font-bold text-foreground hover:bg-muted min-h-[48px] shadow-xs"
                >
                  <Phone className="h-4 w-4 text-[#E21B23]" />
                  Call Us: 07707 733038
                </a>

                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-muted font-bold text-lg"
                  activeProps={{ className: "bg-muted font-bold text-[#E21B23]" }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>

                {/* Services Accordion */}
                <div className="border-y border-border/80 py-2">
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="w-full flex items-center justify-between py-2 px-4 rounded-xl font-bold text-lg text-left"
                  >
                    <span>Services</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {servicesOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-2 bg-muted/40 rounded-xl mt-1">
                      <Link
                        to="/services/$slug"
                        params={{ slug: "iphone-repair" }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        <Smartphone className="h-4 w-4 text-[#E21B23]" />
                        iPhone Repair
                      </Link>
                      <Link
                        to="/services/$slug"
                        params={{ slug: "samsung-repair" }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        Samsung Repair
                      </Link>
                      <Link
                        to="/services/$slug"
                        params={{ slug: "google-pixel-repair" }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        <Smartphone className="h-4 w-4 text-emerald-600" />
                        Google Pixel Repair
                      </Link>
                      <Link
                        to="/services"
                        onClick={() => setOpen(false)}
                        className="block text-xs font-bold text-[#E21B23] px-3 pt-1"
                      >
                        View All Services →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Repair Options Accordion */}
                <div className="border-b border-border/80 pb-2">
                  <button
                    onClick={() => setOptionsOpen(!optionsOpen)}
                    className="w-full flex items-center justify-between py-2 px-4 rounded-xl font-bold text-lg text-left"
                  >
                    <span>Repair Options</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${optionsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {optionsOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-2 bg-muted/40 rounded-xl mt-1">
                      <Link
                        to="/services"
                        search={{ service: "walk_in" }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        <Wrench className="h-4 w-4 text-[#E21B23]" />
                        Walk-in Repair
                      </Link>
                      <Link
                        to="/home-repair"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        <HomeIcon className="h-4 w-4 text-[#E21B23]" />
                        Home Repair
                      </Link>
                      <Link
                        to="/mail-in"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        <Package className="h-4 w-4 text-[#E21B23]" />
                        Mail-in Repair
                      </Link>
                      <Link
                        to="/track"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-bold text-emerald-600 hover:bg-muted"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Track Your Repair
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/locations"
                  onClick={() => setOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-muted text-lg"
                  activeProps={{ className: "bg-muted font-bold text-[#E21B23]" }}
                >
                  Locations
                </Link>
                <Link
                  to="/reviews"
                  onClick={() => setOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-muted text-lg"
                  activeProps={{ className: "bg-muted font-bold text-[#E21B23]" }}
                >
                  Reviews
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-muted text-lg"
                  activeProps={{ className: "bg-muted font-bold text-[#E21B23]" }}
                >
                  Contact
                </Link>
              </div>

              {/* "Book Repair" button at BOTTOM of mobile menu */}
              <div className="pt-4 border-t border-border mt-auto">
                <a
                  href="/book"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center bg-[#E21B23] text-white font-bold py-3.5 px-6 rounded-xl text-base animate-pulse-glow shadow-lg transition-all min-h-[52px]"
                >
                  Book Repair
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export function StickyMobileBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border/80 pb-safe">
      <div className="grid grid-cols-3 gap-2 p-2 px-3">
        <a
          href="tel:+447707733038"
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] active:scale-95 transition-transform"
        >
          <Phone className="h-4 w-4 text-red-500" /> Call
        </a>
        <a
          href="https://wa.me/447707733038?text=Hi%20MR.%20KHAN%2C%20I%27d%20like%20a%20quote"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold min-h-[44px] active:scale-95 transition-transform shadow-sm"
        >
          <span>💬 WhatsApp</span>
        </a>
        <a
          href="/book"
          className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-[#E21B23] text-white text-xs font-bold min-h-[44px] active:scale-95 transition-transform shadow-sm animate-pulse-glow"
        >
          <span>Book</span>
        </a>
      </div>
    </div>
  );
}
