import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  PackageCheck,
  PackageSearch,
  Percent,
  Printer,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CField,
  CSection,
  InvoiceSummaryPanel,
  MoneyInput,
  PaymentMethodSelector,
  StatusBadge,
  StickyActionBar,
  SuccessStateView,
  WarrantySelector,
  getSavedPaymentMethod,
  getSavedPrinterFormat,
} from "@/components/counter/ds";
import { CompactConfirmModal } from "@/components/counter/compact-confirm-modal";
import {
  createSaleInvoice,
  getCounterInvoice,
  listCounterStock,
  searchCounterCustomers,
} from "@/lib/counter.functions";
import { buildCounterInvoiceHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";
import { cents, formatPence } from "@/lib/money";
import type { PartySummary, StockDevice } from "@/lib/counter.types";

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

export const Route = createFileRoute("/_authenticated/admin/sell")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sell Phone — MR KHAN" }] }),
  component: SellPhonePage,
});

function SellPhonePage() {
  const navigate = useNavigate();
  const [stockSearch, setStockSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockDevice | null>(null);

  // Customer state
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Financials & Payment
  const [sellingPrice, setSellingPrice] = useState("");
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [discountValue, setDiscountValue] = useState("0");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "BANK_TRANSFER" | "OTHER">(
    () => getSavedPaymentMethod(),
  );
  const [warrantyDays, setWarrantyDays] = useState("90");

  // Confirmation & Success modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPrintFormat, setPendingPrintFormat] = useState<"80MM" | "A4" | null>(null);
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

  const stockFn = useServerFn(listCounterStock);
  const customersFn = useServerFn(searchCounterCustomers);
  const createFn = useServerFn(createSaleInvoice);
  const detailFn = useServerFn(getCounterInvoice);

  // Load available stock
  const { data: stockList = [], isLoading: stockLoading } = useQuery({
    queryKey: ["counter", "stock", "sell_list", stockSearch],
    queryFn: () => stockFn({ data: { query: stockSearch, status: "ALL" } }),
    staleTime: 15_000,
  });

  const availableStock = stockList.filter((s) => s.status === "IN_STOCK");
  const otherStock = stockList.filter((s) => s.status !== "IN_STOCK");

  // Customer search
  const { data: customerMatches = [] } = useQuery({
    queryKey: ["counter", "customers", "sell_search", customerSearch],
    queryFn: () => customersFn({ data: { query: customerSearch } }),
    enabled: customerSearch.trim().length >= 2,
  });

  // Calculate pricing
  const rawPricePence = cents(sellingPrice || "0");
  let discountPence = 0;
  if (discountType === "FIXED") {
    discountPence = cents(discountValue || "0");
  } else {
    const pct = parseFloat(discountValue) || 0;
    discountPence = Math.round((rawPricePence * pct) / 100);
  }
  const finalTotalPence = Math.max(0, rawPricePence - discountPence);
  const paidPence = cents(
    amountPaid || (finalTotalPence > 0 ? (finalTotalPence / 100).toFixed(2) : "0"),
  );
  const balancePence = Math.max(0, finalTotalPence - paidPence);

  const updateSellingPrice = (val: string) => {
    setSellingPrice(val);
    const newRaw = cents(val || "0");
    const dVal =
      discountType === "FIXED"
        ? cents(discountValue || "0")
        : Math.round((newRaw * (parseFloat(discountValue) || 0)) / 100);
    const newTotal = Math.max(0, newRaw - dVal);
    if (!amountPaid || cents(amountPaid) > newTotal) {
      setAmountPaid(newTotal > 0 ? (newTotal / 100).toFixed(2) : "");
    }
  };

  const updateDiscountValue = (val: string) => {
    setDiscountValue(val);
    const raw = cents(sellingPrice || "0");
    const dVal =
      discountType === "FIXED"
        ? cents(val || "0")
        : Math.round((raw * (parseFloat(val) || 0)) / 100);
    const newTotal = Math.max(0, raw - dVal);
    if (!amountPaid || cents(amountPaid) > newTotal) {
      setAmountPaid(newTotal > 0 ? (newTotal / 100).toFixed(2) : "");
    }
  };

  const updateDiscountType = (type: "FIXED" | "PERCENT") => {
    setDiscountType(type);
    const raw = cents(sellingPrice || "0");
    const dVal =
      type === "FIXED"
        ? cents(discountValue || "0")
        : Math.round((raw * (parseFloat(discountValue) || 0)) / 100);
    const newTotal = Math.max(0, raw - dVal);
    if (!amountPaid || cents(amountPaid) > newTotal) {
      setAmountPaid(newTotal > 0 ? (newTotal / 100).toFixed(2) : "");
    }
  };

  const handleSelectStock = (device: StockDevice) => {
    setSelectedStock(device);
    const initialPricePence = device.expected_sale_price_pence || device.purchase_price_pence || 0;
    const priceStr = (initialPricePence / 100).toFixed(2);
    setSellingPrice(priceStr);
    setAmountPaid(priceStr);
  };

  const handleSelectCustomer = (party: PartySummary) => {
    setCustomerId(party.id);
    setCustomerName(party.name);
    setCustomerPhone(party.phone);
    setCustomerSearch(party.phone);
    setShowCustomerDropdown(false);
    setIsWalkIn(false);
  };

  const handleClearCustomer = () => {
    setCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerSearch("");
    setIsWalkIn(true);
  };

  // Validation & Overpayment protection
  const isOverpaid = paidPence > finalTotalPence;

  const canSubmit =
    !busy &&
    !!selectedStock &&
    Number.isFinite(finalTotalPence) &&
    finalTotalPence > 0 &&
    !isOverpaid &&
    (!balancePence ||
      (!isWalkIn && customerPhone.trim().length >= 6 && customerName.trim().length >= 1));

  const handleOpenConfirm = (paperFormat: "80MM" | "A4" | null = getSavedPrinterFormat()) => {
    if (isOverpaid) {
      toast.error("Amount received cannot be greater than the final total.");
      return;
    }
    if (!canSubmit) return;
    setPendingPrintFormat(paperFormat);
    setShowConfirmModal(true);
  };

  const executeSale = async () => {
    if (!selectedStock) return;
    requestId.current ??= crypto.randomUUID();
    setBusy(true);

    try {
      const result = await createFn({
        data: {
          request_id: requestId.current,
          sale_source: "STOCK",
          stock_device_id: selectedStock.id,
          customer_id: customerId || undefined,
          customer_name: isWalkIn ? "Walk-in Retail Customer" : customerName.trim(),
          customer_phone: isWalkIn ? "Walk-in" : customerPhone.trim(),
          selling_price_pence: rawPricePence,
          discount_pence: discountPence,
          paid_pence: paidPence,
          payment_method: paymentMethod,
          warranty_days: Number(warrantyDays) || 0,
        },
      });

      toast.success(`Sale completed! Invoice ${result.invoice_number} generated.`);
      requestId.current = null;
      setShowConfirmModal(false);
      await qc.invalidateQueries({ queryKey: ["counter"] });

      setCompletedResult({
        id: result.id,
        invoice_number: result.invoice_number,
        total_pence: finalTotalPence,
        paid_pence: paidPence,
        balance_pence: balancePence,
        payment_method: paymentMethod,
      });

      if (pendingPrintFormat) {
        try {
          const detail = await detailFn({ data: { kind: "SALE", id: result.id } });
          setPreview({
            invoiceNumber: result.invoice_number,
            html80mm: buildCounterInvoiceHtml("SALE", detail, "80MM"),
            htmlA4: buildCounterInvoiceHtml("SALE", detail, "A4"),
          });
        } catch {
          toast.error("Sale recorded, but print preview could not be opened automatically.");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not complete sale. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResetForNew = () => {
    setSelectedStock(null);
    setStockSearch("");
    setIsWalkIn(true);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerId("");
    setSellingPrice("");
    setDiscountValue("0");
    setAmountPaid("");
    setCompletedResult(null);
    setPreview(null);
  };

  const handleReprintCurrent = async () => {
    if (!completedResult) return;
    try {
      const detail = await detailFn({ data: { kind: "SALE", id: completedResult.id } });
      setPreview({
        invoiceNumber: completedResult.invoice_number,
        html80mm: buildCounterInvoiceHtml("SALE", detail, "80MM"),
        htmlA4: buildCounterInvoiceHtml("SALE", detail, "A4"),
      });
    } catch {
      toast.error("Could not load reprint preview.");
    }
  };

  if (completedResult) {
    return (
      <div className="py-8">
        <SuccessStateView
          title="Phone Sale Completed Successfully"
          invoiceNumber={completedResult.invoice_number}
          totalPence={completedResult.total_pence}
          paidPence={completedResult.paid_pence}
          balancePence={completedResult.balance_pence}
          paymentMethod={completedResult.payment_method}
          onReprint={handleReprintCurrent}
          onNewTransaction={handleResetForNew}
          newTransactionLabel="Sell Another Phone"
          onReturnToCounter={() => navigate({ to: "/admin" })}
          onViewInvoice={() => navigate({ to: "/admin/invoices" })}
        />

        {preview && (
          <PrintPreviewModal
            open={true}
            onClose={() => setPreview(null)}
            kind="SALE"
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
            <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Sell Phone</h1>
          </div>
          <p className="text-[14px] text-slate-500 mt-0.5 pl-7">
            Search for a phone currently in stock and complete the sale.
          </p>
        </div>

        <Link
          to="/admin/stock"
          className="text-[13px] font-bold text-[var(--kimi-accent)] hover:underline flex items-center gap-1 shrink-0"
        >
          <PackageSearch className="h-4 w-4" /> View All Stock
        </Link>
      </div>

      {/* ── Step 1: Stock Search & Selection ───────────────────────────────── */}
      {!selectedStock ? (
        <div className="space-y-4">
          <div className="rounded-[var(--kimi-radius-card)] border-2 border-slate-200 bg-white p-6 shadow-sm">
            <label className="block text-[14px] font-bold text-slate-800 mb-2">
              Search Stock by IMEI, Brand, Model or SKU
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Scan barcode or type IMEI, iPhone 15, Samsung..."
                className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-10 text-[16px] font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)]"
              />
              <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Stock Results */}
          <div className="space-y-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
              Phones Available in Stock ({availableStock.length})
            </h2>

            {stockLoading ? (
              <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-8 text-center text-slate-400 animate-pulse">
                Searching phones in stock…
              </div>
            ) : availableStock.length === 0 ? (
              <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-8 text-center space-y-3">
                <PackageSearch className="mx-auto h-10 w-10 text-slate-300" />
                <div>
                  <p className="text-[15px] font-bold text-slate-800">
                    No phones matching this search in stock
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Check spelling or add this device to stock first.
                  </p>
                </div>
                <Link
                  to="/admin/buy"
                  className="inline-flex items-center gap-1.5 rounded-[var(--kimi-radius-btn)] bg-[var(--kimi-accent)] px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-[var(--kimi-accent-hover)]"
                >
                  + Add Phone to Stock
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableStock.map((phone) => (
                  <button
                    key={phone.id}
                    type="button"
                    onClick={() => handleSelectStock(phone)}
                    className="flex flex-col justify-between rounded-[var(--kimi-radius-card)] border-2 border-slate-200 bg-white p-4 text-left shadow-xs transition-all hover:border-[var(--kimi-accent)] hover:shadow-md min-h-[130px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[16px] font-black text-slate-900 leading-tight">
                          {phone.device_make} {phone.device_model}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          In Stock
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-500 mt-1">
                        {phone.storage || "N/A"} · {phone.colour || "Standard"} ·{" "}
                        {phone.device_condition}
                      </p>
                      <p className="text-[12px] font-mono text-slate-400 mt-0.5">
                        IMEI: {phone.imei ? `••••${phone.imei.slice(-5)}` : "—"}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[12px] text-slate-400">Retail price:</span>
                      <span className="text-[18px] font-black text-slate-900 tabular-nums">
                        {formatPence(
                          phone.expected_sale_price_pence || phone.purchase_price_pence || 0,
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Step 2: Selected Phone Sale Form ─────────────────────────────── */
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {/* Selected Phone Card */}
            <div className="rounded-[var(--kimi-radius-card)] border-2 border-[var(--kimi-accent)] bg-blue-50/40 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] px-2.5 py-0.5 rounded-full">
                      Selected Phone
                    </span>
                  </div>
                  <h2 className="text-[20px] font-black text-slate-900 mt-1">
                    {selectedStock.device_make} {selectedStock.device_model}
                  </h2>
                  <p className="text-[14px] text-slate-600 mt-0.5">
                    {selectedStock.storage} · {selectedStock.colour} · Condition:{" "}
                    {selectedStock.device_condition}
                  </p>
                  <p className="font-mono text-[13px] text-slate-500 mt-1">
                    Full IMEI: {selectedStock.imei || "—"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="rounded-[var(--kimi-radius-btn)] border border-slate-300 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px] shrink-0"
                >
                  Change Phone
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <CSection title="Customer Information">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-[14px] font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="customer_type"
                      checked={isWalkIn}
                      onChange={() => handleClearCustomer()}
                      className="h-4 w-4 text-[var(--kimi-accent)]"
                    />
                    Walk-in Retail Customer
                  </label>
                  <label className="flex items-center gap-2 text-[14px] font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="customer_type"
                      checked={!isWalkIn}
                      onChange={() => setIsWalkIn(false)}
                      className="h-4 w-4 text-[var(--kimi-accent)]"
                    />
                    Record Customer Details
                  </label>
                </div>

                {!isWalkIn && (
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="relative">
                      <CField
                        id="sell-phone-search"
                        label="Customer Phone"
                        value={customerPhone}
                        onChange={(v) => {
                          setCustomerPhone(v);
                          setCustomerSearch(v);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        type="tel"
                        required={balancePence > 0}
                        placeholder="e.g. 07700 900000"
                      />

                      {showCustomerDropdown && customerMatches.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                          {customerMatches.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectCustomer(c)}
                              className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] hover:bg-blue-50 transition-colors border-b border-slate-50"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{c.name}</p>
                                <p className="text-[12px] text-slate-500">{c.phone}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <CField
                      id="sell-customer-name"
                      label="Customer Name"
                      value={customerName}
                      onChange={setCustomerName}
                      required={balancePence > 0}
                      placeholder="e.g. John Smith"
                    />
                  </div>
                )}
              </div>
            </CSection>

            {/* Pricing & Discounts */}
            <CSection title="Sale Price & Discount">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <MoneyInput
                    id="selling-price"
                    label="Retail Selling Price"
                    value={sellingPrice}
                    onChange={updateSellingPrice}
                    required
                  />

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Discount
                    </label>
                    <div className="flex gap-2">
                      <div className="flex rounded-[var(--kimi-radius-input)] border border-slate-200 bg-slate-50 p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateDiscountType("FIXED")}
                          className={`rounded px-2.5 py-1 text-[12px] font-bold ${
                            discountType === "FIXED"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500"
                          }`}
                        >
                          £
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDiscountType("PERCENT")}
                          className={`rounded px-2.5 py-1 text-[12px] font-bold ${
                            discountType === "PERCENT"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500"
                          }`}
                        >
                          %
                        </button>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={discountValue}
                        onChange={(e) => updateDiscountValue(e.target.value.replace(/[^\d.]/g, ""))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] font-semibold focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="sell-amount-paid"
                        className="block text-[13px] font-semibold text-slate-700"
                      >
                        Amount Received Now <span className="text-red-500">*</span>
                      </label>
                      {finalTotalPence > 0 && (
                        <button
                          type="button"
                          onClick={() => setAmountPaid((finalTotalPence / 100).toFixed(2))}
                          className="text-[12px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Pay Full (£{(finalTotalPence / 100).toFixed(2)})
                        </button>
                      )}
                    </div>
                    <MoneyInput
                      id="sell-amount-paid"
                      label=""
                      value={amountPaid}
                      onChange={setAmountPaid}
                      required
                      helperText={
                        isOverpaid
                          ? "Amount received cannot be greater than the final total."
                          : balancePence > 0
                            ? `£${(balancePence / 100).toFixed(2)} will remain on the customer's balance.`
                            : "Fully paid in full."
                      }
                    />
                  </div>

                  <WarrantySelector value={warrantyDays} onChange={setWarrantyDays} />
                </div>
              </div>
            </CSection>
          </div>

          {/* Right Column: Summary & Confirmation */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <InvoiceSummaryPanel
              subtotal={rawPricePence}
              discount={discountPence}
              paid={paidPence}
              customerName={customerName || "Customer"}
            />

            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={!canSubmit || busy}
                onClick={() => handleOpenConfirm(getSavedPrinterFormat())}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--kimi-radius-btn)] bg-[var(--kimi-accent)] px-6 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[var(--kimi-accent-hover)] active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
              >
                <Printer className="h-4 w-4" />
                Complete Sale &amp; Print
              </button>

              <button
                type="button"
                disabled={!canSubmit || busy}
                onClick={() => handleOpenConfirm(null)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--kimi-radius-btn)] border border-slate-300 bg-white px-6 py-3 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 min-h-[46px]"
              >
                Complete Without Printing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Compact Confirmation Modal ─────────────────────────────────────── */}
      <CompactConfirmModal
        open={showConfirmModal}
        title={`Sell ${selectedStock?.device_make} ${selectedStock?.device_model} for ${formatPence(finalTotalPence)}?`}
        details={[
          { label: "Payment Method", value: PAYMENT_LABELS[paymentMethod] || paymentMethod },
          { label: "Amount Paid", value: formatPence(paidPence) },
          {
            label: "Remaining Balance",
            value: balancePence > 0 ? formatPence(balancePence) : "£0.00 (Fully Paid)",
          },
          {
            label: "Device IMEI",
            value: selectedStock?.imei ? `••••${selectedStock.imei.slice(-5)}` : "N/A",
          },
          {
            label: "Customer",
            value: isWalkIn ? "Walk-in Retail" : `${customerName} (${customerPhone})`,
          },
        ]}
        confirmLabel={
          pendingPrintFormat
            ? `Confirm & Print (${pendingPrintFormat === "80MM" ? "80mm" : "A4"})`
            : "Confirm Sale"
        }
        cancelLabel="Go Back"
        isBusy={busy}
        onConfirm={executeSale}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* ── Print Preview Modal ───────────────────────────────────────────── */}
      {preview && (
        <PrintPreviewModal
          open={true}
          onClose={() => setPreview(null)}
          kind="SALE"
          invoiceNumber={preview.invoiceNumber}
          html80mm={preview.html80mm}
          htmlA4={preview.htmlA4}
          defaultPaper={pendingPrintFormat ?? undefined}
        />
      )}
    </div>
  );
}
