/**
 * MR KHAN Counter POS — Design System Primitives & Ergonomic Components
 * Upgraded Form UI/UX, Accessible Touch Targets, and Protected Financial Inputs.
 */
import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
  type HTMLAttributes,
  type ComponentType,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  Percent,
  Phone,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPence, paymentStatus } from "@/lib/money";

// ─── LocalStorage Preference Keys ──────────────────────────────────────────────
export const PREF_PRINTER_FORMAT = "mrkhan_pos_printer_format";
export const PREF_PAYMENT_METHOD = "mrkhan_pos_payment_method";

export function getSavedPrinterFormat(): "80MM" | "A4" {
  if (typeof window === "undefined") return "80MM";
  const saved = localStorage.getItem(PREF_PRINTER_FORMAT);
  return saved === "A4" ? "A4" : "80MM";
}

export function setSavedPrinterFormat(format: "80MM" | "A4") {
  if (typeof window !== "undefined") {
    localStorage.setItem(PREF_PRINTER_FORMAT, format);
  }
}

export function getSavedPaymentMethod(): "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER" {
  if (typeof window === "undefined") return "CASH";
  const saved = localStorage.getItem(PREF_PAYMENT_METHOD);
  if (saved && ["CASH", "CARD", "BANK_TRANSFER", "OTHER"].includes(saved)) {
    return saved as "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
  }
  return "CASH";
}

export function setSavedPaymentMethod(method: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER") {
  if (typeof window !== "undefined") {
    localStorage.setItem(PREF_PAYMENT_METHOD, method);
  }
}

// ─── Focus & Base Input Utilities ──────────────────────────────────────────────
export const focusRing =
  "focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)]";

export const inputBase =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[16px] text-slate-900 placeholder:text-slate-400 transition-colors shadow-sm hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

export const inputErrorBase =
  "border-red-400 bg-red-50/20 text-red-950 focus:border-red-500 focus:ring-red-500/20";

// ─── Inline Error Component ───────────────────────────────────────────────────

export function InlineError({
  id,
  message,
  className,
}: {
  id?: string;
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      className={cn(
        "mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600",
        className,
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  );
}

// ─── Form Completion Hint ─────────────────────────────────────────────────────

export function FormCompletionHint({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-[13px] font-medium text-amber-900",
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      <span>{message}</span>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

const badgeConfig = {
  PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PARTIAL: { label: "Partial", className: "bg-amber-50 text-amber-700 border-amber-200" },
  UNPAID: { label: "Unpaid", className: "bg-red-50 text-red-700 border-red-200" },
  VOID: { label: "Void", className: "bg-slate-100 text-slate-500 border-slate-200 line-through" },
  IN_STOCK: { label: "In stock", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SOLD: { label: "Sold", className: "bg-slate-100 text-slate-500 border-slate-200" },
  REMOVED: { label: "Removed", className: "bg-red-50 text-red-600 border-red-200" },
  REPAIR: { label: "Repair", className: "bg-blue-50 text-blue-700 border-blue-200" },
  SALE: { label: "Sale", className: "bg-violet-50 text-violet-700 border-violet-200" },
  PURCHASE: { label: "Purchase", className: "bg-orange-50 text-orange-700 border-orange-200" },
} as const;

type BadgeKey = keyof typeof badgeConfig;

export function StatusBadge({ status }: { status: string }) {
  const cfg = badgeConfig[status as BadgeKey];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        cfg?.className ?? "bg-slate-100 text-slate-600 border-slate-200",
      )}
    >
      {cfg?.label ?? status}
    </span>
  );
}

// ─── Payment Method Selector ───────────────────────────────────────────────────

export type PayMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
export const PAY_OPTIONS: { value: PayMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

export function PaymentMethodSelector({
  value,
  onChange,
  className,
}: {
  value: PayMethod;
  onChange: (v: PayMethod) => void;
  className?: string;
}) {
  const handleChange = (v: PayMethod) => {
    setSavedPaymentMethod(v);
    onChange(v);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[13px] font-semibold text-slate-800">Payment method</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PAY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border py-3 px-3 text-[14px] font-semibold transition-all min-h-[48px]",
              value === opt.value
                ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent)] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {value === opt.value && <Check className="h-4 w-4 stroke-[3]" />}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Condition Chips ───────────────────────────────────────────────────────────

export const CONDITION_OPTIONS = [
  { value: "New", label: "New — Sealed", desc: "Brand new, sealed box" },
  { value: "Grade A", label: "Grade A", desc: "Excellent, no wear" },
  { value: "Grade B", label: "Grade B", desc: "Minor wear" },
  { value: "Grade C", label: "Grade C", desc: "Visible wear" },
  { value: "Faulty", label: "Faulty", desc: "Repair or parts" },
] as const;

export function ConditionChips({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[13px] font-semibold text-slate-800">Condition</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {CONDITION_OPTIONS.map((c) => {
          const isSelected = value.toLowerCase().includes(c.value.toLowerCase());
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              aria-pressed={isSelected}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all min-h-[52px]",
                isSelected
                  ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] text-[var(--kimi-accent)] font-bold shadow-sm ring-1 ring-[var(--kimi-accent)]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span className="text-[14px] font-semibold">{c.label}</span>
              <span className="text-[11px] text-slate-500 font-normal leading-tight">{c.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Storage Chips ─────────────────────────────────────────────────────────────

export const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "Other"] as const;

export function StorageChips({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [custom, setCustom] = useState(
    value && !STORAGE_OPTIONS.slice(0, -1).includes(value as (typeof STORAGE_OPTIONS)[number])
      ? value
      : "",
  );
  const isOther =
    custom !== "" ||
    value === "Other" ||
    (!STORAGE_OPTIONS.slice(0, -1).includes(value as (typeof STORAGE_OPTIONS)[number]) &&
      value !== "");

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[13px] font-semibold text-slate-800">Storage capacity</label>
      <div className="flex flex-wrap gap-1.5">
        {STORAGE_OPTIONS.map((opt) => {
          const active = opt === "Other" ? isOther : value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (opt === "Other") {
                  onChange(custom || "128GB");
                } else {
                  onChange(opt);
                  setCustom("");
                }
              }}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-[14px] font-semibold transition-all min-h-[44px]",
                active
                  ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent)] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {isOther && (
        <input
          type="text"
          value={
            custom ||
            (STORAGE_OPTIONS.slice(0, -1).includes(value as (typeof STORAGE_OPTIONS)[number])
              ? ""
              : value)
          }
          onChange={(e) => {
            setCustom(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="e.g. 2TB or 16GB"
          className={cn(
            "mt-2 h-11 w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-3.5 text-[15px]",
            focusRing,
          )}
        />
      )}
    </div>
  );
}

// ─── Repair Type Suggestion Chips ─────────────────────────────────────────────

export const COMMON_REPAIRS = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Back Glass Replacement",
  "Camera Repair",
  "Speaker Repair",
  "Water Damage Treatment",
  "Software Repair",
  "Other",
] as const;

export function RepairTypeChips({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[13px] font-semibold text-slate-800">Quick repair presets</label>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_REPAIRS.map((rep) => {
          const isSelected = value.toLowerCase() === rep.toLowerCase();
          return (
            <button
              key={rep}
              type="button"
              onClick={() => {
                if (rep === "Other") {
                  onChange(value === "Other" ? "" : "Diagnostic & repair");
                } else {
                  onChange(rep);
                }
              }}
              aria-pressed={isSelected}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all min-h-[38px]",
                isSelected
                  ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] text-[var(--kimi-accent)] font-semibold ring-1 ring-[var(--kimi-accent)]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {rep}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Warranty Selector ─────────────────────────────────────────────────────────

const WARRANTY_PRESETS = [
  { days: 0, label: "None" },
  { days: 7, label: "7 Days" },
  { days: 30, label: "30 Days" },
  { days: 90, label: "3 Months" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "12 Months" },
];

export function WarrantySelector({
  value,
  onChange,
  customNotes,
  onCustomNotesChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  customNotes?: string;
  onCustomNotesChange?: (v: string) => void;
  className?: string;
}) {
  const preset = WARRANTY_PRESETS.find((p) => String(p.days) === value);
  const isCustom = !preset && value !== "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[13px] font-semibold text-slate-800">Warranty</label>
      <div className="flex flex-wrap gap-1.5">
        {WARRANTY_PRESETS.map((opt) => (
          <button
            key={opt.days}
            type="button"
            onClick={() => onChange(String(opt.days))}
            aria-pressed={String(opt.days) === value}
            className={cn(
              "flex-1 min-w-[72px] rounded-xl border py-2.5 text-[13px] font-semibold transition-all min-h-[44px]",
              String(opt.days) === value
                ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent)] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(isCustom ? value : "14")}
          aria-pressed={isCustom}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-all min-h-[44px]",
            isCustom
              ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent)] text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          Custom
        </button>
      </div>
      {isCustom && (
        <div className="mt-2 grid gap-2 sm:grid-cols-[160px_1fr]">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Warranty days (e.g. 45)"
            className={cn(
              "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[15px]",
              focusRing,
            )}
          />
          {onCustomNotesChange && (
            <input
              type="text"
              value={customNotes ?? ""}
              onChange={(e) => onCustomNotesChange(e.target.value)}
              placeholder="Custom warranty terms/description (optional)"
              className={cn(
                "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[14px]",
                focusRing,
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Money Input ───────────────────────────────────────────────────────────────

export function MoneyInput({
  id,
  label,
  value,
  onChange,
  required,
  optional,
  className,
  placeholder = "0.00",
  helperText,
  error,
  statusBadge,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  optional?: boolean;
  className?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  statusBadge?: ReactNode;
  disabled?: boolean;
}) {
  const handleChange = (raw: string) => {
    // Only allow numbers and one decimal point with max 2 digits
    const cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChange(cleaned);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-[13px] font-semibold text-slate-800">
          {label}
          {optional && <span className="ml-1 font-normal text-slate-400">· Optional</span>}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {statusBadge && <div className="text-[12px]">{statusBadge}</div>}
      </div>

      <div className="relative flex rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 focus-within:border-[var(--kimi-accent)] focus-within:ring-2 focus-within:ring-[var(--kimi-accent-ring)] overflow-hidden">
        <div className="flex items-center justify-center bg-slate-50 border-r border-slate-200 px-3.5 text-[16px] font-bold text-slate-600 select-none">
          £
        </div>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          required={required}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
          className={cn(
            "h-12 w-full bg-transparent px-3.5 text-[18px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none tabular-nums",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            error && inputErrorBase,
          )}
        />
      </div>

      {error ? (
        <InlineError message={error} />
      ) : helperText ? (
        <p id={`${id}-help`} className="mt-1 text-[13px] text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

// ─── Standard Form Field (CField) ─────────────────────────────────────────────

export function CField({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  required,
  optional,
  type = "text",
  placeholder,
  inputMode,
  className,
  maxLength,
  mono,
  helperText,
  error,
  clearable,
  onClear,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  maxLength?: number;
  mono?: boolean;
  helperText?: string;
  error?: string;
  clearable?: boolean;
  onClear?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-slate-800">
        {label}
        {optional && <span className="ml-1 font-normal text-slate-400">· Optional</span>}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          required={required}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onWheel={(e) => type === "number" && e.currentTarget.blur()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
          className={cn(
            inputBase,
            focusRing,
            mono && "font-mono text-[15px] tracking-wider",
            clearable && value && "pr-10",
            error && inputErrorBase,
          )}
        />
        {clearable && value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <InlineError message={error} />
      ) : helperText ? (
        <p id={`${id}-help`} className="mt-1 text-[13px] text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

// ─── Dedicated Phone Input Field ──────────────────────────────────────────────

export function PhoneInput({
  id,
  label = "Customer phone number",
  value,
  onChange,
  onFocus,
  onBlur,
  required = true,
  placeholder = "e.g. 07700 900123",
  className,
  helperText,
  error,
  clearable,
  onClear,
  disabled,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  helperText?: string;
  error?: string;
  clearable?: boolean;
  onClear?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-slate-800">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none pointer-events-none">
          <Phone className="h-4 w-4" />
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          required={required}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
          className={cn(
            inputBase,
            focusRing,
            "pl-10",
            clearable && value && "pr-10",
            error && inputErrorBase,
          )}
        />
        {clearable && value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <InlineError message={error} />
      ) : helperText ? (
        <p id={`${id}-help`} className="mt-1 text-[13px] text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

// ─── IMEI & Serial Input Field ────────────────────────────────────────────────

export function IMEIInput({
  id = "imei-input",
  label = "IMEI or Serial Number",
  value,
  onChange,
  required,
  optional,
  placeholder = "15-digit IMEI or device serial",
  className,
  helperText,
  error,
  duplicateAlert,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  className?: string;
  helperText?: string;
  error?: string;
  duplicateAlert?: string;
}) {
  const digitsOnly = value.replace(/\D/g, "");
  const isImeiCandidate = digitsOnly.length > 0 && digitsOnly.length <= 15;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-[13px] font-semibold text-slate-800">
          {label}
          {optional && <span className="ml-1 font-normal text-slate-400">· Optional</span>}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {isImeiCandidate && (
          <span className="text-[12px] font-mono font-medium text-slate-500">
            {digitsOnly.length} / 15 digits
          </span>
        )}
      </div>

      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error || duplicateAlert)}
        className={cn(
          inputBase,
          focusRing,
          "font-mono text-[15px] tracking-wider",
          (error || duplicateAlert) && inputErrorBase,
        )}
      />

      {duplicateAlert ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{duplicateAlert}</span>
        </div>
      ) : error ? (
        <InlineError message={error} />
      ) : helperText ? (
        <p className="mt-1 text-[13px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

// ─── Textarea Field (CTextArea) ───────────────────────────────────────────────

export function CTextArea({
  id,
  label,
  value,
  onChange,
  required,
  optional,
  placeholder,
  rows = 3,
  className,
  helperText,
  error,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-[13px] font-semibold text-slate-800">
          {label}
          {optional && <span className="ml-1 font-normal text-slate-400">· Optional</span>}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {maxLength && (
          <span className="text-[12px] text-slate-400">
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      <textarea
        id={id}
        required={required}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full min-h-[96px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors shadow-sm resize-y hover:border-slate-300",
          focusRing,
          error && inputErrorBase,
        )}
      />

      {error ? (
        <InlineError message={error} />
      ) : helperText ? (
        <p className="mt-1 text-[13px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

// ─── Collapsible "More Details" Component ─────────────────────────────────────

export function MoreDetails({
  title = "More details",
  defaultOpen = false,
  hasErrors = false,
  children,
  className,
}: {
  title?: string;
  defaultOpen?: boolean;
  hasErrors?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen || hasErrors);

  useEffect(() => {
    if (hasErrors) setOpen(true);
  }, [hasErrors]);

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50/50 transition-all",
        hasErrors && "border-red-200 bg-red-50/20",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors rounded-xl min-h-[48px]"
      >
        <span className="flex items-center gap-2">
          {title}
          <span className="text-[12px] font-normal text-slate-400">
            {open ? "(Click to collapse)" : "(Optional additional info)"}
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-200/80 p-4 space-y-4 bg-white rounded-b-xl">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Form Section Card ────────────────────────────────────────────────────────

export function CSection({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-600">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Sticky Action Bar ─────────────────────────────────────────────────────────

export function StickyActionBar({
  primaryLabel = "Complete & Print",
  isBusy,
  canSubmit,
  completionHint,
  onSubmitWithPrint,
  onSubmitSaveOnly,
  onCancel,
  children,
}: {
  primaryLabel?: string;
  isBusy: boolean;
  canSubmit: boolean;
  completionHint?: string;
  onSubmitWithPrint: (paper: "80MM" | "A4") => void;
  onSubmitSaveOnly: () => void;
  onCancel?: () => void;
  children?: ReactNode;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const savedFormat = getSavedPrinterFormat();

  const handlePrintClick = (paper: "80MM" | "A4") => {
    setSavedPrinterFormat(paper);
    setDropdownOpen(false);
    onSubmitWithPrint(paper);
  };

  return (
    <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mt-8 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg">
      <div className="mx-auto flex max-w-[1280px] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left side actions / warnings */}
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              Cancel
            </button>
          )}
          {!canSubmit && completionHint && (
            <span className="text-[13px] font-medium text-amber-700 hidden lg:inline">
              {completionHint}
            </span>
          )}
          {children}
        </div>

        {/* Right side primary buttons */}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            disabled={!canSubmit || isBusy}
            onClick={onSubmitSaveOnly}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 min-h-[48px]"
          >
            Save Only
          </button>

          {/* Primary Split Button */}
          <div className="relative inline-flex rounded-xl shadow-sm">
            <button
              type="button"
              disabled={!canSubmit || isBusy}
              onClick={() => handlePrintClick(savedFormat)}
              className={cn(
                "inline-flex items-center gap-2 rounded-l-xl bg-[var(--kimi-accent)] px-6 py-2.5 text-[14px] font-bold text-white transition-all min-h-[48px]",
                "hover:bg-[var(--kimi-accent-hover)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isBusy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Completing…
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  {primaryLabel} ({savedFormat === "80MM" ? "80mm" : "A4"})
                </>
              )}
            </button>
            <button
              type="button"
              disabled={!canSubmit || isBusy}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="More print formats"
              className={cn(
                "border-l border-white/20 bg-[var(--kimi-accent)] px-3 py-2.5 text-white transition-all rounded-r-xl",
                "hover:bg-[var(--kimi-accent-hover)] disabled:opacity-50 min-h-[48px]",
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown Options */}
            {dropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                <button
                  type="button"
                  onClick={() => handlePrintClick("80MM")}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Print Thermal 80mm</span>
                  {savedFormat === "80MM" && (
                    <span className="text-[11px] font-bold text-[var(--kimi-accent)]">Default</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintClick("A4")}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Print Full A4 Invoice</span>
                  {savedFormat === "A4" && (
                    <span className="text-[11px] font-bold text-[var(--kimi-accent)]">Default</span>
                  )}
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onSubmitSaveOnly();
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Complete Without Printing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Summary Sidebar Panel ─────────────────────────────────────────────

export function InvoiceSummaryPanel({
  subtotal,
  discount,
  paid,
  label = "Invoice summary",
  customerName,
}: {
  subtotal: number;
  discount: number;
  paid: number;
  label?: string;
  customerName?: string;
}) {
  const total = Math.max(0, subtotal - discount);
  const balance = Math.max(0, total - paid);
  const status = paymentStatus(total, paid);
  const statusKey = status === "Paid" ? "PAID" : status === "Unpaid" ? "UNPAID" : "PARTIAL";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</h3>
        <StatusBadge status={statusKey} />
      </div>

      <div className="space-y-2 text-[14px]">
        <SummaryRow label="Subtotal" value={formatPence(subtotal)} />
        {discount > 0 && (
          <SummaryRow
            label="Discount"
            value={`− ${formatPence(discount)}`}
            className="text-emerald-700 font-medium"
          />
        )}
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Total payable
        </p>
        <p className="text-[32px] font-black text-slate-900 leading-tight tabular-nums mt-0.5">
          {formatPence(total)}
        </p>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-3 text-[14px]">
        <SummaryRow label="Amount paid" value={formatPence(Math.min(paid, total))} />
        {balance > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 mt-2">
            <div className="flex items-center justify-between text-amber-900 font-bold">
              <span>Remaining balance</span>
              <span className="text-[16px] tabular-nums">{formatPence(balance)}</span>
            </div>
            <p className="mt-1 text-[12px] text-amber-700">
              {formatPence(balance)} will remain on {customerName?.trim() || "the customer"}’s
              account.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span>Remaining balance</span>
            <span className="tabular-nums">£0.00 (Paid in full)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold tabular-nums text-slate-800">{value}</span>
    </div>
  );
}

// ─── Success Confirmation Card / Modal ────────────────────────────────────────

export function SuccessStateView({
  title,
  invoiceNumber,
  totalPence,
  paidPence,
  balancePence,
  paymentMethod,
  onReprint,
  onNewTransaction,
  newTransactionLabel = "New Repair",
  onReturnToCounter,
  onViewInvoice,
}: {
  title: string;
  invoiceNumber: string;
  totalPence: number;
  paidPence: number;
  balancePence: number;
  paymentMethod: string;
  onReprint: () => void;
  onNewTransaction: () => void;
  newTransactionLabel?: string;
  onReturnToCounter: () => void;
  onViewInvoice?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div>
        <h2 className="text-[24px] font-bold text-slate-900">{title}</h2>
        <p className="mt-1 font-mono text-[16px] font-bold text-[var(--kimi-accent)]">
          {invoiceNumber}
        </p>
      </div>

      {/* Financial Summary */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-left space-y-2 text-[14px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Total:</span>
          <span className="font-bold text-slate-900">{formatPence(totalPence)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Amount Paid:</span>
          <span className="font-bold text-emerald-700">
            {formatPence(paidPence)} ({paymentMethod})
          </span>
        </div>
        {balancePence > 0 && (
          <div className="flex justify-between text-amber-800 font-bold border-t border-slate-200 pt-2">
            <span>Balance Due:</span>
            <span>{formatPence(balancePence)}</span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onReprint}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-[14px] font-bold text-slate-800 hover:bg-slate-50 transition-colors min-h-[48px]"
        >
          <Printer className="h-4 w-4 text-slate-500" />
          Reprint Invoice
        </button>
        <button
          type="button"
          onClick={onNewTransaction}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--kimi-accent)] px-5 py-3 text-[14px] font-bold text-white hover:bg-[var(--kimi-accent-hover)] transition-colors min-h-[48px]"
        >
          <RotateCcw className="h-4 w-4" />
          {newTransactionLabel}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 text-[13px] pt-2">
        {onViewInvoice && (
          <button
            type="button"
            onClick={onViewInvoice}
            className="font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            View in Invoices
          </button>
        )}
        <button
          type="button"
          onClick={onReturnToCounter}
          className="font-semibold text-[var(--kimi-accent)] hover:underline"
        >
          Return to Counter →
        </button>
      </div>
    </div>
  );
}

// ─── Compact Confirmation Dialog ──────────────────────────────────────────────
export {
  CompactConfirmModal,
  type CompactConfirmModalProps,
  type CompactConfirmModalDetail,
} from "./compact-confirm-modal";

// ─── Data Table & Header Components ───────────────────────────────────────────

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[26px] font-bold text-slate-900 leading-tight">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-slate-500">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-[15px] font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 text-[13px] text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-4 animate-pulse rounded bg-slate-100"
                style={{ width: `${60 + ((j * 13) % 30)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function DataTable({
  headers,
  children,
  rightAlignCols,
}: {
  headers: string[];
  children: ReactNode;
  rightAlignCols?: number[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {headers.map((h, i) => (
              <th
                key={h || i}
                className={cn(
                  "px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500",
                  rightAlignCols?.includes(i) ? "text-right" : "text-left",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        {children}
      </table>
    </div>
  );
}

export function PrimaryBtn({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kimi-accent)] px-6 py-3 text-[14px] font-bold text-white shadow-sm transition-all min-h-[48px]",
        "hover:bg-[var(--kimi-accent-hover)] active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[14px] font-medium text-slate-700 transition-colors min-h-[48px]",
        "hover:bg-slate-50 hover:border-slate-300",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DangerBtn({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[14px] font-bold text-white transition-colors min-h-[48px]",
        "hover:bg-red-700 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-lg px-4 py-2 text-[13px] font-semibold transition-all min-h-[38px]",
            value === opt.value
              ? "bg-white text-[var(--kimi-accent)] shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
