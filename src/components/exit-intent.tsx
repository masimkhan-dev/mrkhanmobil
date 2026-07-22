import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("mk_exit_shown")) return;
    let timer: ReturnType<typeof setTimeout>;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        sessionStorage.setItem("mk_exit_shown", "1");
        setOpen(true);
        document.removeEventListener("mouseleave", onLeave);
      }
    };
    timer = setTimeout(() => document.addEventListener("mouseleave", onLeave), 8000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95 }}
            className="relative bg-card rounded-2xl max-w-md w-full p-8 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-12 w-12 rounded-full bg-accent/10 text-accent grid place-items-center">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display font-bold text-2xl">
              Wait — get 10% off your first repair
            </h3>
            <p className="mt-2 text-muted-foreground">
              Book online today and mention{" "}
              <span className="font-semibold text-foreground">WELCOME10</span> at checkout.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="flex-1">
                <Link to="/book" onClick={() => setOpen(false)}>
                  Book now
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                No thanks
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
