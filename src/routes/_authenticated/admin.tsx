import { createFileRoute, Link, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
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
  Menu,
  Bell,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { business } from "@/config/business";

const adminSearchSchema = z.object({
  tab: z.enum(["dashboard", "bookings", "leads", "subs"]).optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: adminSearchSchema,
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
  if (!w) {
    // Most browsers block window.open() calls that are not directly tied to a
    // user gesture, or when the user has popup blocking enabled.
    import("sonner").then(({ toast }) =>
      toast.error("Popup blocked — please allow popups for this site to print job sheets."),
    );
    return;
  }
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

interface SidebarProps {
  me: { email: string | null; isAdmin: boolean };
  activeTab: string;
  onSignOut: () => void;
  onLinkClick?: () => void;
}

function AdminSidebar({ me, activeTab, onSignOut, onLinkClick }: SidebarProps) {
  const location = useLocation();

  const coreLinks = [
    { value: "dashboard", label: "Overview", icon: LayoutDashboard, adminOnly: false },
    { value: "bookings", label: "Bookings", icon: Wrench, adminOnly: false },
    { value: "leads", label: "Leads", icon: Mail, adminOnly: false },
    { value: "subs", label: "Subscribers", icon: Users, adminOnly: true },
  ] as const;

  const cmsLinks = [
    { to: "/admin/settings", label: "Site Settings", icon: Settings, adminOnly: true },
    { to: "/admin/services", label: "Services", icon: Wrench, adminOnly: true },
    { to: "/admin/devices", label: "Devices", icon: Smartphone, adminOnly: true },
    { to: "/admin/repair-types", label: "Repair Types", icon: Wrench, adminOnly: true },
    { to: "/admin/reviews", label: "Reviews", icon: Star, adminOnly: true },
    { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, adminOnly: true },
    { to: "/admin/gallery", label: "Gallery", icon: ImageIcon, adminOnly: true },
    { to: "/admin/cities", label: "Location Pages", icon: MapPin, adminOnly: true },
  ];

  const isMainAdminRoute = location.pathname === "/admin" || location.pathname === "/admin/";

  return (
    <div className="flex flex-col h-full bg-ink-navy text-white font-sans">
      {/* Brand logo */}
      <div className="flex h-20 items-center px-6 border-b border-white/10 gap-3">
        <div className="h-9 w-9 rounded-xl bg-signal-blue flex items-center justify-center p-1.5 font-space font-black text-white text-base shadow-sm shrink-0">
          MK
        </div>
        <div className="leading-tight flex-1">
          <div className="font-space font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            {business.name}
            <span className="inline-block h-2 w-2 rounded-full bg-success-mint animate-pulse" />
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/50 font-bold">
            Admin Portal
          </div>
        </div>
      </div>

      {/* User profile info */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/2 pt-5 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-space font-bold text-xs text-white uppercase shadow-inner shrink-0">
            {(me.email ?? "??").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{me.email ?? "—"}</p>
            <p className="text-[9px] text-white/40 mt-1 font-bold uppercase tracking-wider">
              {me.isAdmin ? "Administrator" : "Staff"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto pr-4 pl-0 py-6 space-y-7">
        {/* Main dashboard tabs */}
        <div className="space-y-1">
          <div className="pl-5 text-[9px] uppercase tracking-widest font-bold text-white/40 mb-3">
            Main Portal
          </div>
          {coreLinks.map((link) => {
            if (link.adminOnly && !me.isAdmin) return null;
            const isTabActive = isMainAdminRoute && activeTab === link.value;

            return (
              <Link
                key={link.value}
                to="/admin"
                search={{ tab: link.value }}
                onClick={onLinkClick}
                className={`group relative flex items-center gap-3.5 pl-5 pr-3 py-2 rounded-r-xl text-xs font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue ${
                  isTabActive
                    ? "bg-white/10 text-white font-semibold shadow-xs"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {isTabActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-signal-blue rounded-r-md" />
                )}
                <div
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                    isTabActive
                      ? "bg-signal-blue/20 text-white shadow-xs"
                      : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* CMS Configuration Links */}
        {me.isAdmin && (
          <div className="space-y-1">
            <div className="pl-5 text-[9px] uppercase tracking-widest font-bold text-white/40 mb-3">
              Content Management
            </div>
            {cmsLinks.map((link) => {
              const isRouteActive = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onLinkClick}
                  className={`group relative flex items-center gap-3.5 pl-5 pr-3 py-2 rounded-r-xl text-xs font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue ${
                    isRouteActive
                      ? "bg-white/10 text-white font-semibold shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isRouteActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-signal-blue rounded-r-md" />
                  )}
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                      isRouteActive
                        ? "bg-signal-blue/20 text-white shadow-xs"
                        : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-white/5 mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start border-white/10 text-rose-400 hover:text-rose-300 hover:bg-white/5 text-xs py-2.5 rounded-xl gap-2.5 font-medium transition-colors cursor-pointer"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const roleFn = useServerFn(getMyRole);
  const { data: me, isLoading } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => roleFn(),
    staleTime: 30_000,
  });

  const { tab, status, q } = Route.useSearch();
  const activeTab = tab ?? "dashboard";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState(q ?? "");

  const bookingsFn = useServerFn(listBookings);
  const {
    data: bookings,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
    isFetching: isFetchingBookings,
  } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => bookingsFn(),
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedBooking = bookings?.find((b: any) => b.id === selectedId) ?? null;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate({
        to: "/admin",
        search: { tab: "bookings", q: globalSearch.trim() },
      });
    }
  };

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
          <h1 className="font-space font-bold text-2xl">Awaiting Approval</h1>
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

  const isChildRoute = location.pathname !== "/admin" && location.pathname !== "/admin/";

  return (
    <div className="min-h-screen bg-soft-white font-sans text-ink-navy">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex h-16 items-center justify-between px-4 border-b border-white/10 bg-ink-navy text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 flex items-center justify-center border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open navigation sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-space font-bold text-base tracking-tight">MR. KHAN Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-400 text-xs px-3 hover:bg-white/5 min-h-[44px]"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-border/40 bg-ink-navy">
        <AdminSidebar me={me} activeTab={activeTab} onSignOut={signOut} />
      </aside>

      {/* Sidebar for Mobile (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-ink-navy border-r-0 text-white">
          <AdminSidebar
            me={me}
            activeTab={activeTab}
            onSignOut={signOut}
            onLinkClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Top Info Bar / Header inside main */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-space font-bold text-2xl md:text-3xl text-ink-navy tracking-tight">
                  {isChildRoute ? "CMS Content Editor" : "MR. KHAN Admin Portal"}
                </h1>
                <div className="flex items-center gap-1.5 bg-success-mint/10 border border-success-mint/20 text-success-mint px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-mint animate-pulse" />
                  System Active
                </div>
              </div>
              <p className="text-xs text-slate-gray font-medium">
                Welcome back, <span className="font-semibold text-ink-navy">{me.email}</span>
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <form
                onSubmit={handleGlobalSearch}
                className="relative flex-1 sm:flex-initial min-w-[200px]"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search bookings..."
                  className="pl-9.5 pr-4 py-1.5 bg-white border border-border/80 rounded-xl text-xs text-ink-navy placeholder:text-slate-gray/70 focus-visible:ring-signal-blue w-full sm:w-60 shadow-xs focus-visible:outline-2"
                />
              </form>
              <button
                className="relative h-9 w-9 rounded-xl border border-border/80 bg-white hover:bg-slate-50 transition grid place-items-center text-ink-navy shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-attention-amber animate-pulse" />
              </button>
            </div>
          </div>

          {/* Content panels */}
          {isChildRoute ? (
            <Outlet />
          ) : (
            <div className="space-y-8">
              {activeTab === "dashboard" && (
                <OverviewPanel
                  onSelectBooking={setSelectedId}
                  bookings={bookings}
                  isBookingsLoading={isBookingsLoading}
                />
              )}
              {activeTab === "bookings" && (
                <BookingsPanel
                  selectedId={selectedId}
                  onSelectBooking={setSelectedId}
                  bookings={bookings ?? []}
                  isLoading={isBookingsLoading}
                  refetch={refetchBookings}
                  isFetching={isFetchingBookings}
                />
              )}
              {activeTab === "leads" && <LeadsPanel isAdmin={me.isAdmin} />}
              {activeTab === "subs" && me.isAdmin && <SubscribersPanel />}
            </div>
          )}
        </main>
      </div>
      <BookingDrawer booking={selectedBooking} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function OverviewPanel({
  onSelectBooking,
  bookings,
  isBookingsLoading,
}: {
  onSelectBooking: (id: string | null) => void;
  bookings: any[] | undefined;
  isBookingsLoading: boolean;
}) {
  const navigate = useNavigate();
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

  const recentBookings = (bookings ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Aligned Subheader Actions */}
      <div className="flex justify-end items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl border-border/80 bg-white hover:bg-slate-50 transition text-xs font-semibold px-4 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {/* 1. Needs Your Attention Row */}
      <div className="bg-attention-amber/5 border border-attention-amber/25 rounded-2xl p-6 shadow-xs">
        <h2 className="font-space font-bold text-sm text-ink-navy mb-4 tracking-wide uppercase">
          Needs Your Attention
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() =>
              navigate({ to: "/admin", search: { tab: "bookings", status: "pending" } })
            }
            className="w-full text-left p-5 bg-white border border-attention-amber/20 hover:border-attention-amber/50 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-gray mb-1">
              Pending Bookings
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-attention-amber">
              {data.bookings.pending}
            </div>
            <div className="text-[11px] text-slate-gray mt-1">
              New bookings awaiting confirmation
            </div>
          </button>

          <button
            onClick={() => navigate({ to: "/admin", search: { tab: "leads" } })}
            className="w-full text-left p-5 bg-white border border-attention-amber/20 hover:border-attention-amber/50 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-gray mb-1">
              New Leads
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-attention-amber">
              {data.leads}
            </div>
            <div className="text-[11px] text-slate-gray mt-1">
              Unresolved customer contact inquiries
            </div>
          </button>
        </div>
      </div>

      {/* 2. Repair Pipeline Tracker */}
      <div className="space-y-4">
        <h2 className="font-space font-bold text-base text-ink-navy tracking-tight">
          Repair Pipeline
        </h2>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Stage 1: Pending */}
          <button
            onClick={() =>
              navigate({ to: "/admin", search: { tab: "bookings", status: "pending" } })
            }
            className="flex-1 text-left p-5 bg-white border border-border/60 hover:border-signal-blue/30 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-attention-amber" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-gray">
                Pending
              </div>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-ink-navy">
              {data.bookings.pending}
            </div>
            <div className="text-[10px] text-slate-gray mt-1.5 font-medium">Awaiting action</div>
          </button>

          <div className="hidden lg:flex shrink-0 items-center justify-center text-slate-gray/30">
            <ArrowRight className="h-5 w-5 animate-pulse" />
          </div>

          {/* Stage 2: In Progress */}
          <button
            onClick={() =>
              navigate({ to: "/admin", search: { tab: "bookings", status: "in_progress" } })
            }
            className="flex-1 text-left p-5 bg-white border border-border/60 hover:border-signal-blue/30 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-gray">
                In Progress
              </div>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-ink-navy">
              {data.bookings.inProgress}
            </div>
            <div className="text-[10px] text-slate-gray mt-1.5 font-medium">Under repair</div>
          </button>

          <div className="hidden lg:flex shrink-0 items-center justify-center text-slate-gray/30">
            <ArrowRight className="h-5 w-5 animate-pulse" />
          </div>

          {/* Stage 3: Ready */}
          <button
            onClick={() =>
              navigate({
                to: "/admin",
                search: { tab: "bookings", status: "ready_for_collection" },
              })
            }
            className="flex-1 text-left p-5 bg-white border border-border/60 hover:border-signal-blue/30 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-gray">
                Ready for Collection
              </div>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-ink-navy">
              {data.bookings.ready}
            </div>
            <div className="text-[10px] text-slate-gray mt-1.5 font-medium">Awaiting pickup</div>
          </button>

          <div className="hidden lg:flex shrink-0 items-center justify-center text-slate-gray/30">
            <ArrowRight className="h-5 w-5 animate-pulse" />
          </div>

          {/* Stage 4: Completed */}
          <button
            onClick={() =>
              navigate({ to: "/admin", search: { tab: "bookings", status: "completed" } })
            }
            className="flex-1 text-left p-5 bg-white border border-border/60 hover:border-signal-blue/30 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-success-mint" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-gray">
                Completed
              </div>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-ink-navy">
              {data.bookings.completed}
            </div>
            <div className="text-[10px] text-slate-gray mt-1.5 font-medium">Done & collected</div>
          </button>
        </div>
      </div>

      {/* 3. Secondary Muted Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => navigate({ to: "/admin", search: { tab: "bookings" } })}
          className="p-4 bg-white border border-border/40 rounded-2xl hover:border-slate-300 hover:shadow-xs transition text-left cursor-pointer transform hover:scale-[1.005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
        >
          <div className="text-[10px] font-bold text-slate-gray uppercase tracking-wider">
            Bookings Today
          </div>
          <div className="text-xl font-mono font-bold mt-1 text-ink-navy">
            {data.bookings.today}
          </div>
        </button>

        <button
          onClick={() => navigate({ to: "/admin", search: { tab: "bookings" } })}
          className="p-4 bg-white border border-border/40 rounded-2xl hover:border-slate-300 hover:shadow-xs transition text-left cursor-pointer transform hover:scale-[1.005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
        >
          <div className="text-[10px] font-bold text-slate-gray uppercase tracking-wider">
            This Week
          </div>
          <div className="text-xl font-mono font-bold mt-1 text-ink-navy">{data.bookings.week}</div>
        </button>

        <button
          onClick={() => navigate({ to: "/admin", search: { tab: "bookings" } })}
          className="p-4 bg-white border border-border/40 rounded-2xl hover:border-slate-300 hover:shadow-xs transition text-left cursor-pointer transform hover:scale-[1.005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
        >
          <div className="text-[10px] font-bold text-slate-gray uppercase tracking-wider">
            Cancelled
          </div>
          <div className="text-xl font-mono font-bold mt-1 text-ink-navy">
            {data.bookings.cancelled}
          </div>
        </button>

        <button
          onClick={() => navigate({ to: "/admin", search: { tab: "subs" } })}
          className="p-4 bg-white border border-border/40 rounded-2xl hover:border-slate-300 hover:shadow-xs transition text-left cursor-pointer transform hover:scale-[1.005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-blue"
        >
          <div className="text-[10px] font-bold text-slate-gray uppercase tracking-wider">
            Subscribers
          </div>
          <div className="text-xl font-mono font-bold mt-1 text-ink-navy">{data.subscribers}</div>
        </button>
      </div>

      {/* 4. Recent Activity Section */}
      <div className="bg-white border border-border/60 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-space font-bold text-base text-ink-navy">Recent Activity</h3>
            <p className="text-xs text-slate-gray mt-0.5">The 5 most recently created bookings</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/admin", search: { tab: "bookings" } })}
            className="text-xs text-signal-blue hover:text-signal-blue/80 hover:bg-signal-blue/5 rounded-xl cursor-pointer"
          >
            View All Bookings
          </Button>
        </div>

        {isBookingsLoading ? (
          <div className="p-10 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-gray" />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-gray">No activity found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border/60 text-slate-gray font-semibold">
                  <th className="px-6 py-3">Ref</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Device</th>
                  <th className="px-6 py-3">Received</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentBookings.map((b: any) => {
                  const meta = STATUS_META[b.status] ?? {
                    label: b.status,
                    className: "",
                    short: b.status,
                  };
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3.5 font-mono font-bold text-ink-navy">
                        #{b.booking_ref}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-ink-navy">
                        {b.first_name} {b.last_name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-gray">
                        {b.brand} {b.model}
                      </td>
                      <td className="px-6 py-3.5 text-slate-gray">
                        {new Date(b.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectBooking(b.id)}
                          className="h-7 text-[10px] px-3 rounded-lg border-border bg-white hover:bg-slate-50 text-ink-navy cursor-pointer"
                        >
                          View Detail
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingsPanel({
  selectedId,
  onSelectBooking,
  bookings,
  isLoading,
  refetch,
  isFetching,
}: {
  selectedId: string | null;
  onSelectBooking: (id: string | null) => void;
  bookings: any[];
  isLoading: boolean;
  refetch: () => void;
  isFetching: boolean;
}) {
  const { status, q } = Route.useSearch();
  const [filter, setFilter] = useState<string>(status ?? "all");
  const [search, setSearch] = useState(q ?? "");

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

  // Sync state with URL parameter changes:
  useEffect(() => {
    if (status) {
      setFilter(status);
    }
  }, [status]);

  useEffect(() => {
    if (q !== undefined) {
      setSearch(q);
    }
  }, [q]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((b: any) => {
      // Custom filters for In Progress grouping
      if (filter === "in_progress") {
        if (!["diagnosing", "waiting_parts", "repair_started"].includes(b.status)) return false;
      } else if (filter !== "all" && b.status !== filter) {
        return false;
      }

      if (!query) return true;
      return (
        (b.booking_ref ?? "").toLowerCase().includes(query) ||
        (b.first_name ?? "").toLowerCase().includes(query) ||
        (b.last_name ?? "").toLowerCase().includes(query) ||
        (b.email ?? "").toLowerCase().includes(query) ||
        (b.phone ?? "").toLowerCase().includes(query) ||
        (b.model ?? "").toLowerCase().includes(query) ||
        (b.brand ?? "").toLowerCase().includes(query)
      );
    });
  }, [bookings, filter, search]);

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
      ...filteredBookings.map((b: any) => [
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
        {(
          [
            "all",
            "pending",
            "in_progress",
            "ready_for_collection",
            "completed",
            "cancelled",
          ] as const
        ).map((s) => {
          const label =
            s === "all"
              ? "All"
              : s === "in_progress"
                ? "In Progress"
                : (STATUS_META[s]?.short ?? s);
          return (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
              className="rounded-full"
            >
              {label}
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-16 grid place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl space-y-2">
          <div className="font-semibold text-base text-foreground">No repair tickets found</div>
          <p className="text-xs max-w-md mx-auto text-muted-foreground">
            There are currently no repair tickets matching your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((b: any) => {
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
                  onClick={() => onSelectBooking(b.id)}
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
                      href={`tel:${b.phone?.replace(/\s+/g, "")}`}
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
