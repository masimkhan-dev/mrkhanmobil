import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About Us | ${business.name}` },
      {
        name: "description",
        content: `${business.name} is a UK repair company built on genuine warranty, fair pricing and real craft. Meet the team behind the workshop.`,
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">About us</p>
        <h1 className="mt-2 font-display font-bold text-4xl md:text-6xl">Repair, done properly.</h1>
        <div className="prose prose-lg mt-8 max-w-none text-foreground/85 leading-relaxed">
          <p>
            {business.name} started with a simple idea: mobile phone repair shouldn't be a gamble.
            No more mystery pricing, no more "we'll call you", no more disappointing warranties.
          </p>
          <p>
            We combine certified technicians, OEM-quality parts and a real 12-month warranty into
            one honest service — walk-in, home visit or mail-in.
          </p>
          <p>
            Today we repair over 400 devices a week from our workshops in Liverpool and across the
            North West, and mail-in from every corner of the UK.
          </p>
          <h2 className="font-display font-semibold text-2xl mt-10">Our promise</h2>
          <ul>
            <li>Fixed prices before any repair</li>
            <li>12-month warranty on parts and labour</li>
            <li>Your data stays private, always</li>
            <li>No fix, no fee — every time</li>
          </ul>
        </div>
      </div>
    </section>
  ),
});
