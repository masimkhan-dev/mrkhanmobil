/**
 * counter-ui.tsx — Legacy wrapper + shared layout primitives.
 * New screens use ds.tsx components directly.
 */
import type { ReactNode } from "react";

// Re-export the new DS components for backward compat
export {
  PaymentMethodSelector as PaymentMethod,
  CField as Field,
  CTextArea as TextAreaField,
  InvoiceSummaryPanel as Totals,
} from "@/components/counter/ds";

// ─── CounterPage (legacy compat wrapper) ───────────────────────────────────────

export function CounterPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 leading-tight">{title}</h1>
        <p className="mt-0.5 text-[14px] text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ─── FormSection (legacy compat) ───────────────────────────────────────────────

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// ─── PartyPicker (legacy — used in older screens) ──────────────────────────────
import { formatPence } from "@/lib/money";
import type { PartySummary } from "@/lib/counter.types";

export function PartyPicker({
  label,
  parties,
  selectedId,
  onSelect,
}: {
  label: string;
  parties: PartySummary[];
  selectedId: string;
  onSelect: (party: PartySummary | null) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor="party-picker" className="mb-1.5 block text-[13px] font-medium text-slate-600">
        {label}
      </label>
      <select
        id="party-picker"
        value={selectedId}
        onChange={(e) => onSelect(parties.find((party) => party.id === e.target.value) ?? null)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[15px] text-slate-900 focus:border-[#0f4c75] focus:outline-none focus:ring-2 focus:ring-[#0f4c75]/20"
      >
        <option value="">New person — enter details below</option>
        {parties.map((party) => (
          <option key={party.id} value={party.id}>
            {party.name} — {party.phone}
            {party.balance_pence > 0 ? ` — Due ${formatPence(party.balance_pence)}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
