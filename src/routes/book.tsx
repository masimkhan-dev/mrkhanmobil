import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Smartphone,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { brands, problems } from "@/config/services";
import { business } from "@/config/business";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({
  head: () => {
    const siteUrl = process.env.SITE_URL || "https://mrkhan-repairs.co.uk";
    return {
      meta: [
        { title: `Book a Repair | ${business.name}` },
        {
          name: "description",
          content:
            "Book your mobile phone repair online in 60 seconds. Walk-in, home visit or mail-in. Same-day service across the UK.",
        },
        { property: "og:url", content: `${siteUrl}/book` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/book` }],
    };
  },
  component: BookPage,
});

type BookingData = {
  device_type: string;
  brand: string;
  model: string;
  problem: string;
  service_type: "walk_in" | "home_visit" | "mail_in";
  preferred_date: string;
  preferred_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  notes: string;
};

const emptyBooking: BookingData = {
  device_type: "phone",
  brand: "",
  model: "",
  problem: "",
  service_type: "walk_in",
  preferred_date: "",
  preferred_time: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  postcode: "",
  city: "",
  notes: "",
};

const stepLabels = ["Device & Problem", "Service & Appointment", "Contact Details"];

const brandModels: Record<string, string[]> = {
  Apple: [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13",
    "iPhone 12 Pro Max",
    "iPhone 12",
    "iPhone 11 Pro Max",
    "iPhone 11",
    "iPhone SE (2022)",
  ],
  Samsung: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23",
    "Galaxy S22 Ultra",
    "Galaxy S22",
    "Galaxy A54",
    "Galaxy A34",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
  ],
  Google: [
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 6 Pro",
    "Pixel 6",
    "Pixel 7a",
    "Pixel 6a",
  ],
  Huawei: ["P60 Pro", "P50 Pro", "Mate 50 Pro", "P40 Pro", "P30 Pro"],
  Xiaomi: ["Xiaomi 14 Ultra", "Xiaomi 13 Pro", "Redmi Note 13 Pro", "Poco F5 Pro", "Redmi Note 12"],
  Oppo: ["Find X5 Pro", "Reno 10 Pro", "Find N2 Flip", "Oppo A78"],
  OnePlus: ["OnePlus 12", "OnePlus 11", "OnePlus 10 Pro", "OnePlus Nord 3"],
};

const brandEmojis: Record<string, string> = {
  Apple: "🍎 Apple",
  Samsung: "📱 Samsung",
  Google: "🤖 Google",
  Huawei: "🌸 Huawei",
  Xiaomi: "🍊 Xiaomi",
  Oppo: "🟢 Oppo",
  OnePlus: "➕ OnePlus",
  Honor: "💎 Honor",
  Sony: "🎥 Sony",
  Nokia: "🧱 Nokia",
  Motorola: "🦇 Motorola",
};

const estimateMap: Record<string, { price: string; time: string; warranty: string }> = {
  "Cracked screen": { price: "£79", time: "45 Mins", warranty: "12 Months" },
  "Battery drains fast": { price: "£39", time: "30 Mins", warranty: "12 Months" },
  "Won't charge": { price: "£45", time: "45 Mins", warranty: "12 Months" },
  "Water damage": { price: "£45", time: "24-72 Hours", warranty: "No Fix No Fee" },
  "No sound / speaker": { price: "£35", time: "45 Mins", warranty: "12 Months" },
  "Camera not working": { price: "£49", time: "45 Mins", warranty: "12 Months" },
  "Microphone issue": { price: "£35", time: "45 Mins", warranty: "12 Months" },
  "Software / boot loop": { price: "£29", time: "1-2 Hours", warranty: "12 Months" },
  "Data recovery": { price: "£59", time: "24-72 Hours", warranty: "No Data No Fee" },
  "Back glass cracked": { price: "£49", time: "1-2 Hours", warranty: "12 Months" },
  Other: { price: "£29", time: "Diagnostics", warranty: "12 Months" },
};

function BookPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookingData>(emptyBooking);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customModel, setCustomModel] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(createBooking);

  const update = (patch: Partial<BookingData>) => {
    setData((d) => {
      const nextData = { ...d, ...patch };
      // Real-time validation
      const newErrors: Record<string, string> = { ...errors };
      if (patch.model !== undefined) {
        if (patch.model.trim().length > 0 && patch.model.trim().length < 2) {
          newErrors.model = "Model must be at least 2 characters.";
        } else {
          delete newErrors.model;
        }
      }
      if (patch.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (patch.email.trim().length > 0 && !emailRegex.test(patch.email)) {
          newErrors.email = "Please enter a valid email address.";
        } else {
          delete newErrors.email;
        }
      }
      if (patch.phone !== undefined) {
        if (patch.phone.trim().length > 0 && patch.phone.trim().length < 6) {
          newErrors.phone = "Phone must be at least 6 digits.";
        } else {
          delete newErrors.phone;
        }
      }
      setErrors(newErrors);
      return nextData;
    });
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return !!data.brand && !!data.model && data.model.trim().length >= 2 && !!data.problem;
      case 1:
        return !!data.service_type;
      case 2: {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const basicDetails =
          !!data.first_name &&
          !!data.last_name &&
          emailRegex.test(data.email) &&
          !!data.phone &&
          data.phone.trim().length >= 6;
        if (data.service_type !== "walk_in") {
          return (
            basicDetails && !!data.address?.trim() && !!data.postcode?.trim() && !!data.city?.trim()
          );
        }
        return basicDetails;
      }
      default:
        return true;
    }
  };

  const onSubmit = async () => {
    setBusy(true);
    try {
      const res = await submit({
        data: {
          ...data,
          preferred_date: data.preferred_date || null,
          preferred_time: data.preferred_time || null,
          address: data.address || null,
          postcode: data.postcode || null,
          city: data.city || null,
          notes: data.notes || null,
        },
      });
      setRef(res.booking_ref);
    } catch (e) {
      toast.error("Something went wrong — please try again or WhatsApp us.");
    }
    setBusy(false);
  };

  if (ref) return <BookingConfirmation reference={ref} data={data} />;

  const progress = ((step + 1) / stepLabels.length) * 100;
  const estimate = data.problem ? estimateMap[data.problem] : null;

  return (
    <section className="py-12 md:py-16">
      <div className="container-x max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Book a Repair</p>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-5xl">Fixed in 60 seconds</h1>
        <p className="mt-2 text-muted-foreground">
          Step {step + 1} of {stepLabels.length}: {stepLabels[step]}
        </p>

        <Progress value={progress} className="mt-6" />

        <Card className="mt-8">
          <CardContent className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display font-semibold text-2xl mb-4">1. Choose Brand</h2>
                      <div className="flex flex-wrap gap-2">
                        {brands.map((b) => {
                          const active = data.brand === b;
                          return (
                            <button
                              key={b}
                              onClick={() => {
                                update({ brand: b, model: "" });
                                setCustomModel(false);
                              }}
                              className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
                                active
                                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                                  : "border-border hover:border-accent bg-background"
                              }`}
                            >
                              {brandEmojis[b] || b}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {data.brand && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="font-display font-semibold text-2xl mb-4">
                          2. Choose Model
                        </h2>
                        {!customModel ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {(brandModels[data.brand] || []).map((m) => {
                                const active = data.model === m;
                                return (
                                  <button
                                    key={m}
                                    onClick={() => update({ model: m })}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                                      active
                                        ? "border-accent bg-accent/5 text-accent font-semibold"
                                        : "border-border hover:border-accent bg-background text-foreground/80"
                                    }`}
                                  >
                                    {m}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => {
                                  setCustomModel(true);
                                  update({ model: "" });
                                }}
                                className="p-3 rounded-xl border border-dashed border-border hover:border-accent hover:bg-accent/5 text-sm font-medium text-muted-foreground transition-all"
                              >
                                ✏️ Other Model
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Label htmlFor="custom-model">Type your Model</Label>
                            <div className="flex gap-2">
                              <Input
                                id="custom-model"
                                value={data.model}
                                onChange={(e) => update({ model: e.target.value })}
                                placeholder="e.g. iPhone 15 Pro, Galaxy S23"
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCustomModel(false);
                                  update({ model: "" });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                            {errors.model && (
                              <p className="text-xs text-destructive">{errors.model}</p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {data.model && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="font-display font-semibold text-2xl mb-4">
                          3. Choose Problem
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                          {problems.map((p) => {
                            const active = data.problem === p;
                            return (
                              <button
                                key={p}
                                onClick={() => update({ problem: p })}
                                className={`p-3.5 rounded-xl border text-left text-sm transition-all ${
                                  active
                                    ? "border-accent bg-accent/5 text-accent font-semibold"
                                    : "border-border hover:border-accent bg-background text-foreground/80"
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {estimate && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 flex items-center justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                              Estimated Price
                            </div>
                            <div className="mt-1 font-display font-bold text-3xl text-accent">
                              {estimate.price}
                            </div>
                          </div>
                          <div className="text-right text-xs space-y-1.5 text-muted-foreground">
                            <div className="flex items-center justify-end gap-1.5 font-semibold text-foreground">
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />{" "}
                              {estimate.warranty} Warranty
                            </div>
                            <div className="flex items-center justify-end gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Fix in {estimate.time}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 1 && <StepService data={data} update={update} />}
                {step === 2 && (
                  <div className="space-y-6">
                    <StepDetails data={data} update={update} errors={errors} />
                    <div className="border-t border-border pt-6">
                      <Label htmlFor="p-notes">Add details / special instructions (optional)</Label>
                      <Textarea
                        id="p-notes"
                        value={data.notes}
                        onChange={(e) => update({ notes: e.target.value })}
                        rows={2}
                        className="mt-2"
                        maxLength={1000}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < stepLabels.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={onSubmit} disabled={!canNext() || busy} size="lg" className="px-8">
                  {busy ? "Confirming…" : "Book Repair"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StepService({
  data,
  update,
}: {
  data: BookingData;
  update: (p: Partial<BookingData>) => void;
}) {
  const opts = [
    {
      key: "walk_in",
      title: "Walk-in",
      desc: "Drop in at our branch — most repairs while you wait.",
    },
    {
      key: "home_visit",
      title: "Home Visit",
      desc: "Our engineer comes to you (North West only).",
    },
    { key: "mail_in", title: "Mail-in", desc: "Free UK-wide courier collection & tracked return." },
  ];
  return (
    <div className="space-y-6">
      <h2 className="font-display font-semibold text-2xl">Choose service type</h2>
      <RadioGroup
        value={data.service_type}
        onValueChange={(v) => update({ service_type: v as BookingData["service_type"] })}
        className="space-y-3"
      >
        {opts.map((o) => (
          <label
            key={o.key}
            className={`flex gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${data.service_type === o.key ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
          >
            <RadioGroupItem value={o.key} className="mt-1" />
            <div>
              <div className="font-semibold text-sm">{o.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
            </div>
          </label>
        ))}
      </RadioGroup>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Preferred date</Label>
          <Input
            id="date"
            type="date"
            value={data.preferred_date}
            onChange={(e) => update({ preferred_date: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="time">Preferred time</Label>
          <Input
            id="time"
            placeholder="e.g. Morning / 2pm"
            value={data.preferred_time}
            onChange={(e) => update({ preferred_time: e.target.value })}
            className="mt-2"
            maxLength={20}
          />
        </div>
      </div>
    </div>
  );
}

function StepDetails({
  data,
  update,
  errors,
}: {
  data: BookingData;
  update: (p: Partial<BookingData>) => void;
  errors: Record<string, string>;
}) {
  const needsAddress = data.service_type !== "walk_in";
  return (
    <div>
      <h2 className="font-display font-semibold text-2xl mb-4">Your details</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            value={data.first_name}
            onChange={(e) => update({ first_name: e.target.value })}
            required
            maxLength={50}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            value={data.last_name}
            onChange={(e) => update({ last_name: e.target.value })}
            required
            maxLength={50}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            required
            maxLength={255}
            className="mt-2"
          />
          {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            required
            maxLength={30}
            className="mt-2"
          />
          {errors.phone && <p className="text-xs text-destructive mt-1.5">{errors.phone}</p>}
        </div>
        {needsAddress && (
          <>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={data.address}
                onChange={(e) => update({ address: e.target.value })}
                maxLength={300}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={data.postcode}
                onChange={(e) => update({ postcode: e.target.value })}
                maxLength={20}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => update({ city: e.target.value })}
                maxLength={80}
                className="mt-2"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BookingConfirmation({ reference, data }: { reference: string; data: BookingData }) {
  return (
    <section className="py-20">
      <div className="container-x max-w-2xl text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/15 text-success grid place-items-center">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display font-bold text-4xl">Booking confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks {data.first_name} — we've received your repair request and will contact you
          shortly.
        </p>

        <div className="mt-10 bg-card border border-border rounded-2xl p-8 text-left">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Your booking reference
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="font-display font-bold text-3xl tracking-wider">{reference}</div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(reference);
                toast.success("Copied");
              }}
            >
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Save this reference — you can track your repair status any time with it.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/track" search={{ ref: reference } as never}>
              Track my repair
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
