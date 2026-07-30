import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/booking.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  if (subscribed) {
    return (
      <div className="p-3.5 rounded-xl bg-success/20 border border-success/30 text-success-foreground text-sm font-medium">
        ✓ Subscribed! Thank you.
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email) return;
        if (!agreed) {
          toast.error("Please consent to receive marketing emails to subscribe.");
          return;
        }
        setBusy(true);
        try {
          await subscribe({ data: { email } });
          toast.success("Subscribed — welcome aboard.");
          setEmail("");
          setAgreed(false);
          setSubscribed(true);
        } catch {
          toast.error("Please enter a valid email.");
        }
        setBusy(false);
      }}
      className="space-y-2.5"
    >
      <div className="flex gap-2">
        <Input
          type="email"
          required
          aria-label="Email address for newsletter updates"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
        />
        <Button type="submit" disabled={busy || !agreed} variant="secondary">
          Join
        </Button>
      </div>

      <div className="flex items-start gap-2 pt-0.5">
        <Checkbox
          id="news-privacy"
          checked={agreed}
          onCheckedChange={(c) => setAgreed(Boolean(c))}
          className="mt-0.5 border-primary-foreground/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
        />
        <Label
          htmlFor="news-privacy"
          className="text-[11px] leading-tight text-primary-foreground/80 cursor-pointer font-normal"
        >
          I consent to receive marketing emails about offers and services. You can unsubscribe at
          any time. Read our{" "}
          <Link to="/privacy" className="underline hover:text-white font-medium">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>
    </form>
  );
}
