import { createFileRoute, Link, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  getMyRole,
  getDashboardStats,
  listBookings,
  updateBookingStatus,
  listLeads,
  deleteLead,
  listSubscribers,
} from "@/lib/admin.functions";
import { listBookingEvents } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Wrench,
  Mail,
  Users,
  LogOut,
  Loader2,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  Trash2,
  Search,
  Printer,
  Download,
  Settings,
  Smartphone,
  Star,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — MR KHAN" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = [
  "pending",
  "diagnosing",
  "waiting_parts",
  "repair_started",
  "ready_for_collection",
  "completed",
  "delivered",
  "cancelled",
] as const;
type Status = (typeof STATUSES)[number];

const COLOR_CLASSES: Record<string, string> = {
  pending:
    "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30",
  diagnosing:
    "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800/30",
  waiting_parts:
    "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/30",
  repair_started:
    "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800/30",
  ready_for_collection:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30",
  completed:
    "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-zinc-800/30",
  delivered:
    "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-zinc-800/30",
  cancelled:
    "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30",
};

const STATUS_META: Record<string, { label: string; className: string; short: string }> = {
  pending: { label: "New", short: "New", className: COLOR_CLASSES.pending },
  diagnosing: { label: "Diagnosing", short: "Diagnosing", className: COLOR_CLASSES.diagnosing },
  waiting_parts: {
    label: "Waiting Parts",
    short: "Waiting",
    className: COLOR_CLASSES.waiting_parts,
  },
  repair_started: {
    label: "Repairing",
    short: "Repairing",
    className: COLOR_CLASSES.repair_started,
  },
  ready_for_collection: {
    label: "Ready",
    short: "Ready",
    className: COLOR_CLASSES.ready_for_collection,
  },
  completed: { label: "Collected", short: "Collected", className: COLOR_CLASSES.completed },
  delivered: { label: "Collected", short: "Collected", className: COLOR_CLASSES.delivered },
  cancelled: { label: "Cancelled", short: "Cancelled", className: COLOR_CLASSES.cancelled },
};

const printJobSheet = (booking: any) => {
  if (!booking) return;
  const escapeHtml = (str: string | null | undefined): string => {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document
    .write(`<!doctype html><html><head><title>Job Sheet — ${escapeHtml(booking.booking_ref)}</title>
    <style>
      body{font-family:system-ui,-apple-system,sans-serif;padding:32px;color:#111;max-width:720px;margin:0 auto}
      h1{margin:0 0 4px;font-size:28px}
      .ref{font-family:ui-monospace,monospace;font-size:20px;background:#f4f4f5;padding:6px 12px;border-radius:6px;display:inline-block}
      h2{border-bottom:1px solid #e4e4e7;padding-bottom:6px;margin-top:24px;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#71717a}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:12px 0}
      .row{padding:6px 0}
      .lbl{font-size:11px;text-transform:uppercase;color:#71717a;letter-spacing:1px}
      .val{font-weight:600;font-size:15px}
      .box{border:1px dashed #a1a1aa;height:120px;margin-top:8px;border-radius:6px}
      .sig{display:flex;gap:24px;margin-top:32px}
      .sig>div{flex:1;border-top:1px solid #71717a;padding-top:6px;font-size:12px;color:#71717a}
      @media print{body{padding:20px}}
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:start">
      <div>
        <h1>MR KHAN Repair — Job Sheet</h1>
        <p style="margin:4px 0;color:#71717a">Printed ${new Date().toLocaleString("en-GB")}</p>
      </div>
      <div class="ref">${escapeHtml(booking.booking_ref)}</div>
    </div>
    <h2>Customer</h2>
    <div class="grid">
      <div class="row"><div class="lbl">Name</div><div class="val">${escapeHtml(booking.first_name)} ${escapeHtml(booking.last_name)}</div></div>
      <div class="row"><div class="lbl">Phone</div><div class="val">${escapeHtml(booking.phone ?? "")}</div></div>
      <div class="row"><div class="lbl">Email</div><div class="val">${escapeHtml(booking.email ?? "")}</div></div>
      <div class="row"><div class="lbl">Service</div><div class="val">${escapeHtml((booking.service_type ?? "").replace("_", " "))}</div></div>
      ${booking.address ? `<div class="row" style="grid-column:1/-1"><div class="lbl">Address</div><div class="val">${escapeHtml(booking.address)}, ${escapeHtml(booking.postcode ?? "")}</div></div>` : ""}
    </div>
    <h2>Device</h2>
    <div class="grid">
      <div class="row"><div class="lbl">Brand</div><div class="val">${escapeHtml(booking.brand ?? "")}</div></div>
      <div class="row"><div class="lbl">Model</div><div class="val">${escapeHtml(booking.model ?? "")}</div></div>
      <div class="row" style="grid-column:1/-1"><div class="lbl">Problem</div><div class="val">${escapeHtml(booking.problem ?? "")}</div></div>
      ${booking.notes ? `<div class="row" style="grid-column:1/-1"><div class="lbl">Customer notes</div><div class="val" style="font-weight:400">${escapeHtml(booking.notes)}</div></div>` : ""}
    </div>
    <h2>Diagnosis / Technician Notes</h2>
    <div class="box"></div>
    <div class="box" style="margin-top:8px"></div>
    <h2>Parts Used / Cost</h2>
    <div class="box"></div>
    <div class="sig">
      <div>Technician signature &amp; date</div>
      <div>Customer signature &amp; date</div>
    </div>
    <script>window.onload=()=>{window.print()}</script>
    </body></html>`);
  w.document.close();
};

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const roleFn = useServerFn(getMyRole);
  const { data: me, isLoading } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => roleFn(),
    staleTime: 30_000,
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isLoading)
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!me?.hasAccess) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <Card className="p-8 text-center space-y-4">
          <h1 className="font-display font-bold text-2xl">Awaiting Approval</h1>
          <p className="text-sm text-muted-foreground">
            Your account <span className="font-mono">{me?.email}</span> is signed in but doesn't
            have admin or staff access yet.
          </p>
          <div className="text-left text-xs bg-muted rounded-lg p-4 font-mono break-all text-center">
            User ID: {me?.userId}
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </Card>
      </div>
    );
  }

  const cmsLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    { to: "/admin/settings", label: "Site Settings", icon: Settings, adminOnly: true },
    { to: "/admin/services", label: "Services", icon: Wrench, adminOnly: true },
    { to: "/admin/devices", label: "Devices", icon: Smartphone, adminOnly: true },
    { to: "/admin/repair-types", label: "Repair Types", icon: Wrench, adminOnly: true },
    { to: "/admin/reviews", label: "Reviews", icon: Star, adminOnly: true },
    { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, adminOnly: true },
    { to: "/admin/gallery", label: "Gallery", icon: ImageIcon, adminOnly: true },
    { to: "/admin/cities", label: "Location Pages", icon: MapPin, adminOnly: true },
  ];

  const isChildRoute = location.pathname !== "/admin" && location.pathname !== "/admin/";

  return (
    <div className="container-x py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {me.email} · {me.isAdmin ? "Admin" : "Staff"}
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>

      {/* CMS Nav */}
      {me.isAdmin && (
        <Card className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pb-2 font-semibold">
            Content Management
          </div>
          <div className="flex flex-wrap gap-2">
            {cmsLinks.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Button key={l.to} asChild size="sm" variant={isActive ? "default" : "outline"}>
                  <Link to={l.to}>
                    <l.icon className="h-3.5 w-3.5 mr-1.5" />
                    {l.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </Card>
      )}

      {isChildRoute ? (
        <Outlet />
      ) : (
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Wrench className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Mail className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="subs" disabled={!me.isAdmin}>
              <Users className="h-4 w-4 mr-2" />
              Subscribers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <OverviewPanel />
          </TabsContent>
          <TabsContent value="bookings" className="mt-6">
            <BookingsPanel />
          </TabsContent>
          <TabsContent value="leads" className="mt-6">
            <LeadsPanel isAdmin={me.isAdmin} />
          </TabsContent>
          <TabsContent value="subs" className="mt-6">
            <SubscribersPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display font-bold text-3xl ${tone ?? ""}`}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}

function OverviewPanel() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fn(),
  });
  if (isLoading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!data) return null;
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Bookings Today" value={data.bookings.today} />
        <StatCard label="This Week" value={data.bookings.week} />
        <StatCard label="Total Bookings" value={data.bookings.total} />
        <StatCard label="Leads" value={data.leads} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending" value={data.bookings.pending} tone="text-amber-600" />
        <StatCard label="In Progress" value={data.bookings.inProgress} tone="text-purple-600" />
        <StatCard label="Ready" value={data.bookings.ready} tone="text-cyan-600" />
        <StatCard label="Completed" value={data.bookings.completed} tone="text-emerald-600" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Cancelled" value={data.bookings.cancelled} />
        <StatCard label="Newsletter" value={data.subscribers} />
      </div>
    </div>
  );
}

function BookingsPanel() {
  const listFn = useServerFn(listBookings);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => listFn(),
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const updateFn = useServerFn(updateBookingStatus);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (p: { id: string; status: Status; status_note?: string }) =>
      updateFn({ data: { id: p.id, status: p.status, status_note: p.status_note ?? null } }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const bookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((b: any) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        (b.booking_ref ?? "").toLowerCase().includes(q) ||
        (b.first_name ?? "").toLowerCase().includes(q) ||
        (b.last_name ?? "").toLowerCase().includes(q) ||
        (b.email ?? "").toLowerCase().includes(q) ||
        (b.phone ?? "").toLowerCase().includes(q) ||
        (b.model ?? "").toLowerCase().includes(q) ||
        (b.brand ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, filter, search]);

  const selected = bookings.find((b: any) => b.id === selectedId) ?? null;

  const exportCsv = () => {
    const rows = [
      [
        "Ref",
        "Created",
        "Name",
        "Email",
        "Phone",
        "Brand",
        "Model",
        "Problem",
        "Service",
        "Status",
      ],
      ...bookings.map((b: any) => [
        b.booking_ref,
        b.created_at,
        `${b.first_name} ${b.last_name}`,
        b.email,
        b.phone,
        b.brand,
        b.model,
        b.problem,
        b.service_type,
        b.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, name, phone, email, model…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", ...STATUSES] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
            className="rounded-full"
          >
            {s === "all" ? "All" : STATUS_META[s].short}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-16 grid place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-16 text-center text-muted-foreground text-sm bg-card border rounded-xl">
          No bookings match.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b: any) => {
            const meta = STATUS_META[b.status] ?? {
              label: b.status,
              className: "",
              short: b.status,
            };
            const colorClass = COLOR_CLASSES[b.status] || "border-border bg-card";
            const cleanedPhone = b.phone?.replace(/\s+/g, "") || "";
            const waUrl = `https://wa.me/${cleanedPhone}?text=Hi%20${encodeURIComponent(b.first_name)},%20this%20is%20MR%20KHAN%20Repairs%20regarding%20your%20${encodeURIComponent(b.brand)}%20${encodeURIComponent(b.model)}%20(Ref:%20${b.booking_ref})...`;

            return (
              <Card
                key={b.id}
                className="overflow-hidden border border-border shadow-sm flex flex-col justify-between"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-muted/30 transition flex-1"
                  onClick={() => setSelectedId(b.id)}
                >
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="font-mono font-bold text-xs bg-muted text-foreground px-2 py-0.5 rounded border border-border">
                      #{b.booking_ref}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="font-display font-bold text-base text-foreground">
                      {b.first_name} {b.last_name}
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Smartphone className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
                      <div>
                        <span className="font-semibold text-foreground">
                          {b.brand} {b.model}
                        </span>
                        <p className="line-clamp-2 mt-0.5 text-[11px]">{b.problem}</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground/80 flex flex-wrap gap-x-2 gap-y-0.5 border-t border-border/50 pt-2 mt-1">
                      <span className="capitalize">{b.service_type?.replace("_", " ")}</span>
                      <span>•</span>
                      <span>
                        {new Date(b.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border bg-muted/20 px-3 py-2 flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex gap-1">
                    {b.status !== "ready_for_collection" &&
                      b.status !== "delivered" &&
                      b.status !== "completed" && (
                        <Button
                          variant="outline"
                          className="h-7 text-[10px] px-2 rounded border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                          onClick={() => mut.mutate({ id: b.id, status: "ready_for_collection" })}
                          disabled={mut.isPending}
                        >
                          Mark Ready
                        </Button>
                      )}
                    {b.status !== "completed" && b.status !== "delivered" && (
                      <Button
                        variant="outline"
                        className="h-7 text-[10px] px-2 rounded border-zinc-500/20 text-zinc-600 bg-zinc-500/5 hover:bg-zinc-500 hover:text-white"
                        onClick={() => mut.mutate({ id: b.id, status: "completed" })}
                        disabled={mut.isPending}
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <a
                      href={`tel:${b.phone}`}
                      className="h-7 w-7 rounded border border-border bg-background grid place-items-center hover:border-accent hover:text-accent transition text-muted-foreground"
                      title="Call Customer"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-7 w-7 rounded border border-border bg-background grid place-items-center hover:border-emerald-500 hover:text-emerald-500 transition text-muted-foreground"
                      title="WhatsApp Update"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => printJobSheet(b)}
                      className="h-7 w-7 rounded border border-border bg-background grid place-items-center hover:border-accent hover:text-accent transition text-muted-foreground"
                      title="Print Job Sheet"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <BookingDrawer booking={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function BookingDrawer({ booking, onClose }: { booking: any; onClose: () => void }) {
  const updateFn = useServerFn(updateBookingStatus);
  const eventsFn = useServerFn(listBookingEvents);
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data: events } = useQuery({
    queryKey: ["admin", "booking-events", booking?.id],
    queryFn: () => eventsFn({ data: { booking_id: booking.id } }),
    enabled: !!booking?.id,
  });

  const mut = useMutation({
    mutationFn: (p: { status: Status; status_note?: string }) =>
      updateFn({ data: { id: booking.id, status: p.status, status_note: p.status_note ?? null } }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["admin", "booking-events", booking?.id] });
      setNote("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const printSheet = () => {
    printJobSheet(booking);
  };

  return (
    <Sheet open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {booking && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between gap-2">
                <span>Booking</span>
                <span className="font-mono text-base bg-muted px-3 py-1 rounded-md">
                  {booking.booking_ref}
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Quick status */}
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Quick status
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => {
                    const active = booking.status === s;
                    const meta = STATUS_META[s];
                    return (
                      <Button
                        key={s}
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className="justify-start"
                        disabled={mut.isPending}
                        onClick={() => mut.mutate({ status: s })}
                      >
                        {active ? (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        ) : (
                          <Circle className="h-4 w-4 mr-2" />
                        )}
                        {meta.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Info label="Customer" value={`${booking.first_name} ${booking.last_name}`} />
                <Info label="Service" value={(booking.service_type ?? "").replace("_", " ")} />
                <Info label="Phone" value={booking.phone} icon={<Phone className="h-3 w-3" />} />
                <Info label="Email" value={booking.email} icon={<Mail className="h-3 w-3" />} />
                <Info
                  label="Device"
                  value={`${booking.brand} ${booking.model}`}
                  icon={<Smartphone className="h-3 w-3" />}
                />
                <Info
                  label="Created"
                  value={new Date(booking.created_at).toLocaleString("en-GB")}
                  icon={<Clock className="h-3 w-3" />}
                />
                {booking.address && (
                  <div className="col-span-2">
                    <Info
                      label="Address"
                      value={`${booking.address}, ${booking.postcode ?? ""}`}
                      icon={<MapPin className="h-3 w-3" />}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Problem reported</Label>
                <div className="text-sm mt-1 p-3 bg-muted rounded-md">{booking.problem}</div>
                {booking.notes && (
                  <>
                    <Label className="mt-3 block">Customer notes</Label>
                    <div className="text-sm mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {booking.notes}
                    </div>
                  </>
                )}
              </div>

              <div>
                <Label>Add note & update</Label>
                <Textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note (saved to timeline)"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => mut.mutate({ status: booking.status, status_note: note })}
                    disabled={!note || mut.isPending}
                  >
                    Save note
                  </Button>
                  <Button size="sm" variant="outline" onClick={printSheet}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Job Sheet
                  </Button>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Timeline
                </Label>
                <div className="mt-2 space-y-3">
                  {(events ?? []).length === 0 ? (
                    <div className="text-xs text-muted-foreground py-4">No events yet.</div>
                  ) : (
                    (events ?? []).map((e: any) => {
                      const meta = STATUS_META[e.status] ?? {
                        label: e.status,
                        className: "",
                        short: e.status,
                      };
                      return (
                        <div key={e.id} className="flex gap-3 text-sm">
                          <div className="mt-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${meta.className} text-xs`}>
                                {meta.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(e.created_at).toLocaleString("en-GB")}
                              </span>
                            </div>
                            {e.note && (
                              <div className="text-xs text-muted-foreground mt-1">{e.note}</div>
                            )}
                            {e.author_email && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                by {e.author_email}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-medium flex items-center gap-1.5 capitalize">
        {icon}
        {value}
      </div>
    </div>
  );
}

function LeadsPanel({ isAdmin }: { isAdmin: boolean }) {
  const fn = useServerFn(listLeads);
  const delFn = useServerFn(deleteLead);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => fn(),
  });
  const mut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Lead removed.");
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed."),
  });

  const filtered = (data ?? []).filter((l: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [l.name, l.email, l.phone, l.device, l.message].some((v: any) =>
      (v ?? "").toLowerCase().includes(q),
    );
  });

  if (isLoading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground text-sm">No leads.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Received</TableHead>
                  {isAdmin && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-xs">
                      {l.email && <div>{l.email}</div>}
                      {l.phone && <div className="text-muted-foreground">{l.phone}</div>}
                    </TableCell>
                    <TableCell className="text-xs">{l.device ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{l.message ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {l.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => mut.mutate(l.id)}
                          disabled={mut.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SubscribersPanel() {
  const fn = useServerFn(listSubscribers);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "subs"], queryFn: () => fn() });
  if (isLoading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  const csv =
    "email,subscribed_at\n" + (data ?? []).map((s: any) => `${s.email},${s.created_at}`).join("\n");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "newsletter-subscribers.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <Card className="overflow-hidden">
        {(data ?? []).length === 0 ? (
          <div className="p-16 text-center text-muted-foreground text-sm">No subscribers yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
