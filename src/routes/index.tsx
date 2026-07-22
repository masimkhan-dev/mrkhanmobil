import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
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
  Phone,
  MessageCircle,
  CheckCircle2,
  Smartphone,
  Navigation,
} from "lucide-react";
import heroImg from "@/assets/heroimage.jpg";
import devicesImg from "@/assets/devices.jpg";
import technicianImg from "@/assets/technician.jpg";
import walkinIllustration from "@/assets/illustrations/walkin_clean.png";
import homeVisitIllustration from "@/assets/illustrations/home_visit_clean.png";
import mailinIllustration from "@/assets/illustrations/mailin_clean.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brands, deviceServices } from "@/config/services";
import { business, telLink, whatsappLink } from "@/config/business";
import { QuoteForm } from "@/components/quote-form";
import { ExitIntentPopup } from "@/components/exit-intent";
import { StickyConversionBar } from "@/components/sticky-conversion-bar";
import { FaqAccordion } from "@/components/faq-accordion";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { BrandLogo } from "@/components/brand-logos";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { EmergencyBanner } from "@/components/emergency-banner";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { InstantPriceCalculator } from "@/components/instant-price-calculator";

export const Route = createFileRoute("/")({
  head: () => {
    const siteUrl = process.env.SITE_URL || business.url;
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

function Home() {
  useEffect(() => {
    trackFunnelEvent("page_view", { page: "home" });
  }, []);

  return (
    <>
      <EmergencyBanner />
      <Hero />
      <TrustBar />
      <InstantPriceCalculator />
      <BrandsStrip />
      <ServicesGrid />
      <BeforeAfterSlider />
      <HowItWorks />
      <WhyUs />
      <ReviewsSection />
      <ServiceOptionsSection />
      <QuoteSection />
      <FaqSection />
      <MapSection />
      <FinalCtaSection />
      <ExitIntentPopup />
      <StickyConversionBar />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="h-full w-full object-cover" width={1800} height={1200} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/40" />
      </div>
      <div className="container-x relative py-24 md:py-32 lg:py-40 text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <Badge variant="secondary" className="mb-6 rounded-full py-1.5 px-3 gap-1.5">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-xs font-medium">{business.rating.stars} Google rating · {business.rating.reviews}+ reviews</span>
          </Badge>
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Mobile repair,<br />
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">done properly.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
            Same-day iPhone, Samsung, Google Pixel and Android repair — walk-in, home visit or mail-in.
            Every repair backed by our real 12-month warranty.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full h-14 px-8 text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-glow)]">
              <Link to="/book">Book a Repair <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
              <a href={whatsappLink()}><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full h-14 px-6 text-base text-white hover:bg-white/10 hover:text-white">
              <a href={telLink()}><Phone className="mr-2 h-4 w-4" />{business.phone}</a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 12-month warranty</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Same-day service</div>
            <div className="flex items-center gap-2"><Award className="h-4 w-4" /> No fix, no fee</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: Clock, label: "Same-Day Repairs", desc: "Most under 60 minutes" },
    { icon: ShieldCheck, label: "12-Month Warranty", desc: "Parts & labour covered" },
    { icon: Award, label: "No Fix, No Fee", desc: "Free diagnostic review" },
    { icon: Wrench, label: "Certified Technicians", desc: "10+ years experience" },
  ];
  return (
    <section className="border-b border-border bg-card/50 backdrop-blur-md py-6">
      <div className="container-x">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {items.map((i, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3.5 ${idx > 1 ? "pt-4 md:pt-0" : ""} md:pl-4 first:pl-0`}
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
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground/80 hover:text-foreground hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-xs transition-all duration-200 cursor-default"
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
          eyebrow="Popular Repairs"
          title="Repairs for every device you own"
          description="From cracked screen replacement to battery issues & motherboard work — one team, one 12-month warranty."
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
              <Link to="/services/$slug" params={{ slug: s.slug }} className="group block h-full">
                <Card className="h-full border-border/70 hover:border-blue-500/40 hover:shadow-md transition-all">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.short}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs border-t border-border/60 pt-4">
                      <span className="text-muted-foreground">
                        From <span className="text-foreground font-semibold">{s.priceFrom}</span>
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Repair <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link to="/services">Browse all services</Link>
          </Button>
          <a
            href="#quote"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 transition-colors"
          >
            Not sure which service you need? Get a free quote →
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Book in 60s",
      desc: "Select your device, model and problem — choose walk-in, home visit or mail-in.",
    },
    {
      n: "02",
      title: "Free Diagnosis",
      desc: "Free diagnostic review and a fixed quote before any work starts. No surprises.",
    },
    {
      n: "03",
      title: "Same-Day Fix",
      desc: "Most repairs completed in under 60 minutes by certified UK technicians.",
    },
    {
      n: "04",
      title: "12-Month Guarantee",
      desc: "Every repair covered by our 12-month parts & labour guarantee.",
    },
  ];
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="container-x">
        <SectionHeader
          dark
          eyebrow="How it works"
          title="From booked to fixed in four simple steps"
          description="Fast, transparent, professional repair with zero hassle."
        />
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-5xl font-mono font-extrabold text-blue-400/30">{s.n}</div>
              <h3 className="mt-3 font-display font-semibold text-lg text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button
            asChild
            size="lg"
            className="rounded-full h-12 px-8 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all duration-200"
          >
            <Link
              to="/book"
              onClick={() => trackFunnelEvent("book_click", { location: "how_it_works" })}
            >
              Ready when you are — Book in 60 seconds →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const points = [
    "Certified technicians with 10+ years experience",
    "Genuine-grade & OEM-quality replacement parts",
    "Transparent fixed pricing — no hidden fees",
    "12-month warranty on all parts and labour",
    "Data security and confidentiality guaranteed",
    "Free UK-wide return delivery on mail-in repairs",
  ];
  return (
    <section className="py-24">
      <div className="container-x grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <img
            src={technicianImg}
            alt="MR. KHAN Technician repairing device motherboard"
            width={1400}
            height={1000}
            loading="lazy"
            className="rounded-3xl shadow-xl w-full h-auto object-cover aspect-[4/3] border border-border/80"
          />
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 md:p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 grid place-items-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-sm">12-Month Guarantee</div>
                <div className="text-xs text-muted-foreground">On parts &amp; labour</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
            Why {business.name}
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
            Liverpool repair experts you can actually trust
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We've repaired over {business.repairsCount} devices across Liverpool and the UK. Same
            certified team, same quality standard — whether you walk in, we come to your doorstep,
            or you post it to us.
          </p>
          <ul className="grid gap-3 pt-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="py-24 bg-surface">
      <div className="container-x">
        <SectionHeader
          eyebrow="Reviews"
          title="What our customers say"
          description={`${business.rating.stars} out of 5 from ${business.rating.reviews}+ verified Google reviews`}
        />
        <div className="mt-14">
          <ReviewsCarousel />
        </div>
        <div className="mt-10 flex flex-col items-center gap-6">
          <Button asChild variant="outline" className="rounded-full">
            <a href={business.googleReviewUrl} target="_blank" rel="noreferrer">
              <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" />
              Leave a Google review
            </a>
          </Button>

          {/* Decision Stage Primary CTA Box */}
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-center space-y-4 shadow-xs mt-4">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">
              Join {business.repairsCount} happy customers — Book Repair
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Same-day repairs backed by our 12-month guarantee. No fix, no fee.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-8 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
              >
                <Link
                  to="/book"
                  onClick={() =>
                    trackFunnelEvent("book_click", { location: "reviews_decision_stage" })
                  }
                >
                  Book Repair Now <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-6 text-sm font-semibold border-border bg-card/80"
              >
                <a href={telLink()}>
                  <Phone className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Call {business.phone}
                </a>
              </Button>
            </div>
          </div>
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
      desc: "Visit our Liverpool workshop — most repairs completed in 30–60 minutes while you wait.",
      cta: "Book Walk-in Repair →",
      to: "/book" as const,
    },
    {
      icon: HomeIcon,
      img: homeVisitIllustration,
      title: "Home Service",
      desc: "We come to you. Repairs completed at your doorstep or office across Liverpool & North West.",
      cta: "Book Home Visit →",
      to: "/home-repair" as const,
    },
    {
      icon: Package,
      img: mailinIllustration,
      title: "Mail-in Repair",
      desc: "Ship your device to us with free return courier delivery — fully insured and tracked end-to-end.",
      cta: "Book Mail-in Repair →",
      to: "/mail-in" as const,
    },
  ];
  return (
    <section className="py-24 bg-background">
      <div className="container-x">
        <SectionHeader eyebrow="Choose your service" title="Repair, your way" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {opts.map((o) => (
            <Card
              key={o.title}
              className="border-border/70 group hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 bg-card overflow-hidden"
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
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <o.icon className="h-5 w-5" />
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
                  className="mt-6 px-0 text-blue-600 dark:text-blue-400 font-semibold justify-start"
                >
                  <Link
                    to={o.to}
                    onClick={() =>
                      trackFunnelEvent("book_click", {
                        location: "service_options",
                        service: o.title,
                      })
                    }
                  >
                    {o.cta}
                  </Link>
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
    <section className="py-24 bg-surface" id="quote">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
            Free quote
          </p>
          <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl">
            Not sure of the cost?
            <br />
            Get a free estimate.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us what's wrong — we'll come back with a fixed price estimate and turnaround by phone or
            WhatsApp, usually within an hour.
          </p>
          <img
            src={devicesImg}
            alt="Various devices repaired by MR. KHAN"
            width={1400}
            height={900}
            loading="lazy"
            className="mt-8 rounded-2xl w-full h-auto object-cover aspect-[16/10] border border-border"
          />
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-24">
      <div className="container-x max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <div className="mt-12">
          <FaqAccordion />
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full">
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
    <section className="py-20 border-t border-border bg-background">
      <div className="container-x">
        <SectionHeader
          eyebrow="Liverpool Workshop"
          title="Visit our Liverpool Repair Center"
          description="Co-located inside Liverpool Post Office on London Road. Drop in for same-day repair while you wait."
        />
        <div className="mt-10 relative rounded-3xl overflow-hidden border border-border/80 shadow-md min-h-[380px] md:aspect-[16/7]">
          <iframe
            title="MR. KHAN Liverpool Workshop Location"
            src={business.googleMapsEmbed}
            className="w-full h-full min-h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-4 left-4 p-5 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl max-w-sm z-10 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              <MapPin className="h-4 w-4 shrink-0" /> {business.name} Repair Experts
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Address
              </div>
              <div className="text-sm font-semibold text-foreground leading-snug mt-0.5">
                {business.address.line1}, {business.address.city} {business.address.postcode}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Co-located inside Liverpool Post Office
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground pt-1 border-t border-border/60">
              <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" /> {business.phone}
            </div>
            <div className="pt-2 flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <a href={directionsUrl} target="_blank" rel="noreferrer">
                  <Navigation className="h-3.5 w-3.5 mr-1.5" />
                  Get Directions
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-xl h-9 px-3 text-xs font-semibold"
              >
                <a href={telLink()}>
                  <Phone className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                  Call
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      <div className="container-x max-w-4xl text-center space-y-6 relative z-10">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
          Ready to Fix Your Phone?
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Book your repair today. Same-day service backed by our 12-month warranty in Liverpool and
          across the UK.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full h-13 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30"
          >
            <Link
              to="/book"
              onClick={() => trackFunnelEvent("book_click", { location: "final_cta" })}
            >
              Book Repair Now <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full h-13 px-7 text-base font-semibold border-white/20 bg-white/10 hover:bg-white/20 text-white"
          >
            <a href={telLink()}>
              <Phone className="mr-2 h-4 w-4 text-blue-400" />
              Call {business.phone}
            </a>
          </Button>
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
          className={`text-xs uppercase tracking-widest font-semibold ${dark ? "text-blue-400" : "text-blue-600 dark:text-blue-400"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight ${dark ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base md:text-lg ${dark ? "text-slate-300" : "text-muted-foreground"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default Home;
