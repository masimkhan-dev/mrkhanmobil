/**
 * Predefined retail constants & autocomplete data for MR KHAN Counter POS.
 */

export const DEVICE_MODELS: readonly string[] = [
  // Apple iPhone
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13 Mini",
  "iPhone 13",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12 Mini",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XS Max",
  "iPhone XS",
  "iPhone XR",
  "iPhone X",
  "iPhone SE (3rd Gen)",
  // Apple iPad & Mac
  'iPad Pro 13" (M4)',
  'iPad Pro 11" (M4)',
  'iPad Air 13" (M2)',
  "iPad (10th Gen)",
  'MacBook Pro 16"',
  'MacBook Pro 14"',
  'MacBook Air 15"',
  'MacBook Air 13"',
  // Samsung Galaxy S & Fold/Flip
  "Samsung Galaxy S25 Ultra",
  "Samsung Galaxy S25+",
  "Samsung Galaxy S25",
  "Samsung Galaxy S24 Ultra",
  "Samsung Galaxy S24+",
  "Samsung Galaxy S24",
  "Samsung Galaxy S23 Ultra",
  "Samsung Galaxy S23+",
  "Samsung Galaxy S23",
  "Samsung Galaxy S22 Ultra",
  "Samsung Galaxy S22",
  "Samsung Galaxy Z Fold 6",
  "Samsung Galaxy Z Flip 6",
  // Samsung Galaxy A Series
  "Samsung Galaxy A55 5G",
  "Samsung Galaxy A54 5G",
  "Samsung Galaxy A35 5G",
  "Samsung Galaxy A25 5G",
  "Samsung Galaxy A15",
  // Google Pixel
  "Google Pixel 9 Pro XL",
  "Google Pixel 9 Pro",
  "Google Pixel 9",
  "Google Pixel 8 Pro",
  "Google Pixel 8a",
  "Google Pixel 8",
  "Google Pixel 7 Pro",
  "Google Pixel 7a",
  "Google Pixel 7",
  // Xiaomi & Others
  "Xiaomi 14 Ultra",
  "Xiaomi 14",
  "Redmi Note 13 Pro+",
  "POCO X6 Pro",
  // Consoles & Laptops
  "PlayStation 5",
  "PlayStation 5 Slim",
  "PlayStation 4 Pro",
  "PlayStation 4",
  "Xbox Series X",
  "Xbox Series S",
  "Xbox One X",
  "Nintendo Switch OLED",
  "Nintendo Switch",
  "Nintendo Switch Lite",
  "Dell XPS 15",
  "HP Spectre x360",
  "Lenovo ThinkPad X1 Carbon",
];

export const REPAIR_TYPES: readonly string[] = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Back Glass Replacement",
  "Camera Repair (Rear)",
  "Camera Repair (Front)",
  "Speaker / Earpiece Repair",
  "Microphone Repair",
  "Water Damage Assessment & Diagnostic",
  "Power / Volume Button Repair",
  "Network Unlock / SIM Unlock",
  "Software / iOS Reset & Restore",
  "Data Recovery & Transfer",
  "Console HDMI Port Repair",
  "Laptop Screen Replacement",
  "Laptop Battery Replacement",
  "Other Hardware Repair",
];

export const ID_TYPES: readonly string[] = [
  "Driving Licence",
  "Passport",
  "National ID",
  "CitizenCard",
  "Trade Account / Other",
];

export const CONDITION_GRADES: readonly string[] = [
  "Brand New",
  "Grade A (Like New)",
  "Grade B (Good)",
  "Grade C (Fair)",
  "Faulty / For Parts",
];

/**
 * Automatically infers brand/make from model name string.
 */
export function inferBrand(model: string, fallbackBrand = "Apple"): string {
  const m = model.toLowerCase();
  if (m.includes("iphone") || m.includes("ipad") || m.includes("macbook") || m.includes("apple"))
    return "Apple";
  if (
    m.includes("galaxy") ||
    m.includes("samsung") ||
    m.startsWith("s2") ||
    m.startsWith("a5") ||
    m.startsWith("a3") ||
    m.startsWith("a1") ||
    m.includes("z fold") ||
    m.includes("z flip")
  )
    return "Samsung";
  if (m.includes("pixel") || m.includes("google")) return "Google";
  if (m.includes("xiaomi") || m.includes("redmi") || m.includes("poco")) return "Xiaomi";
  if (m.includes("motorola") || m.includes("moto")) return "Motorola";
  if (m.includes("playstation") || m.includes("ps5") || m.includes("ps4") || m.includes("sony"))
    return "Sony";
  if (m.includes("xbox") || m.includes("surface") || m.includes("microsoft")) return "Microsoft";
  if (m.includes("switch") || m.includes("nintendo")) return "Nintendo";
  if (m.includes("dell")) return "Dell";
  if (m.includes("hp")) return "HP";
  if (m.includes("lenovo") || m.includes("thinkpad")) return "Lenovo";
  return fallbackBrand;
}

export const TERMS_VERSION = "MRK-TC-1.0-2026-08-24";

export const REPAIR_WARRANTY_EXCLUSION_TEXT =
  "Warranty does not cover accidental or physical damage, liquid/water damage, misuse, further damage after repair, or any repair/opening carried out by another repairer.";

export const STANDARD_TERMS = {
  REPAIR: {
    heading: "Repair & Warranty Information",
    points: [
      {
        title: "1. COMPLETED REPAIR",
        body: "This invoice records the repair and replacement parts completed by MR. KHAN on the device described above.",
      },
      {
        title: "2. WARRANTY COVERAGE",
        body: "The warranty shown on this invoice applies only to the listed repair, replacement part and workmanship for the stated warranty period.",
      },
      {
        title: "3. WARRANTY EXCLUSIONS",
        body: "The warranty does not cover issues caused by accidental or liquid damage, misuse, normal wear and tear, or third-party work that directly caused the claimed fault. Faults directly related to our original repair and parts remain covered under warranty.",
      },
      {
        title: "4. DEVICE DATA & WATER RESISTANCE",
        body: "Repairs involving opening the device may affect its original water-resistant seals. Customers should maintain a backup of important data. We take reasonable care of every device during service.",
      },
      {
        title: "5. CUSTOMER SUPPORT",
        body: "If a problem occurs, please call us or visit our Liverpool shop with the device and proof of purchase so that we can inspect and assist you. Your statutory rights are not affected.",
      },
    ],
  },
  SALE: {
    heading: "Sale & Warranty Terms",
    points: [
      {
        title: "Device Condition",
        body: "The device is sold in the condition and specification stated on this invoice.",
      },
      {
        title: "Shop Warranty",
        body: "Any applicable shop warranty is provided in addition to, and does not affect, your statutory rights.",
      },
      {
        title: "Warranty Exclusions",
        body: "Warranty does not cover accidental or liquid damage, misuse, neglect, or unauthorised tampering that caused the fault.",
      },
      {
        title: "Proof of Purchase",
        body: "Please retain this receipt as proof of purchase. Customer statutory rights are not affected.",
      },
    ],
  },
  PURCHASE: {
    heading: "Seller Declaration & Confirmation",
    points: [
      {
        title: "1. OWNERSHIP",
        body: "The seller confirms that they legally own the device or have full authority to sell or trade it.",
      },
      {
        title: "2. DEVICE STATUS",
        body: "The seller confirms that the device is not lost, stolen, blacklisted, subject to outstanding finance or affected by any third-party ownership claim.",
      },
      {
        title: "3. ACCURATE INFORMATION",
        body: "The device details, condition, faults and IMEI or serial number recorded on this receipt have been provided accurately by the seller.",
      },
      {
        title: "4. ACCOUNTS & PERSONAL DATA",
        body: "The seller is responsible for removing SIM cards, personal data and accounts including iCloud, Google and Samsung. The seller authorises reasonable testing and secure data erasure where required.",
      },
      {
        title: "5. VALUE & TRANSFER",
        body: "The agreed value is based on the recorded condition and final inspection. Ownership transfers to Khan Mobile and Accessories Liverpool Ltd once payment has cleared. False declarations may be reported and payment recovered.",
      },
    ],
  },
} as const;
