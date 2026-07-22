import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${business.name}` },
      { name: "description", content: "How we collect, use and protect your personal data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl prose prose-lg">
        <h1 className="font-display font-bold text-4xl">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated {new Date().toLocaleDateString("en-GB")}
        </p>
        <p>
          {business.legalName} ("we", "us") is committed to protecting your privacy. This policy
          describes what personal data we collect and how we use it.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            Contact details you provide (name, email, phone, address) when booking a repair or
            requesting a quote.
          </li>
          <li>Device details, fault description and photos you upload as part of a booking.</li>
          <li>Basic analytics (page views, referrer) to improve the site.</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>To carry out your repair and contact you about it.</li>
          <li>To send repair updates and (optionally) marketing emails you've opted in to.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <h2>Data retention</h2>
        <p>
          We retain booking records for 6 years for warranty and tax purposes. You can request
          deletion at any time.
        </p>
        <h2>Your rights (UK GDPR)</h2>
        <p>
          You have the right to access, correct, delete or export your data. Email{" "}
          <a href={`mailto:${business.email}`}>{business.email}</a>.
        </p>
      </div>
    </section>
  ),
});
