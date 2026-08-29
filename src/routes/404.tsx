import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Phone, Home, Wrench } from "lucide-react";
import { business, telLink } from "@/config/business";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <section className="py-20 md:py-32">
      <div className="container-x max-w-xl text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-accent/10 text-accent grid place-items-center mb-6">
          <Wrench className="h-10 w-10" />
        </div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-foreground">404</h1>
        <h2 className="mt-3 font-display font-semibold text-2xl">Page not found</h2>
        <p className="mt-3 text-muted-foreground text-base leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Need immediate assistance
          with your repair?
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6 font-semibold">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" /> Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6 font-semibold">
            <a href={telLink()}>
              <Phone className="h-4 w-4 mr-2 text-brand" /> Call {business.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
