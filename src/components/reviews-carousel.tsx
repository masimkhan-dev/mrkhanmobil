import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicReviews } from "@/lib/cms.functions";

export const reviews = [
  {
    name: "Sarah H.",
    city: "Liverpool",
    stars: 5,
    text: "Cracked my iPhone 14 Pro screen — dropped it off at 10am, back like new by lunchtime. Genuinely brilliant service and the price was exactly what they quoted.",
  },
  {
    name: "James M.",
    city: "Manchester",
    stars: 5,
    text: "Google Pixel wouldn't charge after a spill. They cleaned the board and had it working within a day. Saved me buying a new phone.",
  },
  {
    name: "Priya S.",
    city: "Wirral",
    stars: 5,
    text: "Home visit for my daughter's Samsung — technician arrived on time, replaced the screen at our kitchen table. Couldn't fault it.",
  },
  {
    name: "Tom W.",
    city: "Bootle",
    stars: 5,
    text: "Mail-in from Southport, got it back in 4 days, tracked and insured all the way. Warranty is real too — needed a minor tweak and they sorted it free.",
  },
  {
    name: "Ella J.",
    city: "St Helens",
    stars: 5,
    text: "Battery replaced on my iPhone 12 in under 40 minutes while I had a coffee next door. All-day battery again. Cheers Mr Khan!",
  },
  {
    name: "Ahmed K.",
    city: "Birkenhead",
    stars: 5,
    text: "Data recovery from a totally dead Galaxy — got every photo of my son's first year back. Cannot recommend enough.",
  },
];

export function ReviewsCarousel() {
  const getReviews = useServerFn(listPublicReviews);
  const { data: dbReviews } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: () => getReviews(),
    staleTime: 1000 * 60 * 10, // Cache reviews for 10 minutes
  });

  const rawItems = dbReviews && dbReviews.length > 0 ? dbReviews : reviews;
  const items = rawItems.map((r: any) => ({
    name: r.author || r.name,
    city: r.location || r.city,
    stars: r.rating !== undefined ? r.rating : r.stars,
    text: r.body || r.text,
  }));

  return (
    <Carousel opts={{ align: "start", loop: true }}>
      <CarouselContent className="-ml-4">
        {items.map((r, i) => (
          <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-warning text-warning" />
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
