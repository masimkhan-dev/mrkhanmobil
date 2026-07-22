import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackBooking } from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Circle, Search, Ban, Calendar, RefreshCw } from "lucide-react";
import { business } from "@/config/business";
import { motion } from "framer-motion";

const TIMELINE_STEPS = [
  { key: "received", label: "Booking Received", desc: "We have registered your repair request." },
  {
    key: "device_received",
    label: "Device Received",
    desc: "Your device has arrived at our workshop.",
  },
  {
    key: "diagnosing",
    label: "Diagnosis",
    desc: "Our engineers are testing and diagnosing the issue.",
  },
  { key: "repairing", label: "Repair Started", desc: "We are actively repairing your device." },
  {
    key: "qc",
    label: "Quality Check",
    desc: "Testing all functions to ensure everything works perfectly.",
  },
  {
    key: "ready",
    label: "Ready for Collection",
    desc: "Your device is ready to collect or return by courier.",
  },
  {
    key: "collected",
    label: "Collected / Delivered",
    desc: "Repair complete! Device has been picked up/delivered.",
  },
];

type Booking = {
  booking_ref: string;
  device_type: string;
  brand: string;
  model: string;
  service_type: string;
  status: string;
  status_note: string | null;
  updated_at: string;
  created_at: string;
};

export const Route = createFileRoute("/track")({
  head: () => {
    const siteUrl = process.env.SITE_URL || business.url;
    return {
      meta: [
        { title: `Track Your Repair | ${business.name}` },
        {
          name: "description",
          content:
            "Track your repair by entering your booking reference. Real-time status updates from received to ready for collection.",
        },
        { property: "og:url", content: `${siteUrl}/track` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/track` }],
    };
  },
  component: TrackPage,
});

function TrackPage() {
  const searchParams = Route.useSearch() as any;
  const [ref, setRef] = useState(searchParams?.ref || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ found: false } | { found: true; booking: Booking } | null>(
    null,
  );
  const track = useServerFn(trackBooking);

  const go = async (customRef?: string) => {
    const targetRef = customRef || ref;
    if (!targetRef) return;
    setBusy(true);
    try {
      const res = await track({ data: { ref: targetRef } });
      setResult(res as typeof result);
    } catch {
      setResult({ found: false });
    }
    setBusy(false);
  };

  useEffect(() => {
    if (searchParams?.ref) {
      go(searchParams.ref);
    }
  }, [searchParams?.ref]);

  const getActiveIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "diagnosing":
        return 2;
      case "waiting_parts":
        return 2; // Still in diagnosing/waiting parts
      case "repair_started":
        return 3;
      case "completed":
        return 4;
      case "ready_for_collection":
        return 5;
      case "delivered":
        return 6;
      default:
        return 0;
    }
  };

  const activeIdx = result?.found ? getActiveIndex(result.booking.status) : -1;
  const isCancelled = result?.found && result.booking.status === "cancelled";

  return (
    <section className="py-16 md:py-24">
      <div className="container-x max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Repair Status</p>
        <h1 className="mt-2 font-display font-bold text-4xl md:text-5xl">Track your repair</h1>
        <p className="mt-3 text-muted-foreground">
          Enter your booking reference to see live status.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
          className="mt-8 flex gap-2"
        >
          <Input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. MK-XXXXXX"
            className="text-lg h-12"
            aria-label="Booking reference"
          />
          <Button type="submit" size="lg" disabled={busy}>
            <Search className="h-4 w-4 mr-2" />
            {busy ? "Tracking…" : "Track"}
          </Button>
        </form>

        {result && !result.found && (
          <Card className="mt-8 border-warning/40 bg-warning/5">
            <CardContent className="p-6">
              <div className="font-semibold">Reference not found</div>
              <p className="text-sm text-muted-foreground mt-1">
                Double-check the code, or WhatsApp us — we'll find it.
              </p>
            </CardContent>
          </Card>
        )}

        {result?.found && (
          <Card className="mt-8 overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start pb-6 border-b border-border">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Reference
                  </div>
                  <div className="font-display font-bold text-2xl tracking-wider text-accent">
                    {result.booking.booking_ref}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <span className="font-semibold text-foreground">
                    {result.booking.brand} {result.booking.model}
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {result.booking.service_type.replace("_", " ")}
                  </div>
                </div>
              </div>

              {isCancelled ? (
                <div className="p-5 rounded-2xl border border-destructive/20 bg-destructive/5 flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-destructive/15 text-destructive grid place-items-center shrink-0">
                    <Ban className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-destructive">Booking Cancelled</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This booking has been marked as cancelled. If you have questions, please
                      WhatsApp us.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-7 border-l-2 border-dashed border-border/80 space-y-6 ml-3 py-1">
                  {TIMELINE_STEPS.map((s, idx) => {
                    const done = idx <= activeIdx;
                    const current = idx === activeIdx;
                    return (
                      <div key={s.key} className="relative">
                        {/* Circle marker */}
                        <span
                          className={`absolute -left-[39px] top-0.5 h-6 w-6 rounded-full border-2 grid place-items-center transition-all ${
                            done
                              ? current
                                ? "border-accent bg-accent text-accent-foreground shadow-[0_0_8px_rgba(var(--color-accent),0.4)] animate-pulse"
                                : "border-emerald-500 bg-emerald-500 text-white"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {done && !current ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <div
                              className={`h-2 w-2 rounded-full ${current ? "bg-white" : "bg-muted-foreground/60"}`}
                            />
                          )}
                        </span>

                        <div>
                          <div
                            className={`font-semibold text-sm ${done ? "text-foreground" : "text-muted-foreground/60"}`}
                          >
                            {s.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>

                          {current && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3"
                            >
                              {result.booking.status === "waiting_parts" && (
                                <div className="mb-2 text-xs bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2.5 py-1 rounded-md inline-block font-semibold">
                                  ⏳ Awaiting Part Delivery
                                </div>
                              )}
                              {result.booking.status_note && (
                                <div className="text-xs bg-muted p-3.5 rounded-xl border border-border inline-block max-w-full text-foreground/80 leading-relaxed">
                                  <span className="font-semibold text-[10px] text-accent uppercase tracking-wider block mb-1">
                                    Technician Comment
                                  </span>
                                  {result.booking.status_note}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Booked {new Date(result.booking.created_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    Updated {new Date(result.booking.updated_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
