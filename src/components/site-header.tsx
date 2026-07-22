import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle, Star, ShieldCheck } from "lucide-react";
import { business, telLink, whatsappLink } from "@/config/business";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";

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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/80 transition-all">
      <div className="container-x flex h-16 md:h-20 items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-border/80 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200 shadow-sm">
            <img
              src={logoImg}
              alt="MR. KHAN Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen"
            />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              {business.name}
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
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
        <div className="hidden md:flex items-center gap-3">
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
            className="rounded-full px-5 py-2 bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-sm transition-all duration-200"
          >
            <Link to="/book">Book Repair</Link>
          </Button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-border/80 bg-background/95 backdrop-blur-xl"
          >
            <div className="container-x py-4 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <span>{n.label}</span>
                  {n.label === "Track Repair" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              ))}
              <div className="flex items-center gap-2 pt-3 border-t border-border/80 mt-2">
                <Button asChild className="flex-1 rounded-full bg-accent text-accent-foreground">
                  <Link to="/book" onClick={() => setOpen(false)}>
                    Book Repair
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 rounded-full">
                  <a href={telLink()}>Call</a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function StickyMobileBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-3 gap-2 p-2">
        <a
          href={telLink()}
          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[color:var(--color-whatsapp)] text-[color:var(--color-whatsapp-foreground)] text-xs font-medium"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <Link
          to="/book"
          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium"
        >
          <Star className="h-4 w-4" /> Book
        </Link>
      </div>
    </div>
  );
}
