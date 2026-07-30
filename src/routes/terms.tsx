import { createFileRoute, Link } from "@tanstack/react-router";
import { business, telLink } from "@/config/business";
import { Wrench, ShieldCheck, Database, Droplets, AlertCircle, Clock, CreditCard, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | MR. KHAN Mobile Repair" },
      {
        name: "description",
        content:
          "Repair warranty terms, payment conditions, and liability terms for MR. KHAN mobile repair services in Liverpool.",
      },
      { property: "og:title", content: "Terms & Conditions | MR. KHAN Mobile Repair" },
      {
        property: "og:description",
        content:
          "Repair warranty terms, payment conditions, and liability terms for MR. KHAN mobile repair services in Liverpool.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.mrkhanmobiles.co.uk/terms" },
    ],
    links: [{ rel: "canonical", href: "https://www.mrkhanmobiles.co.uk/terms" }],
  }),
  component: () => (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <div className="p-3 rounded-2xl bg-accent/10 text-accent w-fit mb-4">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl">Terms & Conditions</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 2026 · {business.legalName}
        </p>

        <div className="mt-10 space-y-10 text-foreground/90 leading-relaxed text-sm sm:text-base">
          <p>
            By booking a repair or submitting a device to <strong>{business.legalName}</strong> (trading as <strong>{business.name}</strong>), you agree to the following terms and conditions. Please read them carefully before submitting your device.
          </p>

          {/* 1. 12-Month Repair Warranty */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" /> 1. 12-Month Repair Warranty
            </h2>
            <p className="text-muted-foreground">
              Every repair completed by {business.name} carries a <strong>12-month warranty</strong> covering manufacturer defects in fitted replacement parts and our repair labour:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>If a replacement part fails due to a defect within 12 months, we will re-repair or replace it free of charge.</li>
              <li>Warranty covers the specific part fitted and work performed by our technicians.</li>
              <li><strong>Exclusions:</strong> Warranty does <em>not</em> cover physical accidental damage (drops, cracks, pressure damage), subsequent liquid exposure, software issues, or devices previously tampered with by a third party after our repair.</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              For complete warranty details, visit our dedicated <Link to="/warranty" className="text-accent underline font-medium">Warranty Page</Link>.
            </p>
          </div>

          {/* 2. Customer Data & Backup Disclaimer */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-accent" /> 2. Data Backup & Privacy Responsibility
            </h2>
            <p className="text-muted-foreground">
              While we take extreme care to preserve your data during hardware repairs, technical procedures carry inherent risks:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li><strong>Backup Required:</strong> Customers are strongly advised to back up all personal data, photos, and files prior to handing over their device.</li>
              <li>{business.name} accepts no liability for data loss, corrupted files, or system restoration required during hardware repairs.</li>
              <li>Your personal data remains strictly confidential and will never be accessed or copied except when necessary to test repair functionality with your permission.</li>
            </ul>
          </div>

          {/* 3. Water Damage Repairs */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <Droplets className="h-5 w-5 text-accent" /> 3. Liquid / Water Damage Diagnostics
            </h2>
            <p className="text-muted-foreground">
              Liquid damage causes progressive corrosion on motherboard micro-components. Diagnostic cleaning is performed to attempt revival, but long-term stability cannot be guaranteed on liquid-damaged circuitry. Severe water-damaged repairs carry a diagnostic fee and specialized 30-day warranty unless stated otherwise.
            </p>
          </div>

          {/* 4. Parts Quality & Manufacturer Warranties */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground">4. Parts Quality & Compatibility</h2>
            <p className="text-muted-foreground">
              We fit premium OEM-grade and original-specification replacement components tested for reliability. Opening a device or replacing parts may void manufacturer water-resistance ratings or original brand warranties.
            </p>
          </div>

          {/* 5. Payments & Pricing */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" /> 5. Payment Terms & No Fix No Fee
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>Payment is due upon repair completion, prior to device return or dispatch.</li>
              <li>We accept Cash, Visa, Mastercard, Apple Pay, and Google Pay.</li>
              <li><strong>No Fix, No Fee:</strong> If we are unable to repair your device fault (excluding water damage diagnostic cleaning), you owe no repair charge.</li>
            </ul>
          </div>

          {/* 6. Uncollected Devices & Abandonment Policy */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" /> 6. Device Collection & 90-Day Unclaimed Policy
            </h2>
            <p className="text-muted-foreground">
              Devices must be collected within 30 days of repair completion notification. Devices unclaimed <strong>90 days</strong> after initial completion notification will be deemed abandoned and may be recycled or sold to recover unpaid parts and labor costs.
            </p>
          </div>

          {/* 7. Mail-in & Home Visit Repair Terms */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground">7. Mail-in & Doorstep Repair Services</h2>
            <p className="text-muted-foreground">
              Mail-in repairs must be packaged securely. Return delivery is insured and tracked across the UK. For home visits, engineers require a safe workspace and adult presence during repair.
            </p>
          </div>

          {/* 8. Limitation of Liability */}
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" /> 8. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by UK law, {business.legalName}'s total liability for any claim arising out of a repair service shall not exceed the amount paid by the customer for that specific repair service.
            </p>
          </div>

          {/* Contact Details */}
          <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
            <h3 className="font-display font-semibold text-lg">Questions Regarding Our Terms?</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions or require clarification regarding our terms, please contact our workshop team:
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium pt-1">
              <a href={telLink()} className="inline-flex items-center gap-1.5 text-accent hover:underline">
                <Phone className="h-4 w-4" /> {business.phone}
              </a>
              {business.email && (
                <a href={`mailto:${business.email}`} className="inline-flex items-center gap-1.5 text-accent hover:underline">
                  <Mail className="h-4 w-4" /> {business.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
});
