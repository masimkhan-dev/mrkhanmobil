import type { LucideIcon } from "lucide-react";
import {
  Smartphone,
  Battery,
  Zap,
  Camera,
  Volume2,
  Mic,
  Droplets,
  Cpu,
  HardDrive,
  ScanLine,
  Wrench,
  HelpCircle,
} from "lucide-react";

import type React from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Battery,
  Zap,
  Camera,
  Volume2,
  Mic,
  Droplets,
  Cpu,
  HardDrive,
  ScanLine,
  Wrench,
  HelpCircle,
};

export interface Service {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  fromPricePence?: number; // Integer pence (e.g. 4900 = £49.00)
  priceFrom: string; // Formatted "From £XX" or "Price on assessment"
  turnaround: string;
  category: "device" | "repair";
  features: string[];
}

/**
 * Formats a minimum price in pence according to UK price-transparency guidelines.
 * Returns "From £XX" when a reliable minimum is configured, or "Price on assessment" if unavailable.
 */
export function formatFromPrice(
  fromPricePence?: number | null,
  fallback = "Price on assessment",
): string {
  if (fromPricePence == null || Number.isNaN(fromPricePence) || fromPricePence <= 0) {
    return fallback;
  }
  const pounds = fromPricePence / 100;
  return pounds % 1 === 0 ? `From £${pounds}` : `From £${pounds.toFixed(2)}`;
}

/**
 * Builds standard pre-filled message for WhatsApp repair inquiries
 */
export function buildRepairQuoteMessage({
  device = "Not specified",
  service,
  price,
}: {
  device?: string;
  service: string;
  price?: string;
}): string {
  const displayPrice = price && price.trim() ? price.trim() : "Price on assessment";
  return `Hi MR. KHAN, I’d like a repair quote.\nDevice: ${device}\nService: ${service}\nWebsite price: ${displayPrice}\nPlease confirm the final price and availability.`;
}

export const services: Service[] = [
  // ── Device-Specific Pages ──────────────────────────────────────────────────
  {
    slug: "iphone-repair",
    title: "iPhone Repair",
    short: "All iPhone models — same-day",
    icon: Smartphone,
    category: "device",
    fromPricePence: 2900,
    priceFrom: "From £29",
    turnaround: "30 min – 2 hrs",
    description:
      "Expert iPhone repair from iPhone 6 through iPhone 15 Pro Max. Screens, batteries, cameras, charging ports, back glass and logic-board level work — all backed by our 12-month warranty.",
    features: [
      "Genuine-grade parts",
      "12-month warranty",
      "Same-day for most repairs",
      "No fix, no fee",
    ],
  },
  {
    slug: "samsung-repair",
    title: "Samsung Repair",
    short: "Galaxy S, Note, A, Z Fold/Flip",
    icon: Smartphone,
    category: "device",
    fromPricePence: 3500,
    priceFrom: "From £35",
    turnaround: "1 – 3 hrs",
    description:
      "Full Samsung Galaxy repair coverage including foldables. Screen replacement (OLED & AMOLED), battery, charging port, cameras and water damage recovery.",
    features: [
      "OLED-grade panels",
      "12-month warranty",
      "Fold & Flip specialists",
      "Data preserved",
    ],
  },
  {
    slug: "google-pixel-repair",
    title: "Google Pixel Repair",
    short: "Pixel 3 through Pixel 8 Pro",
    icon: Smartphone,
    category: "device",
    fromPricePence: 4500,
    priceFrom: "From £45",
    turnaround: "1 – 3 hrs",
    description:
      "Google Pixel screen, battery, camera and charging repairs by certified technicians. We stock parts for every recent Pixel generation.",
    features: [
      "OEM-quality parts",
      "12-month warranty",
      "Fingerprint recalibration",
      "Free diagnostic",
    ],
  },
  {
    slug: "huawei-repair",
    title: "Huawei Repair",
    short: "P series, Mate, Nova, Honor",
    icon: Smartphone,
    category: "device",
    fromPricePence: 4500,
    priceFrom: "From £45",
    turnaround: "1 – 3 hrs",
    description:
      "Huawei and Honor repair specialists. Screens, batteries and charging ports for every popular model.",
    features: ["Genuine-grade parts", "12-month warranty", "Data preserved", "Free diagnostic"],
  },
  {
    slug: "xiaomi-repair",
    title: "Xiaomi Repair",
    short: "Mi, Redmi, Poco",
    icon: Smartphone,
    category: "device",
    fromPricePence: 3500,
    priceFrom: "From £35",
    turnaround: "1 – 3 hrs",
    description:
      "Full Xiaomi coverage across Mi, Redmi and Poco ranges — from cracked screens to charging ports.",
    features: ["OEM-quality parts", "12-month warranty", "Same-day", "No fix, no fee"],
  },
  {
    slug: "oppo-repair",
    title: "Oppo Repair",
    short: "Find, Reno, A-series",
    icon: Smartphone,
    category: "device",
    fromPricePence: 3900,
    priceFrom: "From £39",
    turnaround: "1 – 3 hrs",
    description: "Oppo repair for Find, Reno and A-series handsets. Fast, reliable and warrantied.",
    features: ["Genuine-grade parts", "12-month warranty", "Same-day", "Free diagnostic"],
  },
  {
    slug: "oneplus-repair",
    title: "OnePlus Repair",
    short: "OnePlus 6 through 12",
    icon: Smartphone,
    category: "device",
    fromPricePence: 4500,
    priceFrom: "From £45",
    turnaround: "1 – 3 hrs",
    description:
      "OnePlus screens, batteries, dash-charge port and camera repairs — same-day where parts are in stock.",
    features: [
      "Genuine-grade parts",
      "12-month warranty",
      "Dash-charge specialists",
      "Data preserved",
    ],
  },
  {
    slug: "other-brands-repair",
    title: "Other Brands & Tablets",
    short: "Honor, Sony, Nokia, Motorola, iPad",
    icon: HelpCircle,
    category: "device",
    fromPricePence: 2500,
    priceFrom: "From £25",
    turnaround: "1 – 3 hrs",
    description:
      "Don't see your brand? We repair Honor, Sony, Nokia, Motorola, Asus, RealMe, iPads and tablets. Contact us for a fast quote.",
    features: ["All major brands", "12-month warranty", "Fast turnaround", "Free diagnostic"],
  },

  // ── Problem-Specific Services ──────────────────────────────────────────────
  {
    slug: "screen-replacement",
    title: "Screen Replacement",
    short: "Cracked or dead display — OLED and LCD",
    icon: Smartphone,
    category: "repair",
    fromPricePence: 4900,
    priceFrom: "From £49",
    turnaround: "30 min – 2 hrs",
    description:
      "Cracked screen, black screen, dead pixels or unresponsive touch — fixed with OLED/AMOLED-grade replacement panels.",
    features: ["OEM-quality panels", "12-month warranty", "True-tone re-calibration"],
  },
  {
    slug: "battery-replacement",
    title: "Battery Replacement",
    short: "Restore full-day battery life",
    icon: Battery,
    category: "repair",
    fromPricePence: 2900,
    priceFrom: "From £29",
    turnaround: "30 – 60 min",
    description:
      "High-grade replacement batteries fitted while you wait for iPhone, Samsung and all major Android phones.",
    features: ["Health-tested cells", "12-month warranty", "Fitted while you wait"],
  },
  {
    slug: "charging-port",
    title: "Charging Port Repair",
    short: "Won't charge or loose connector",
    icon: Zap,
    category: "repair",
    fromPricePence: 3500,
    priceFrom: "From £35",
    turnaround: "1 – 2 hrs",
    description:
      "Micro-soldered charging port repair — deep clean, connector replacement or full port assembly swap.",
    features: ["Micro-solder repair", "12-month warranty", "Deep clean included"],
  },
  {
    slug: "camera-repair",
    title: "Camera Repair",
    short: "Blurry, cracked or dead camera",
    icon: Camera,
    category: "repair",
    fromPricePence: 3900,
    priceFrom: "From £39",
    turnaround: "1 – 2 hrs",
    description:
      "Rear, front and ultra-wide camera module replacement. Auto-focus, lens and flex-cable repair.",
    features: ["OEM modules", "12-month warranty", "Test shot verification"],
  },
  {
    slug: "speaker-repair",
    title: "Speaker Repair",
    short: "No sound or muffled audio",
    icon: Volume2,
    category: "repair",
    fromPricePence: 2900,
    priceFrom: "From £29",
    turnaround: "1 – 2 hrs",
    description: "Earpiece and loud-speaker replacement — clean, replace or re-solder as needed.",
    features: ["Audio-tested", "12-month warranty"],
  },
  {
    slug: "microphone-repair",
    title: "Microphone Repair",
    short: "Callers can't hear you clearly",
    icon: Mic,
    category: "repair",
    fromPricePence: 2900,
    priceFrom: "From £29",
    turnaround: "1 – 2 hrs",
    description:
      "Primary, noise-cancelling and video-mic array repair on iPhone, Samsung and more.",
    features: ["Call-tested", "12-month warranty"],
  },
  {
    slug: "back-glass",
    title: "Back Glass Repair",
    short: "Laser removal for iPhone & Samsung",
    icon: ScanLine,
    category: "repair",
    fromPricePence: 3900,
    priceFrom: "From £39",
    turnaround: "1 – 3 hrs",
    description:
      "Laser-precision back glass removal and replacement — colour-matched and adhesive-sealed.",
    features: ["Colour-matched", "12-month warranty", "Wireless-charge tested"],
  },
  {
    slug: "water-damage",
    title: "Water Damage Repair",
    short: "Liquid-damaged device rescue",
    icon: Droplets,
    category: "repair",
    fromPricePence: 4500,
    priceFrom: "From £45",
    turnaround: "24 – 72 hrs",
    description:
      "Ultrasonic board cleaning and component-level rework to recover water-damaged devices. Free diagnostic.",
    features: ["Ultrasonic clean", "Data recovery", "No fix, no fee"],
  },
  {
    slug: "software-repair",
    title: "Software Support",
    short: "Boot loop, iOS/Android errors",
    icon: Cpu,
    category: "repair",
    fromPricePence: 2500,
    priceFrom: "From £25",
    turnaround: "1 – 4 hrs",
    description:
      "iOS/Android restore, boot-loop fix, iCloud/FRP support (proof required), Windows reinstall and virus removal.",
    features: ["Data-safe methods", "Same-day", "Fixed price"],
  },
  {
    slug: "data-recovery",
    title: "Data Recovery",
    short: "Photos, contacts & messages rescue",
    icon: HardDrive,
    category: "repair",
    fromPricePence: undefined, // Price depends on disk/board damage
    priceFrom: "Price on assessment",
    turnaround: "24 – 72 hrs",
    description:
      "Data recovery from dead phones, water-damaged devices, failed hard drives and SSDs.",
    features: ["No data, no fee", "Confidential", "Secure return"],
  },
  {
    slug: "diagnostic-check",
    title: "Diagnostic & Inspection",
    short: "Full hardware & board health test",
    icon: HelpCircle,
    category: "repair",
    fromPricePence: 1500,
    priceFrom: "From £15",
    turnaround: "15 – 45 min",
    description:
      "Comprehensive hardware and diagnostic health check to pinpoint unknown faults. Free when you proceed with any recommended repair.",
    features: ["Free with repair", "Full component test", "Written report"],
  },
  {
    slug: "logic-board-repair",
    title: "Logic Board & Micro-Soldering",
    short: "Chip-level IC & power rail fix",
    icon: Cpu,
    category: "repair",
    fromPricePence: 4500,
    priceFrom: "From £45",
    turnaround: "24 – 48 hrs",
    description:
      "Expert micro-soldering for damaged FPC connectors, no-power faults, backlight IC issues, audio IC and baseband repairs.",
    features: ["Microscope rework", "12-month warranty", "No fix, no fee"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const deviceServices = services.filter((s) => s.category === "device");
export const repairServices = services.filter((s) => s.category === "repair");

export const brands = [
  "Apple",
  "Samsung",
  "Google",
  "Huawei",
  "Xiaomi",
  "Oppo",
  "OnePlus",
  "Honor",
  "Sony",
  "Nokia",
  "Motorola",
] as const;

export const problems = [
  "Cracked screen",
  "Battery drains fast",
  "Won't charge",
  "Water damage",
  "No sound / speaker",
  "Camera not working",
  "Microphone issue",
  "Software / boot loop",
  "Data recovery",
  "Back glass cracked",
  "Other",
] as const;

export const cities = [
  {
    slug: "liverpool",
    name: "Liverpool",
    postcodes: "L1 – L36",
    intro: "Same-day mobile phone repair for Liverpool city centre and surrounding areas.",
  },
  {
    slug: "manchester",
    name: "Manchester",
    postcodes: "M1 – M46",
    intro:
      "Trusted Manchester repair experts — walk-in, home visit or mail-in service across Greater Manchester.",
  },
  {
    slug: "bootle",
    name: "Bootle",
    postcodes: "L20 – L30",
    intro: "Bootle's local phone repair specialists — fast turnaround, warranty on every repair.",
  },
  {
    slug: "wirral",
    name: "Wirral",
    postcodes: "CH41 – CH66",
    intro:
      "Home and mail-in repair for the Wirral peninsula — Birkenhead, Wallasey, Heswall and beyond.",
  },
  {
    slug: "st-helens",
    name: "St Helens",
    postcodes: "WA9 – WA12",
    intro: "St Helens phone repair — same-day service with a real 12-month warranty.",
  },
  {
    slug: "southport",
    name: "Southport",
    postcodes: "PR8 – PR9",
    intro: "Repair collection and mail-in service across Southport — free UK-wide return delivery.",
  },
  {
    slug: "birkenhead",
    name: "Birkenhead",
    postcodes: "CH41 – CH43",
    intro: "Birkenhead's premier repair service — walk-in, home visit or courier collection.",
  },
] as const;

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);

export function getIconComponent(name: string): React.ComponentType<{ className?: string }> {
  const Icon = ICON_MAP[name];
  return Icon || Wrench;
}
