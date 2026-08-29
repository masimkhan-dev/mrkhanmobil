import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, Plus, Printer, Search, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  CField,
  CTextArea,
  DataTable,
  EmptyState,
  MoneyInput,
  PaymentMethodSelector,
  PrimaryBtn,
  SecondaryBtn,
  SkeletonRows,
} from "@/components/counter/ds";
import {
  createCounterCustomer,
  createCounterSupplier,
  getCustomerStatement,
  getSupplierStatement,
  payCounterSupplier,
  receiveCustomerPayment,
  searchCounterCustomers,
  searchCounterSuppliers,
} from "@/lib/counter.functions";
import type { PartySummary } from "@/lib/counter.types";
import { cents, formatPence } from "@/lib/money";
import { buildStatementHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";
import { cn } from "@/lib/utils";

export function LedgerPage({ type }: { type: "CUSTOMER" | "SUPPLIER" }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PartySummary | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CASH" | "CARD" | "BANK_TRANSFER" | "OTHER">("CASH");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatementPrint, setShowStatementPrint] = useState(false);

  // New Party Form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newIdRef, setNewIdRef] = useState("");
  const [newNote, setNewNote] = useState("");
  const [creatingParty, setCreatingParty] = useState(false);

  const paymentRequestId = useRef<string | null>(null);
  const qc = useQueryClient();

  const customerListFn = useServerFn(searchCounterCustomers);
  const supplierListFn = useServerFn(searchCounterSuppliers);
  const customerStatementFn = useServerFn(getCustomerStatement);
  const supplierStatementFn = useServerFn(getSupplierStatement);
  const receiveFn = useServerFn(receiveCustomerPayment);
  const payFn = useServerFn(payCounterSupplier);
  const addCustomerFn = useServerFn(createCounterCustomer);
  const addSupplierFn = useServerFn(createCounterSupplier);

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ["counter", type, "list", query],
    queryFn: () =>
      type === "CUSTOMER"
        ? customerListFn({ data: { query } })
        : supplierListFn({ data: { query } }),
  });

  const { data: statement } = useQuery({
    queryKey: ["counter", type, "statement", selected?.id, from, to],
    queryFn: () =>
      type === "CUSTOMER"
        ? customerStatementFn({
            data: { id: selected!.id, from: from || undefined, to: to || undefined },
          })
        : supplierStatementFn({
            data: { id: selected!.id, from: from || undefined, to: to || undefined },
          }),
    enabled: !!selected,
  });

  const amountPence = cents(amount);
  const currentBalance = statement?.balance_pence ?? selected?.balance_pence ?? 0;
  const remaining = Math.max(0, currentBalance - (Number.isFinite(amountPence) ? amountPence : 0));

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPhone.trim().length < 6) {
      return toast.error("Please enter a valid name and phone number.");
    }
    setCreatingParty(true);
    try {
      if (type === "CUSTOMER") {
        const res = await addCustomerFn({
          data: { name: newName.trim(), phone: newPhone.trim(), note: newNote.trim() },
        });
        if (res.existing) {
          if (res.name.toLowerCase() !== newName.trim().toLowerCase()) {
            toast.info(
              `An existing account with this phone number was found: "${res.name}". Opening account statement.`,
            );
          } else {
            toast.info(`Existing account found: "${res.name}". Opening account statement.`);
          }
        } else {
          toast.success(`Customer "${res.name}" created.`);
        }
        setSelected({
          id: res.id,
          name: res.name,
          phone: res.phone,
          balance_pence: 0,
          total_paid_pence: 0,
          last_activity: null,
        });
      } else {
        const res = await addSupplierFn({
          data: {
            name: newName.trim(),
            phone: newPhone.trim(),
            id_reference: newIdRef.trim(),
            note: newNote.trim(),
          },
        });
        if (res.existing) {
          if (res.name.toLowerCase() !== newName.trim().toLowerCase()) {
            toast.info(
              `An existing supplier with this phone number was found: "${res.name}". Opening account statement.`,
            );
          } else {
            toast.info(`Existing supplier found: "${res.name}". Opening account statement.`);
          }
        } else {
          toast.success(`Supplier "${res.name}" created.`);
        }
        setSelected({
          id: res.id,
          name: res.name,
          phone: res.phone,
          id_reference: res.id_reference,
          balance_pence: 0,
          total_paid_pence: 0,
          last_activity: null,
        });
      }
      setShowAddModal(false);
      setNewName("");
      setNewPhone("");
      setNewIdRef("");
      setNewNote("");
      await qc.invalidateQueries({ queryKey: ["counter"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add party.");
    } finally {
      setCreatingParty(false);
    }
  };

  const makePayment = async () => {
    if (!selected) return;
    if (!Number.isFinite(amountPence) || amountPence <= 0)
      return toast.error("Enter a valid amount.");
    if (amountPence > currentBalance)
      return toast.error(
        `Payment cannot exceed outstanding balance of ${formatPence(currentBalance)}.`,
      );
    paymentRequestId.current ??= crypto.randomUUID();
    setBusy(true);
    try {
      const request_id = paymentRequestId.current;
      if (type === "CUSTOMER")
        await receiveFn({
          data: {
            request_id,
            customer_id: selected.id,
            amount_pence: amountPence,
            payment_method: method,
            reference_note: note,
          },
        });
      else
        await payFn({
          data: {
            request_id,
            supplier_id: selected.id,
            amount_pence: amountPence,
            payment_method: method,
            reference_note: note,
          },
        });
      toast.success(type === "CUSTOMER" ? "Payment received." : "Supplier payment recorded.");
      paymentRequestId.current = null;
      setAmount("");
      setNote("");
      await qc.invalidateQueries({ queryKey: ["counter"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save payment.");
    } finally {
      setBusy(false);
    }
  };

  // ── Account detail view ─────────────────────────────────────────────────────
  if (selected) {
    const isCustomer = type === "CUSTOMER";
    const balanceLabel = isCustomer ? "Amount Due" : "We Owe";
    const actionLabel = isCustomer ? "Receive Payment" : "Record Supplier Payment";

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900">{selected.name}</h1>
            <p className="text-[14px] text-slate-500">
              {selected.phone} {selected.id_reference ? `· ID: ${selected.id_reference}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <SecondaryBtn
              onClick={() => {
                paymentRequestId.current = null;
                setSelected(null);
              }}
              className="w-auto px-4 py-2 text-[14px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </SecondaryBtn>
            <SecondaryBtn
              disabled={!statement}
              onClick={() => setShowStatementPrint(true)}
              className="w-auto px-4 py-2 text-[14px]"
            >
              <Printer className="h-4 w-4" />
              Print Statement
            </SecondaryBtn>
          </div>
        </div>

        {/* Balance card */}
        <div
          className={cn(
            "rounded-xl border p-6",
            currentBalance > 0
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50",
          )}
        >
          <p
            className={cn(
              "text-[13px] font-semibold uppercase tracking-wider",
              currentBalance > 0 ? "text-amber-700" : "text-emerald-700",
            )}
          >
            {balanceLabel}
          </p>
          <p
            className={cn(
              "mt-1 text-[36px] font-bold leading-none",
              currentBalance > 0 ? "text-amber-900" : "text-emerald-900",
            )}
          >
            {formatPence(currentBalance)}
          </p>
          {currentBalance === 0 && (
            <p className="mt-2 text-[13px] text-emerald-700">
              Account has zero outstanding balance. Outstanding invoices and payments will appear
              here automatically.
            </p>
          )}
        </div>

        {/* Payment form */}
        {currentBalance > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-[15px] font-bold text-slate-900">{actionLabel}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyInput
                id="ledger-amount"
                label="Amount"
                value={amount}
                onChange={setAmount}
                required
              />
              <div>
                <label
                  htmlFor="ledger-note"
                  className="mb-1.5 block text-[13px] font-medium text-slate-600"
                >
                  Reference / Note
                  <span className="ml-1 font-normal text-slate-400">· Optional</span>
                </label>
                <input
                  id="ledger-note"
                  placeholder="e.g. Cash advance, Bank transfer ref..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[15px] text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="sm:col-span-2">
                <PaymentMethodSelector value={method} onChange={setMethod} />
              </div>
            </div>

            {/* Remaining after payment */}
            {Number.isFinite(amountPence) && amountPence > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-[13px] text-slate-500">Remaining after payment</span>
                <span
                  className={cn(
                    "text-[15px] font-bold",
                    remaining > 0 ? "text-amber-700" : "text-emerald-700",
                  )}
                >
                  {formatPence(remaining)}
                </span>
              </div>
            )}

            <div className="mt-4">
              <PrimaryBtn
                onClick={makePayment}
                disabled={busy || !Number.isFinite(amountPence) || amountPence <= 0}
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Banknote className="h-4 w-4" />
                    {Number.isFinite(amountPence) && amountPence > 0
                      ? `${isCustomer ? "Receive" : "Pay"} ${formatPence(amountPence)}`
                      : actionLabel}
                  </>
                )}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* Statement date range */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="statement-from"
              className="mb-1.5 block text-[13px] font-medium text-slate-600"
            >
              From
            </label>
            <Input
              id="statement-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 w-40 rounded-lg border-slate-200 text-[13px]"
            />
          </div>
          <div>
            <label
              htmlFor="statement-to"
              className="mb-1.5 block text-[13px] font-medium text-slate-600"
            >
              To
            </label>
            <Input
              id="statement-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 w-40 rounded-lg border-slate-200 text-[13px]"
            />
          </div>
          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="text-[13px] text-slate-500 underline hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Transactions */}
        <DataTable headers={["Date", "Details", "Reference", "Invoice", "Payment", "Balance"]}>
          {!statement ? (
            <SkeletonRows cols={6} rows={5} />
          ) : statement.entries.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Banknote}
                    title="No transactions"
                    description="Transactions appear here automatically from invoices and payments."
                  />
                </td>
              </tr>
            </tbody>
          ) : (
            <LedgerRows entries={statement.entries} opening={statement.opening_pence} />
          )}
        </DataTable>

        {showStatementPrint && statement && selected && (
          <PrintPreviewModal
            open={true}
            onClose={() => setShowStatementPrint(false)}
            kind="STATEMENT"
            invoiceNumber={`Statement — ${selected.name}`}
            html80mm={buildStatementHtml(statement, type)}
            htmlA4={buildStatementHtml(statement, type)}
            defaultPaper="A4"
          />
        )}
      </div>
    );
  }

  // ── Party list view ──────────────────────────────────────────────────────────
  const isCustomer = type === "CUSTOMER";
  const listTitle = isCustomer ? "Customer Accounts" : "Supplier Accounts";
  const listDescription = isCustomer
    ? "Manage customer accounts, view balances, and receive payments."
    : "Manage supplier accounts, view trade-in payables, and record payouts.";
  const emptyTitle = isCustomer ? "No customer accounts" : "No supplier accounts";
  const emptyDesc = isCustomer
    ? "Create a customer manually or they will be added automatically on invoices."
    : "Create a supplier manually or they will be added automatically on buy invoices.";

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900">{listTitle}</h1>
          <p className="text-[14px] text-slate-500">{listDescription}</p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-brand-hover"
          >
            <UserPlus className="h-4 w-4" />
            {isCustomer ? "+ Add Customer" : "+ Add Supplier"}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${isCustomer ? "customer" : "supplier"} name or phone…`}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : parties.length === 0 ? (
          <EmptyState
            icon={Users}
            title={emptyTitle}
            description={emptyDesc}
            action={
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" />
                {isCustomer ? "Add Customer" : "Add Supplier"}
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {parties.map((party) => (
              <button
                key={party.id}
                onClick={() => {
                  paymentRequestId.current = null;
                  setSelected(party);
                }}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="text-[15px] font-bold text-slate-900">{party.name}</p>
                  <p className="text-[13px] text-slate-500">
                    {party.phone} {party.id_reference ? `· ID: ${party.id_reference}` : ""}
                  </p>
                  {party.last_activity && (
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Last activity:{" "}
                      {new Date(party.last_activity).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">
                    {isCustomer ? "Amount Due" : "We Owe"}
                  </p>
                  <p
                    className={cn(
                      "text-[20px] font-bold tabular-nums",
                      party.balance_pence > 0 ? "text-amber-700" : "text-emerald-700",
                    )}
                  >
                    {formatPence(party.balance_pence)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Party Modal ────────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand" />
                <h2 className="text-[16px] font-bold text-slate-900">
                  {isCustomer ? "Add New Customer" : "Add New Supplier"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-4 p-6">
              <CField
                id="new-party-name"
                label={isCustomer ? "Customer Full Name" : "Supplier / Business Name"}
                value={newName}
                onChange={setNewName}
                required
                placeholder={isCustomer ? "e.g. Sarah Jenkins" : "e.g. Liverpool Parts Ltd"}
              />

              <CField
                id="new-party-phone"
                label="Phone Number"
                value={newPhone}
                onChange={setNewPhone}
                required
                type="tel"
                placeholder="e.g. 07700 900000"
              />

              {!isCustomer && (
                <CField
                  id="new-party-idref"
                  label="ID Reference / Account Ref"
                  value={newIdRef}
                  onChange={setNewIdRef}
                  optional
                  placeholder="e.g. Driving License no. / Trade VAT ref"
                />
              )}

              <CTextArea
                id="new-party-note"
                label="Address / Internal Note"
                value={newNote}
                onChange={setNewNote}
                optional
                placeholder="Customer address or business notes…"
                rows={2}
              />

              <div className="flex justify-end gap-2 pt-2">
                <SecondaryBtn
                  onClick={() => setShowAddModal(false)}
                  className="w-auto px-4 py-2.5 text-[14px]"
                >
                  Cancel
                </SecondaryBtn>
                <PrimaryBtn
                  type="submit"
                  disabled={creatingParty || !newName.trim() || newPhone.trim().length < 6}
                  className="w-auto px-5 py-2.5 text-[14px]"
                >
                  {creatingParty ? "Saving…" : isCustomer ? "Save Customer" : "Save Supplier"}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ledger rows ───────────────────────────────────────────────────────────────

function LedgerRows({
  entries,
  opening,
}: {
  entries: Array<{
    id: string;
    created_at: string;
    description: string;
    reference: string;
    debit_pence: number;
    credit_pence: number;
  }>;
  opening: number;
}) {
  let running = opening;
  return (
    <tbody>
      {entries.map((entry) => {
        running += entry.debit_pence - entry.credit_pence;
        return (
          <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 text-[13px] text-slate-500">
              {new Date(entry.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </td>
            <td className="px-4 py-3 text-[13px] text-slate-700">{entry.description}</td>
            <td className="px-4 py-3 font-mono text-[12px] text-slate-500">{entry.reference}</td>
            <td className="px-4 py-3 text-right tabular-nums text-[13px] text-slate-700">
              {entry.debit_pence ? formatPence(entry.debit_pence) : "—"}
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-[13px] text-emerald-700 font-medium">
              {entry.credit_pence ? formatPence(entry.credit_pence) : "—"}
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-[14px] font-bold text-slate-900">
              {formatPence(running)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
