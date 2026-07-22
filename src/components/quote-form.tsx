import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createLead } from "@/lib/booking.functions";

export function QuoteForm({ source = "quote_form" }: { source?: string }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = useServerFn(createLead);
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardContent className="p-8">
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
              setBusy(true);
              try {
                await submit({
                  data: {
                    name: String(fd.get("name") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    device: String(fd.get("device") || ""),
                    message: String(fd.get("message") || ""),
                    source,
                  },
                });
                toast.success("Quote request sent");
                setSent(true);
              } catch {
                toast.error("Please check your details and try again.");
              }
              setBusy(false);
            }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="q-name">Your name</Label>
                <Input id="q-name" name="name" required maxLength={80} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="q-phone">Phone</Label>
                <Input id="q-phone" name="phone" required maxLength={30} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="q-email">Email</Label>
              <Input id="q-email" name="email" type="email" maxLength={255} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="q-device">Device</Label>
              <Input
                id="q-device"
                name="device"
                placeholder="e.g. iPhone 14 Pro"
                maxLength={80}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="q-msg">What's wrong?</Label>
              <Textarea id="q-msg" name="message" rows={4} maxLength={1000} className="mt-1.5" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Get free quote"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to be contacted about your repair.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
