import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Smartphone,
  BadgePoundSterling,
  Headphones,
  Zap,
  Shield,
  Watch,
  Cable,
  Car,
  Volume2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { business, telLink, whatsappLink } from "@/config/business";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

export const Route = createFileRoute("/buy-sell")({
  head: () => ({
    meta: [
      {
        title: "Buy & Sell Phones, Accessories & Electronics | MR. KHAN Liverpool",
      },
      {
        name: "description",
        content:
          "Buy, sell and shop mobile phones, everyday accessories and electronic devices at MR. KHAN on London Road, Liverpool. Visit in-store or message on WhatsApp.",
      },
      {
        property: "og:title",
        content: "Buy & Sell Phones, Accessories & Electronics | MR. KHAN Liverpool",
      },
      {
        property: "og:description",
        content:
          "Buy, sell and shop mobile phones, everyday accessories and electronic devices at MR. KHAN on London Road, Liverpool.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${business.url}/buy-sell` },
    ],
    links: [{ rel: "canonical", href: `${business.url}/buy-sell` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.mrkhanmobiles.co.uk/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Buy & Sell",
              item: "https://www.mrkhanmobiles.co.uk/buy-sell",
            },
          ],
        }),
      },
    ],
  }),
  component: BuySellPage,
});

function BuySellPage() {
  const accessoriesList = [
    {
      icon: Shield,
      title: "Phone cases and screen protectors",
      desc: "Silicone, clear, rugged, MagSafe cases & tempered glass fitted in-store.",
    },
    {
      icon: Cable,
      title: "Charging cables and wall chargers",
      desc: "USB-C, Lightning, 20W/30W/65W fast chargers for Apple, Samsung & Android.",
    },
    {
      icon: Car,
      title: "Power banks and car chargers",
      desc: "High-capacity portable battery packs, car mounts & fast 12V adaptors.",
    },
    {
      icon: Headphones,
      title: "Earphones, headphones and speakers",
      desc: "Bluetooth wireless earbuds, wired headsets, aux cables & portable speakers.",
    },
    {
      icon: Watch,
      title: "Smartwatches and wearable accessories",
      desc: "Replacement straps, screen guards and magnetic chargers for Apple Watch & Wear OS.",
    },
    {
      icon: Zap,
      title: "Phone holders, adapters and everyday electronics",
      desc: "OTG connectors, multiport hubs, desk stands, selfie accessories & vapes.",
    },
  ];

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#07101d] text-white pt-14 sm:pt-20 pb-20 sm:pb-24 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-brand/15 blur-[130px] pointer-events-none rounded-full" />

        <div className="container-x relative z-10 max-w-4xl text-center">
          {/* Eyebrow */}
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand mb-4">
            Mobile Phones, Accessories &amp; Electronics in Liverpool
          </p>

          {/* Headline */}
          <h1 className="text-[2.3rem] sm:text-[3.2rem] lg:text-[3.8rem] font-display font-extrabold leading-[1.12] tracking-tight text-white">
            Buy, Sell &amp; Shop Mobile Phones &amp; Accessories —{" "}
            <span className="text-white">MR. KHAN</span>
          </h1>

          {/* Subtext */}
          <p className="mt-5 text-[1.05rem] sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Looking for a mobile phone, everyday accessories or electronic devices? Visit our London
            Road shop or message us to check current availability.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <a
              href="#accessories"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-brand text-white font-bold text-base hover:bg-brand-hover transition-colors min-h-[52px] w-full sm:w-auto shadow-md"
            >
              Shop Phones &amp; Accessories
            </a>
            <a
              href="#sell-phone"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] border border-white/25 bg-white/10 backdrop-blur-sm text-white font-bold text-base hover:bg-white/20 transition-colors min-h-[52px] w-full sm:w-auto"
            >
              Sell Your Phone
            </a>
          </div>

          {/* Quick shop address strip */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" />
              {business.address.line1}, {business.address.city} {business.address.postcode}
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-brand" />
              Call {business.phone}
            </span>
          </div>
        </div>
      </section>

      {/* ── Buy & Sell Two-Column Feature Cards ───────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white" id="phones">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Card 1: Looking to Buy a Phone */}
            <div className="flex flex-col justify-between p-7 sm:p-9 rounded-2xl bg-[#f7f7f5] border border-[#e3e5e8] hover:border-brand/30 transition-all shadow-xs">
              <div>
                <div className="h-12 w-12 rounded-xl bg-white border border-[#e3e5e8] grid place-items-center mb-5 shadow-xs">
                  <Smartphone className="h-6 w-6 text-brand" />
                </div>
                <h2 className="font-display font-bold text-[24px] sm:text-[28px] text-[#111318] leading-tight">
                  Looking to Buy a Phone?
                </h2>
                <p className="mt-3 text-[15px] sm:text-base text-[#5f6670] leading-relaxed">
                  We offer a selection of new and pre-owned mobile phones. Tell us the model,
                  storage and budget you need, and our team will check what is currently available.
                </p>

                <ul className="mt-5 space-y-2.5">
                  <li className="flex items-center gap-2.5 text-sm text-[#111318] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <span>Apple iPhone, Samsung Galaxy &amp; popular Android handsets</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-[#111318] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <span>Fully tested, IMEI checked with written shop invoice</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-[#111318] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <span>Warranty coverage included on purchases</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-[#e3e5e8]">
                <a
                  href={whatsappLink(
                    "Hi MR. KHAN, I am looking to buy a mobile phone. Could you please share which models and prices you currently have in stock?",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackFunnelEvent("book_click", {
                      location: "buy_sell_page",
                      service: "Check Available Phones",
                    })
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors min-h-[48px]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Check Available Phones
                </a>
              </div>
            </div>

            {/* Card 2: Looking to Sell Your Phone */}
            <div
              className="flex flex-col justify-between p-7 sm:p-9 rounded-2xl bg-[#f7f7f5] border border-[#e3e5e8] hover:border-brand/30 transition-all shadow-xs"
              id="sell-phone"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-white border border-[#e3e5e8] grid place-items-center mb-5 shadow-xs">
                  <BadgePoundSterling className="h-6 w-6 text-brand" />
                </div>
                <h2 className="font-display font-bold text-[24px] sm:text-[28px] text-[#111318] leading-tight">
                  Looking to Sell Your Phone?
                </h2>
                <p className="mt-3 text-[15px] sm:text-base text-[#5f6670] leading-relaxed">
                  Bring your phone to our Liverpool shop for an in-person assessment. We will check
                  its condition and provide a clear purchase or trade-in price.
                </p>

                {/* Notice box */}
                <div className="mt-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 leading-snug">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Please remove personal accounts and back up your data before visiting.
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2.5 text-sm text-[#111318] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <span>Instant same-day valuation and fast payout</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-[#111318] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <span>Trade-in against upgrades or repair services</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-[#e3e5e8]">
                <a
                  href={whatsappLink(
                    "Hi MR. KHAN, I want to sell/trade-in my phone. Could you give me an estimate? Device details:",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackFunnelEvent("book_click", {
                      location: "buy_sell_page",
                      service: "Get Price for Phone",
                    })
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[8px] bg-brand text-white font-bold text-sm hover:bg-brand-hover transition-colors min-h-[48px]"
                >
                  <BadgePoundSterling className="h-4 w-4" />
                  Get a Price for Your Phone
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Accessories & Electronics Grid ───────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#f7f7f5] border-y border-[#e3e5e8]" id="accessories">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="text-xs uppercase tracking-[0.16em] text-brand font-bold">
              Everyday Tech Essentials
            </p>
            <h2 className="mt-2 font-display font-extrabold text-[1.9rem] sm:text-[2.5rem] text-[#111318] tracking-tight leading-tight">
              Mobile Accessories &amp; Electronics
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5f6670] leading-relaxed">
              We stock a wide range of mobile accessories and selected electronic devices. Stock
              changes regularly — call or WhatsApp us to check whether a particular item is
              available.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accessoriesList.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col p-6 rounded-2xl bg-white border border-[#e3e5e8] hover:border-brand/30 hover:shadow-md transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#f7f7f5] border border-[#e3e5e8] grid place-items-center mb-4 shrink-0">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-[#111318] leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#5f6670] leading-relaxed flex-1">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <a
              href={whatsappLink(
                "Hi MR. KHAN, I am inquiring about accessories/electronics. Do you have this item in stock?",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors min-h-[48px] shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Ask About Accessories
            </a>
          </div>
        </div>
      </section>

      {/* ── Visit Our Liverpool Shop ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white" id="shop-location">
        <div className="container-x">
          <div className="rounded-3xl bg-[#07101d] text-white p-8 sm:p-12 lg:p-14 border border-slate-800 shadow-xl overflow-hidden grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                In-Store Shopping &amp; Support
              </p>
              <h2 className="font-display font-extrabold text-[2rem] sm:text-[2.6rem] text-white tracking-tight leading-tight">
                Visit Our Liverpool Shop
              </h2>
              <div className="space-y-1 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed">
                <div className="font-bold text-white text-lg">{business.name}</div>
                <div>{business.legalName}</div>
                <div>{business.address.line1}</div>
                <div>
                  {business.address.city} {business.address.postcode}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-sm text-slate-300">
                <a
                  href={telLink()}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-brand" />
                  Call: {business.phone}
                </a>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-brand" />
                  Email: {business.email}
                </a>
              </div>

              <div className="pt-3">
                <a
                  href={business.social.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[8px] bg-brand text-white font-bold text-sm hover:bg-brand-hover transition-colors min-h-[48px]"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Google map embed iframe */}
            <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg h-[280px] sm:h-[320px]">
              <iframe
                title="MR. KHAN Shop Location on London Road Liverpool"
                src={business.googleMapsEmbed}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── What Are You Looking For? Final Call to Action ───────────────── */}
      <section className="py-16 sm:py-20 bg-[#f7f7f5] border-t border-[#e3e5e8]">
        <div className="container-x max-w-3xl text-center">
          <h2 className="font-display font-extrabold text-[2rem] sm:text-[2.6rem] text-[#111318] tracking-tight">
            What Are You Looking For?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5f6670] leading-relaxed max-w-xl mx-auto">
            Send us the product name, phone model or a photo of the accessory you need. Our team
            will check availability and reply with the relevant details.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center">
            <a
              href={whatsappLink(
                "Hi MR. KHAN, I am looking for a product/accessory. Here are the details:",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackFunnelEvent("book_click", {
                  location: "buy_sell_cta",
                  service: "WhatsApp Us",
                })
              }
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors min-h-[48px] shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </a>
            <a
              href={telLink()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] border border-[#e3e5e8] bg-white text-[#111318] font-bold text-sm hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              <Phone className="h-4 w-4 text-brand" />
              Call {business.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
