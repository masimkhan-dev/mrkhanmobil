// Central config — swap phone, WhatsApp, address, etc. here (Phase 2 = admin-editable).
export const business = {
  name: "MR. KHAN",
  url: "https://www.mrkhanmobiles.co.uk",
  tagline: "Phones, Vapes, Accessories, Repairs & Electronics",
  legalName: "Khan Mobile and Accessories Liverpool Ltd",
  companyNumber: "",
  vatNumber: "",
  icoReference: "",
  phone: "07707 733038",
  phoneRaw: "+447707733038",
  whatsapp: "+44 7707 733038",
  whatsappNumber: "447707733038",
  email: "info@mrkhanmobiles.co.uk",
  address: {
    line1: "83-85 London Road",
    city: "Liverpool",
    region: "Merseyside",
    postcode: "L3 8JA",
    country: "United Kingdom",
  },
  geo: {
    latitude: 53.4094083,
    longitude: -2.9742342,
  },
  hours: [
    { day: "Monday", hours: "8:00 AM – 9:00 PM" },
    { day: "Tuesday", hours: "8:00 AM – 9:00 PM" },
    { day: "Wednesday", hours: "8:00 AM – 9:00 PM" },
    { day: "Thursday", hours: "8:00 AM – 9:00 PM" },
    { day: "Friday", hours: "8:00 AM – 9:00 PM" },
    { day: "Saturday", hours: "8:00 AM – 9:00 PM" },
    { day: "Sunday", hours: "10:00 AM – 9:00 PM" },
  ],
  social: {
    facebook: "https://facebook.com/mr.khan.phones",
    instagram: "https://instagram.com/mr.khan.phones",
    tiktok: "https://tiktok.com/",
    google: "https://maps.app.goo.gl/uUpSAAnJL8WzDKUi6",
  },
  googleReviewUrl: "https://maps.app.goo.gl/uUpSAAnJL8WzDKUi6",
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2378.435741634586!2d-2.9742342!3d53.4094083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487b21f2fa508cc7%3A0x3699e39984da20b0!2sKhan%20Mobile%20and%20Accessories%20Liverpool%20Ltd!5e0!3m2!1sen!2suk!4v1710000000000!5m2!1sen!2suk",
  rating: { stars: 4.9, reviews: 847 },
  repairsCount: "25,000+",
} as const;

export const whatsappLink = (msg = "Hi, I'd like to book a repair.") =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(msg)}`;

export const telLink = () => `tel:${business.phoneRaw}`;
