import { createFileRoute } from "@tanstack/react-router";
import { ReviewsCarousel, reviews } from "@/components/reviews-carousel";
import { business } from "@/config/business";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: `Customer Reviews | ${business.name}` },
      {
        name: "description",
        content: `${business.rating.stars} out of 5 from ${business.rating.reviews}+ verified Google reviews. Read what our customers say.`,
      },
      { property: "og:url", content: "/reviews" },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-medium">
              {business.rating.stars} / 5 · {business.rating.reviews} Google reviews
            </span>
          </div>
          <h1 className="mt-6 font-display font-bold text-4xl md:text-6xl">Reviews</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Real customers, real repairs, real reviews.
          </p>
        </div>
        <div className="mt-14">
          <ReviewsCarousel />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="border border-border rounded-xl p-6 bg-card">
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mt-3 text-sm">{r.text}</p>
              <div className="mt-4 pt-3 border-t border-border text-xs">
                <span className="font-semibold">{r.name}</span> ·{" "}
                <span className="text-muted-foreground">{r.city}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-full">
            <a href={business.googleReviewUrl}>Leave a Google review</a>
          </Button>
        </div>
      </div>
    </section>
  ),
});
