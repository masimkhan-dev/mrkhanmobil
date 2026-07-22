import { createFileRoute, Link } from "@tanstack/react-router";
import { business } from "@/config/business";
import { Card, CardContent } from "@/components/ui/card";

const posts = [
  {
    slug: "iphone-screen-repair-guide",
    title: "How much should an iPhone screen repair cost in 2026?",
    excerpt:
      "The honest UK price guide — what genuine, OEM and aftermarket really mean, and how to avoid getting stung.",
    date: "12 Feb 2026",
    cat: "Guides",
  },
  {
    slug: "battery-health-tips",
    title: "Extend your phone battery life by 40% — 7 real tips",
    excerpt: "Simple habits (and one settings tweak) that dramatically extend battery lifespan.",
    date: "05 Feb 2026",
    cat: "Tips",
  },
  {
    slug: "water-damage-what-to-do",
    title: "Dropped your phone in water? Do this immediately.",
    excerpt: "The five-minute rescue routine that saves most water-damaged phones.",
    date: "22 Jan 2026",
    cat: "Emergency",
  },
];

export const Route = createFileRoute("/blog")({
  head: () => {
    const siteUrl = process.env.SITE_URL || "https://mrkhan-repairs.co.uk";
    return {
      meta: [
        { title: `Repair Blog | ${business.name}` },
        {
          name: "description",
          content: "Repair guides, buying advice and honest tips from the workshop.",
        },
        { property: "og:url", content: `${siteUrl}/blog` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/blog` }],
    };
  },
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Blog</p>
        <h1 className="mt-2 font-display font-bold text-4xl md:text-6xl">
          Insights from the workshop
        </h1>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }}>
              <Card className="h-full hover:border-accent/40 transition">
                <CardContent className="p-6">
                  <div className="text-xs uppercase tracking-wider text-accent">{p.cat}</div>
                  <h2 className="mt-2 font-display font-semibold text-lg leading-snug">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-4 text-xs text-muted-foreground">{p.date}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  ),
});

export const blogPosts = posts;
