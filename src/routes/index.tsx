import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Star,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Wrench,
  Home as HomeIcon,
  Package,
  Phone,
  MessageCircle,
  CheckCircle2,
  Navigation,
  Smartphone,
} from "lucide-react";
import heroImg from "@/assets/heroimage.jpg";
import technicianImg from "@/assets/technician.jpg";
import { Button } from "@/components/ui/button";
import { business, telLink, whatsappLink } from "@/config/business";
import { FaqAccordion } from "@/components/faq-accordion";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { BrandLogo } from "@/components/brand-logos";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { brands, repairServices, buildRepairQuoteMessage } from "@/config/services";
import { ServiceCard } from "@/components/service-card";

export const Route = createFileRoute("/")({
  head: () => {
    return {
      meta: [
        { title: "Phone Repair Liverpool | MR. KHAN — London Road" },
        {
          name: "description",
          content:
            "Screen, battery, charging port and device repairs from our London Road shop in Liverpool. Clear advice before we begin. MR. KHAN — 83–85 London Road, L3 8JA.",
        },
        { property: "og:title", content: "Phone Repair Liverpool | MR. KHAN — London Road" },
        {
          property: "og:description",
          content:
            "Screen, battery, charging port and device repairs from our London Road shop in Liverpool. Clear advice before we begin.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/" },
        { property: "og:image", content: "https://www.mrkhanmobiles.co.uk/og-home.png" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/" },
        { rel: "preload", href: heroImg, as: "image", type: "image/jpeg" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MobilePhoneRepairShop",
            name: `${business.name} Mobile Repair`,
            url: "https://www.mrkhanmobiles.co.uk",
            telephone: business.phoneRaw,
            priceRange: "££",
            address: {
              "@type": "PostalAddress",
              streetAddress: business.address.line1,
              addressLocality: business.address.city,
              addressRegion: business.address.region,
              postalCode: business.address.postcode,
              addressCountry: "GB",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 53.4094083,
              longitude: -2.9742342,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: String(business.rating.stars),
            },
          }),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  useEffect(() => {
    trackFunnelEvent("page_view", { page: "home" });
  }, []);

  return (
    <>
      <Hero />
      <BrandsStrip />
      <RepairFinder />
      <ServiceOptions />
      <LocalTrust />
      <BeforeAfterSlider />
      <HowItWorks />
      <ReviewsSection />
      <ServicesOverview />
      <FaqSection />
      <MapSection />
      <FinalCtaSection />
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative bg-[#07101d] text-white pt-14 sm:pt-20 pb-24 sm:pb-28 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="MR. KHAN repair workshop on London Road, Liverpool"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07101d]/96 via-[#07101d]/88 to-[#07101d]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07101d]/80 via-transparent to-transparent" />
      </div>

      <div className="container-x relative z-10 max-w-3xl">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white mb-4">
          <div className="flex items-center text-amber-400 gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <Star className="h-3.5 w-3.5 fill-amber-400" />
          </div>
          <span>5-Star Rated on Google</span>
          <span className="text-white/40">·</span>
          <span>Same-Day Repairs</span>
        </div>

        {/* Eyebrow */}
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand mb-3">
          Mobile Repairs in Liverpool
        </p>

        {/* Headline */}
        <h1 className="text-[2.4rem] sm:text-[3.2rem] lg:text-[3.8rem] font-display font-extrabold leading-[1.1] tracking-tight text-white">
          Phone repairs, <span className="text-white">done properly.</span>
        </h1>

        {/* Subtext */}
        <p className="mt-5 text-[1.05rem] sm:text-lg text-slate-200 max-w-xl leading-relaxed">
          Screen, battery, charging port and device repairs from our London Road shop. Clear advice
          before we begin and support after the repair.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Link
            to="/contact"
            onClick={() => trackFunnelEvent("book_click", { location: "hero" })}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-[8px] bg-brand text-white font-semibold text-base hover:bg-brand-hover transition-colors min-h-[52px] w-full sm:w-auto"
          >
            Get a Repair Quote
          </Link>
          <a
            href={whatsappLink("Hi MR. KHAN, I'd like to get a repair quote.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-[#25d366] text-white font-semibold text-base hover:bg-[#1da851] transition-colors min-h-[52px] w-full sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            Message on WhatsApp
          </a>
        </div>

        {/* Supporting contact + location */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-slate-300">
          <a
            href={telLink()}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4 text-brand shrink-0" />
            Or call {business.phone}
          </a>
          <span className="flex items-center gap-2 text-slate-400">
            <MapPin className="h-4 w-4 text-brand shrink-0" />
            {business.address.line1}, {business.address.city} {business.address.postcode}
          </span>
        </div>
      </div>
    </section>
  );
}

// ── Brands Strip ─────────────────────────────────────────────────────────────

function BrandsStrip() {
  return (
    <section className="py-10 border-b border-[#e3e5e8] bg-white">
      <div className="container-x">
        <p className="text-center text-xs uppercase tracking-widest text-[#5f6670] font-semibold mb-5">
          Repairs across every major brand
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {brands.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e3e5e8] text-[#111318] hover:border-brand/30 hover:bg-[#f7f7f5] transition-colors cursor-default min-h-[44px]"
            >
              <BrandLogo name={b} className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Repair Finder ─────────────────────────────────────────────────────────────

const deviceOptions = [
  { label: "Apple iPhone", badge: "iPhone" },
  { label: "Samsung Galaxy", badge: "Samsung" },
  { label: "Google Pixel", badge: "Pixel" },
  { label: "iPad & Tablets", badge: "iPad / Tablet" },
  { label: "Other Device", badge: "Other" },
] as const;

function RepairFinder() {
  const [selectedDevice, setSelectedDevice] = useState<string>("Apple iPhone");

  return (
    <section className="py-16 sm:py-24 bg-[#f7f7f5]" id="repair-finder">
      <div className="container-x">
        <SectionHeader
          eyebrow="Find a Repair"
          title="What needs repairing?"
          description="Select your device brand and choose the repair service — we'll provide an upfront minimum price (inc. VAT & fitting) and direct WhatsApp quote."
        />

        {/* Step 1: Device selector */}
        <div className="mt-10">
          <div className="text-center text-xs font-bold uppercase tracking-wider text-[#5f6670] mb-3">
            Step 1 — Select your device:
          </div>
          <div
            className="flex flex-wrap gap-2.5 sm:gap-3 justify-center"
            role="radiogroup"
            aria-label="Device selection"
          >
            {deviceOptions.map((d) => {
              const isSelected = selectedDevice === d.label;
              return (
                <button
                  key={d.label}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedDevice(d.label)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-semibold text-sm transition-all min-h-[46px] border ${
                    isSelected
                      ? "bg-brand text-white border-brand shadow-sm ring-2 ring-brand/20"
                      : "bg-white text-[#111318] border-[#e3e5e8] hover:border-brand/40 hover:bg-white"
                  }`}
                >
                  <Smartphone
                    className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#5f6670]"}`}
                  />
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Repair services list with prices and WhatsApp quote */}
        <div className="mt-10">
          <div className="text-center text-xs font-bold uppercase tracking-wider text-[#5f6670] mb-4">
            Step 2 — Selected for{" "}
            <span className="text-brand underline font-extrabold">{selectedDevice}</span>:
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repairServices.map((r) => (
              <ServiceCard key={r.slug} service={r} selectedDevice={selectedDevice} />
            ))}
          </div>
        </div>

        {/* Fallback */}
        <div className="mt-8 p-5 sm:p-6 rounded-[14px] bg-white border border-[#e3e5e8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold text-[17px] text-[#111318]">
              Can't find your device or repair issue?
            </div>
            <div className="text-sm text-[#5f6670] mt-0.5">
              Message us directly with your device model — we'll give you an immediate free quote.
            </div>
          </div>
          <a
            href={whatsappLink(
              `Hi MR. KHAN, I need a repair quote for my ${selectedDevice}. Could you please check availability and pricing?`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackFunnelEvent("book_click", {
                location: "repair_finder_fallback",
                device: selectedDevice,
              })
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors min-h-[46px] shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            Custom Quote on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Service Options ───────────────────────────────────────────────────────────

function ServiceOptions() {
  const opts = [
    {
      icon: Wrench,
      title: "Visit Our Shop",
      desc: "Bring your device to our London Road repair counter. Most repairs are assessed while you wait.",
      cta: "Get in Touch",
      to: "/contact" as const,
    },
    {
      icon: HomeIcon,
      title: "Home or Call-out",
      desc: "Contact us to check availability for a repair at your home or workplace across Liverpool.",
      cta: "Book Home Visit",
      to: "/home-repair" as const,
    },
    {
      icon: Package,
      title: "Mail-in Repair",
      desc: "Contact us before posting your device — we'll confirm the repair and return it tracked.",
      cta: "Mail-in Details",
      to: "/mail-in" as const,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-white border-y border-[#e3e5e8]">
      <div className="container-x">
        <SectionHeader eyebrow="Choose what works for you" title="Repair options" />
        <div className="mt-10 sm:mt-14 grid gap-5 md:grid-cols-3">
          {opts.map((o) => (
            <div
              key={o.title}
              className="flex flex-col p-6 rounded-[14px] border border-[#e3e5e8] bg-white"
            >
              <div className="h-11 w-11 rounded-[10px] bg-[#f7f7f5] border border-[#e3e5e8] grid place-items-center mb-4">
                <o.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-display font-bold text-[18px] text-[#111318]">{o.title}</h3>
              <p className="mt-2 text-[15px] text-[#5f6670] leading-relaxed flex-1">{o.desc}</p>
              <Link
                to={o.to}
                onClick={() =>
                  trackFunnelEvent("book_click", { location: "service_options", service: o.title })
                }
                className="mt-5 inline-flex items-center gap-1.5 text-brand font-semibold text-sm hover:underline min-h-[44px]"
              >
                {o.cta} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Local Trust ───────────────────────────────────────────────────────────────

function LocalTrust() {
  const benefits = [
    "Clear advice and cost before any repair begins",
    "Support and warranty after the repair is complete",
    "Repairs for phones, tablets and laptops",
    "Convenient location on Liverpool's London Road",
  ];
  return (
    <section className="py-16 sm:py-24 bg-[#f7f7f5]">
      <div className="container-x grid gap-10 sm:gap-16 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <img
            src={technicianImg}
            alt="MR. KHAN technician at the repair bench on London Road, Liverpool"
            width={1400}
            height={1000}
            loading="lazy"
            className="rounded-[16px] w-full h-auto object-cover aspect-[4/3] border border-[#e3e5e8]"
          />
          {/* Address badge */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-white border border-[#e3e5e8] rounded-[12px] p-4 shadow-md max-w-[calc(100%-2rem)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-subtle grid place-items-center shrink-0">
                <MapPin className="h-5 w-5 text-brand" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#111318]">{business.address.line1}</div>
                <div className="text-xs text-[#5f6670]">
                  {business.address.city}, {business.address.postcode}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.16em] text-brand font-bold">
            Liverpool Phone Repair Shop
          </p>
          <h2 className="font-display font-extrabold text-[1.9rem] sm:text-[2.4rem] text-[#111318] tracking-tight leading-tight">
            Local repairs from a shop you can visit
          </h2>
          <p className="text-[#5f6670] leading-relaxed text-[15px] sm:text-base">
            We are a phone repair shop based on London Road in Liverpool. You can walk in with your
            device, get it assessed and have most common repairs completed in the same visit.
          </p>
          <ul className="grid gap-3 pt-1">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[15px] text-[#111318]">
                <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              onClick={() => trackFunnelEvent("book_click", { location: "local_trust" })}
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors min-h-[48px]"
            >
              Contact the Shop
            </Link>
            <a
              href={telLink()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] border border-[#e3e5e8] bg-white text-[#111318] font-semibold text-sm hover:bg-[#f7f7f5] transition-colors min-h-[48px]"
            >
              <Phone className="h-4 w-4 text-brand" />
              Call {business.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Tell us the problem",
      desc: "Call, message or visit the shop. Tell us what's wrong and which device you have.",
    },
    {
      n: "2",
      title: "Get clear advice",
      desc: "We explain the repair, what's involved and the expected cost before any work begins.",
    },
    {
      n: "3",
      title: "Repair and collect",
      desc: "We complete the work and provide your invoice and warranty information on collection.",
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-white border-y border-[#e3e5e8]">
      <div className="container-x">
        <SectionHeader
          eyebrow="Simple Process"
          title="How it works"
          description="Three straightforward steps from first contact to collection."
        />
        <div className="mt-10 sm:mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative p-6 rounded-[14px] border border-[#e3e5e8] bg-[#f7f7f5]"
            >
              {/* Step connector line (desktop) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-[2.6rem] left-full w-5 h-px bg-[#e3e5e8] z-10"
                  aria-hidden="true"
                />
              )}
              <div className="text-[2.2rem] font-mono font-extrabold text-brand leading-none mb-4">
                {s.n}
              </div>
              <h3 className="font-display font-bold text-[17px] text-[#111318]">{s.title}</h3>
              <p className="mt-2 text-sm text-[#5f6670] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/contact"
            onClick={() => trackFunnelEvent("book_click", { location: "how_it_works" })}
            className="inline-flex items-center justify-center px-7 py-3 rounded-[8px] bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors min-h-[48px]"
          >
            Contact the Shop
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────────

function ReviewsSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#f7f7f5]">
      <div className="container-x">
        <SectionHeader
          eyebrow="Reviews"
          title="Reviews from our customers"
          description="Rated 4.9 out of 5 on Google by verified customers."
        />
        <div className="mt-10 sm:mt-14">
          <ReviewsCarousel />
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href={business.googleReviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] border border-[#e3e5e8] bg-white text-[#111318] font-semibold text-sm hover:bg-[#f7f7f5] hover:border-brand/40 transition-colors min-h-[48px]"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Read All Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Services Overview ─────────────────────────────────────────────────────────

function ServicesOverview() {
  const categories = [
    {
      title: "Mobile Phone Repairs",
      desc: "iPhone, Samsung, Google Pixel, Huawei, Xiaomi and all major brands.",
      to: "/services" as const,
    },
    {
      title: "Tablet & iPad Repairs",
      desc: "iPad, Samsung Tab and other tablet screen and battery repairs.",
      to: "/services" as const,
    },
    {
      title: "Laptop & Computer Repairs",
      desc: "Screen replacement, battery, keyboard, software and data recovery.",
      to: "/services" as const,
    },
    {
      title: "Phone Buying & Selling",
      desc: "We buy and sell used phones — visit the shop for a trade-in price.",
      to: "/buy-sell" as const,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-[#e3e5e8]">
      <div className="container-x">
        <SectionHeader eyebrow="Our Services" title="What we repair and sell" />
        <div className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="group flex flex-col p-5 rounded-[12px] border border-[#e3e5e8] bg-[#f7f7f5] hover:border-brand/30 hover:bg-white transition-all"
            >
              <h3 className="font-display font-bold text-[16px] text-[#111318]">{c.title}</h3>
              <p className="mt-2 text-sm text-[#5f6670] leading-snug flex-1">{c.desc}</p>
              <span className="mt-4 flex items-center gap-1 text-brand font-semibold text-xs group-hover:gap-2 transition-all">
                Learn more <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FaqSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#f7f7f5] border-t border-[#e3e5e8]">
      <div className="container-x max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <div className="mt-8 sm:mt-12">
          <FaqAccordion />
        </div>
        <div className="mt-8 sm:mt-10 text-center">
          <Button asChild variant="outline" className="rounded-[8px] min-h-[44px] border-[#e3e5e8]">
            <Link to="/faq">View all FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Map / Location ────────────────────────────────────────────────────────────

function MapSection() {
  const directionsUrl = business.social.google;
  return (
    <section className="py-16 sm:py-20 border-t border-[#e3e5e8] bg-white">
      <div className="container-x">
        <SectionHeader
          eyebrow="Find Us"
          title="Visit MR. KHAN in Liverpool"
          description="We are on London Road — drop in with your device or contact us before travelling."
        />
        <div className="mt-8 sm:mt-10 flex flex-col md:block relative rounded-[18px] overflow-hidden border border-[#e3e5e8] min-h-[380px] md:aspect-[16/7]">
          {/* Info card */}
          <div className="p-5 rounded-[14px] bg-white border border-[#e3e5e8] shadow-md max-w-sm z-10 space-y-3 m-4 md:m-0 md:absolute md:top-5 md:left-5">
            <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider">
              <MapPin className="h-4 w-4 shrink-0" /> Liverpool Repair Shop
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#5f6670] tracking-wider">
                Address
              </div>
              <div className="text-sm font-semibold text-[#111318] leading-snug mt-0.5">
                {business.address.line1}, {business.address.city} {business.address.postcode}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#111318] pt-1 border-t border-[#e3e5e8]">
              <Phone className="h-3.5 w-3.5 text-brand shrink-0" />
              <a href={telLink()} className="hover:text-brand transition-colors">
                {business.phone}
              </a>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors min-h-[40px]"
              >
                <Navigation className="h-3.5 w-3.5" />
                Get Directions
              </a>
              <a
                href={telLink()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e3e5e8] bg-white text-[#111318] text-xs font-semibold hover:bg-[#f7f7f5] transition-colors min-h-[40px]"
              >
                <Phone className="h-3.5 w-3.5 text-brand" />
                Call
              </a>
            </div>
          </div>

          {/* Map embed */}
          <iframe
            title="MR. KHAN Liverpool — 83-85 London Road location map"
            src={business.googleMapsEmbed}
            className="w-full h-full min-h-[300px] md:min-h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-24 bg-[#07101d] text-white">
      <div className="container-x max-w-3xl text-center space-y-5">
        <h2 className="font-display font-extrabold text-[2rem] sm:text-[2.6rem] tracking-tight">
          Need help with your device?
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          Tell us what's wrong and we'll explain the next step.
        </p>
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/contact"
            onClick={() => trackFunnelEvent("book_click", { location: "final_cta" })}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-[8px] bg-brand text-white font-semibold text-base hover:bg-brand-hover transition-colors min-h-[52px] w-full sm:w-auto"
          >
            Get a Repair Quote
          </Link>
          <a
            href={whatsappLink("Hi MR. KHAN, I need help with my device.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[8px] bg-[#25d366] text-white font-semibold text-base hover:bg-[#1da851] transition-colors min-h-[52px] w-full sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            Message on WhatsApp
          </a>
        </div>
        <p className="text-slate-400 text-sm pt-2">
          Or call us on{" "}
          <a
            href={telLink()}
            className="text-white font-semibold hover:text-brand transition-colors"
          >
            {business.phone}
          </a>
        </p>
      </div>
    </section>
  );
}

// ── Shared Section Header ─────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-brand mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display font-extrabold text-[1.8rem] sm:text-[2.2rem] lg:text-[2.6rem] tracking-tight text-[#111318]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base sm:text-lg text-[#5f6670] leading-relaxed">{description}</p>
      )}
    </div>
  );
}
