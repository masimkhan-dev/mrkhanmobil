import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { business, telLink, whatsappLink } from "@/config/business";
import logoImg from "@/assets/logo.webp";

const navLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/services", label: "Repairs", exact: false },
  { to: "/buy-sell", label: "Buy & Sell", exact: false },
  { to: "/about", label: "About Us", exact: false },
  { to: "/contact", label: "Contact", exact: false },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const location = useRouterState({ select: (s) => s.location.pathname });

  // Scroll state for sticky collapse
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Escape key closes menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Body scroll lock when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location === to;
    return location === to || location.startsWith(to + "/");
  };

  return (
    <header className="sticky top-0 z-40 w-full" role="banner">
      {/* ── Full header (shown at top, before scroll) ─────────────────────── */}
      <div
        className={`w-full bg-white border-b border-[#e3e5e8] transition-shadow duration-200 ${
          scrolled ? "hidden" : "block"
        }`}
      >
        {/* Row 2: Brand bar */}
        <div className="container-x">
          <div className="flex items-center justify-between h-[84px] gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0 py-1"
              aria-label="MR. KHAN — return to homepage"
            >
              <img
                src={logoImg}
                alt="MR. KHAN Liverpool"
                width={260}
                height={72}
                className="h-14 sm:h-16 md:h-18 w-auto max-w-[260px] sm:max-w-[320px] object-contain shrink-0 transition-transform duration-200 hover:scale-[1.02]"
                loading="eager"
              />
            </Link>

            {/* Right: Contact + CTAs (desktop only) */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={telLink()}
                className="flex items-center gap-2 text-[#111318] font-semibold text-sm hover:text-brand transition-colors"
                aria-label={`Call MR. KHAN on ${business.phone}`}
              >
                <Phone className="h-4 w-4 text-brand" />
                Need help? {business.phone}
              </a>
              <span className="w-px h-5 bg-[#e3e5e8]" aria-hidden="true" />
              <a
                href={whatsappLink("Hi MR. KHAN, I need help with a repair.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#25d366] text-white text-sm font-semibold hover:bg-[#1da851] transition-colors min-h-[44px]"
                aria-label="Message MR. KHAN on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors min-h-[44px]"
              >
                Get a Repair Quote
              </Link>
            </div>

            {/* Mobile: phone + WA icons + hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <a
                href={telLink()}
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[#e3e5e8] text-[#111318] hover:bg-[#f7f7f5] transition-colors"
                aria-label={`Call ${business.phone}`}
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href={whatsappLink("Hi MR. KHAN, I need help with a repair.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#25d366] text-white hover:bg-[#1da851] transition-colors"
                aria-label="Message on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <button
                ref={hamburgerRef}
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[#e3e5e8] text-[#111318] hover:bg-[#f7f7f5] transition-colors"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Main navigation bar (desktop) */}
        <div className="hidden lg:block border-t border-[#e3e5e8] bg-white">
          <div className="container-x">
            <div className="flex items-center h-[56px]">
              <nav className="flex items-center gap-1 flex-1" aria-label="Main navigation">
                {navLinks.map((link) => {
                  const active = isActive(link.to, link.exact);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      aria-current={active ? "page" : undefined}
                      className={`relative px-4 py-2 text-[15px] font-medium rounded-md transition-colors ${
                        active
                          ? "text-[#111318] bg-[#f7f7f5]"
                          : "text-[#5f6670] hover:text-[#111318] hover:bg-[#f7f7f5]"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact sticky header (shown after scroll) ─────────────────────── */}
      <div
        className={`w-full bg-white border-b border-[#e3e5e8] shadow-sm transition-all duration-200 ${
          scrolled ? "block" : "hidden"
        }`}
      >
        <div className="container-x">
          <div className="flex items-center h-[64px] gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0"
              aria-label="MR. KHAN — return to homepage"
            >
              <img
                src={logoImg}
                alt="MR. KHAN Liverpool"
                width={180}
                height={44}
                className="h-10 sm:h-11 w-auto max-w-[180px] object-contain shrink-0"
              />
            </Link>

            {/* Desktop nav (compact) */}
            <nav
              className="hidden lg:flex items-center gap-0.5 flex-1 ml-4"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => {
                const active = isActive(link.to, link.exact);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors ${
                      active
                        ? "text-[#111318] bg-[#f7f7f5]"
                        : "text-[#5f6670] hover:text-[#111318] hover:bg-[#f7f7f5]"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* CTAs */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              <a
                href={whatsappLink("Hi MR. KHAN, I need help with a repair.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#25d366] text-white text-sm font-semibold hover:bg-[#1da851] transition-colors min-h-[40px]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 rounded-[8px] bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors min-h-[40px]"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile icons */}
            <div className="flex items-center gap-2 lg:hidden ml-auto">
              <a
                href={telLink()}
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#e3e5e8] text-[#111318] hover:bg-[#f7f7f5] transition-colors"
                aria-label={`Call ${business.phone}`}
              >
                <Phone className="h-4.5 w-4.5" />
              </a>
              <a
                href={whatsappLink("Hi MR. KHAN, I need help with a repair.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#25d366] text-white hover:bg-[#1da851] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </a>
              <button
                ref={hamburgerRef}
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#e3e5e8] text-[#111318] hover:bg-[#f7f7f5] transition-colors"
              >
                {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer menu ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className="absolute top-0 right-0 h-full w-[min(320px,85vw)] bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#e3e5e8]">
              <span className="font-display font-extrabold text-[17px] text-[#111318]">
                {business.name}
              </span>
              <button
                onClick={() => {
                  setOpen(false);
                  hamburgerRef.current?.focus();
                }}
                aria-label="Close navigation menu"
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-[#e3e5e8] text-[#111318] hover:bg-[#f7f7f5] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const active = isActive(link.to, link.exact);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-semibold mb-1 transition-colors min-h-[52px] ${
                      active
                        ? "bg-[#f7f7f5] text-[#111318] border-l-2 border-brand"
                        : "text-[#111318] hover:bg-[#f7f7f5]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* CTAs */}
            <div className="p-4 border-t border-[#e3e5e8] space-y-3">
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full px-5 py-3.5 rounded-[8px] bg-brand text-white text-base font-semibold hover:bg-brand-hover transition-colors min-h-[52px]"
              >
                Get a Repair Quote
              </Link>
              <a
                href={whatsappLink("Hi MR. KHAN, I need help with a repair.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-[8px] bg-[#25d366] text-white text-base font-semibold hover:bg-[#1da851] transition-colors min-h-[52px]"
              >
                <MessageCircle className="h-5 w-5" />
                Message on WhatsApp
              </a>
            </div>

            {/* Contact info strip */}
            <div className="px-5 py-4 bg-[#f7f7f5] border-t border-[#e3e5e8]">
              <a
                href={telLink()}
                className="flex items-center gap-2 text-sm font-semibold text-[#111318] hover:text-brand transition-colors"
              >
                <Phone className="h-4 w-4 text-brand" />
                {business.phone}
              </a>
              <p className="mt-1 text-xs text-[#5f6670]">
                {business.address.line1}, {business.address.city}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
