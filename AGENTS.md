# AGENT.md

# Mobile Repair Service Website

Production-grade Mobile Repair Service platform built with:

- React 18
- TypeScript (Strict)
- Vite
- TanStack Router
- TanStack Query
- Supabase
- Tailwind CSS
- shadcn/ui

---

# Project Goal

This project is a Mobile Repair Service Management System.

It is NOT an eCommerce application.

Primary goals:

- Fast online booking
- Repair tracking
- Admin booking management
- CMS-driven content
- Excellent mobile UX
- High SEO
- High performance

---

# Project Scope

## Customer

- Homepage
- About
- Contact
- FAQ
- Warranty
- Gallery
- Reviews
- Book Repair
- Track Repair
- Mail-in Repair
- Home Repair
- Dynamic Service Pages
- City SEO Pages

---

## Admin

- Dashboard
- Booking Management
- Site Settings CMS
- Services CMS
- Device Brands
- Device Models
- Repair Types
- Reviews CMS
- FAQ CMS
- Gallery CMS
- Leads
- Newsletter
- CSV Export
- Print Job Sheet

---

# Out Of Scope

Never add:

- Customer Login
- Customer Dashboard
- Shopping Cart
- eCommerce
- Stripe
- PayPal
- Inventory
- POS
- Loyalty
- Gift Cards
- AI Chatbot
- Referral System
- Multi Branch

unless explicitly requested.

---

# Engineering Rules

Always:

- Read existing implementation first.
- Reuse existing architecture.
- Follow existing coding style.
- Keep components reusable.
- Prefer composition over duplication.
- Maintain backward compatibility.
- Maintain SSR compatibility.
- Maintain TypeScript strict mode.

Never:

- Rewrite working code.
- Introduce unnecessary abstractions.
- Change folder structure without reason.
- Duplicate business logic.
- Add unnecessary dependencies.

---

# Code Style

Use:

- Functional Components
- TypeScript
- Hooks
- Server Functions
- Small reusable components

Avoid:

- any
- duplicated code
- nested ternaries
- large switch statements

Maximum component size:

~300 lines preferred.

Split larger components.

---

# Performance Rules

Always optimize:

- Mobile first
- Lazy loading
- Dynamic imports
- Route splitting
- Image optimization
- Bundle size
- Query caching

Never optimize prematurely.

Measure first.

---

# React

Prefer:

React.memo

useMemo

useCallback

Only when measurable.

Avoid unnecessary re-renders.

---

# TanStack Router

Use:

- Route loaders
- Route code splitting
- Error boundaries
- Nested layouts
- Prefetching

---

# TanStack Query

Use:

- staleTime
- gcTime
- cache
- optimistic updates when appropriate

Avoid duplicate requests.

---

# Supabase

Always:

- Use RLS
- Validate inputs
- Fetch only required columns
- Reuse server client
- Use indexes

Never expose secrets.

---

# Database

Every new table must include:

- Primary Key
- created_at
- updated_at
- RLS
- Proper indexes
- Foreign Keys

---

# Security

Always:

Validate inputs.

Escape HTML.

Protect admin routes.

Check roles.

Use server-side validation.

Never trust client input.

---

# Accessibility

Target WCAG AA.

Every form must include:

- labels
- keyboard support
- focus states
- aria attributes

---

# SEO

Every public page should have:

- Title
- Description
- Canonical
- Open Graph
- Twitter Card
- Structured Data

---

# UI

Maintain:

- Existing spacing
- Existing colors
- Existing typography

Do not redesign UI unless requested.

---

# CMS

All editable content belongs in CMS.

Avoid hardcoded:

- phone
- address
- reviews
- services
- FAQs
- gallery

---

# Booking Flow

Keep booking process simple.

Target:

Less than one minute.

Prefer:

Brand

↓

Model

↓

Problem

↓

Contact

↓

Submit

---

# Admin UX

Owner should perform every task within a few clicks.

Prioritize:

- Search
- Quick actions
- Filters
- Bulk actions
- Print

---

# Performance Targets

Lighthouse Mobile:

90+

Core Web Vitals:

LCP < 2.5s

INP < 200ms

CLS < 0.1

---

# Before Every Commit

Verify:

npm run lint

npm run typecheck

npm run build

Fix all errors.

---

# Before Modifying Code

Always:

1. Read related files.
2. Understand current implementation.
3. Check for reusable code.
4. Identify side effects.
5. Preserve compatibility.

---

# Output Rules

When making changes always explain:

- What changed
- Why
- Files modified
- Breaking changes
- Performance impact
- Security impact

---

# Final Principle

This project is already feature complete.

Prioritize:

- Stability
- Maintainability
- Performance
- Security
- Accessibility
- Production readiness

Do NOT introduce new business features unless explicitly requested by the project owner.
