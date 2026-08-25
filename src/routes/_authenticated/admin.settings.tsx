import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Check,
  CreditCard,
  FileCheck2,
  Printer,
  Save,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  CField,
  CSection,
  CTextArea,
  PageHeader,
  PrimaryBtn,
  getSavedPrinterFormat,
  setSavedPrinterFormat,
} from "@/components/counter/ds";

import { business } from "@/config/business";
import { STANDARD_TERMS, TERMS_VERSION } from "@/lib/counter-constants";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Settings — MR KHAN" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "shop" | "print" | "payment" | "warranty" | "tax" | "staff"
  >("shop");

  // Shop details initialized from business config
  const [shopName, setShopName] = useState<string>(business.name);
  const [legalName, setLegalName] = useState<string>(business.legalName);
  const [phone, setPhone] = useState<string>(business.phone);
  const [email, setEmail] = useState<string>(business.email);
  const [address, setAddress] = useState<string>(
    `${business.address.line1}, ${business.address.city}, ${business.address.postcode}`,
  );

  // Print settings
  const [printerFormat, setPrinterFormat] = useState<"80MM" | "A4">(getSavedPrinterFormat());
  const [printShopNote, setPrintShopNote] = useState("Thank you for choosing MR. KHAN. Professional Mobile Repairs, Sales & Accessories");

  // Warranty settings
  const [repairWarrantyDays, setRepairWarrantyDays] = useState("90");
  const [saleWarrantyDays, setSaleWarrantyDays] = useState("90");
  const [warrantyTerms, setWarrantyTerms] = useState(
    "Warranty covers parts and labour. Does not cover accidental physical or liquid damage.",
  );

  // Tax settings
  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [vatNumber, setVatNumber] = useState("");

  const handleSavePrint = () => {
    setSavedPrinterFormat(printerFormat);
    toast.success("Printing preferences saved.");
  };

  const handleSaveGeneral = () => {
    toast.success("Settings updated successfully.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure shop details, default printer format, warranty policies and counter preferences."
      />

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Navigation Tabs */}
        <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: "shop", label: "Shop Details", icon: Building2 },
            { id: "print", label: "Printing", icon: Printer },
            { id: "payment", label: "Payments", icon: CreditCard },
            { id: "warranty", label: "Warranty", icon: ShieldCheck },
            { id: "tax", label: "Tax & VAT", icon: FileCheck2 },
            { id: "staff", label: "Staff Access", icon: Users },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[14px] font-semibold transition-colors min-h-[44px] text-left shrink-0 ${
                activeTab === t.id
                  ? "bg-[var(--kimi-accent)] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white"
              }`}
            >
              <t.icon className="h-4 w-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="space-y-5">
          {activeTab === "shop" && (
            <CSection
              title="Shop & Counter Contact Details"
              subtitle="These details appear at the top of your printed invoices and receipts."
            >
              <div className="space-y-4">
                <CField
                  id="shop-name"
                  label="Shop Trading Name"
                  value={shopName}
                  onChange={setShopName}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CField
                    id="shop-phone"
                    label="Counter Phone Number"
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                    required
                  />
                  <CField
                    id="shop-email"
                    label="Counter Email"
                    value={email}
                    onChange={setEmail}
                    type="email"
                  />
                </div>
                <CTextArea
                  id="shop-address"
                  label="Shop Address"
                  value={address}
                  onChange={setAddress}
                  rows={2}
                  required
                />
                <div className="pt-2">
                  <PrimaryBtn onClick={handleSaveGeneral} className="w-auto px-6">
                    <Save className="h-4 w-4" /> Save Shop Details
                  </PrimaryBtn>
                </div>
              </div>
            </CSection>
          )}

          {activeTab === "print" && (
            <CSection
              title="Receipt & Invoice Printing"
              subtitle="Choose your preferred receipt format and default printer behavior."
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Default Printer Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPrinterFormat("80MM")}
                      className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                        printerFormat === "80MM"
                          ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] ring-1 ring-[var(--kimi-accent)] shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 text-[15px]">
                        <span>Thermal 80mm</span>
                        {printerFormat === "80MM" && (
                          <Check className="h-4 w-4 text-[var(--kimi-accent)]" />
                        )}
                      </div>
                      <p className="mt-1 text-[12px] text-slate-500">
                        Compact receipt format for standard Epson/Star POS thermal receipt printers.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrinterFormat("A4")}
                      className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                        printerFormat === "A4"
                          ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] ring-1 ring-[var(--kimi-accent)] shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 text-[15px]">
                        <span>Full A4 Invoice</span>
                        {printerFormat === "A4" && (
                          <Check className="h-4 w-4 text-[var(--kimi-accent)]" />
                        )}
                      </div>
                      <p className="mt-1 text-[12px] text-slate-500">
                        Formal itemized A4 invoice sheet for standard office laser / inkjet
                        printers.
                      </p>
                    </button>
                  </div>
                </div>

                <CTextArea
                  id="print-footer"
                  label="Receipt Footer Note"
                  value={printShopNote}
                  onChange={setPrintShopNote}
                  rows={2}
                />

                <div className="pt-2">
                  <PrimaryBtn onClick={handleSavePrint} className="w-auto px-6">
                    <Save className="h-4 w-4" /> Save Printing Preferences
                  </PrimaryBtn>
                </div>
              </div>
            </CSection>
          )}

          {activeTab === "payment" && (
            <CSection
              title="Payment Methods"
              subtitle="Configure which payment methods are accepted at the counter."
            >
              <div className="space-y-3">
                {["Cash", "Card / Chip & PIN", "Bank Transfer", "Other"].map((m) => (
                  <div
                    key={m}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3.5 bg-white"
                  >
                    <span className="font-semibold text-[14px] text-slate-800">{m}</span>
                    <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </CSection>
          )}

          {activeTab === "warranty" && (
            <CSection
              title="Invoice & Warranty Terms"
              subtitle={`Standard 5-point statutory & warranty conditions applied across all invoices. Current Version: ${TERMS_VERSION}`}
            >
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CField
                    id="rep-warranty"
                    label="Default Repair Warranty (Days)"
                    value={repairWarrantyDays}
                    onChange={(v) => setRepairWarrantyDays(v.replace(/\D/g, ""))}
                    type="text"
                    inputMode="numeric"
                  />
                  <CField
                    id="sale-warranty"
                    label="Default Phone Sale Warranty (Days)"
                    value={saleWarrantyDays}
                    onChange={(v) => setSaleWarrantyDays(v.replace(/\D/g, ""))}
                    type="text"
                    inputMode="numeric"
                  />
                </div>

                {/* Repair Terms Snapshot */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-slate-900 uppercase tracking-wide">
                      {STANDARD_TERMS.REPAIR.heading} (5 Points)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Standard Repair Terms</span>
                  </div>
                  <div className="space-y-1.5 text-[12px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    {STANDARD_TERMS.REPAIR.points.map((p, i) => (
                      <p key={i}>
                        <strong className="text-slate-800">{p.title}:</strong> {p.body}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Sale Terms Snapshot */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-slate-900 uppercase tracking-wide">
                      {STANDARD_TERMS.SALE.heading} (5 Points)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Standard Phone Sale Terms</span>
                  </div>
                  <div className="space-y-1.5 text-[12px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    {STANDARD_TERMS.SALE.points.map((p, i) => (
                      <p key={i}>
                        <strong className="text-slate-800">{p.title}:</strong> {p.body}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Purchase Declaration Snapshot */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-slate-900 uppercase tracking-wide">
                      {STANDARD_TERMS.PURCHASE.heading} (5 Points)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Trade-in &amp; Purchase Declaration</span>
                  </div>
                  <div className="space-y-1.5 text-[12px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    {STANDARD_TERMS.PURCHASE.points.map((p, i) => (
                      <p key={i}>
                        <strong className="text-slate-800">{p.title}:</strong> {p.body}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <PrimaryBtn onClick={handleSaveGeneral} className="w-auto px-6">
                    <Save className="h-4 w-4" /> Save Warranty Defaults
                  </PrimaryBtn>
                </div>
              </div>
            </CSection>
          )}

          {activeTab === "tax" && (
            <CSection
              title="Tax & VAT Settings"
              subtitle="Only enable if your business is registered for UK VAT."
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="vat-check"
                    checked={isVatRegistered}
                    onChange={(e) => setIsVatRegistered(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[var(--kimi-accent)] focus:ring-[var(--kimi-accent)]"
                  />
                  <label htmlFor="vat-check" className="text-[14px] font-bold text-slate-800">
                    This business is VAT registered (Standard UK VAT Rate 20%)
                  </label>
                </div>

                {isVatRegistered && (
                  <CField
                    id="vat-number"
                    label="UK VAT Registration Number"
                    value={vatNumber}
                    onChange={setVatNumber}
                    placeholder="e.g. GB 123 4567 89"
                  />
                )}

                <div className="pt-2">
                  <PrimaryBtn onClick={handleSaveGeneral} className="w-auto px-6">
                    <Save className="h-4 w-4" /> Save Tax Settings
                  </PrimaryBtn>
                </div>
              </div>
            </CSection>
          )}

          {activeTab === "staff" && (
            <CSection
              title="Staff Access & Roles"
              subtitle="Control permissions and financial visibility for counter staff."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-white">
                  <div>
                    <p className="font-bold text-[14px] text-slate-900">Owner / Admin</p>
                    <p className="text-[12px] text-slate-500">
                      Full access to phone costs, profits, business reports and invoice voids.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    Full Access
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-white">
                  <div>
                    <p className="font-bold text-[14px] text-slate-900">Counter Staff</p>
                    <p className="text-[12px] text-slate-500">
                      Fast counter transactions, repairs, sales and printing. Purchase costs &amp;
                      profits hidden.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    Standard
                  </span>
                </div>
              </div>
            </CSection>
          )}
        </div>
      </div>
    </div>
  );
}
