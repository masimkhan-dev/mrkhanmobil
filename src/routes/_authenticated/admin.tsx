import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BanknoteArrowDown,
  BarChart3,
  CheckCircle2,
  FileText,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PackageCheck,
  PackagePlus,
  PackageSearch,
  Printer,
  Search,
  Settings,
  ShoppingBag,
  Smartphone,
  Sparkles,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { getMyRole } from "@/lib/admin.functions";
import {
  getCounterDashboard,
  getCounterInvoice,
  listCounterInvoices,
  listCounterStock,
  searchCounterCustomers,
} from "@/lib/counter.functions";
import { formatPence } from "@/lib/money";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { StatusBadge, getSavedPrinterFormat } from "@/components/counter/ds";
import { buildCounterInvoiceHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";
import type { InvoiceSummary } from "@/lib/counter.types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "MR KHAN Counter POS" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CounterAdminLayout,
});

// ─── Main Navigation Config ───────────────────────────────────────────────────

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { to: "/admin", label: "Counter", icon: LayoutDashboard, exact: true },
  { to: "/admin/stock", label: "Phone Stock", icon: PackageSearch },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

// ─── Shell Layout ─────────────────────────────────────────────────────────────

function CounterAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const roleFn = useServerFn(getMyRole);

  const { data: me, isLoading } = useQuery({
    queryKey: ["counter", "me"],
    queryFn: () => roleFn(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--kimi-color-page-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[var(--kimi-accent)] border-t-transparent" />
          <p className="text-[14px] font-semibold text-slate-600">Opening MR KHAN Counter…</p>
        </div>
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const isDashboard = location.pathname === "/admin";

  return (
    <div className="min-h-screen bg-[var(--kimi-color-page-bg)] pb-16 lg:pb-0">
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          {/* Mobile drawer toggle */}
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand Logo */}
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--kimi-accent)] text-[12px] font-black text-white tracking-wider shadow-sm">
              MK
            </span>
            <div className="leading-tight">
              <p className="text-[14px] font-black text-slate-900 tracking-tight">MR KHAN</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--kimi-accent)]">
                Counter POS
              </p>
            </div>
          </Link>

          {/* Right Header — Role badge & Sign out */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-bold text-slate-900">
                {me?.isAdmin ? "Owner (Admin)" : "Counter Staff"}
              </p>
              <p className="text-[11px] text-slate-400">UK Retail Counter</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-[var(--kimi-radius-btn)] border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Layout Wrapper ────────────────────────────────────────────── */}
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-14 lg:z-10 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0",
            drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          )}
        >
          {/* Mobile close bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 lg:hidden">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
              Menu Navigation
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Sidebar navigation">
            {NAV_ITEMS.map((item) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold transition-colors min-h-[44px]",
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--kimi-accent)]" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active
                        ? "text-[var(--kimi-accent)]"
                        : "text-slate-400 group-hover:text-slate-600",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-100 p-3 text-center">
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} MR KHAN MOBILES
            </p>
          </div>
        </aside>

        {/* ── Main Workspace ───────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1280px]">
            {isDashboard ? <CounterHomeScreen me={me} /> : <Outlet />}
          </div>
        </main>
      </div>

      {/* ── Tablet / Mobile Bottom Navigation Bar ────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 lg:hidden shadow-lg"
      >
        <BottomNavLink to="/admin" label="Counter" icon={LayoutDashboard} exact />
        <BottomNavLink to="/admin/stock" label="Stock" icon={PackageSearch} />
        <BottomNavLink to="/admin/invoices" label="Invoices" icon={FileText} />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 min-h-[44px] min-w-[54px]"
        >
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>
    </div>
  );
}

function BottomNavLink({
  to,
  label,
  icon: Icon,
  exact,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}) {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors min-h-[44px] min-w-[54px]",
        active ? "text-[var(--kimi-accent)]" : "text-slate-500 hover:text-slate-900",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "text-[var(--kimi-accent)]")} />
      {label}
    </Link>
  );
}

// ─── Counter Home Screen (The Core Hub) ────────────────────────────────────────

function CounterHomeScreen({ me }: { me: { isAdmin: boolean } | undefined }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [reprinting, setReprinting] = useState(false);
  const [preview, setPreview] = useState<{
    invoiceNumber: string;
    html80mm: string;
    htmlA4: string;
    kind: "REPAIR" | "SALE" | "PURCHASE";
  } | null>(null);

  const dashFn = useServerFn(getCounterDashboard);
  const invoicesFn = useServerFn(listCounterInvoices);
  const stockFn = useServerFn(listCounterStock);
  const customersFn = useServerFn(searchCounterCustomers);
  const detailFn = useServerFn(getCounterInvoice);

  const {
    data: dashData,
    isLoading: dashLoading,
    error: dashError,
  } = useQuery({
    queryKey: ["counter", "dashboard"],
    queryFn: () => dashFn(),
  });

  const { data: recentInvoices = [], isLoading: recentLoading } = useQuery({
    queryKey: ["counter", "recent"],
    queryFn: () => invoicesFn({ data: { query: "", kind: "ALL" } }),
    staleTime: 30_000,
    select: (rows) => rows.slice(0, 5),
  });

  const { data: searchInvoices = [] } = useQuery({
    queryKey: ["counter", "search", "invoices", searchQuery],
    queryFn: () => invoicesFn({ data: { query: searchQuery, kind: "ALL" } }),
    enabled: searchQuery.trim().length >= 2,
  });

  const { data: searchCustomers = [] } = useQuery({
    queryKey: ["counter", "search", "customers", searchQuery],
    queryFn: () => customersFn({ data: { query: searchQuery } }),
    enabled: searchQuery.trim().length >= 2,
  });

  const { data: searchStock = [] } = useQuery({
    queryKey: ["counter", "search", "stock", searchQuery],
    queryFn: () => stockFn({ data: { query: searchQuery, status: "ALL" } }),
    enabled: searchQuery.trim().length >= 2,
  });

  const hasSearchResults =
    searchQuery.trim().length >= 2 &&
    (searchInvoices.length > 0 || searchCustomers.length > 0 || searchStock.length > 0);

  // Quick Reprint Last Invoice Handler
  const handleReprintLastInvoice = async () => {
    if (recentInvoices.length === 0) {
      toast.error("No recent invoices found to reprint.");
      return;
    }
    const last = recentInvoices[0];
    setReprinting(true);
    try {
      const detail = await detailFn({ data: { kind: last.kind, id: last.id } });
      setPreview({
        invoiceNumber: last.invoice_number,
        html80mm: buildCounterInvoiceHtml(last.kind, detail, "80MM"),
        htmlA4: buildCounterInvoiceHtml(last.kind, detail, "A4"),
        kind: last.kind,
      });
    } catch (err) {
      toast.error("Could not load invoice preview for reprinting.");
    } finally {
      setReprinting(false);
    }
  };

  const handlePrintSpecific = async (inv: InvoiceSummary) => {
    try {
      const detail = await detailFn({ data: { kind: inv.kind, id: inv.id } });
      setPreview({
        invoiceNumber: inv.invoice_number,
        html80mm: buildCounterInvoiceHtml(inv.kind, detail, "80MM"),
        htmlA4: buildCounterInvoiceHtml(inv.kind, detail, "A4"),
        kind: inv.kind,
      });
    } catch {
      toast.error("Failed to load invoice print preview.");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Greeting Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--kimi-accent)]">
            Counter Terminal
          </p>
          <h1 className="mt-0.5 text-[28px] font-black text-slate-900 tracking-tight">
            What would you like to do?
          </h1>
          <p className="text-[14px] text-slate-500">
            Select a counter action or quickly search records below.
          </p>
        </div>

        {/* Quick 1-Click Reprint Button */}
        {recentInvoices.length > 0 && (
          <button
            type="button"
            onClick={handleReprintLastInvoice}
            disabled={reprinting}
            className="inline-flex items-center gap-2 rounded-[var(--kimi-radius-btn)] border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-all min-h-[44px] shrink-0"
          >
            <Printer className="h-4 w-4 text-[var(--kimi-accent)]" />
            {reprinting ? "Loading…" : `Reprint Last (${recentInvoices[0]?.invoice_number})`}
          </button>
        )}
      </div>

      {/* ── Database Migration Warning (if any) ───────────────────────────── */}
      {dashError && (
        <div className="flex items-start gap-3 rounded-[var(--kimi-radius-card)] border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-[13px] font-bold text-amber-900">Database connection note</p>
            <p className="text-[12px] text-amber-800">
              Ensure the counter database procedures are active in Supabase.
            </p>
          </div>
        </div>
      )}

      {/* ── 3 Large Primary Action Cards (Min Height ~120px) ───────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Create Repair Invoice */}
        <Link
          to="/admin/repair"
          className="group relative flex flex-col justify-between rounded-[var(--kimi-radius-card)] border-2 border-blue-100 bg-white p-6 shadow-sm transition-all hover:border-[var(--kimi-accent)] hover:shadow-md min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[var(--kimi-accent)]">
              <Wrench className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              45s Entry
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-[18px] font-black text-slate-900 group-hover:text-[var(--kimi-accent)] transition-colors">
              Create Repair Invoice
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Enter a completed repair and print the invoice
            </p>
          </div>
        </Link>

        {/* Card 2: Add Phone to Stock */}
        <Link
          to="/admin/buy"
          className="group relative flex flex-col justify-between rounded-[var(--kimi-radius-card)] border-2 border-emerald-100 bg-white p-6 shadow-sm transition-all hover:border-emerald-600 hover:shadow-md min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PackagePlus className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              30s Entry
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-[18px] font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              Add Phone to Stock
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Add a new or pre-owned phone to shop stock
            </p>
          </div>
        </Link>

        {/* Card 3: Sell Phone */}
        <Link
          to="/admin/sell"
          className="group relative flex flex-col justify-between rounded-[var(--kimi-radius-card)] border-2 border-violet-100 bg-white p-6 shadow-sm transition-all hover:border-violet-600 hover:shadow-md min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
              25s Sale
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-[18px] font-black text-slate-900 group-hover:text-violet-700 transition-colors">
              Sell Phone
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Select a phone from stock and complete the sale
            </p>
          </div>
        </Link>
      </div>

      {/* ── Universal Quick Search ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice, customer, phone number or IMEI…"
            className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-10 text-[16px] text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-[var(--kimi-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kimi-accent-ring)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Grouped Live Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-4 shadow-lg space-y-4">
            {!hasSearchResults ? (
              <p className="py-4 text-center text-[14px] text-slate-500">
                No matching invoices, customers or phones found for &ldquo;{searchQuery}&rdquo;.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Invoices */}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Invoices ({searchInvoices.length})
                  </h3>
                  <div className="space-y-1.5">
                    {searchInvoices.slice(0, 4).map((inv) => (
                      <Link
                        key={inv.id}
                        to="/admin/invoices"
                        className="block rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] font-bold text-[var(--kimi-accent)]">
                            {inv.invoice_number}
                          </span>
                          <StatusBadge status={inv.payment_status} />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-900 mt-1">
                          {inv.party_name}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {inv.device_make} {inv.device_model} · {formatPence(inv.total_pence)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Customers */}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Customers ({searchCustomers.length})
                  </h3>
                  <div className="space-y-1.5">
                    {searchCustomers.slice(0, 4).map((c) => (
                      <Link
                        key={c.id}
                        to="/admin/customers"
                        className="block rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-[13px] font-bold text-slate-900">{c.name}</p>
                        <p className="text-[12px] text-slate-500">{c.phone}</p>
                        {c.balance_pence > 0 && (
                          <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                            Owes {formatPence(c.balance_pence)}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Phones */}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Phone Stock ({searchStock.length})
                  </h3>
                  <div className="space-y-1.5">
                    {searchStock.slice(0, 4).map((s) => (
                      <Link
                        key={s.id}
                        to="/admin/stock"
                        className="block rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] text-slate-900">
                            {s.device_make} {s.device_model}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-[12px] text-slate-500 font-mono">
                          IMEI: {s.imei || "—"}
                        </p>
                        <p className="text-[12px] font-semibold text-slate-700">
                          {formatPence(s.expected_sale_price_pence || s.purchase_price_pence || 0)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Counter Balances & Summary ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Repairs Today
          </p>
          <p className="mt-1 text-[24px] font-black text-slate-900 tabular-nums">
            {dashLoading ? "…" : (dashData?.today_repairs ?? 0)}
          </p>
        </div>
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Phones Sold Today
          </p>
          <p className="mt-1 text-[24px] font-black text-slate-900 tabular-nums">
            {dashLoading ? "…" : (dashData?.today_sales ?? 0)}
          </p>
        </div>
        <div className="rounded-[var(--kimi-radius-card)] border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Customers Owe (Unpaid)
          </p>
          <p className="mt-1 text-[24px] font-black text-amber-800 tabular-nums">
            {dashLoading ? "…" : formatPence(dashData?.customer_due ?? 0)}
          </p>
        </div>
        <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Phones in Stock
          </p>
          <p className="mt-1 text-[24px] font-black text-slate-900 tabular-nums">
            {dashLoading ? "…" : (dashData?.in_stock ?? 0)}
          </p>
        </div>
      </div>

      {/* ── 5 Latest Invoices ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-slate-600">
            Recent Counter Invoices
          </h2>
          <Link
            to="/admin/invoices"
            className="text-[13px] font-bold text-[var(--kimi-accent)] hover:underline flex items-center gap-1"
          >
            View all invoices <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentLoading ? (
          <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-6 animate-pulse text-center text-slate-400">
            Loading recent invoices…
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-8 text-center">
            <p className="text-[14px] font-semibold text-slate-600">
              No transactions recorded yet.
            </p>
            <p className="text-[13px] text-slate-400 mt-1">
              Start by creating a Repair invoice, adding a phone to stock, or completing a sale.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 text-left">Invoice</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Customer / Supplier</th>
                  <th className="px-4 py-3 text-left">Device</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[12px] font-bold text-[var(--kimi-accent)]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.kind} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{inv.party_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {inv.device_make} {inv.device_model}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                      {formatPence(inv.total_pence)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.payment_status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handlePrintSpecific(inv)}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-md hover:bg-slate-100"
                      >
                        <Printer className="h-3.5 w-3.5" /> Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Print Preview Modal ───────────────────────────────────────────── */}
      {preview && (
        <PrintPreviewModal
          open={true}
          onClose={() => setPreview(null)}
          kind={preview.kind}
          invoiceNumber={preview.invoiceNumber}
          html80mm={preview.html80mm}
          htmlA4={preview.htmlA4}
        />
      )}
    </div>
  );
}
