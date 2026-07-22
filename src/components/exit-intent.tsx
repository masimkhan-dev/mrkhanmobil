import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { X, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLead } from "@/lib/booking.functions";
import { toast } from "sonner";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submitLead = useServerFn(createLead);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Desktop only: check screen width
    if (window.innerWidth < 768) return;
    if (sessionStorage.getItem("mk_exit_shown")) return;

    let timer: ReturnType<typeof setTimeout>;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        sessionStorage.setItem("mk_exit_shown", "1");
        setOpen(true);
        document.removeEventListener("mouseleave", onLeave);
      }
    };

    // Wait 5 seconds after load before enabling listener
    timer = setTimeout(() => {
      document.addEventListener("mouseleave", onLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submitLead({
        data: {
          name: String(fd.get("name") || ""),
          phone: String(fd.get("phone") || ""),
          device: String(fd.get("device") || ""),
          email: "",
          message: "Exit-intent quote request",
          source: "exit_intent_modal",
        },
      });
      toast.success("Quote request sent!");
      trackFunnelEvent("quote_submit", { source: "exit_intent_modal" });
      setSent(true);
    } catch {
      toast.error("Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.93, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {sent ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground">
                  Quote Request Sent!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  We'll reply with a fixed price estimate within an hour during business hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
                  Quick Free Quote
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground leading-snug">
                  Before you go — get a free repair quote in 60 seconds
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  Tell us your device and phone number — we'll send a no-obligation quote right
                  away.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
                  <div>
                    <Label htmlFor="exit-name" className="text-xs font-semibold">
                      Your Name
                    </Label>
                    <Input
                      id="exit-name"
                      name="name"
                      required
                      placeholder="e.g. John Smith"
                      maxLength={80}
                      className="mt-1.5 rounded-xl bg-background"
                      onFocus={() =>
                        trackFunnelEvent("quote_start", { source: "exit_intent_modal" })
                      }
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exit-phone" className="text-xs font-semibold">
                        Phone Number
                      </Label>
                      <Input
                        id="exit-phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="e.g. 07123 456789"
                        maxLength={30}
                        className="mt-1.5 rounded-xl bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exit-device" className="text-xs font-semibold">
                        Device & Issue
                      </Label>
                      <Input
                        id="exit-device"
                        name="device"
                        required
                        placeholder="e.g. iPhone 13 Screen"
                        maxLength={80}
                        className="mt-1.5 rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                      disabled={busy}
                    >
                      {busy ? "Sending…" : "Get My Free Quote"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-xl text-xs text-muted-foreground"
                      onClick={() => setOpen(false)}
                    >
                      No thanks
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    No spam. 100% free & confidential quote.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
