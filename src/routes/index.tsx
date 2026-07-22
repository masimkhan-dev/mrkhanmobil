import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  Award,
  ChevronRight,
  Wrench,
  Home as HomeIcon,
  Package,
  MessageCircle,
  Phone,
  CheckCircle2,
  Smartphone,
  BatteryCharging,
  Camera,
  Cpu,
  Zap,
} from "lucide-react";
import heroImg from "@/assets/hero-workshop.jpg";
import devicesImg from "@/assets/devices.jpg";
import technicianImg from "@/assets/technician.jpg";
import walkinIllustration from "@/assets/illustrations/walkin_clean.png";
import homeVisitIllustration from "@/assets/illustrations/home_visit_clean.png";
import mailinIllustration from "@/assets/illustrations/mailin_clean.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { services, brands, deviceServices } from "@/config/services";
import { business, telLink, whatsappLink } from "@/config/business";
import { QuoteForm } from "@/components/quote-form";
import { ExitIntentPopup } from "@/components/exit-intent";
import { FaqAccordion } from "@/components/faq-accordion";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { BrandLogo } from "@/components/brand-logos";

export const Route = createFileRoute("/")({
  head: () => {
    const siteUrl = process.env.SITE_URL || "https://mrkhan-repairs.co.uk";
    return {
      meta: [
        { title: `${business.name} | Mobile Phone Repair — Liverpool, Manchester & UK` },
        {
          name: "description",
          content:
            "Same-day iPhone, Samsung, Google Pixel & Android repair with a 12-month warranty. Walk-in, home visit or mail-in across the UK. Book in 60 seconds.",
        },
        {
          property: "og:title",
          content: `${business.name} — Same-Day Mobile Repair with 12-Month Warranty`,
        },
        {
          property: "og:description",
          content: "Trusted UK repair experts. Book online in 60 seconds.",
        },
        { property: "og:image", content: "/og-home.png" },
        { property: "og:url", content: `${siteUrl}/` },
      ],
      links: [
        { rel: "canonical", href: `${siteUrl}/` },
        { rel: "preload", href: heroImg, as: "image", type: "image/jpeg" },
      ],
    };
  },
  component: Home,
});

import { EmergencyBanner } from "@/components/emergency-banner";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { InstantPriceCalculator } from "@/components/instant-price-calculator";

function Home() {
  return (
    <>
      <EmergencyBanner />
      <Hero />
      <TrustBar />
      <BrandsStrip />
      <InstantPriceCalculator />
      <ServicesGrid />
      <BeforeAfterSlider />
      <HowItWorks />
      <WhyUs />
      <StatsSection />
      <ReviewsSection />
      <ServiceOptionsSection />
      <QuoteSection />
      <FaqSection />
      <MapSection />
      <ExitIntentPopup />
    </>
  );
}

function Hero() {
  const floatingParts = [
    {
      title: "OLED Screen",
      desc: "Original Grade",
      icon: Smartphone,
      className: "top-4 -left-4 md:-left-8",
      delay: 0,
      duration: 4,
      y: [-8, 8, -8],
    },
    {
      title: "High Capacity Battery",
      desc: "100% Health",
      icon: BatteryCharging,
      className: "top-8 -right-4 md:-right-8",
      delay: 0.5,
      duration: 5,
      y: [6, -8, 6],
    },
    {
      title: "4K Camera Module",
      desc: "Ultra-wide lens",
      icon: Camera,
      className: "top-1/2 -right-6 md:-right-10",
      delay: 1,
      duration: 4.5,
      y: [-6, 7, -6],
    },
    {
      title: "Bionic IC Chip",
      desc: "Logic Board",
      icon: Cpu,
      className: "bottom-16 -left-6 md:-left-10",
      delay: 0.8,
      duration: 4.2,
      y: [7, -7, 7],
    },
    {
      title: "Charging Port Flex",
      desc: "Fast Charge",
      icon: Zap,
      className: "bottom-8 -right-4 md:-right-8",
      delay: 1.2,
      duration: 4.8,
      y: [-5, 7, -5],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-20 lg:py-24">
      {/* Background Gradients & Mesh Texture */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-10 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[100px]" />
        <div className="absolute bottom-0 right-10 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="container-x relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Rating Badge */}
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs backdrop-blur-md"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-foreground">
                {business.rating.stars} Google Rated ({business.rating.reviews}+ verified reviews)
              </span>
            </Badge>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight text-foreground">
              Expert Mobile Phone{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Repairs
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-normal">
              From broken screens to battery issues — we bring your device back to life with
              same-day precision service and a real 12-month warranty.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-xs sm:text-sm font-semibold text-foreground/90 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                Same-Day Repair
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                12-Month Warranty
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                No Fix, No Fee
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                Certified Technicians
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Button
                asChild
                size="lg"
                className="rounded-full h-13 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link to="/book">
                  Book a Repair Today <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full h-13 px-7 text-base font-semibold border-border bg-card/80 hover:bg-muted text-foreground hover:-translate-y-0.5 transition-all duration-200"
              >
                <a href={telLink()}>
                  <Phone className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Call Now
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full h-13 px-6 text-base font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <a href={whatsappLink()}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {/* Trust Cards Strip */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur border border-border/80 flex items-center gap-3 shadow-xs">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-foreground">12 Month Warranty</div>
                  <div className="text-[10px] text-muted-foreground">Parts & Labour</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur border border-border/80 flex items-center gap-3 shadow-xs">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-foreground">Same-Day Service</div>
                  <div className="text-[10px] text-muted-foreground">Most under 2 hrs</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-card/60 backdrop-blur border border-border/80 flex items-center gap-3 shadow-xs col-span-2 sm:col-span-1">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-foreground">5,000+ Repairs</div>
                  <div className="text-[10px] text-muted-foreground">Trusted UK Experts</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Repair Canvas with Floating Parts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center"
          >
            {/* Center Card with Technician Hero Graphic */}
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-border/80 bg-slate-900 shadow-2xl group transform-gpu">
              <img
                src={heroImg}
                alt="Expert Mobile Phone Repair Technician"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                width={1200}
                height={900}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

              {/* Glass Tag on Image */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold">Live Workshop Repair Station</span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
                  Liverpool L3
                </span>
              </div>
            </div>

            {/* Floating 3D Repair Part Chips */}
            {floatingParts.map((part, i) => (
              <motion.div
                key={i}
                animate={{
                  y: part.y,
                  rotate: [0, i % 2 === 0 ? 3 : -3, 0],
                }}
                transition={{
                  duration: part.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: part.delay,
                }}
                className={`absolute ${part.className} hidden sm:flex items-center gap-2.5 p-2.5 pr-4 rounded-2xl bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl border border-border/80 shadow-xl shadow-black/10 z-10 pointer-events-none transform-gpu`}
              >
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <part.icon className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-foreground">{part.title}</div>
                  <div className="text-[10px] text-muted-foreground">{part.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "12-Month Warranty", desc: "On all parts & labour" },
    { icon: Award, label: "5000+ Repairs", desc: "Trusted local experts" },
    { icon: Clock, label: "Same Day Service", desc: "Most repairs under 2 hours" },
    { icon: Wrench, label: "Certified Techs", desc: "Professional repairs only" },
    { icon: Star, label: "Google Reviews", desc: "5-Star rated service" },
  ];
  return (
    <section className="border-y border-border bg-card/50 backdrop-blur">
      <div className="container-x py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {items.map((i, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 ${idx > 1 ? "pt-4 md:pt-0" : ""} md:pl-4 first:pl-0`}
            >
              <i.icon className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <div className="text-sm font-bold leading-tight">{i.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{i.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandsStrip() {
  return (
    <section className="py-12 border-b border-border bg-background">
      <div className="container-x">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">
          Trusted repairs across every major brand
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {brands.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground/80 hover:text-foreground hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-md transition-all duration-200 cursor-default"
            >
              <BrandLogo
                name={b}
                className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0"
              />
              <span className="text-sm font-semibold">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Services"
          title="Repairs for every device you own"
          description="From cracked screens to logic-board work — one team, one warranty, every device."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deviceServices.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to="/services/$slug" params={{ slug: s.slug }} className="group block">
                <Card className="h-full border-border/70 hover:border-accent/40 hover:shadow-[var(--shadow-elegant)] transition-all">
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-lg bg-accent/10 text-accent grid place-items-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.short}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        From <span className="text-foreground font-semibold">{s.priceFrom}</span>
                      </span>
                      <span className="text-accent font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link to="/services">Browse all services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Book in 60 seconds",
      desc: "Pick your device, model and issue — choose walk-in, home visit or mail-in.",
    },
    {
      n: "02",
      title: "We diagnose",
      desc: "Free diagnostic and a fixed quote before we touch your device. No surprises.",
    },
    {
      n: "03",
      title: "Same-day repair",
      desc: "Most repairs done in under 2 hours by certified technicians.",
    },
    {
      n: "04",
      title: "12-month warranty",
      desc: "Every repair covered end-to-end. If it fails, we fix it — free.",
    },
  ];
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container-x">
        <SectionHeader
          dark
          eyebrow="How it works"
          title="From booked to fixed in four steps"
          description="No gimmicks, no jargon. Just fast, honest repair."
        />
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-6xl font-display font-bold text-white/10">{s.n}</div>
              <h3 className="mt-2 font-display font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-primary-foreground/70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const points = [
    "Certified technicians with 10+ years experience",
    "Genuine-grade & OEM-quality parts only",
    "Transparent fixed pricing — no hidden fees",
    "12-month warranty on parts and labour",
    "Data protection and confidentiality guaranteed",
    "Free UK-wide return delivery on mail-in",
  ];
  return (
    <section className="py-24">
      <div className="container-x grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <img
            src={technicianImg}
            alt="Technician repairing a phone motherboard"
            width={1400}
            height={1000}
            loading="lazy"
            className="rounded-2xl shadow-[var(--shadow-elegant)] w-full h-auto object-cover aspect-[4/3]"
          />
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/15 grid place-items-center">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-semibold text-sm">12-month warranty</div>
                <div className="text-xs text-muted-foreground">On every repair</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Why {business.name}
          </p>
          <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight">
            Repair experts you can actually trust
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We've repaired over 25,000 devices across the UK. Same team, same standard — whether you
            drop in, we come to you, or you post it to us.
          </p>
          <ul className="mt-8 grid gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { n: "25k+", l: "Devices repaired" },
    { n: "12mo", l: "Warranty" },
    { n: "4.9★", l: "Google rating" },
    { n: "60min", l: "Avg turnaround" },
  ];
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="font-display text-4xl md:text-5xl font-bold tracking-tight">{s.n}</div>
            <div className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Reviews"
          title="What our customers say"
          description={`${business.rating.stars} out of 5 from ${business.rating.reviews}+ Google reviews`}
        />
        <div className="mt-14">
          <ReviewsCarousel />
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <a href={business.googleReviewUrl} target="_blank" rel="noreferrer">
              <Star className="mr-2 h-4 w-4 fill-warning text-warning" />
              Leave a Google review
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ServiceOptionsSection() {
  const opts = [
    {
      icon: Wrench,
      img: walkinIllustration,
      title: "Walk-in Repair",
      desc: "Drop in to our Liverpool workshop — most repairs done in 30–60 minutes while you wait.",
      cta: "Book walk-in",
      to: "/book" as const,
    },
    {
      icon: HomeIcon,
      img: homeVisitIllustration,
      title: "Home Service",
      desc: "We come to you. Repairs completed at your doorstep or office across Liverpool & North West.",
      cta: "Learn more",
      to: "/home-repair" as const,
    },
    {
      icon: Package,
      img: mailinIllustration,
      title: "Mail-in Repair",
      desc: "Ship your device to us with free return courier delivery — fully insured and tracked end-to-end.",
      cta: "How mail-in works",
      to: "/mail-in" as const,
    },
  ];
  return (
    <section className="py-24 bg-surface">
      <div className="container-x">
        <SectionHeader eyebrow="Choose your service" title="Repair, your way" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {opts.map((o) => (
            <Card
              key={o.title}
              className="border-border/70 group hover:border-accent/40 hover:shadow-xl transition-all duration-300 bg-card overflow-hidden"
            >
              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="relative rounded-2xl overflow-hidden bg-slate-50/80 dark:bg-slate-900/40 border border-border/70 p-4 mb-6 flex items-center justify-center aspect-[16/10]">
                    <img
                      src={o.img}
                      alt={o.title}
                      width={400}
                      height={250}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen scale-125 group-hover:scale-135 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <o.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-foreground">
                      {o.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
                </div>
                <Button
                  asChild
                  variant="link"
                  className="mt-6 px-0 text-accent font-semibold justify-start"
                >
                  <Link to={o.to}>{o.cta} →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="py-24">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">Free quote</p>
          <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl">
            Not sure of the cost?
            <br />
            Get a free estimate.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us what's wrong — we'll come back with a fixed price and turnaround by phone or
            WhatsApp, usually within an hour.
          </p>
          <img
            src={devicesImg}
            alt="Various devices we repair"
            width={1400}
            height={900}
            loading="lazy"
            className="mt-8 rounded-2xl w-full h-auto object-cover aspect-[16/10]"
          />
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-24 bg-surface">
      <div className="container-x max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <div className="mt-12">
          <FaqAccordion />
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link to="/faq">View all FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  const directionsUrl = business.social.google;
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Visit us"
          title="Find your nearest branch"
          description={`${business.address.line1}, ${business.address.city} ${business.address.postcode}`}
        />
        <div className="mt-10 relative rounded-2xl overflow-hidden border border-border shadow-sm min-h-[360px] md:aspect-[16/8]">
          <iframe
            title="Location"
            src={business.googleMapsEmbed}
            className="w-full h-full min-h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-4 left-4 p-4 rounded-xl bg-card/95 backdrop-blur border border-border shadow-lg max-w-xs z-10">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
              <MapPin className="h-4 w-4 shrink-0" /> Contact Info
            </div>
            <div className="mt-2 text-xs uppercase font-bold text-muted-foreground">Address</div>
            <div className="text-sm font-semibold text-foreground leading-snug mt-0.5">
              83/85 London Road, Post Office, Liverpool L3 8JA
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground">
              <Phone className="h-3.5 w-3.5 text-accent shrink-0" /> {business.phone}
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              Get Directions →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  dark,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {eyebrow && (
        <p
          className={`text-xs uppercase tracking-widest font-semibold ${dark ? "text-accent" : "text-accent"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight ${dark ? "text-primary-foreground" : ""}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base md:text-lg ${dark ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default Home;
