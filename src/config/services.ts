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

const ICON_MAP: Record<string, any> = {
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
  priceFrom: string;
  turnaround: string;
  category: "device" | "repair";
  features: string[];
}

export const services: Service[] = [
  {
    slug: "iphone-repair",
    title: "iPhone Repair",
    short: "All iPhone models — same-day",
    icon: Smartphone,
    category: "device",
    priceFrom: "£29",
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
    priceFrom: "£35",
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
    priceFrom: "£45",
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
    priceFrom: "£45",
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
    priceFrom: "£35",
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
    priceFrom: "£39",
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
    priceFrom: "£45",
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
    title: "Other Brands & Quote",
    short: "Honor, Sony, Nokia, Motorola & more",
    icon: HelpCircle,
    category: "device",
    priceFrom: "£25",
    turnaround: "1 – 3 hrs",
    description:
      "Don't see your brand? We repair Honor, Sony, Nokia, Motorola, Asus, RealMe and all other models. Contact us for a fast quote.",
    features: ["All major brands", "12-month warranty", "Fast turnaround", "Free diagnostic"],
  },

  {
    slug: "battery-replacement",
    title: "Battery Replacement",
    short: "Restore all-day battery life",
    icon: Battery,
    category: "repair",
    priceFrom: "£29",
    turnaround: "30 – 60 min",
    description:
      "High-grade replacement batteries fitted while you wait for iPhone, Samsung and all major Android phones.",
    features: ["Health-tested cells", "12-month warranty", "Fitted while you wait"],
  },
  {
    slug: "screen-replacement",
    title: "Screen Replacement",
    short: "Cracked or dead display",
    icon: Smartphone,
    category: "repair",
    priceFrom: "£29",
    turnaround: "30 min – 2 hrs",
    description:
      "Cracked screen, black screen, dead pixels or unresponsive touch — fixed with OLED/AMOLED-grade replacement panels.",
    features: ["OEM-quality panels", "12-month warranty", "True-tone re-calibration"],
  },
  {
    slug: "charging-port",
    title: "Charging Port Repair",
    short: "Won't charge or loose port",
    icon: Zap,
    category: "repair",
    priceFrom: "£35",
    turnaround: "1 – 2 hrs",
    description:
      "Micro-soldered charging port repair — deep clean, connector replacement or full port assembly swap.",
    features: ["Micro-solder repair", "12-month warranty", "Deep clean included"],
  },
  {
    slug: "camera-repair",
    title: "Camera Repair",
    short: "Blurry or dead camera",
    icon: Camera,
    category: "repair",
    priceFrom: "£39",
    turnaround: "1 – 2 hrs",
    description:
      "Rear, front and ultra-wide camera module replacement. Auto-focus, lens and flex-cable repair.",
    features: ["OEM modules", "12-month warranty", "Test shot verification"],
  },
  {
    slug: "speaker-repair",
    title: "Speaker Repair",
    short: "No sound or muffled speaker",
    icon: Volume2,
    category: "repair",
    priceFrom: "£29",
    turnaround: "1 – 2 hrs",
    description: "Earpiece and loud-speaker replacement — clean, replace or re-solder as needed.",
    features: ["Audio-tested", "12-month warranty"],
  },
  {
    slug: "microphone-repair",
    title: "Microphone Repair",
    short: "Callers can't hear you",
    icon: Mic,
    category: "repair",
    priceFrom: "£29",
    turnaround: "1 – 2 hrs",
    description:
      "Primary, noise-cancelling and video-mic array repair on iPhone, Samsung and more.",
    features: ["Call-tested", "12-month warranty"],
  },
  {
    slug: "water-damage",
    title: "Water Damage Repair",
    short: "Liquid-damaged device rescue",
    icon: Droplets,
    category: "repair",
    priceFrom: "£45",
    turnaround: "24 – 72 hrs",
    description:
      "Ultrasonic board cleaning and component-level rework to recover water-damaged devices. Free diagnostic.",
    features: ["Ultrasonic clean", "Data recovery", "No fix, no fee"],
  },
  {
    slug: "software-repair",
    title: "Software Repair",
    short: "Boot loop, iOS/Android errors",
    icon: Cpu,
    category: "repair",
    priceFrom: "£25",
    turnaround: "1 – 4 hrs",
    description:
      "iOS/Android restore, boot-loop fix, iCloud/FRP support (proof required), Windows reinstall and virus removal.",
    features: ["Data-safe methods", "Same-day", "Fixed price"],
  },
  {
    slug: "data-recovery",
    title: "Data Recovery",
    short: "Photos, contacts, messages",
    icon: HardDrive,
    category: "repair",
    priceFrom: "£59",
    turnaround: "24 – 72 hrs",
    description:
      "Data recovery from dead phones, water-damaged devices, failed hard drives and SSDs.",
    features: ["No data, no fee", "Confidential", "Secure return"],
  },
  {
    slug: "back-glass",
    title: "Back Glass Repair",
    short: "iPhone & Samsung back covers",
    icon: ScanLine,
    category: "repair",
    priceFrom: "£39",
    turnaround: "1 – 3 hrs",
    description:
      "Laser-precision back glass removal and replacement — colour-matched and adhesive-sealed.",
    features: ["Colour-matched", "12-month warranty", "Wireless-charge tested"],
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

export function getIconComponent(name: string): any {
  const Icon = ICON_MAP[name];
  return Icon || Wrench;
}
