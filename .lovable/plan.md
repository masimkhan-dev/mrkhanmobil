## Heads-up on stack

You asked for **Next.js 15 / App Router**. This Lovable project runs on **TanStack Start (React 19 + Vite + Cloudflare Workers)** with **Lovable Cloud** (managed Supabase) — swapping to Next would mean abandoning this project template. TanStack Start covers everything Next App Router does for your use case: SSR, server functions, file-based routing, edge deploy, SEO. I'll build on TanStack Start unless you tell me otherwise. Everything else in your spec (Tailwind, shadcn, Framer Motion, Supabase, RHF+Zod, React Query, PWA, dark mode) stays exactly as requested.

## Reality check on scope

What you described is a 3–6 month build for a full team: public marketing site + booking engine + repair status tracker + customer dashboard + full CRM + visual admin CMS for every section + email automation + Google Reviews sync + blog CMS + role-based auth + analytics + PWA. Trying to ship all of it in one pass produces a shallow, template-feeling result — the exact thing you said you don't want.

I'll ship it in **quality-first phases**, each one production-deployable on its own. You approve Phase 1, we ship it, then move to Phase 2.

## Phase 1 — Premium marketing site + booking + lead capture (this build)

Public site, fully SEO'd, converts visitors today. No admin CMS yet — content lives in typed TS files that are trivial to edit; we swap to DB-backed CMS in Phase 2 without rewriting the UI.

**Pages**

- Home (hero, trust bar, brands, services grid, how-it-works, why-us, stats, reviews carousel, home/mail-in service, warranty, FAQ, map, contact, sticky mobile Call/WhatsApp/Book bar)
- Services index + dynamic `/services/$slug` (iPhone, Samsung, Pixel, Huawei, Xiaomi, Oppo, OnePlus, Laptop, MacBook, Tablet, iPad, Battery, Screen, Charging Port, Camera, Speaker, Mic, Water Damage, Software, Data Recovery, Back Glass)
- Locations index + dynamic `/repairs/$city` (Liverpool, Manchester, Bootle, Wirral, St Helens, Southport, Birkenhead) — each with local schema, unique copy, city-specific CTAs (local SEO)
- Home Repair, Mail-in Repair (step-by-step), Accessories (catalog placeholder), Warranty, Gallery, Reviews, FAQ, Contact, About, Privacy, Terms, Cookies
- Repair Status Tracker (`/track` — enter booking ID, see status)
- Booking flow (`/book` — device → brand → model → problem → service type → date/time → details → photo upload → confirmation with booking ID)
- Blog index + `/blog/$slug` (MDX-style entries, SEO fields, categories, tags)

**Backend (Lovable Cloud / Supabase)**

- `bookings` (with status enum, timeline events, RLS)
- `customers` (auto-created from bookings, deduped by email/phone)
- `leads` (quote-form + exit-intent + newsletter)
- `reviews` (seeded, later Google Reviews sync)
- Photo uploads → Supabase Storage
- Booking confirmation email (Lovable Emails)
- Repair status updates trigger email
- Admin notification email on new booking

**Auth & roles**

- Supabase auth (email + Google)
- `user_roles` table with enum `admin | manager | engineer | staff | customer` + `has_role()` security-definer (per Lovable rules)

**Admin (Phase 1 minimum — real, not fake)**

- `/admin` (role-gated) with:
  - Dashboard: bookings today/week, revenue, new leads, status breakdown
  - Bookings list + detail (change status, add notes, timeline)
  - Customers list + detail (history)
  - Leads inbox
  - Reviews moderation
  - Settings: business hours, phone, WhatsApp number, social links
- Everything else on your admin list (manage homepage sections, banners, sliders, SEO per page, coupons, staff, etc.) → Phase 2

**SEO / performance**

- Per-route `head()` with title, description, OG, Twitter, canonical
- JSON-LD: LocalBusiness (per city), Service, FAQ, BreadcrumbList, Organization, Article (blog)
- `sitemap.xml` server route enumerating static + dynamic (services, cities, blog)
- `robots.txt`
- Image optimization, lazy loading, preconnect fonts, Lighthouse 90+ target
- WCAG AA (semantic HTML, ARIA on icon buttons, contrast via tokens)

**Marketing**

- WhatsApp click-to-chat, click-to-call (sticky on mobile)
- Google Maps embed
- GA4 + GTM + Meta Pixel + TikTok Pixel placeholders (paste IDs in settings)
- Exit-intent discount popup
- Free-quote form (creates a lead)
- Newsletter signup

**Design system**

- Plus Jakarta Sans (headings) + Inter (body) via `<link>` in root head
- Semantic tokens in `src/styles.css` matching your palette (`#0F172A`, `#2563EB`, `#22C55E`, `#F59E0B`, `#F8FAFC`) in oklch
- Dark + light mode
- Framer Motion micro-interactions (hero, cards, section reveals)
- Custom shadcn Button variants (`hero`, `whatsapp`, `call`), Card, Badge; no ad-hoc color classes

## Phase 2 — Full visual admin CMS + customer dashboard

Manage every homepage section, banners, sliders, brands, services (pricing/copy/images), FAQs, team, gallery, blog editor (rich text), landing-page builder, per-page SEO editor, redirects, coupons, discounts, announcements, email templates, staff/roles, locations, import/export/backup. Customer login area: bookings, invoices, warranty, saved devices, notifications, profile.

## Phase 3 — Google Reviews sync, email automations (reminders, review requests, drip), referral program, coupon engine, PWA install, audit logs

## Phase 4 — eCommerce (accessories store), Stripe/PayPal, inventory, POS/barcode, loyalty, gift cards, AI chatbot + repair estimator, multi-branch

## What I need from you before I start Phase 1

1. **Confirm TanStack Start is OK** (or say "must be Next.js" and I'll stop).
2. **Real business details** or use sensible placeholders? (phone, WhatsApp number, address, opening hours, email, actual Google Business URL) — I can ship with placeholders you edit later.
3. **Logo?** Upload one, or I'll design a wordmark for "MR KHAN".
4. **Hero imagery** — I generate premium images (repair bench, engineers, devices), or you'll supply?

Reply "go" (with answers to the above) and I'll build Phase 1 end-to-end.
