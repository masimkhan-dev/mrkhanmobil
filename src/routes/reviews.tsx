import { createFileRoute } from "@tanstack/react-router";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { business } from "@/config/business";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews | 4.9★ Phone Repair Liverpool | MR. KHAN" },
      {
        name: "description",
        content:
          "Read 847+ verified Google reviews for MR. KHAN Mobile Repair. Same-day service, 12-month warranty, trusted by Liverpool customers.",
      },
      { property: "og:title", content: "Customer Reviews | 4.9★ Phone Repair Liverpool | MR. KHAN" },
      {
        property: "og:description",
        content:
          "Read 847+ verified Google reviews for MR. KHAN Mobile Repair. Same-day service, 12-month warranty, trusted by Liverpool customers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/reviews" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/reviews" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 font-semibold text-xs">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>
              {business.rating.stars} / 5.0 Rating · {business.rating.reviews}+ Verified Google Reviews
            </span>
          </div>
          <h1 className="mt-6 font-display font-extrabold text-4xl md:text-5xl text-[#0B1220]">
            Customer Reviews
          </h1>
          <p className="mt-4 text-[#5B6472] text-lg">
            Real customers, real repairs, real verified reviews.
          </p>
        </div>
        <div className="mt-14">
          <ReviewsCarousel />
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold">
            <a href={business.googleReviewUrl} target="_blank" rel="noreferrer">
              <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" /> Leave a Google Review
            </a>
          </Button>
        </div>
      </div>
    </section>
  ),
});
