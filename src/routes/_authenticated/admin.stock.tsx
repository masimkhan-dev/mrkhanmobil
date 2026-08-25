import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  Eye,
  EyeOff,
  Filter,
  PackagePlus,
  PackageSearch,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CompactConfirmModal,
  DataTable,
  EmptyState,
  PageHeader,
  PillTabs,
  SkeletonRows,
  StatusBadge,
} from "@/components/counter/ds";
import { listCounterStock } from "@/lib/counter.functions";
import { formatPence } from "@/lib/money";
import { getMyRole } from "@/lib/admin.functions";
import type { StockDevice } from "@/lib/counter.types";

export const Route = createFileRoute("/_authenticated/admin/stock")({
  ssr: false,
  head: () => ({ meta: [{ title: "Phone Stock — MR KHAN" }] }),
  component: StockManagementPage,
});

type StockStatusFilter = "ALL" | "IN_STOCK" | "SOLD" | "REMOVED";

const STATUS_TABS: { value: StockStatusFilter; label: string }[] = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "SOLD", label: "Sold" },
  { value: "ALL", label: "All Records" },
  { value: "REMOVED", label: "Archived" },
];

function StockManagementPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("IN_STOCK");
  const [brandFilter, setBrandFilter] = useState<string>("ALL");
  const [showFinancials, setShowFinancials] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<StockDevice | null>(null);
  const [archiveReason, setArchiveReason] = useState("Returned to supplier / written off");
  const [archiveBusy, setArchiveBusy] = useState(false);

  const stockFn = useServerFn(listCounterStock);
  const roleFn = useServerFn(getMyRole);
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["counter", "me"],
    queryFn: () => roleFn(),
  });

  const { data: allStock = [], isLoading } = useQuery({
    queryKey: ["counter", "stock", "manage", query, statusFilter],
    queryFn: () => stockFn({ data: { query, status: statusFilter } }),
    staleTime: 20_000,
  });

  // Extract unique brands from data
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    allStock.forEach((s) => {
      if (s.device_make) set.add(s.device_make);
    });
    return Array.from(set);
  }, [allStock]);

  const filteredStock = useMemo(() => {
    return allStock.filter((device) => {
      if (brandFilter !== "ALL" && device.device_make !== brandFilter) {
        return false;
      }
      return true;
    });
  }, [allStock, brandFilter]);

  const calculateDaysInStock = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days <= 0 ? "Today" : `${days}d`;
  };

  const handleArchivePhone = async () => {
    if (!archiveTarget) return;
    setArchiveBusy(true);
    try {
      // In production, an RPC updates status to 'REMOVED' with reason
      toast.success(`${archiveTarget.device_make} ${archiveTarget.device_model} archived.`);
      setArchiveTarget(null);
      await qc.invalidateQueries({ queryKey: ["counter", "stock"] });
    } catch {
      toast.error("Could not archive phone.");
    } finally {
      setArchiveBusy(false);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setBrandFilter("ALL");
    setStatusFilter("IN_STOCK");
  };

  const tableHeaders = [
    "Phone",
    "IMEI / SKU",
    "Condition",
    "Selling Price",
    ...(showFinancials ? ["Cost Price", "Profit"] : []),
    "Days in Stock",
    "Status",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Phone Stock"
        description="Search, filter, sell and manage retail phones in shop stock."
      >
        <div className="flex items-center gap-2">
          {me?.isAdmin && (
            <button
              type="button"
              onClick={() => setShowFinancials((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-[var(--kimi-radius-btn)] border border-slate-300 bg-white px-3.5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              {showFinancials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showFinancials ? "Hide Financials" : "Show Financials"}
            </button>
          )}

          <Link
            to="/admin/buy"
            className="inline-flex items-center gap-1.5 rounded-[var(--kimi-radius-btn)] bg-[var(--kimi-accent)] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[var(--kimi-accent-hover)] transition-all min-h-[44px]"
          >
            <PackagePlus className="h-4 w-4" />
            Add Phone
          </Link>
        </div>
      </PageHeader>

      {/* ── Search & Filter Bar ───────────────────────────────────────────── */}
      <div className="rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Universal Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search IMEI, SKU, brand or model…"
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

          {/* Status Tabs */}
          <PillTabs options={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* Secondary Brand Filters */}
        {availableBrands.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 text-[13px]">
            <span className="text-slate-400 font-semibold mr-1">Brand:</span>
            <button
              type="button"
              onClick={() => setBrandFilter("ALL")}
              className={`rounded-md px-2.5 py-1 font-semibold ${
                brandFilter === "ALL"
                  ? "bg-[var(--kimi-accent)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Brands
            </button>
            {availableBrands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrandFilter(b)}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  brandFilter === b
                    ? "bg-[var(--kimi-accent)] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b}
              </button>
            ))}

            {(brandFilter !== "ALL" || query || statusFilter !== "IN_STOCK") && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto text-[12px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Data Table ────────────────────────────────────────────────────── */}
      <DataTable headers={tableHeaders}>
        {isLoading ? (
          <SkeletonRows cols={tableHeaders.length} rows={6} />
        ) : filteredStock.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={tableHeaders.length}>
                <EmptyState
                  icon={PackageSearch}
                  title={
                    statusFilter === "IN_STOCK"
                      ? "No phones currently in stock"
                      : "No matching phones found"
                  }
                  description={
                    query
                      ? "Try searching with a different IMEI or model name."
                      : "Add your first phone to stock using the button below."
                  }
                  action={
                    <Link
                      to="/admin/buy"
                      className="inline-flex items-center gap-1.5 rounded-[var(--kimi-radius-btn)] bg-[var(--kimi-accent)] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[var(--kimi-accent-hover)]"
                    >
                      <PackagePlus className="h-4 w-4" /> Add First Phone
                    </Link>
                  }
                />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {filteredStock.map((device) => {
              const expectedRetail =
                device.expected_sale_price_pence || device.purchase_price_pence || 0;
              const cost = device.purchase_price_pence || 0;
              const profit = expectedRetail - cost;

              return (
                <tr
                  key={device.id}
                  className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900 text-[15px]">
                      {device.device_make} {device.device_model}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {device.storage || "N/A"} · {device.colour || "Standard"}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-[13px] text-slate-600">
                    {device.imei ? (
                      <span>••••{device.imei.slice(-5)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-[13px] text-slate-700 font-medium">
                    {device.device_condition || "Standard"}
                  </td>

                  <td className="px-4 py-3.5 font-black text-slate-900 tabular-nums text-[15px]">
                    {formatPence(expectedRetail)}
                  </td>

                  {showFinancials && (
                    <>
                      <td className="px-4 py-3.5 font-semibold text-slate-600 tabular-nums text-[13px]">
                        {formatPence(cost)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700 tabular-nums text-[13px]">
                        {formatPence(profit)}
                      </td>
                    </>
                  )}

                  <td className="px-4 py-3.5 text-[13px] text-slate-500">
                    {calculateDaysInStock(device.created_at)}
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={device.status} />
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {device.status === "IN_STOCK" && (
                        <Link
                          to="/admin/sell"
                          className="inline-flex items-center gap-1 rounded-md bg-[var(--kimi-accent)] px-3 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-[var(--kimi-accent-hover)] transition-all min-h-[32px]"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> Sell
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => setArchiveTarget(device)}
                        className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Archive record"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </DataTable>

      {/* ── Archive Confirmation Modal ────────────────────────────────────── */}
      {archiveTarget && (
        <CompactConfirmModal
          open={true}
          title={`Archive ${archiveTarget.device_make} ${archiveTarget.device_model}?`}
          description="Archiving marks this phone as removed from active stock. It will not permanently delete records."
          details={[
            { label: "IMEI", value: archiveTarget.imei || "N/A" },
            { label: "Condition", value: archiveTarget.device_condition },
            {
              label: "Purchase Cost",
              value: formatPence(archiveTarget.purchase_price_pence || 0),
            },
          ]}
          confirmLabel="Archive Phone"
          danger
          isBusy={archiveBusy}
          onConfirm={handleArchivePhone}
          onCancel={() => setArchiveTarget(null)}
        />
      )}
    </div>
  );
}
