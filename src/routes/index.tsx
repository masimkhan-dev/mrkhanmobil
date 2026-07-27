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
            "Same-day iPhone, Samsung, Google Pixel & Android repair with a 6-month warranty. Walk-in, home visit or mail-in across the UK. Book in 60 seconds.",
        },
        {
          property: "og:title",
          content: `${business.name} — Same-Day Mobile Repair with 6-Month Warranty`,
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MobilePhoneRepairShop",
            name: `${business.name} Repair Experts`,
            url: siteUrl,
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
              reviewCount: String(business.rating.reviews),
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
    <section className="relative bg-[#050B1A] text-white py-14 sm:py-20 lg:py-28 overflow-hidden">
      <div className="container-x grid gap-8 lg:gap-12 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 space-y-5 sm:space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold max-w-full">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="truncate">{business.rating.stars} Google Rating · {business.rating.reviews}+ Verified Reviews</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
            Reliable Phone Repairs<br />
            <span className="text-indigo-400">in Liverpool</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
            Fast phone repairs from experienced technicians in Liverpool. Most screen and battery repairs completed within 60 minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-xl h-13 px-7 text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all min-h-[48px]"
            >
              <Link to="/book">
                Book a Repair <ChevronRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl h-13 px-6 text-sm font-semibold border-white/20 bg-white/5 hover:bg-white/15 text-white min-h-[48px]"
            >
              <a href={telLink()}>
                <Phone className="mr-2 h-4.5 w-4.5 text-indigo-400" />
                Call Us: {business.phone}
              </a>
            </Button>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" /> 6-Month Warranty
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400 shrink-0" /> Same-Day Repairs
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400 shrink-0" /> Free Diagnosis
            </div>
          </div>
        </motion.div>

        {/* Right Column: Real Technician Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[16/10] sm:aspect-[4/3] lg:aspect-[1/1]">
            <img
              src={technicianImg}
              alt="MR. KHAN Repair Technician working on motherboard"
              className="w-full h-full object-cover"
              width={800}
              height={800}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B1A]/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl bg-[#050B1A]/90 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white">Liverpool Repair Workshop</div>
                <div className="text-[10px] text-slate-400">Located inside Liverpool Post Office on London Road</div>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Open Now
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: Clock, label: "Same-Day Repairs", desc: "Most repairs completed in 60 minutes" },
    { icon: ShieldCheck, label: "Parts and Labour Warranty", desc: "Covered by our 6-month warranty" },
    { icon: Award, label: "Free Diagnosis", desc: "No repair fee if we can't fix it" },
    { icon: Wrench, label: "Experienced Technicians", desc: "Local repair team on London Road" },
  ];
  return (
    <section className="border-b border-[#E6EAF0] bg-white py-6 sm:py-8">
      <div className="container-x">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {items.map((i, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <i.icon className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-[#0B1220] leading-tight">{i.label}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">{i.desc}</div>
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
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground/80 hover:text-foreground hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-xs transition-all duration-200 cursor-default min-h-[44px]"
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
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Popular Repairs"
          title="Popular Phone Repairs"
          description="From screen replacements and battery changes to charging ports and camera repairs."
        />
        <div className="mt-10 sm:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deviceServices.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to="/services/$slug" params={{ slug: s.slug }} className="group block h-full">
                <Card className="h-full border-border/70 hover:border-indigo-500/40 hover:shadow-md transition-all">
                  <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.short}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs border-t border-border/60 pt-4">
                      <span className="text-muted-foreground">
                        From <span className="text-foreground font-semibold">{s.priceFrom}</span>
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
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
          <Button asChild variant="outline" size="lg" className="rounded-full min-h-[44px]">
            <Link to="/services">Browse all services</Link>
          </Button>
          <a
            href="#quote"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-2 transition-colors min-h-[44px]"
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
      tag: "BOOK",
      title: "Book Your Repair",
      desc: "Choose your phone and tell us what needs fixing.",
    },
    {
      n: "02",
      tag: "SERVICE",
      title: "Choose Your Service",
      desc: "Visit our workshop or book a home or mail-in repair.",
    },
    {
      n: "03",
      tag: "REPAIR",
      title: "We Repair Your Phone",
      desc: "Our technicians inspect and repair your device.",
    },
    {
      n: "04",
      tag: "COLLECT",
      title: "Collect Your Phone",
      desc: "Check your phone before you leave. Every repair is covered by our 12-month warranty.",
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-[#F7F9FC] border-y border-[#E6EAF0]">
      <div className="container-x">
        <SectionHeader
          eyebrow="Simple Process"
          title="How Your Repair Works"
          description="A simple repair process from booking to collection."
        />
        <div className="mt-10 sm:mt-16 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative p-5 sm:p-6 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-mono font-extrabold text-indigo-600">{s.n}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
                    {s.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-display font-extrabold text-lg text-[#0B1220]">{s.title}</h3>
                <p className="mt-2 text-xs text-[#5B6472] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 sm:mt-14 text-center">
          <Button
            asChild
            size="lg"
            className="rounded-xl h-12 px-8 text-sm font-semibold shadow-md transition-all duration-200 min-h-[48px] w-full sm:w-auto"
          >
            <Link
              to="/book"
              onClick={() => trackFunnelEvent("book_click", { location: "how_it_works" })}
            >
              Book Your Repair →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const points = [
    "Experienced technicians based at our London Road workshop",
    "High-grade replacement parts with strict quality checks",
    "Transparent fixed pricing without hidden fees",
    "6-Month Warranty covering parts and labour",
    "Data privacy guaranteed — your personal data is safe",
    "Tracked courier return for all mail-in repairs",
  ];
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container-x grid gap-10 sm:gap-16 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <img
            src={technicianImg}
            alt="MR. KHAN Technician repairing device motherboard"
            width={1400}
            height={1000}
            loading="lazy"
            className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-[4/3] border border-[#E6EAF0]"
          />
          <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-md border border-[#E6EAF0] rounded-xl p-3 sm:p-4 shadow-lg max-w-[calc(100%-1.5rem)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 grid place-items-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#0B1220]">6-Month Warranty</div>
                <div className="text-xs text-[#5B6472]">Full parts and labour cover</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
            Experienced Technicians · Quality Repairs
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#0B1220] tracking-tight">
            Local Phone Repair You Can Trust
          </h2>
          <p className="text-[#5B6472] leading-relaxed text-sm sm:text-base">
            We are a local phone repair team based in Liverpool. Our technicians repair phones every day and work with customers across Liverpool and the surrounding areas. You can visit our workshop on London Road or book a home repair or mail-in service.
          </p>
          <ul className="grid gap-3 pt-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm font-medium text-[#0B1220]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
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
    <section className="py-16 sm:py-24 bg-surface">
      <div className="container-x">
        <SectionHeader
          eyebrow="Reviews"
          title="What Our Customers Say"
          description={`Rated ${business.rating.stars} out of 5 on Google`}
        />
        <div className="mt-10 sm:mt-14">
          <ReviewsCarousel />
        </div>
        <div className="mt-10 flex flex-col items-center gap-6">
          <Button asChild variant="outline" className="rounded-full min-h-[44px]">
            <a href={business.googleReviewUrl} target="_blank" rel="noreferrer">
              <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" />
              Leave a Google review
            </a>
          </Button>

          {/* Decision Stage Primary CTA Box */}
          <div className="w-full max-w-2xl p-5 sm:p-8 rounded-3xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-center space-y-4 shadow-xs mt-4">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">
              Local Phone Repair in Liverpool
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Same-day repairs covered by our 6-month warranty.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-8 text-sm font-semibold min-h-[48px]"
              >
                <Link
                  to="/book"
                  onClick={() =>
                    trackFunnelEvent("book_click", { location: "reviews_decision_stage" })
                  }
                >
                  Book Repair <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-6 text-sm font-semibold border-border bg-card/80 min-h-[48px]"
              >
                <a href={telLink()}>
                  <Phone className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
      desc: "Visit our Liverpool workshop. Most repairs are completed in 30–60 minutes.",
      cta: "Book Walk-in Repair →",
      to: "/book" as const,
    },
    {
      icon: HomeIcon,
      img: homeVisitIllustration,
      title: "Home Repair",
      desc: "We come to you. Book a repair at your home or workplace across Liverpool and nearby areas.",
      cta: "Book Home Visit →",
      to: "/home-repair" as const,
    },
    {
      icon: Package,
      img: mailinIllustration,
      title: "Mail-in Repair",
      desc: "Send your phone to us by tracked post. We will repair it and arrange its return.",
      cta: "Book Mail-in Repair →",
      to: "/mail-in" as const,
    },
  ];
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container-x">
        <SectionHeader eyebrow="Choose your service" title="Repair Options" />
        <div className="mt-10 sm:mt-14 grid gap-6 sm:gap-8 md:grid-cols-3">
          {opts.map((o) => (
            <Card
              key={o.title}
              className="border-border/70 group hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 bg-card overflow-hidden"
            >
              <CardContent className="p-5 sm:p-8 flex flex-col justify-between h-full">
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
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
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
                  className="mt-6 px-0 text-indigo-600 dark:text-indigo-400 font-semibold justify-start min-h-[44px]"
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
    <section className="py-16 sm:py-24 bg-surface" id="quote">
      <div className="container-x grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
            Free quote
          </p>
          <h2 className="mt-3 font-display font-bold text-2xl sm:text-4xl">
            Not sure of the cost?
            <br />
            Get a free estimate.
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            Tell us what is wrong with your phone. We will review the details and get back to you with an estimated price.
          </p>
          <img
            src={devicesImg}
            alt="Various devices repaired by MR. KHAN"
            width={1400}
            height={900}
            loading="lazy"
            className="mt-6 sm:mt-8 rounded-2xl w-full h-auto object-cover aspect-[16/10] border border-border"
          />
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Phone Repair FAQs" />
        <div className="mt-8 sm:mt-12">
          <FaqAccordion />
        </div>
        <div className="mt-8 sm:mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full min-h-[44px]">
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
    <section className="py-16 sm:py-20 border-t border-border bg-background">
      <div className="container-x">
        <SectionHeader
          eyebrow="Liverpool Workshop"
          title="Visit Our Liverpool Repair Centre"
          description="We are based on London Road in Liverpool. Visit us for a same-day repair or contact us to book your repair."
        />
        <div className="mt-8 sm:mt-10 flex flex-col md:block relative rounded-3xl overflow-hidden border border-border/80 shadow-md min-h-[380px] md:aspect-[16/7]">
          <div className="p-4 sm:p-5 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl max-w-sm z-10 space-y-3 m-3 md:m-0 md:absolute md:top-4 md:left-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <MapPin className="h-4 w-4 shrink-0" /> Liverpool Repair Workshop
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Address
              </div>
              <div className="text-sm font-semibold text-foreground leading-snug mt-0.5">
                {business.address.line1}, {business.address.city} {business.address.postcode}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Located inside Liverpool Post Office
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground pt-1 border-t border-border/60">
              <Phone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" /> {business.phone}
            </div>
            <div className="pt-2 flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="rounded-xl h-10 px-4 text-xs font-semibold min-h-[40px]"
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
                className="rounded-xl h-10 px-3 text-xs font-semibold min-h-[40px]"
              >
                <a href={telLink()}>
                  <Phone className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                  Call
                </a>
              </Button>
            </div>
          </div>
          <iframe
            title="MR. KHAN Liverpool Workshop Location"
            src={business.googleMapsEmbed}
            className="w-full h-full min-h-[320px] md:min-h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="py-24 bg-[#050B1A] text-white relative overflow-hidden">
      <div className="container-x max-w-4xl text-center space-y-6 relative z-10">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight">
          Phone Broken? Let's Get It Fixed.
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Same-day repairs. Experienced technicians. Clear pricing. Book online or visit our London Road workshop today.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-xl h-13 px-8 text-base font-semibold shadow-xl shadow-indigo-600/30 transition-all"
          >
            <Link
              to="/book"
              onClick={() => trackFunnelEvent("book_click", { location: "final_cta" })}
            >
              Book Your Repair <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl h-13 px-7 text-base font-semibold border-white/20 bg-white/10 hover:bg-white/20 text-white"
          >
            <a href={telLink()}>
              <Phone className="mr-2 h-4 w-4 text-indigo-400" />
              Call Us: {business.phone}
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
