import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  KeyRound,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  UserPlus,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CField,
  CSection,
  CTextArea,
  InvoiceSummaryPanel,
  MoneyInput,
  MoreDetails,
  PaymentMethodSelector,
  RepairTypeChips,
  StickyActionBar,
  SuccessStateView,
  WarrantySelector,
  getSavedPaymentMethod,
  getSavedPrinterFormat,
} from "@/components/counter/ds";
import {
  createRepairInvoice,
  getCounterInvoice,
  searchCounterCustomers,
} from "@/lib/counter.functions";
import { buildCounterInvoiceHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";
import { cents, formatPence } from "@/lib/money";
import { DEVICE_MODELS, inferBrand } from "@/lib/counter-constants";
import type { PartySummary } from "@/lib/counter.types";

export const Route = createFileRoute("/_authenticated/admin/repair")({
  ssr: false,
  head: () => ({ meta: [{ title: "New Repair Invoice — MR KHAN" }] }),
  component: RepairInvoicePage,
});

type RepairForm = {
  customer_id: string;
  customer_phone: string;
  customer_name: string;
  device_input: string;
  device_make: string;
  device_model: string;
  problem: string;
  repair_work: string;
  // More details & Custom terms
  imei_serial: string;
  passcode: string;
  parts_used: string;
  parts_cost: string;
  labour_charge: string;
  additional_agreement: string;
  shop_note: string;
  // Pricing & Payment
  repair_charge: string;
  discount: string;
  paid: string;
  payment_method: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
  warranty_days: string;
};

const initialForm: RepairForm = {
  customer_id: "",
  customer_phone: "",
  customer_name: "",
  device_input: "iPhone 15 Pro",
  device_make: "Apple",
  device_model: "iPhone 15 Pro",
  problem: "Screen Replacement",
  repair_work: "Screen Replacement & full functionality testing",
  imei_serial: "",
  passcode: "",
  parts_used: "",
  parts_cost: "",
  labour_charge: "",
  additional_agreement: "",
  shop_note: "",
  repair_charge: "",
  discount: "0",
  paid: "",
  payment_method: "CASH",
  warranty_days: "90",
};

function RepairInvoicePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RepairForm>(() => ({
    ...initialForm,
    payment_method: getSavedPaymentMethod(),
  }));
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [deviceSearch, setDeviceSearch] = useState("iPhone 15 Pro");
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completedResult, setCompletedResult] = useState<{
    id: string;
    invoice_number: string;
    total_pence: number;
    paid_pence: number;
    balance_pence: number;
    payment_method: string;
  } | null>(null);

  const [preview, setPreview] = useState<{
    invoiceNumber: string;
    html80mm: string;
    htmlA4: string;
  } | null>(null);

  const requestId = useRef<string | null>(null);
  const qc = useQueryClient();

  const customersFn = useServerFn(searchCounterCustomers);
  const createFn = useServerFn(createRepairInvoice);
  const detailFn = useServerFn(getCounterInvoice);

  // Search existing customers when typing phone number
  const { data: customerMatches = [] } = useQuery({
    queryKey: ["counter", "customers", "phone", phoneSearch],
    queryFn: () => customersFn({ data: { query: phoneSearch } }),
    enabled: phoneSearch.trim().length >= 3,
  });

  const update = (key: keyof RepairForm, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // If updating parts_cost or labour_charge, auto-calculate repair_charge
      if (key === "parts_cost" || key === "labour_charge") {
        const parts = parseFloat(key === "parts_cost" ? value : prev.parts_cost) || 0;
        const labour = parseFloat(key === "labour_charge" ? value : prev.labour_charge) || 0;
        if (parts > 0 || labour > 0) {
          next.repair_charge = (parts + labour).toFixed(2);
          if (!prev.paid || prev.paid === prev.repair_charge) {
            next.paid = next.repair_charge;
          }
        }
      }
      // If setting repair_charge, default paid to full amount if not touched or equal
      if (key === "repair_charge") {
        if (!prev.paid || prev.paid === prev.repair_charge) {
          next.paid = value;
        }
      }
      return next;
    });
  };

  // Device autocomplete suggestions
  const filteredDevices = useMemo(() => {
    if (!deviceSearch) return DEVICE_MODELS.slice(0, 10);
    return DEVICE_MODELS.filter((m) => m.toLowerCase().includes(deviceSearch.toLowerCase())).slice(
      0,
      10,
    );
  }, [deviceSearch]);

  const handleSelectDevice = (modelName: string) => {
    const brand = inferBrand(modelName, form.device_make);
    setForm((prev) => ({
      ...prev,
      device_input: modelName,
      device_model: modelName,
      device_make: brand,
    }));
    setDeviceSearch(modelName);
    setShowDeviceDropdown(false);
  };

  const handleSelectCustomer = (party: PartySummary) => {
    setForm((prev) => ({
      ...prev,
      customer_id: party.id,
      customer_name: party.name,
      customer_phone: party.phone,
    }));
    setPhoneSearch(party.phone);
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    setForm((prev) => ({ ...prev, customer_id: "", customer_name: "", customer_phone: "" }));
    setPhoneSearch("");
  };

  // Calculations in pence
  const subtotalPence = cents(form.repair_charge);
  const discountPence = cents(form.discount || "0");
  const totalPence = Math.max(0, subtotalPence - discountPence);
  const paidPence = cents(form.paid || "0");
  const balancePence = Math.max(0, totalPence - paidPence);
  const isOverpaid = paidPence > totalPence;

  const [pendingPrintFormat, setPendingPrintFormat] = useState<"80MM" | "A4" | null>(null);

  const canSubmit =
    !busy &&
    form.customer_phone.trim().length >= 6 &&
    form.customer_name.trim().length >= 1 &&
    form.device_model.trim().length >= 1 &&
    form.problem.trim().length >= 1 &&
    Number.isFinite(subtotalPence) &&
    subtotalPence > 0 &&
    !isOverpaid;

  // Submission handler
  const executeSubmission = async (shouldPrint = true, paperFormat?: "80MM" | "A4") => {
    if (isOverpaid) {
      toast.error("Amount paid cannot exceed the final repair total.");
      return;
    }
    if (!canSubmit) return;

    requestId.current ??= crypto.randomUUID();
    setBusy(true);
    setPendingPrintFormat(paperFormat ?? (shouldPrint ? getSavedPrinterFormat() : null));

    let savedResult: { id: string; invoice_number: string } | null = null;
    try {
      const combinedShopNote = [
        form.passcode ? `Device Passcode/PIN: ${form.passcode}` : "",
        form.parts_used ? `Parts: ${form.parts_used}` : "",
        form.additional_agreement ? `Agreement: ${form.additional_agreement}` : "",
        form.shop_note,
      ]
        .filter(Boolean)
        .join(" | ");

      savedResult = await createFn({
        data: {
          request_id: requestId.current,
          customer_id: form.customer_id || undefined,
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          device_make: form.device_make.trim(),
          device_model: form.device_model.trim(),
          imei_serial: form.imei_serial.replace(/\s+/g, ""),
          problem: form.problem.trim(),
          repair_work: form.repair_work.trim() || `${form.problem} completed & tested`,
          shop_note: combinedShopNote,
          subtotal_pence: subtotalPence,
          discount_pence: discountPence,
          paid_pence: paidPence,
          payment_method: form.payment_method,
          warranty_days: Number(form.warranty_days) || 0,
        },
      });

      toast.success(`Repair invoice ${savedResult.invoice_number} saved.`);
      requestId.current = null;
      await qc.invalidateQueries({ queryKey: ["counter"] });

      setCompletedResult({
        id: savedResult.id,
        invoice_number: savedResult.invoice_number,
        total_pence: totalPence,
        paid_pence: paidPence,
        balance_pence: balancePence,
        payment_method: form.payment_method,
      });

      if (shouldPrint && savedResult) {
        try {
          const detail = await detailFn({ data: { kind: "REPAIR", id: savedResult.id } });
          setPreview({
            invoiceNumber: savedResult.invoice_number,
            html80mm: buildCounterInvoiceHtml("REPAIR", detail, "80MM"),
            htmlA4: buildCounterInvoiceHtml("REPAIR", detail, "A4"),
          });
        } catch {
          toast.error("Invoice saved, but print preview could not be loaded immediately.");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The invoice could not be saved. Please check the fields and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResetForNew = () => {
    setForm(initialForm);
    setDeviceSearch("iPhone 15 Pro");
    setPhoneSearch("");
    setCompletedResult(null);
    setPreview(null);
  };

  const handleReprintCurrent = async () => {
    if (!completedResult) return;
    try {
      const detail = await detailFn({ data: { kind: "REPAIR", id: completedResult.id } });
      setPreview({
        invoiceNumber: completedResult.invoice_number,
        html80mm: buildCounterInvoiceHtml("REPAIR", detail, "80MM"),
        htmlA4: buildCounterInvoiceHtml("REPAIR", detail, "A4"),
      });
    } catch {
      toast.error("Could not load reprint preview.");
    }
  };

  if (completedResult) {
    return (
      <div className="py-8">
        <SuccessStateView
          title="Repair Invoice Completed"
          invoiceNumber={completedResult.invoice_number}
          totalPence={completedResult.total_pence}
          paidPence={completedResult.paid_pence}
          balancePence={completedResult.balance_pence}
          paymentMethod={completedResult.payment_method}
          onReprint={handleReprintCurrent}
          onNewTransaction={handleResetForNew}
          newTransactionLabel="New Repair Invoice"
          onReturnToCounter={() => navigate({ to: "/admin" })}
          onViewInvoice={() => navigate({ to: "/admin/invoices" })}
        />

        {preview && (
          <PrintPreviewModal
            open={true}
            onClose={() => setPreview(null)}
            kind="REPAIR"
            invoiceNumber={preview.invoiceNumber}
            html80mm={preview.html80mm}
            htmlA4={preview.htmlA4}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Back to Counter"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-[26px] font-black text-slate-900 tracking-tight">
              New Repair Invoice
            </h1>
          </div>
          <p className="text-[14px] text-slate-500 mt-0.5 pl-7">
            Enter a completed repair, take payment and print the invoice.
          </p>
        </div>

        <Link
          to="/admin/invoices"
          className="text-[13px] font-bold text-[var(--kimi-accent)] hover:underline flex items-center gap-1 shrink-0"
        >
          <FileText className="h-4 w-4" /> View Repair Invoices
        </Link>
      </div>

      {/* ── Pre-Service Data & Seal Notice ───────────────────────────────── */}
      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-[13px] text-blue-950">
        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-700" />
        <p className="leading-snug">
          <strong>Service Advisory:</strong> Repairs involving device opening may affect
          water-resistant seals. Customers should maintain a backup of important data before repair.
        </p>
      </div>

      {/* ── Two-Column Ergonomic Layout ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Customer, Device & Work */}
        <div className="space-y-5">
          {/* Section 1: Customer Section (Starts with Phone Number) */}
          <CSection
            title="Customer Contact"
            subtitle="Enter customer phone to search returning customers automatically"
          >
            {form.customer_id ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-emerald-950">{form.customer_name}</p>
                    <p className="text-[12px] text-emerald-700">
                      {form.customer_phone} · Returning Customer
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Change customer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 relative">
              {/* Phone Input with Auto Search */}
              <div className="relative">
                <CField
                  id="repair-phone"
                  label="Customer Phone Number"
                  value={form.customer_phone}
                  onChange={(v) => {
                    update("customer_phone", v);
                    setPhoneSearch(v);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  type="tel"
                  required
                  placeholder="e.g. 07700 900000"
                />

                {/* Dropdown matching customer results */}
                {showCustomerDropdown && customerMatches.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                      Matching returning customers
                    </div>
                    {customerMatches.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] hover:bg-brand-subtle transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[12px] text-slate-500">{c.phone}</p>
                        </div>
                        {c.balance_pence > 0 && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Owes {formatPence(c.balance_pence)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Name */}
              <CField
                id="repair-name"
                label="Customer Name"
                value={form.customer_name}
                onChange={(v) => update("customer_name", v)}
                required
                placeholder="e.g. John Smith"
              />
            </div>
          </CSection>

          {/* Section 2: Device & Repair Performed */}
          <CSection title="Device & Repair Information">
            <div className="space-y-4">
              {/* Combined Searchable Device Input */}
              <div className="relative">
                <label
                  htmlFor="repair-device"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-700"
                >
                  Device Model{" "}
                  <span className="ml-1 font-normal text-slate-400">· Type to autocomplete</span>
                  <span className="ml-0.5 text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="repair-device"
                    type="text"
                    required
                    value={form.device_input}
                    placeholder="e.g. iPhone 15 Pro, Samsung S24 Ultra, Pixel 8..."
                    onFocus={() => setShowDeviceDropdown(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDeviceSearch(val);
                      const brand = inferBrand(val, form.device_make);
                      setForm((prev) => ({
                        ...prev,
                        device_input: val,
                        device_model: val,
                        device_make: brand,
                      }));
                      setShowDeviceDropdown(true);
                    }}
                    className="h-12 w-full rounded-[var(--kimi-radius-input)] border border-slate-200 bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)] font-semibold"
                  />
                  {form.device_make && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      {form.device_make}
                    </span>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showDeviceDropdown && filteredDevices.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {filteredDevices.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => handleSelectDevice(d)}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[14px] font-medium hover:bg-brand-subtle hover:text-[var(--kimi-accent)] transition-colors"
                      >
                        <span>{d}</span>
                        <span className="text-[11px] font-bold uppercase text-slate-400">
                          {inferBrand(d)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Repair Performed with Quick Chips */}
              <div className="space-y-2">
                <RepairTypeChips
                  value={form.problem}
                  onChange={(val) => {
                    update("problem", val);
                    if (!form.repair_work || form.repair_work.includes("testing")) {
                      update("repair_work", `${val} & quality functionality testing`);
                    }
                  }}
                />

                <CField
                  id="repair-custom-problem"
                  label="Repair Performed Description"
                  value={form.problem}
                  onChange={(v) => update("problem", v)}
                  required
                  placeholder="e.g. Screen replacement, Battery replacement..."
                />
              </div>
            </div>
          </CSection>

          {/* Section 3: Collapsed "More details" */}
          <MoreDetails title="More details (IMEI, Parts, Labour, Passcode, Notes)">
            <div className="grid gap-4 sm:grid-cols-2">
              <CField
                id="repair-imei"
                label="IMEI / Serial Number"
                value={form.imei_serial}
                onChange={(v) => update("imei_serial", v.replace(/\s+/g, ""))}
                optional
                placeholder="15-digit IMEI or serial"
                mono
              />

              <CField
                id="repair-passcode"
                label="Device PIN / Passcode"
                value={form.passcode}
                onChange={(v) => update("passcode", v)}
                optional
                placeholder="Lock PIN for testing"
              />

              <CField
                id="repair-parts-used"
                label="Parts Used"
                value={form.parts_used}
                onChange={(v) => update("parts_used", v)}
                optional
                placeholder="e.g. OEM OLED Screen"
              />

              <div className="grid grid-cols-2 gap-2">
                <MoneyInput
                  id="repair-parts-cost"
                  label="Parts Cost"
                  value={form.parts_cost}
                  onChange={(v) => update("parts_cost", v)}
                  optional
                />
                <MoneyInput
                  id="repair-labour"
                  label="Labour Charge"
                  value={form.labour_charge}
                  onChange={(v) => update("labour_charge", v)}
                  optional
                />
              </div>
            </div>

            <CTextArea
              id="repair-notes"
              label="Work & Testing Specifications"
              value={form.repair_work}
              onChange={(v) => update("repair_work", v)}
              optional
              rows={2}
              placeholder="Testing details, diagnostic notes..."
            />

            <CTextArea
              id="repair-additional-agreement"
              label="Additional Agreement for This Invoice (Printed on invoice)"
              value={form.additional_agreement}
              onChange={(v) => update("additional_agreement", v)}
              optional
              rows={2}
              placeholder="Enter any special condition agreed for this invoice..."
            />

            <CTextArea
              id="repair-internal-notes"
              label="Internal Shop Notes (Not printed on customer invoice)"
              value={form.shop_note}
              onChange={(v) => update("shop_note", v)}
              optional
              rows={2}
              placeholder="Supplier invoice ref, internal notes..."
            />
          </MoreDetails>
        </div>

        {/* Right Column: Charges, Payment & Summary */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {/* Charges Section */}
          <CSection title="Charges & Payment">
            <div className="space-y-4">
              <MoneyInput
                id="repair-price"
                label="Repair Charge"
                value={form.repair_charge}
                onChange={(v) => update("repair_charge", v)}
                required
                placeholder="40.00"
              />

              <MoneyInput
                id="repair-discount"
                label="Discount"
                value={form.discount}
                onChange={(v) => update("discount", v)}
                optional
              />

              <MoneyInput
                id="repair-paid"
                label="Amount Paid Now"
                value={form.paid}
                onChange={(v) => update("paid", v)}
                required
                helperText={
                  isOverpaid
                    ? "Amount paid cannot exceed the final repair total."
                    : balancePence > 0
                      ? `Customer will owe ${formatPence(balancePence)} on their account.`
                      : "Fully paid in full."
                }
              />

              <PaymentMethodSelector
                value={form.payment_method}
                onChange={(v) => update("payment_method", v)}
              />

              <WarrantySelector
                value={form.warranty_days}
                onChange={(v) => update("warranty_days", v)}
              />
            </div>
          </CSection>

          {/* Live Summary Panel */}
          <InvoiceSummaryPanel
            subtotal={subtotalPence}
            discount={discountPence}
            paid={paidPence}
            customerName={form.customer_name}
          />
        </div>
      </div>

      {/* ── Sticky Action Bar ─────────────────────────────────────────────── */}
      <StickyActionBar
        primaryLabel="Complete & Print"
        isBusy={busy}
        canSubmit={canSubmit}
        onSubmitWithPrint={(paper) => executeSubmission(true, paper)}
        onSubmitSaveOnly={() => executeSubmission(false)}
        onCancel={() => navigate({ to: "/admin" })}
      />

      {/* ── Print Preview Modal ───────────────────────────────────────────── */}
      {preview && (
        <PrintPreviewModal
          open={true}
          onClose={() => setPreview(null)}
          kind="REPAIR"
          invoiceNumber={preview.invoiceNumber}
          html80mm={preview.html80mm}
          htmlA4={preview.htmlA4}
          defaultPaper={pendingPrintFormat ?? undefined}
        />
      )}
    </div>
  );
}
