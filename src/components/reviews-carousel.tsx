import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { listPublicReviews } from "@/lib/cms.functions";
import { business } from "@/config/business";
import { REAL_GOOGLE_REVIEWS } from "@/config/reviews";

export const reviewsQueryOptions = () =>
  queryOptions({
    queryKey: ["public-reviews"],
    queryFn: () => listPublicReviews(),
    staleTime: 1000 * 60 * 10,
  });

export function ReviewsCarousel() {
  const { data: dbReviews, isLoading } = useQuery(reviewsQueryOptions());

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground animate-pulse">
        Loading verified reviews...
      </div>
    );
  }

  const sourceReviews = dbReviews && dbReviews.length > 0 ? dbReviews : REAL_GOOGLE_REVIEWS;

  const items = sourceReviews.map((r) => ({
    name:
      (r as { author?: string; name?: string }).author ||
      (r as { author?: string; name?: string }).name ||
      "Customer",
    city:
      (r as { location?: string | null; city?: string }).location ||
      (r as { location?: string | null; city?: string }).city ||
      "Liverpool",
    stars: typeof r.rating === "number" ? r.rating : 5,
    text:
      (r as { body?: string; text?: string }).body ||
      (r as { body?: string; text?: string }).text ||
      "",
  }));

  if (items.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-[#E6EAF0] text-center space-y-4 shadow-xs max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <h3 className="font-display font-extrabold text-xl text-[#0B1220]">
          {business.rating.stars} / 5.0 Rating on Google
        </h3>
        <p className="text-sm text-[#5B6472]">
          Read verified customer reviews directly on Google Reviews.
        </p>
        <div>
          <a
            href={business.googleReviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-md transition-all"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Read Verified Reviews on Google →
          </a>
        </div>
      </div>
    );
  }

  return (
    <Carousel opts={{ align: "start", loop: true }}>
      <CarouselContent className="-ml-4">
        {items.map((r, i) => (
          <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <Card className="h-full border border-[#E6EAF0]">
              <CardContent className="p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{r.text}"</p>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.city}</div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="hidden md:block">
        <CarouselPrevious className="-left-2 md:-left-4 lg:-left-5" />
        <CarouselNext className="-right-2 md:-right-4 lg:-right-5" />
      </div>
    </Carousel>
  );
}
