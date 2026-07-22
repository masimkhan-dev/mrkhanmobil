import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/booking.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email) return;
        setBusy(true);
        try {
          await subscribe({ data: { email } });
          toast.success("Subscribed — welcome aboard.");
          setEmail("");
        } catch {
          toast.error("Please enter a valid email.");
        }
        setBusy(false);
      }}
      className="flex gap-2"
    >
      <Input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
      />
      <Button type="submit" disabled={busy} variant="secondary">
        Join
      </Button>
    </form>
  );
}
