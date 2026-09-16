import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { blogPosts } from "./blog";
import { business } from "@/config/business";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const p = blogPosts.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData, params }) => {
    const postUrl = `https://www.mrkhanmobiles.co.uk/blog/${params.slug}`;
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.title} | MR. KHAN Blog` },
            { name: "description", content: loaderData.excerpt },
            { property: "og:title", content: loaderData.title },
            { property: "og:description", content: loaderData.excerpt },
            { property: "og:type", content: "article" },
            { property: "og:url", content: postUrl },
            { name: "robots", content: "noindex, follow" },
          ]
        : [{ name: "robots", content: "noindex, follow" }],
      links: [{ rel: "canonical", href: postUrl }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.mrkhanmobiles.co.uk/",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Blog",
                    item: "https://www.mrkhanmobiles.co.uk/blog",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: loaderData.title,
                    item: postUrl,
                  },
                ],
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: loaderData.title,
                datePublished: (loaderData as { isoDate?: string }).isoDate || "2026-02-12",
                author: {
                  "@type": "Organization",
                  "@id": "https://www.mrkhanmobiles.co.uk/#organization",
                  name: business.name,
                },
                publisher: {
                  "@type": "Organization",
                  "@id": "https://www.mrkhanmobiles.co.uk/#organization",
                  name: business.name,
                },
              }),
            },
          ]
        : [],
    };
  },
  component: BlogPostPage,
  notFoundComponent: () => <div className="py-24 text-center">Post not found</div>,
});

function BlogPostPage() {
  const p = Route.useLoaderData();
  return (
    <article className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> All posts
        </Link>
        <div className="mt-4 text-xs uppercase tracking-wider text-accent">
          {p.cat} · {p.date}
        </div>
        <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl">{p.title}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{p.excerpt}</p>
        <div className="mt-10 prose prose-lg max-w-none text-foreground/85 leading-relaxed">
          <p>Full article coming soon — our editorial team is finishing this post.</p>
          <p>
            Meanwhile, if you have a repair question we're always happy to answer over WhatsApp or
            phone. Every recommendation on this blog is based on repairs we've actually done, at
            real UK prices.
          </p>
        </div>
      </div>
    </article>
  );
}
