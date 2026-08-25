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
  Package,
  PackagePlus,
  Printer,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CField,
  CSection,
  CTextArea,
  ConditionChips,
  MoneyInput,
  MoreDetails,
  PaymentMethodSelector,
  StorageChips,
  getSavedPaymentMethod,
} from "@/components/counter/ds";
import {
  createInternalStockDevice,
  createPurchaseInvoice,
  getCounterInvoice,
  listCounterStock,
  searchCounterSuppliers,
} from "@/lib/counter.functions";
import { buildCounterInvoiceHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";
import { cents, formatPence } from "@/lib/money";
import { DEVICE_MODELS, inferBrand } from "@/lib/counter-constants";
import type { PartySummary } from "@/lib/counter.types";

export const Route = createFileRoute("/_authenticated/admin/buy")({
  ssr: false,
  head: () => ({ meta: [{ title: "Add Phone to Stock — MR KHAN" }] }),
  component: AddPhoneToStockPage,
});

const POPULAR_BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Motorola",
  "Huawei",
  "OnePlus",
  "Nokia",
  "Other",
] as const;

const NETWORK_OPTIONS = ["Unlocked", "Network Locked", "Unknown"] as const;
const STOCK_SOURCES = ["Customer", "Supplier", "Trade-in", "Existing Stock", "Other"] as const;
const ACCESSORIES = ["Box", "Charger", "Cable", "Case"] as const;

type PhoneStockForm = {
  brand: string;
  model: string;
  storage: string;
  colour: string;
  imei1: string;
  condition: string;
  cost_price: string;
  selling_price: string;
  paid: string;
  payment_method: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
  // More details
  imei2: string;
  battery_health: string;
  network_status: string;
  accessories: string[];
  device_faults: string;
  stock_source: string;
  supplier_id: string;
  seller_name: string;
  seller_phone: string;
  seller_id_ref: string;
  notes: string;
};

const initialForm: PhoneStockForm = {
  brand: "Apple",
  model: "iPhone 15 Pro",
  storage: "128GB",
  colour: "Black",
  imei1: "",
  condition: "Excellent",
  cost_price: "",
  selling_price: "",
  paid: "",
  payment_method: "CASH",
  imei2: "",
  battery_health: "",
  network_status: "Unlocked",
  accessories: ["Cable"],
  device_faults: "",
  stock_source: "Customer",
  supplier_id: "",
  seller_name: "",
  seller_phone: "",
  seller_id_ref: "",
  notes: "",
};

function AddPhoneToStockPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PhoneStockForm>(() => ({
    ...initialForm,
    payment_method: getSavedPaymentMethod(),
  }));
  const [modelSearch, setModelSearch] = useState("iPhone 15 Pro");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [busy, setBusy] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState<{
    id: string;
    invoice_number: string;
    phoneName: string;
    imeiEnding: string;
    selling_price_pence: number;
    stock_device_id?: string;
  } | null>(null);

  const [preview, setPreview] = useState<{
    invoiceNumber: string;
    html80mm: string;
    htmlA4: string;
  } | null>(null);

  const requestId = useRef<string | null>(null);
  const qc = useQueryClient();

  const internalStockFn = useServerFn(createInternalStockDevice);
  const stockFn = useServerFn(listCounterStock);
  const createFn = useServerFn(createPurchaseInvoice);
  const detailFn = useServerFn(getCounterInvoice);

  // Check IMEI duplicate against current stock
  const cleanImei = form.imei1.replace(/\s+/g, "");
  const { data: existingStock = [] } = useQuery({
    queryKey: ["counter", "stock", "check_imei", cleanImei],
    queryFn: () => stockFn({ data: { query: cleanImei, status: "ALL" } }),
    enabled: cleanImei.length >= 10,
  });

  const duplicatePhone = existingStock.find(
    (s) => s.imei === cleanImei || (cleanImei && s.imei && s.imei.includes(cleanImei)),
  );

  const update = (key: keyof PhoneStockForm, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Default amount paid to cost price if not touched
      if (key === "cost_price") {
        if (!prev.paid || prev.paid === prev.cost_price) {
          next.paid = String(value);
        }
      }
      return next;
    });
  };

  const filteredModels = useMemo(() => {
    const list = DEVICE_MODELS.filter((m) => {
      if (form.brand && form.brand !== "Other") {
        return inferBrand(m).toLowerCase() === form.brand.toLowerCase();
      }
      return true;
    });
    if (!modelSearch) return list.slice(0, 10);
    return list.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase())).slice(0, 10);
  }, [form.brand, modelSearch]);

  const handleSelectModel = (selectedModel: string) => {
    const inferred = inferBrand(selectedModel, form.brand);
    setForm((prev) => ({
      ...prev,
      model: selectedModel,
      brand: inferred,
    }));
    setModelSearch(selectedModel);
    setShowModelDropdown(false);
  };

  const costPence = cents(form.cost_price || "0");
  const sellingPence = cents(form.selling_price || "0");
  const paidPence = cents(form.paid || form.cost_price || "0");
  const profitPence =
    Number.isFinite(sellingPence) && Number.isFinite(costPence) ? sellingPence - costPence : 0;

  const toggleAccessory = (item: string) => {
    setForm((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(item)
        ? prev.accessories.filter((a) => a !== item)
        : [...prev.accessories, item],
    }));
  };

  const canSubmit =
    !busy &&
    form.brand.trim().length >= 1 &&
    form.model.trim().length >= 1 &&
    cleanImei.length >= 10 &&
    !duplicatePhone;

  const handleSaveToStock = async (addAnother = false) => {
    if (duplicatePhone) {
      toast.error("This IMEI already exists in the system. Cannot save duplicate.");
      return;
    }

    requestId.current ??= crypto.randomUUID();
    setBusy(true);

    try {
      const sanitizedImei = form.imei1.replace(/[\s-]/g, "");
      const combinedSellerNote = [
        `Condition: ${form.condition}`,
        `Stock Source: ${form.stock_source}`,
        `Battery: ${form.battery_health ? form.battery_health + "%" : "N/A"}`,
        `Network: ${form.network_status}`,
        form.accessories.length > 0 ? `Accessories: ${form.accessories.join(", ")}` : "",
        form.device_faults ? `Faults: ${form.device_faults}` : "",
        form.notes,
      ]
        .filter(Boolean)
        .join(" | ");

      const isInternalStock = !form.seller_name.trim() && !form.seller_phone.trim();

      if (isInternalStock) {
        // PURE INTERNAL STOCK: No purchase invoice, no supplier, no ledger entry
        const stockResult = await internalStockFn({
          data: {
            device_make: form.brand.trim(),
            device_model: form.model.trim(),
            storage: form.storage,
            colour: form.colour,
            imei: sanitizedImei,
            serial: form.imei2.trim() || undefined,
            device_condition: form.condition,
            purchase_price_pence: costPence,
            expected_sale_price_pence: sellingPence,
            notes: combinedSellerNote,
          },
        });

        toast.success(`${form.brand} ${form.model} saved to stock (SKU: ${stockResult.sku}).`);
        requestId.current = null;
        await qc.invalidateQueries({ queryKey: ["counter"] });

        if (addAnother) {
          setForm((prev) => ({
            ...initialForm,
            brand: prev.brand,
            condition: prev.condition,
            payment_method: prev.payment_method,
          }));
          setModelSearch(form.model);
          setSavedSuccess(null);
          toast.info("Ready for next phone entry.");
        } else {
          setSavedSuccess({
            id: stockResult.id,
            invoice_number: stockResult.sku,
            phoneName: `${form.brand} ${form.model} (${form.storage} · ${form.colour})`,
            imeiEnding: sanitizedImei.slice(-5),
            selling_price_pence: sellingPence,
            stock_device_id: stockResult.stock_device_id,
          });
        }
      } else {
        // EXTERNAL PURCHASE / TRADE-IN: Creates BUY invoice and supplier record
        const result = await createFn({
          data: {
            request_id: requestId.current,
            supplier_id: form.supplier_id || undefined,
            supplier_name: form.seller_name.trim(),
            supplier_phone: form.seller_phone.trim(),
            id_reference: form.seller_id_ref.trim() || undefined,
            seller_note: combinedSellerNote,
            device_make: form.brand.trim(),
            device_model: form.model.trim(),
            storage: form.storage,
            colour: form.colour,
            imei: sanitizedImei,
            serial: form.imei2.trim() || undefined,
            device_condition: form.condition,
            purchase_price_pence: costPence,
            paid_pence: paidPence,
            expected_sale_price_pence: sellingPence,
            payment_method: form.payment_method,
          },
        });

        toast.success(`Purchase receipt ${result.invoice_number} saved.`);
        requestId.current = null;
        await qc.invalidateQueries({ queryKey: ["counter"] });

        if (addAnother) {
          setForm((prev) => ({
            ...initialForm,
            brand: prev.brand,
            condition: prev.condition,
            payment_method: prev.payment_method,
          }));
          setModelSearch(form.model);
          setSavedSuccess(null);
          toast.info("Ready for next phone entry.");
        } else {
          setSavedSuccess({
            id: result.id,
            invoice_number: result.invoice_number,
            phoneName: `${form.brand} ${form.model} (${form.storage} · ${form.colour})`,
            imeiEnding: sanitizedImei.slice(-5),
            selling_price_pence: sellingPence,
            stock_device_id: result.stock_device_id || undefined,
          });
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save phone to stock. Please check the details.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (savedSuccess) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-xl rounded-[var(--kimi-radius-card)] border border-emerald-200 bg-white p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-[24px] font-black text-slate-900">Phone Added to Stock</h2>
            <p className="mt-1 text-[16px] font-bold text-slate-800">{savedSuccess.phoneName}</p>
            <p className="text-[13px] text-slate-500 font-mono mt-0.5">
              Ref: {savedSuccess.invoice_number} · IMEI ending in {savedSuccess.imeiEnding}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
              Selling Price
            </p>
            <p className="text-[28px] font-black text-emerald-700 tabular-nums">
              {formatPence(savedSuccess.selling_price_pence)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/admin/sell"
              className="flex items-center justify-center gap-2 rounded-[var(--kimi-radius-btn)] bg-[var(--kimi-accent)] px-5 py-3 text-[14px] font-bold text-white hover:bg-[var(--kimi-accent-hover)] transition-colors min-h-[48px]"
            >
              <ShoppingBag className="h-4 w-4" />
              Sell This Phone Now
            </Link>
            <button
              type="button"
              onClick={() => {
                setSavedSuccess(null);
                setForm(initialForm);
                setModelSearch("iPhone 15 Pro");
              }}
              className="flex items-center justify-center gap-2 rounded-[var(--kimi-radius-btn)] border border-slate-300 bg-white px-5 py-3 text-[14px] font-bold text-slate-800 hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              <PackagePlus className="h-4 w-4" />
              Add Another Phone
            </button>
          </div>

          <div className="pt-2">
            <Link
              to="/admin"
              className="text-[14px] font-semibold text-[var(--kimi-accent)] hover:underline"
            >
              Return to Counter →
            </Link>
          </div>
        </div>
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
              Add Phone to Stock
            </h1>
          </div>
          <p className="text-[14px] text-slate-500 mt-0.5 pl-7">
            Enter the phone details and selling price.
          </p>
        </div>

        <Link
          to="/admin/stock"
          className="text-[13px] font-bold text-[var(--kimi-accent)] hover:underline flex items-center gap-1 shrink-0"
        >
          <Package className="h-4 w-4" /> View Phone Stock
        </Link>
      </div>

      {/* ── Main Layout ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Essential Phone Details */}
        <div className="space-y-5">
          <CSection title="Essential Phone Details">
            <div className="space-y-4">
              {/* Brand Selector */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Brand / Manufacturer <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => update("brand", b)}
                      className={`rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all min-h-[38px] ${
                        form.brand.toLowerCase() === b.toLowerCase()
                          ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent)] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Autocomplete */}
              <div className="relative">
                <label
                  htmlFor="phone-model"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-700"
                >
                  Model <span className="font-normal text-slate-400">· Type to search</span>
                  <span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  id="phone-model"
                  type="text"
                  required
                  value={form.model}
                  placeholder="e.g. iPhone 15 Pro, Samsung S24 Ultra..."
                  onFocus={() => setShowModelDropdown(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModelSearch(val);
                    const inferred = inferBrand(val, form.brand);
                    setForm((prev) => ({ ...prev, model: val, brand: inferred }));
                    setShowModelDropdown(true);
                  }}
                  className="h-12 w-full rounded-[var(--kimi-radius-input)] border border-slate-200 bg-white px-3.5 text-[15px] text-slate-900 font-semibold focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)]"
                />

                {showModelDropdown && filteredModels.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {filteredModels.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => handleSelectModel(m)}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[14px] font-medium hover:bg-blue-50 hover:text-[var(--kimi-accent)] transition-colors"
                      >
                        <span>{m}</span>
                        <span className="text-[11px] font-bold uppercase text-slate-400">
                          {inferBrand(m)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Storage Chips */}
              <StorageChips value={form.storage} onChange={(v) => update("storage", v)} />

              {/* Colour Input */}
              <CField
                id="phone-colour"
                label="Colour"
                value={form.colour}
                onChange={(v) => update("colour", v)}
                placeholder="e.g. Natural Titanium, Phantom Black, Blue..."
                required
              />

              {/* IMEI 1 with Inline Live Duplicate & Format Check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="phone-imei1" className="text-[13px] font-semibold text-slate-700">
                    IMEI 1 / Serial <span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {form.imei1.replace(/\s+/g, "").length} / 15 digits
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="phone-imei1"
                    type="text"
                    required
                    value={form.imei1}
                    onChange={(e) => update("imei1", e.target.value.replace(/[\s-]/g, ""))}
                    placeholder="Scan or type 15-digit IMEI"
                    className={`h-12 w-full rounded-[var(--kimi-radius-input)] border bg-white px-3.5 font-mono text-[15px] tracking-wider focus:outline-none focus:ring-2 ${
                      duplicatePhone
                        ? "border-red-500 text-red-900 focus:ring-red-200"
                        : "border-slate-200 text-slate-900 focus:border-[var(--kimi-accent)] focus:ring-[var(--kimi-accent-ring)]"
                    }`}
                  />
                  <Barcode className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>

                {/* Inline Duplicate Warning */}
                {duplicatePhone && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[12px] font-bold text-red-800 animate-in fade-in">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>
                      This IMEI already exists in stock ({duplicatePhone.device_make}{" "}
                      {duplicatePhone.device_model} · {duplicatePhone.status}).
                    </span>
                  </div>
                )}
              </div>

              {/* Condition Chips */}
              <ConditionChips value={form.condition} onChange={(v) => update("condition", v)} />
            </div>
          </CSection>

          {/* Pricing Section */}
          <CSection title="Pricing & Profit Margin">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyInput
                id="phone-cost"
                label="Cost Price (Bought for)"
                value={form.cost_price}
                onChange={(v) => update("cost_price", v)}
                required
                placeholder="250.00"
              />

              <MoneyInput
                id="phone-sale-price"
                label="Selling Price (Retail tag)"
                value={form.selling_price}
                onChange={(v) => update("selling_price", v)}
                required
                placeholder="349.00"
              />
            </div>

            {/* Live Profit Preview */}
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Expected Profit
                </p>
                <p className="text-[20px] font-black text-emerald-900 tabular-nums">
                  {formatPence(profitPence)}
                </p>
              </div>
              <span className="text-[12px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                {costPence > 0
                  ? `${Math.round((profitPence / costPence) * 100)}% Margin`
                  : "New Stock"}
              </span>
            </div>
          </CSection>

          {/* Collapsed More details */}
          <MoreDetails title="More details (IMEI 2, Battery %, Network, Accessories, Supplier)">
            <div className="grid gap-4 sm:grid-cols-2">
              <CField
                id="phone-imei2"
                label="IMEI 2 / Serial (Optional)"
                value={form.imei2}
                onChange={(v) => update("imei2", v.replace(/\s+/g, ""))}
                optional
                mono
              />

              <CField
                id="phone-battery"
                label="Battery Health %"
                value={form.battery_health}
                onChange={(v) => update("battery_health", v.replace(/\D/g, ""))}
                placeholder="e.g. 94"
                optional
                type="text"
                inputMode="numeric"
              />

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Network Lock Status
                </label>
                <select
                  value={form.network_status}
                  onChange={(e) => update("network_status", e.target.value)}
                  className="h-12 w-full rounded-[var(--kimi-radius-input)] border border-slate-200 bg-white px-3 text-[14px]"
                >
                  {NETWORK_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Stock Source
                </label>
                <select
                  value={form.stock_source}
                  onChange={(e) => update("stock_source", e.target.value)}
                  className="h-12 w-full rounded-[var(--kimi-radius-input)] border border-slate-200 bg-white px-3 text-[14px]"
                >
                  {STOCK_SOURCES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accessories Chips */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Included Accessories
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`rounded-lg border px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
                      form.accessories.includes(acc)
                        ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] text-[var(--kimi-accent)] ring-1 ring-[var(--kimi-accent)]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            <CField
              id="phone-faults"
              label="Known Device Faults / Cosmetic Flaws"
              value={form.device_faults}
              onChange={(v) => update("device_faults", v)}
              optional
              placeholder="e.g. Small scratch near charging port"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <CField
                id="seller-name"
                label="Seller / Supplier Name (Optional)"
                value={form.seller_name}
                onChange={(v) => update("seller_name", v)}
                optional
                placeholder="e.g. Walk-in Customer or Supplier Ltd"
              />
              <CField
                id="seller-phone"
                label="Seller Phone Number (Optional)"
                value={form.seller_phone}
                onChange={(v) => update("seller_phone", v)}
                optional
                type="tel"
              />
            </div>

            <CTextArea
              id="phone-notes"
              label="Internal Stock Notes"
              value={form.notes}
              onChange={(v) => update("notes", v)}
              optional
              rows={2}
            />
          </MoreDetails>
        </div>

        {/* Right Column: Live Summary Card & Actions */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
              Live Stock Summary
            </h3>

            <div>
              <p className="text-[18px] font-black text-slate-900">
                {form.brand} {form.model || "Select Model"}
              </p>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {form.storage} · {form.colour || "Colour"} · {form.condition}
              </p>
              <p className="font-mono text-[12px] text-slate-400 mt-1">
                IMEI: {form.imei1 ? `••••••••••${form.imei1.slice(-5)}` : "Not entered"}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Cost Price:</span>
                <span className="font-bold text-slate-900">{formatPence(costPence)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selling Price:</span>
                <span className="font-bold text-emerald-700">{formatPence(sellingPence)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <span className="text-slate-700">Expected Profit:</span>
                <span className="text-emerald-700 tabular-nums">{formatPence(profitPence)}</span>
              </div>
            </div>
          </div>

          <PaymentMethodSelector
            value={form.payment_method}
            onChange={(v) => update("payment_method", v)}
          />

          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={!canSubmit || busy}
              onClick={() => handleSaveToStock(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--kimi-radius-btn)] bg-[var(--kimi-accent)] px-6 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[var(--kimi-accent-hover)] active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {busy ? "Saving Phone to Stock…" : "Save to Stock"}
            </button>

            <button
              type="button"
              disabled={!canSubmit || busy}
              onClick={() => handleSaveToStock(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--kimi-radius-btn)] border border-slate-300 bg-white px-6 py-3 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 min-h-[46px]"
            >
              Save &amp; Add Another Phone
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              className="inline-flex w-full items-center justify-center text-[13px] font-semibold text-slate-500 hover:text-slate-800 py-2"
            >
              Cancel &amp; Return to Counter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
