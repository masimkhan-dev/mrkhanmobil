import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";
import techImg from "@/assets/technician.jpg";
import devicesImg from "@/assets/devices.jpg";
import heroImg from "@/assets/hero-workshop.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: `Repair Gallery | ${business.name}` },
      {
        name: "description",
        content:
          "Before-and-after gallery of real repairs from our workshop — screens, batteries, boards, water damage recoveries.",
      },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: () => {
    const items = [heroImg, techImg, devicesImg, heroImg, techImg, devicesImg];
    return (
      <section className="py-16 md:py-24">
        <div className="container-x">
          <h1 className="font-display font-bold text-4xl md:text-6xl">Repair gallery</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            A look inside our workshop — real repairs, real results.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((src, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-border aspect-[4/3] bg-muted"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
});
