import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgePoundSterling, SearchCheck, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { business, telLink, whatsappLink } from "@/config/business";

export const Route = createFileRoute("/buy-sell")({
  head: () => ({
    meta: [
      { title: "Buy & Sell Mobile Phones Liverpool | MR KHAN" },
      {
        name: "description",
        content:
          "Buy quality checked mobile phones or sell your used phone to MR KHAN on London Road, Liverpool.",
      },
    ],
    links: [{ rel: "canonical", href: `${business.url}/buy-sell` }],
  }),
  component: BuySellPage,
});

function BuySellPage() {
  return (
    <>
      <section className="bg-slate-950 py-20 text-white">
        <div className="container-x max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400">
            Liverpool Phone Shop
          </p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-6xl">
            Buy or sell your mobile phone
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Visit our London Road shop for a straightforward price, IMEI-recorded paperwork and
            friendly service.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href={whatsappLink("Hi MR. KHAN, I want to buy or sell a mobile phone.")}>
                WhatsApp Us <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <a href={telLink()}>Call {business.phone}</a>
            </Button>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container-x grid gap-5 md:grid-cols-2">
          <Card className="p-7">
            <Smartphone className="h-10 w-10 text-blue-700" />
            <h2 className="mt-4 text-2xl font-bold">Buy a Phone</h2>
            <p className="mt-2 text-muted-foreground">
              Ask about currently available new and used phones. Device details and warranty are
              shown clearly on your invoice.
            </p>
          </Card>
          <Card className="p-7">
            <BadgePoundSterling className="h-10 w-10 text-emerald-700" />
            <h2 className="mt-4 text-2xl font-bold">Sell Your Phone</h2>
            <p className="mt-2 text-muted-foreground">
              Bring your phone, photo ID and device details to the shop. We inspect it and provide a
              clear purchase price.
            </p>
          </Card>
        </div>
        <div className="container-x mt-8 grid gap-4 sm:grid-cols-3">
          <Feature
            icon={SearchCheck}
            title="Device Checked"
            text="IMEI, condition and device details recorded."
          />
          <Feature
            icon={ShieldCheck}
            title="Clear Paperwork"
            text="Printed invoice for purchases and sales."
          />
          <Feature
            icon={Smartphone}
            title="Visit the Shop"
            text={`${business.address.line1}, ${business.address.city}.`}
          />
        </div>
        <div className="mt-10 text-center">
          <Link to="/contact" className="font-bold text-blue-700 hover:underline">
            See contact details and opening hours →
          </Link>
        </div>
      </section>
    </>
  );
}
function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Smartphone;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border p-5">
      <Icon className="h-6 w-6" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
