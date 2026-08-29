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
import { SiteHeader } from "@/components/site-header";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { TopLoadingBar } from "@/components/top-loading-bar";
import { BackToTop } from "@/components/back-to-top";
import { MobileStickyCTA } from "@/components/mobile-sticky-cta";
import { ErrorBoundary } from "@/components/error-boundary";
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Phone Repair Liverpool | Same-Day Fix | MR. KHAN" },
      {
        name: "description",
        content:
          "Fast iPhone, Samsung & phone repairs in Liverpool. Free diagnosis. 12-month warranty. Walk-ins welcome at London Road, Liverpool Post Office.",
      },
      { name: "author", content: "MR. KHAN Mobile Repair" },
      { name: "theme-color", content: "#FC4B01" },
      { property: "og:site_name", content: "MR. KHAN Mobile Repair" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Phone Repair Liverpool | Same-Day Fix | MR. KHAN" },
      {
        property: "og:description",
        content:
          "Fast iPhone, Samsung & phone repairs in Liverpool. Free diagnosis. 12-month warranty. Walk-ins welcome.",
      },
      { property: "og:image", content: `${business.url}/og-home.png` },
      { property: "og:url", content: `${business.url}/` },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Phone Repair Liverpool | Same-Day Fix | MR. KHAN" },
      {
        name: "twitter:description",
        content:
          "Fast iPhone, Samsung & phone repairs in Liverpool. Free diagnosis. 12-month warranty. Walk-ins welcome.",
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
          "@type": "MobilePhoneStore",
          name: "MR. KHAN Mobile Repair",
          image: `${business.url}/og-home.png`,
          "@id": "https://www.mrkhanmobiles.co.uk",
          url: "https://www.mrkhanmobiles.co.uk",
          telephone: "+447707733038",
          priceRange: "££",
          address: {
            "@type": "PostalAddress",
            streetAddress: "83-85 London Road, Liverpool Post Office",
            addressLocality: "Liverpool",
            postalCode: "L3 8JA",
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "53.4106",
            longitude: "-2.9779",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "08:00",
              closes: "21:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Sunday",
              opens: "10:00",
              closes: "21:00",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
          },
          areaServed: {
            "@type": "City",
            name: "Liverpool",
            containedInPlace: {
              "@type": "Country",
              name: "United Kingdom",
            },
          },
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevent accidental number incrementing on mouse wheel scroll across all forms
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement &&
        (active.type === "number" ||
          active.inputMode === "decimal" ||
          active.inputMode === "numeric")
      ) {
        active.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const getSettings = useServerFn(getPublicSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: () => getSettings(),
    staleTime: 1000 * 60 * 10, // Cache settings for 10 minutes
    enabled: !isAdminRoute,
  });

  const announcement = settings?.announcement as
    { enabled?: boolean; text?: string; link?: string } | undefined;

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-background" suppressHydrationWarning>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:outline-none font-semibold text-sm"
      >
        Skip to main content
      </a>
      <TopBar />
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
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
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
      <TopLoadingBar />
      <AppLayout />
      {!isAdminRoute && <MobileStickyCTA />}
      {!isAdminRoute && <BackToTop />}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
