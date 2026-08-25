import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Banknote,
  Calendar,
  DollarSign,
  FileText,
  PackageCheck,
  PackageSearch,
  Percent,
  Receipt,
  RotateCcw,
  TrendingUp,
  Wrench,
} from "lucide-react";
import {
  getCounterDashboard,
  listCounterInvoices,
  listCounterStock,
} from "@/lib/counter.functions";
import { formatPence } from "@/lib/money";
import { CSection, PageHeader, PillTabs, StatusBadge } from "@/components/counter/ds";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reports — MR KHAN" }] }),
  component: ReportsPage,
});

type PresetPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL";

const PERIOD_OPTIONS: { value: PresetPeriod; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "WEEK", label: "This Week" },
  { value: "MONTH", label: "This Month" },
  { value: "ALL", label: "All Time" },
];

function ReportsPage() {
  const [period, setPeriod] = useState<PresetPeriod>("TODAY");

  const dashFn = useServerFn(getCounterDashboard);
  const invoicesFn = useServerFn(listCounterInvoices);
  const stockFn = useServerFn(listCounterStock);

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["counter", "dashboard"],
    queryFn: () => dashFn(),
  });

  const { data: invoices = [], isLoading: invLoading } = useQuery({
    queryKey: ["counter", "invoices", "reports"],
    queryFn: () => invoicesFn({ data: { query: "", kind: "ALL" } }),
  });

  const { data: stock = [] } = useQuery({
    queryKey: ["counter", "stock", "reports"],
    queryFn: () => stockFn({ data: { query: "", status: "ALL" } }),
  });

  // Calculate filtered stats
  const activeInvoices = invoices.filter((inv) => inv.status !== "VOID");
  const repairs = activeInvoices.filter((inv) => inv.kind === "REPAIR");
  const sales = activeInvoices.filter((inv) => inv.kind === "SALE");

  const totalSalesPence = sales.reduce((acc, curr) => acc + curr.total_pence, 0);
  const totalRepairsPence = repairs.reduce((acc, curr) => acc + curr.total_pence, 0);
  const totalPaidPence = activeInvoices.reduce((acc, curr) => acc + curr.paid_pence, 0);
  const totalDuePence = activeInvoices.reduce(
    (acc, curr) => acc + (curr.total_pence - curr.paid_pence),
    0,
  );

  const inStockPhones = stock.filter((s) => s.status === "IN_STOCK");
  const stockValuePence = inStockPhones.reduce(
    (acc, curr) => acc + (curr.purchase_price_pence || 0),
    0,
  );
  const expectedRetailPence = inStockPhones.reduce(
    (acc, curr) => acc + (curr.expected_sale_price_pence || curr.purchase_price_pence || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Plain-English summary of your counter performance, sales, repairs and balances."
      >
        <PillTabs options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </PageHeader>

      {/* ── Key Counter KPI Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Repairs */}
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[13px] font-semibold uppercase tracking-wider">
              Repairs Completed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums leading-tight">
            {dashLoading ? "…" : (dashboard?.today_repairs ?? repairs.length)}
          </p>
          <p className="text-[13px] text-slate-500">
            Total repair revenue:{" "}
            <span className="font-semibold text-slate-800">{formatPence(totalRepairsPence)}</span>
          </p>
        </div>

        {/* Phone Sales */}
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[13px] font-semibold uppercase tracking-wider">Phones Sold</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums leading-tight">
            {dashLoading ? "…" : (dashboard?.today_sales ?? sales.length)}
          </p>
          <p className="text-[13px] text-slate-500">
            Total sales revenue:{" "}
            <span className="font-semibold text-slate-800">{formatPence(totalSalesPence)}</span>
          </p>
        </div>

        {/* Payments Collected */}
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[13px] font-semibold uppercase tracking-wider">
              Payments Collected
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-emerald-700 tabular-nums leading-tight">
            {formatPence(totalPaidPence)}
          </p>
          <p className="text-[13px] text-slate-500">Cash, Card &amp; Bank transfers received</p>
        </div>

        {/* Customer Balances Owed */}
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[13px] font-semibold uppercase tracking-wider">
              Customers Owe (Unpaid)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-amber-700 tabular-nums leading-tight">
            {dashLoading ? "…" : formatPence(dashboard?.customer_due ?? totalDuePence)}
          </p>
          <Link
            to="/admin/customers"
            className="text-[13px] font-semibold text-[var(--kimi-accent)] hover:underline inline-block"
          >
            View customer balances →
          </Link>
        </div>

        {/* Phones in Stock */}
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[13px] font-semibold uppercase tracking-wider">
              Phone Stock Value
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <PackageSearch className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums leading-tight">
            {formatPence(stockValuePence)}
          </p>
          <p className="text-[13px] text-slate-500">
            {inStockPhones.length} phones in stock · Expected sale:{" "}
            {formatPence(expectedRetailPence)}
          </p>
        </div>

        {/* We Owe Suppliers */}
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[13px] font-semibold uppercase tracking-wider">
              Supplier Balances
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-slate-800 tabular-nums leading-tight">
            {dashLoading ? "…" : formatPence(dashboard?.supplier_due ?? 0)}
          </p>
          <Link
            to="/admin/suppliers"
            className="text-[13px] font-semibold text-[var(--kimi-accent)] hover:underline inline-block"
          >
            View supplier records →
          </Link>
        </div>
      </div>

      {/* ── Practical Guidance ────────────────────────────────────────────── */}
      <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-5">
        <h3 className="text-[14px] font-bold text-slate-900 mb-2">Counter Performance Notes</h3>
        <ul className="space-y-1.5 text-[13px] text-slate-600 list-disc list-inside">
          <li>
            All numbers update automatically after every repair, phone sale, stock purchase and
            payment.
          </li>
          <li>Voided invoices are automatically excluded from revenue and collection summaries.</li>
          <li>
            For detailed tax and year-end accounting statements, visit Invoices and export records.
          </li>
        </ul>
      </div>
    </div>
  );
}
