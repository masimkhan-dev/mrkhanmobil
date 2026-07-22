import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, StickyMobileBar } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { business } from "@/config/business";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const siteName = business.name + " — " + business.tagline;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${business.name} | Mobile Phone Repair UK` },
      {
        name: "description",
        content:
          "UK mobile phone repair with a 12-month warranty. Same-day iPhone, Samsung and Android repair — walk-in, home visit or mail-in across Liverpool, Manchester, Wirral & the UK.",
      },
      { name: "author", content: business.name },
      { name: "theme-color", content: "#0F172A" },
      { property: "og:site_name", content: business.name },
      { property: "og:type", content: "website" },
      { property: "og:title", content: siteName },
      {
        property: "og:description",
        content: "Same-day mobile phone repair with a 12-month warranty.",
      },
      { property: "og:image", content: "/og-home.png" },
      { name: "twitter:image", content: "/og-home.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: business.name,
          telephone: business.phone,
          email: business.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: business.address.line1,
            addressLocality: business.address.city,
            addressRegion: business.address.region,
            postalCode: business.address.postcode,
            addressCountry: "GB",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: business.rating.stars,
            reviewCount: business.rating.reviews,
          },
          areaServed: [
            "Liverpool",
            "Manchester",
            "Bootle",
            "Wirral",
            "St Helens",
            "Southport",
            "Birkenhead",
            "United Kingdom",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSiteSettings } from "@/lib/cms.functions";

function AppLayout() {
  const getSettings = useServerFn(getPublicSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: () => getSettings(),
    staleTime: 1000 * 60 * 10, // Cache settings for 10 minutes
  });

  const announcement = settings?.announcement;

  return (
    <div className="flex min-h-screen flex-col">
      {announcement?.enabled && announcement?.text && (
        <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-xs md:text-sm font-semibold flex items-center justify-center gap-2">
          {announcement.link ? (
            <a href={announcement.link} className="hover:underline flex items-center gap-1">
              {announcement.text}
            </a>
          ) : (
            <span>{announcement.text}</span>
          )}
        </div>
      )}
      <SiteHeader />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      <StickyMobileBar />
      <FloatingWhatsApp />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
