import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createLead } from "@/lib/booking.functions";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { ErrorBoundary } from "@/components/error-boundary";

export function QuoteForm({ source = "quote_form" }: { source?: string }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [started, setStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const submit = useServerFn(createLead);

  const handleStart = () => {
    if (!started) {
      setStarted(true);
      trackFunnelEvent("quote_start", { source });
    }
  };

  return (
    <ErrorBoundary fallbackText="Something went wrong loading the quote form. Please refresh.">
      <Card className="border-border/70 shadow-[var(--shadow-soft)]" id="quote">
        <CardContent className="p-5 sm:p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-2xl font-display font-semibold">Thanks — we'll be in touch.</div>
              <p className="text-muted-foreground mt-2">
                We usually reply within an hour during business hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (fd.get("website_hp")) {
                  console.warn("Honeypot triggered, ignoring quote submission");
                  setSent(true);
                  return;
                }
                if (!agreed) {
                  toast.error("Please agree to the Privacy Policy and Terms of Service.");
                  return;
                }
                setBusy(true);

                const name = String(fd.get("name") || "");
                const phone = String(fd.get("phone") || "");
                const device = String(fd.get("device") || "");
                const message = String(fd.get("message") || "");

                const waMessage = `Hi MR. KHAN, I'd like a quote for ${device}${message ? ` — ${message}` : ""}. Name: ${name}, Phone: ${phone}.`;
                window.open(`https://wa.me/447707733038?text=${encodeURIComponent(waMessage)}`, "_blank");
                toast.success("Quote request sent on WhatsApp!");

                try {
                  await submit({
                    data: {
                      name,
                      email: String(fd.get("email") || ""),
                      phone,
                      device,
                      message,
                      source,
                    },
                  });
                  trackFunnelEvent("quote_submit", { source });
                  setSent(true);
                } catch {
                  setSent(true);
                }
                setBusy(false);
              }}
              onFocus={handleStart}
              className="space-y-4"
            >
              <input type="text" name="website_hp" className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="q-name">
                    Your name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="q-name" name="name" required maxLength={80} placeholder="e.g. John Smith" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="q-phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input id="q-phone" name="phone" type="tel" required maxLength={30} placeholder="07707 733038" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="q-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="q-email" name="email" type="email" required maxLength={255} placeholder="john@example.co.uk" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="q-device">
                  Device <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="q-device"
                  name="device"
                  required
                  placeholder="e.g. iPhone 14 Pro"
                  maxLength={80}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="q-msg">What's wrong?</Label>
                <Textarea id="q-msg" name="message" rows={4} maxLength={1000} placeholder="Describe screen crack, battery drain, or issue..." className="mt-1.5" />
              </div>

              <div className="pt-1 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="q-privacy"
                    checked={agreed}
                    onCheckedChange={(c) => setAgreed(Boolean(c))}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="q-privacy"
                    className="text-xs leading-normal text-muted-foreground cursor-pointer font-normal"
                  >
                    I agree to the{" "}
                    <Link to="/privacy" className="text-accent underline font-semibold hover:text-accent/80">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link to="/terms" className="text-accent underline font-semibold hover:text-accent/80">
                      Terms of Service
                    </Link>
                  </Label>
                </div>
              </div>

              <Button type="submit" disabled={busy} className="w-full font-semibold min-h-[44px] bg-[#25D366] hover:bg-[#20ba5a] text-white">
                {busy ? "Preparing Request..." : "Get Quote on WhatsApp"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
