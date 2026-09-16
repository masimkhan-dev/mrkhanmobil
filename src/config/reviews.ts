export interface PublicReview {
  id: string;
  author: string;
  rating: number;
  body: string;
  location: string;
  source: string;
  featured: boolean;
  sort_order: number;
  published: boolean;
  owner_response?: string | null;
}

export const REAL_GOOGLE_REVIEWS: PublicReview[] = [
  {
    id: "rev-luan-delacruz",
    author: "Luan Delacruz",
    rating: 5,
    body: "Amazing service front screen fixed in 20 minutes for cheap and even cleaned my camera for me without me having to ask! Amazing results thankyou",
    location: "Liverpool",
    source: "google",
    featured: true,
    sort_order: 10,
    published: true,
    owner_response:
      "Thank you Luan! Glad we could get you sorted quickly and happy the little camera clean-up was a nice bonus. That's just how we like to do things here. Appreciate the kind words!",
  },
  {
    id: "rev-tyren-devine",
    author: "Tyren Devine",
    rating: 5,
    body: "Amazing service, quick and easy and best prices going, best friendly staff anywhere in liverpool! highly recommend !!",
    location: "Liverpool",
    source: "google",
    featured: true,
    sort_order: 20,
    published: true,
  },
  {
    id: "rev-sehrish-kabir",
    author: "Sehrish Kabir",
    rating: 5,
    body: "Highly recommended very good and fast service and reasonable prices and quality products 💯💯❤️",
    location: "Liverpool",
    source: "google",
    featured: true,
    sort_order: 30,
    published: true,
  },
  {
    id: "rev-vinay-kumar",
    author: "Vinay kumar",
    rating: 5,
    body: "Good quality ..expert repair",
    location: "Liverpool",
    source: "google",
    featured: true,
    sort_order: 40,
    published: true,
    owner_response:
      "Thank you Vinay! Really glad the repair met the mark. Appreciate you taking the time to leave a review — see you next time if you need anything else sorted.",
  },
  {
    id: "rev-thu-san",
    author: "Thu San",
    rating: 5,
    body: "Great service. Get the screen protection done for my tablet quickly.",
    location: "Liverpool",
    source: "google",
    featured: true,
    sort_order: 50,
    published: true,
    owner_response:
      "Thank you Thu! Glad we could get your tablet's screen protector sorted quickly for you. Come back anytime you need anything else.",
  },
  {
    id: "rev-zion-edwards",
    author: "Zion Edwards",
    rating: 5,
    body: "Good and honest man, fast and cheap service.",
    location: "Liverpool",
    source: "google",
    featured: false,
    sort_order: 60,
    published: true,
  },
  {
    id: "rev-milazim-beqa",
    author: "Milazim Beqa",
    rating: 5,
    body: "Amazing owner, lovely place",
    location: "Liverpool",
    source: "google",
    featured: false,
    sort_order: 70,
    published: true,
    owner_response:
      "That's very kind Milazim thank you! Always a pleasure having you in the shop. See you again soon.",
  },
  {
    id: "rev-muhammad-asim-khan",
    author: "Muhammad Asim Khan",
    rating: 5,
    body: "Well professional staff for each and everything. The services that they provide, highly recommend.",
    location: "Liverpool",
    source: "google",
    featured: false,
    sort_order: 80,
    published: true,
  },
];
