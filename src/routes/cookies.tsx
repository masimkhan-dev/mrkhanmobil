import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: `Cookies | ${business.name}` },
      { name: "description", content: "How we use cookies on this website." },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl prose prose-lg">
        <h1 className="font-display font-bold text-4xl">Cookie Policy</h1>
        <p>
          We use essential cookies to run the website (session, preferences) and analytics cookies
          to understand how visitors use the site.
        </p>
        <h2>Managing cookies</h2>
        <p>You can disable cookies in your browser settings — the site will still work.</p>
      </div>
    </section>
  ),
});
