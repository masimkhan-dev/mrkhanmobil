import { createFileRoute } from "@tanstack/react-router";
import { business, telLink } from "@/config/business";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Phone,
  Mail,
  MapPin,
  Server,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | MR. KHAN Mobile Repair Liverpool" },
      {
        name: "description",
        content:
          "How MR. KHAN collects, uses and protects your personal data. GDPR-compliant privacy policy for our Liverpool repair service.",
      },
      { property: "og:title", content: "Privacy Policy | MR. KHAN Mobile Repair Liverpool" },
      {
        property: "og:description",
        content:
          "How MR. KHAN collects, uses and protects your personal data. GDPR-compliant privacy policy for our Liverpool repair service.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/privacy" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <div className="p-3 rounded-2xl bg-accent/10 text-accent w-fit mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 2026 · {business.legalName}
        </p>

        <div className="mt-10 space-y-10 text-foreground/90 leading-relaxed text-sm sm:text-base">
          {/* 1. Who We Are */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <BuildingIcon className="h-5 w-5 text-accent" /> 1. Who We Are
            </h2>
            <p className="text-muted-foreground">
              This Privacy Policy applies to <strong>{business.legalName}</strong> (trading as{" "}
              <strong>{business.name} Repair Experts</strong>):
            </p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs sm:text-sm space-y-1.5 text-muted-foreground">
              <p>
                <strong>Business Name:</strong> {business.legalName} (t/a {business.name})
              </p>
              <p>
                <strong>Address:</strong> {business.address.line1}, {business.address.city},{" "}
                {business.address.postcode}, {business.address.country}
              </p>
              <p>
                <strong>Phone:</strong> {business.phone}
              </p>
              <p>
                <strong>Email:</strong> {business.email}
              </p>
            </div>
          </div>

          {/* 2. What Data We Collect */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" /> 2. What Data We Collect
            </h2>
            <p className="text-muted-foreground">
              We may collect and process the following information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Contact Information:</strong> Your full name, phone number, and email
                address.
              </li>
              <li>
                <strong>Device Information:</strong> Device brand, model, fault description, and
                IMEI/serial number (if provided for diagnosis).
              </li>
              <li>
                <strong>Service Details:</strong> Repair type, preferred method (walk-in, home
                visit, or mail-in), and delivery address (for home visits or mail-in returns).
              </li>
              <li>
                <strong>Payment Information:</strong> Transactions processed securely via card
                terminal or cash — we never store full card numbers.
              </li>
              <li>
                <strong>Technical Data:</strong> Basic server logs (IP address, browser type) for
                website security.
              </li>
            </ul>
          </div>

          {/* 3. Lawful Basis for Processing */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" /> 3. Lawful Basis for Processing
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Contractual Obligation:</strong> To fulfill and perform the repair service
                you requested.
              </li>
              <li>
                <strong>Legitimate Interest:</strong> For customer support, fraud prevention, and
                legal compliance.
              </li>
              <li>
                <strong>Consent:</strong> Promotional or newsletter updates ONLY if you explicitly
                tick the opt-in box.
              </li>
            </ul>
          </div>

          {/* 4. How We Use Your Data */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" /> 4. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>Process, diagnose, and complete your repair booking.</li>
              <li>Contact you about your repair status and booking confirmation.</li>
              <li>Send digital receipts and manage your 12-month repair warranty.</li>
              <li>Comply with UK legal and accounting record-keeping requirements.</li>
            </ul>
          </div>

          {/* 5. How Long We Keep Data */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground">
              5. How Long We Keep Data
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Repair Records & Invoices:</strong> Retained for 6 years in accordance with
                legal and accounting requirements.
              </li>
              <li>
                <strong>Marketing Consent:</strong> Retained until you withdraw your consent or
                unsubscribe.
              </li>
              <li>
                <strong>Website Security Server Logs:</strong> Retained for up to 12 months.
              </li>
            </ul>
          </div>

          {/* 6. Your Rights (UK GDPR) */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground">
              6. Your Rights (UK GDPR)
            </h2>
            <p className="text-muted-foreground">
              Under UK data protection law, you have rights including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Access:</strong> Request a copy of your personal data.
              </li>
              <li>
                <strong>Rectification:</strong> Request correction of inaccurate or incomplete
                information.
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data (Right to be
                Forgotten).
              </li>
              <li>
                <strong>Restriction:</strong> Limit how we process your personal data.
              </li>
              <li>
                <strong>Portability:</strong> Receive a copy of your data in a structured format.
              </li>
              <li>
                <strong>Objection:</strong> Object to processing based on legitimate interests.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">
              To exercise any of these rights, email{" "}
              <a href={`mailto:${business.email}`} className="text-accent underline font-medium">
                {business.email}
              </a>{" "}
              or call{" "}
              <a href={telLink()} className="text-accent underline font-medium">
                {business.phone}
              </a>
              .
            </p>
          </div>

          {/* 7. Data Sharing & Third Parties */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" /> 7. Data Sharing
            </h2>
            <p className="text-muted-foreground">
              <strong>We do NOT sell your data to any third party.</strong> Data is stored securely
              via Supabase encrypted database infrastructure. Payment card processing is managed
              directly by accredited payment providers — we never see or store your full
              credit/debit card numbers.
            </p>
          </div>

          {/* 8. Cookies & Tracking */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <Server className="h-5 w-5 text-accent" /> 8. Cookies & Tracking
            </h2>
            <p className="text-muted-foreground">
              We do <strong>NOT</strong> use Google Analytics, Meta Pixel, or any non-essential
              tracking cookies. We only use essential session cookies required for website
              functionality (such as managing your repair booking form session). No cookie consent
              banner is required as we do not deploy tracking or advertising cookies.
            </p>
          </div>

          {/* 9. Security */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground">9. Security</h2>
            <p className="text-muted-foreground">
              All website data is transmitted securely over encrypted HTTPS connections. Stored data
              is kept in secure, encrypted databases via Supabase, with access strictly restricted
              to authorized staff.
            </p>
          </div>

          {/* 10. Changes to This Policy */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground">
              10. Changes to This Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Any changes will be published on
              this page with an updated revision date.
            </p>
          </div>

          {/* 11. Contact Us */}
          <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-4">
            <h2 className="font-display font-semibold text-xl text-foreground">11. Contact Us</h2>
            <p className="text-sm text-muted-foreground">
              For any data protection questions or privacy queries:
            </p>
            <ul className="space-y-2.5 text-sm font-medium text-foreground">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:underline">
                  {business.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href={telLink()} className="hover:underline">
                  {business.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {business.address.line1}, {business.address.city}, {business.address.postcode},{" "}
                  {business.address.country}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  ),
});

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
