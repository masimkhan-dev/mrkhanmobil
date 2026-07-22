import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/config/business";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Service | ${business.name}` },
      { name: "description", content: "Terms and conditions governing our repair services." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl prose prose-lg">
        <h1 className="font-display font-bold text-4xl">Terms of Service</h1>
        <p>By booking a repair with {business.legalName} you agree to the following terms.</p>
        <h2>Warranty</h2>
        <p>
          Every repair carries a 12-month warranty on the parts we fit and labour we perform. See
          our <a href="/warranty">warranty page</a>.
        </p>
        <h2>Data</h2>
        <p>
          We take no responsibility for data loss. Please back up your device before handing it
          over.
        </p>
        <h2>Uncollected devices</h2>
        <p>
          Devices unclaimed 90 days after notification of completion may be disposed of to recover
          costs.
        </p>
        <h2>Liability</h2>
        <p>Our maximum liability is limited to the cost of the repair.</p>
      </div>
    </section>
  ),
});
