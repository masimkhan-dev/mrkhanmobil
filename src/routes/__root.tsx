import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, StickyMobileBar } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { business } from "@/config/business";
import { getPublicSiteSettings } from "@/lib/cms.functions";

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

const siteName = "MR KHAN | Mobile Phone Repair Liverpool";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mobile Phone Repair Liverpool | iPhone & Samsung | MR KHAN" },
      {
        name: "description",
        content:
          "Same-day mobile phone repair in Liverpool. iPhone, Samsung, Google Pixel and Android screen, battery and charging port repairs with a 12-month warranty. Visit MR KHAN at 83, 85 London Rd, Liverpool L3 8JA.",
      },
      { name: "author", content: "MR KHAN" },
      { name: "theme-color", content: "#0F172A" },
      { property: "og:site_name", content: "MR KHAN Repair Experts" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Mobile Phone Repair Liverpool | iPhone & Samsung | MR KHAN" },
      {
        property: "og:description",
        content: "Same-day mobile phone repair in Liverpool with a 12-month warranty. Walk-in, home visit or mail-in.",
      },
      { property: "og:image", content: `${business.url}/og-home.png` },
      { property: "og:url", content: `${business.url}/` },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Mobile Phone Repair Liverpool | iPhone & Samsung | MR KHAN" },
      {
        name: "twitter:description",
        content:
          "Same-day mobile phone repair in Liverpool. iPhone, Samsung, Google Pixel screen & battery repairs with a 12-month warranty.",
      },
      { name: "twitter:image", content: `${business.url}/og-home.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "canonical", href: `${business.url}/` },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "MobilePhoneRepairShop"],
          "@id": `${business.url}/#organization`,
          name: "MR KHAN Repair Experts",
          url: `${business.url}/`,
          logo: `${business.url}/logo.png`,
          image: `${business.url}/og-home.png`,
          telephone: business.phoneRaw,
          email: business.email,
          priceRange: "££",
          hasMap: business.googleReviewUrl,
          sameAs: [
            business.social.facebook,
            business.social.instagram,
            business.social.tiktok,
          ],
          address: {
            "@type": "PostalAddress",
            streetAddress: business.address.line1,
            addressLocality: business.address.city,
            addressRegion: business.address.region,
            postalCode: business.address.postcode,
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 53.4094083,
            longitude: -2.9742342,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "19:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "10:00",
              closes: "18:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Sunday",
              opens: "11:00",
              closes: "16:00",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(business.rating.stars),
            reviewCount: String(business.rating.reviews),
          },
          areaServed: [
            "Liverpool",
            "Merseyside",
            "Wirral",
            "Manchester",
            "Bootle",
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


function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const getSettings = useServerFn(getPublicSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: () => getSettings(),
    staleTime: 1000 * 60 * 10, // Cache settings for 10 minutes
    enabled: !isAdminRoute,
  });

  const announcement = settings?.announcement as
    | { enabled?: boolean; text?: string; link?: string }
    | undefined;

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

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
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      {!isAdminRoute && <StickyMobileBar />}
      {!isAdminRoute && <FloatingWhatsApp />}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
