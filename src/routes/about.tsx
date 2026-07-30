import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MR. KHAN | Liverpool Phone Repair Experts" },
      {
        name: "description",
        content:
          "Meet the team behind MR. KHAN Mobile Repair. Liverpool's trusted phone repair workshop at 83-85 London Road. 12-month warranty, same-day service.",
      },
      { property: "og:title", content: "About MR. KHAN | Liverpool Phone Repair Experts" },
      {
        property: "og:description",
        content:
          "Meet the team behind MR. KHAN Mobile Repair. Liverpool's trusted phone repair workshop at 83-85 London Road. 12-month warranty, same-day service.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/about" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/about" }],
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
            We combine experienced technicians, high-grade parts and a 12-month warranty into
            one honest service — walk-in, home visit or mail-in.
          </p>
          <p>
            Today we repair devices every day from our workshop in Liverpool, and mail-in from across the UK.
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
