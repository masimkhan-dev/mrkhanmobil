import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  FileText,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CField,
  CompactConfirmModal,
  DataTable,
  EmptyState,
  MoneyInput,
  PageHeader,
  PaymentMethodSelector,
  PillTabs,
  SkeletonRows,
  StatusBadge,
} from "@/components/counter/ds";
import {
  getCounterInvoice,
  listCounterInvoices,
  receiveCustomerPayment,
  voidCounterInvoice,
} from "@/lib/counter.functions";
import type { InvoiceKind, InvoiceSummary } from "@/lib/counter.types";
import { cents, formatPence } from "@/lib/money";
import { buildCounterInvoiceHtml, buildStatementHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  ssr: false,
  head: () => ({ meta: [{ title: "Invoices — MR KHAN" }] }),
  component: InvoicesHistoryPage,
});

type KindFilter = "ALL" | InvoiceKind | "VOIDED";

const KIND_TABS: { value: KindFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "REPAIR", label: "Repairs" },
  { value: "SALE", label: "Phone Sales" },
  { value: "PURCHASE", label: "Stock Purchases" },
  { value: "VOIDED", label: "Voided" },
];

function InvoicesHistoryPage() {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);

  // Voiding state
  const [voidTarget, setVoidTarget] = useState<InvoiceSummary | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  // Later payment modal state
  const [paymentTarget, setPaymentTarget] = useState<InvoiceSummary | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"CASH" | "CARD" | "BANK_TRANSFER" | "OTHER">("CASH");
  const [payNote, setPayNote] = useState("");
  const [paying, setPaying] = useState(false);

  // Print modal
  const [printPreview, setPrintPreview] = useState<{
    invoiceNumber: string;
    html80mm: string;
    htmlA4: string;
    kind: InvoiceKind;
  } | null>(null);

  const paymentRequestId = useRef<string | null>(null);
  const qc = useQueryClient();

  const listFn = useServerFn(listCounterInvoices);
  const detailFn = useServerFn(getCounterInvoice);
  const voidFn = useServerFn(voidCounterInvoice);
  const receivePaymentFn = useServerFn(receiveCustomerPayment);

  const activeKindParam = kindFilter === "VOIDED" || kindFilter === "ALL" ? "ALL" : kindFilter;

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["counter", "invoices", "list", query, activeKindParam],
    queryFn: () => listFn({ data: { query, kind: activeKindParam } }),
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (kindFilter === "VOIDED") return inv.status === "VOID";
    if (kindFilter === "ALL") return true;
    return inv.kind === kindFilter && inv.status !== "VOID";
  });

  const handlePrint = async (inv: InvoiceSummary) => {
    try {
      const detail = await detailFn({ data: { kind: inv.kind, id: inv.id } });
      setPrintPreview({
        invoiceNumber: inv.invoice_number,
        html80mm: buildCounterInvoiceHtml(inv.kind, detail, "80MM"),
        htmlA4: buildCounterInvoiceHtml(inv.kind, detail, "A4"),
        kind: inv.kind,
      });
    } catch {
      toast.error("Failed to load invoice print preview.");
    }
  };

  const handleVoidInvoice = async () => {
    if (!voidTarget || voidReason.trim().length < 3) {
      toast.error("Please enter a valid reason for voiding this invoice.");
      return;
    }
    setVoiding(true);
    try {
      await voidFn({
        data: {
          kind: voidTarget.kind,
          id: voidTarget.id,
          reason: voidReason.trim(),
        },
      });
      toast.success(`Invoice ${voidTarget.invoice_number} voided and related records reversed.`);
      setVoidTarget(null);
      setVoidReason("");
      await qc.invalidateQueries({ queryKey: ["counter"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not void invoice.");
    } finally {
      setVoiding(false);
    }
  };

  const handleOpenPayment = (inv: InvoiceSummary) => {
    setPaymentTarget(inv);
    const balancePence = Math.max(0, inv.total_pence - inv.paid_pence);
    setPayAmount((balancePence / 100).toFixed(2));
    setPayNote(`Payment towards ${inv.invoice_number}`);
  };

  const handleRecordPayment = async () => {
    if (!paymentTarget) return;
    const amountPence = cents(payAmount);
    const maxBalancePence = Math.max(0, paymentTarget.total_pence - paymentTarget.paid_pence);

    if (amountPence <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    if (amountPence > maxBalancePence) {
      toast.error("Payment cannot be greater than the remaining balance.");
      return;
    }

    paymentRequestId.current ??= crypto.randomUUID();
    setPaying(true);

    try {
      await receivePaymentFn({
        data: {
          request_id: paymentRequestId.current,
          customer_id: paymentTarget.id, // linked customer/party
          amount_pence: amountPence,
          payment_method: payMethod,
          reference_note: payNote.trim(),
        },
      });
      toast.success("Payment recorded successfully.");
      paymentRequestId.current = null;
      setPaymentTarget(null);
      await qc.invalidateQueries({ queryKey: ["counter"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record payment.");
    } finally {
      setPaying(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const tableHeaders = [
    "Invoice #",
    "Type",
    "Customer / Supplier",
    "Device Details",
    "Date",
    "Total",
    "Status",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Invoices"
        description="Search, view, print, record later payments, or safely void invoices."
      />

      {/* ── Search & Filter Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice number, customer, phone or IMEI…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <PillTabs options={KIND_TABS} value={kindFilter} onChange={setKindFilter} />
      </div>

      {/* ── Invoices Data Table ────────────────────────────────────────────── */}
      <DataTable headers={tableHeaders}>
        {isLoading ? (
          <SkeletonRows cols={tableHeaders.length} rows={6} />
        ) : filteredInvoices.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={tableHeaders.length}>
                <EmptyState
                  icon={FileText}
                  title="No invoices found"
                  description={
                    query
                      ? `No invoices matched "${query}".`
                      : "Completed repairs, sales and purchases will appear here."
                  }
                />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {filteredInvoices.map((inv) => {
              const balancePence = Math.max(0, inv.total_pence - inv.paid_pence);
              const isVoid = inv.status === "VOID";

              return (
                <tr
                  key={`${inv.kind}-${inv.id}`}
                  className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                    isVoid ? "opacity-60 bg-slate-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 font-mono text-[13px] font-black text-[var(--kimi-accent)]">
                    {inv.invoice_number}
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={inv.kind} />
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900 text-[14px]">{inv.party_name}</p>
                    <p className="text-[12px] text-slate-500">{inv.party_phone || "No phone"}</p>
                  </td>

                  <td className="px-4 py-3.5 text-[13px] text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {inv.device_make} {inv.device_model}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {inv.identifier ? `IMEI: ${inv.identifier}` : "No IMEI"}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-[13px] text-slate-500">
                    {formatDate(inv.created_at)}
                  </td>

                  <td className="px-4 py-3.5 font-black text-slate-900 tabular-nums text-[15px]">
                    {formatPence(inv.total_pence)}
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={inv.payment_status} />
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrint(inv)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 min-h-[32px]"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-500" />
                        Print
                      </button>

                      {balancePence > 0 && !isVoid && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(inv)}
                          className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1.5 text-[12px] font-bold text-white hover:bg-amber-700 min-h-[32px]"
                        >
                          <Banknote className="h-3.5 w-3.5" />
                          Pay
                        </button>
                      )}

                      {!isVoid && (
                        <button
                          type="button"
                          onClick={() => {
                            setVoidTarget(inv);
                            setVoidReason("");
                          }}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Void invoice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </DataTable>

      {/* ── Record Later Payment Modal ─────────────────────────────────────── */}
      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[18px] font-bold text-slate-900">Record Payment</h3>
              <button
                type="button"
                onClick={() => setPaymentTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{paymentTarget.party_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-[var(--kimi-accent)]">
                  {paymentTarget.invoice_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Total:</span>
                <span className="font-bold text-slate-900">
                  {formatPence(paymentTarget.total_pence)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-amber-800">
                <span>Remaining Balance:</span>
                <span>{formatPence(paymentTarget.total_pence - paymentTarget.paid_pence)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <MoneyInput
                id="record-pay-amount"
                label="Payment Amount"
                value={payAmount}
                onChange={setPayAmount}
                required
              />

              <PaymentMethodSelector value={payMethod} onChange={setPayMethod} />

              <CField
                id="record-pay-note"
                label="Payment Reference / Note"
                value={payNote}
                onChange={setPayNote}
                optional
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentTarget(null)}
                disabled={paying}
                className="rounded-[var(--kimi-radius-btn)] border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={paying}
                className="rounded-[var(--kimi-radius-btn)] bg-emerald-600 px-6 py-2.5 text-[14px] font-bold text-white hover:bg-emerald-700 transition-all min-h-[44px]"
              >
                {paying ? "Recording…" : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Void Invoice Confirmation Modal ───────────────────────────────── */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-[18px] font-bold text-slate-900">
                Void Invoice {voidTarget.invoice_number}?
              </h3>
            </div>

            <p className="text-[14px] text-slate-600">
              Voiding will reverse payments, restore phone stock if applicable, and create a
              permanent audit log. This action cannot be directly undone.
            </p>

            <div className="space-y-1">
              <label
                htmlFor="void-reason-input"
                className="block text-[13px] font-bold text-slate-700"
              >
                Reason for Voiding <span className="text-red-500">*</span>
              </label>
              <textarea
                id="void-reason-input"
                rows={2}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Customer cancelled / incorrect amount entered"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-[14px] focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVoidTarget(null)}
                disabled={voiding}
                className="rounded-[var(--kimi-radius-btn)] border border-slate-200 px-4 py-2 text-[14px] font-medium text-slate-600 hover:bg-slate-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVoidInvoice}
                disabled={voiding || voidReason.trim().length < 3}
                className="rounded-[var(--kimi-radius-btn)] bg-red-600 px-5 py-2 text-[14px] font-bold text-white hover:bg-red-700 transition-all disabled:opacity-50 min-h-[44px]"
              >
                {voiding ? "Voiding…" : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print Preview Modal ───────────────────────────────────────────── */}
      {printPreview && (
        <PrintPreviewModal
          open={true}
          onClose={() => setPrintPreview(null)}
          kind={printPreview.kind}
          invoiceNumber={printPreview.invoiceNumber}
          html80mm={printPreview.html80mm}
          htmlA4={printPreview.htmlA4}
        />
      )}
    </div>
  );
}
