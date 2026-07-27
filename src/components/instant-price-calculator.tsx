import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, ChevronRight, ShieldCheck, Clock, CheckCircle2, Wrench } from "lucide-react";

const REPAIR_DATA: Record<string, { models: string[]; basePrice: number }> = {
  Apple: {
    models: [
      "iPhone 15 Pro Max",
      "iPhone 15 Pro",
      "iPhone 15",
      "iPhone 14 Pro Max",
      "iPhone 14",
      "iPhone 13",
      "iPhone 12",
      "iPhone 11",
    ],
    basePrice: 45,
  },
  Samsung: {
    models: [
      "Galaxy S24 Ultra",
      "Galaxy S24",
      "Galaxy S23 Ultra",
      "Galaxy S22",
      "Galaxy A54",
      "Galaxy Z Flip 5",
    ],
    basePrice: 49,
  },
  "Google Pixel": {
    models: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7 Pro", "Pixel 6a"],
    basePrice: 45,
  },
  OnePlus: {
    models: ["OnePlus 12", "OnePlus 11", "OnePlus 10 Pro", "OnePlus Nord 3"],
    basePrice: 39,
  },
};

const ISSUES: Record<string, { multiplier: number; duration: string }> = {
  "Screen Replacement (OLED)": { multiplier: 1.4, duration: "30-45 mins" },
  "Battery Replacement": { multiplier: 0.8, duration: "20-30 mins" },
  "Charging Port Repair": { multiplier: 0.9, duration: "30 mins" },
  "Rear Camera Repair": { multiplier: 1.1, duration: "45 mins" },
  "Back Glass Replacement": { multiplier: 1.2, duration: "60 mins" },
  "Water Damage Diagnostic": { multiplier: 0.5, duration: "Same day" },
};

export function InstantPriceCalculator() {
  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [selectedModel, setSelectedModel] = useState("iPhone 15 Pro");
  const [selectedIssue, setSelectedIssue] = useState("Screen Replacement (OLED)");

  const base = REPAIR_DATA[selectedBrand]?.basePrice ?? 45;
  const issueMeta = ISSUES[selectedIssue] ?? { multiplier: 1, duration: "30-45 mins" };
  const estimatedPrice = Math.round(base * issueMeta.multiplier);

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge
            variant="secondary"
            className="mb-3 rounded-full py-1 px-3.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 gap-1.5"
          >
            <Calculator className="h-3.5 w-3.5" />
            Instant Cost Estimator
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-foreground">
            Calculate Your Repair{" "}
            <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
              Price
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Select your device and repair issue to see an estimated price.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-border shadow-xl rounded-3xl overflow-hidden bg-card/60 backdrop-blur">
          <CardContent className="p-4 sm:p-8 grid md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Selector Controls */}
            <div className="md:col-span-7 space-y-5">
              {/* Brand Selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  1. Select Brand
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(REPAIR_DATA).map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        setSelectedBrand(brand);
                        setSelectedModel(REPAIR_DATA[brand].models[0]);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center ${
                        selectedBrand === brand
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  2. Select Model
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scroller-smooth">
                  {(REPAIR_DATA[selectedBrand]?.models ?? []).map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all min-h-[40px] flex items-center justify-center ${
                        selectedModel === model
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  3. Select Repair Issue
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.keys(ISSUES).map((issue) => (
                    <button
                      key={issue}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-3.5 rounded-xl text-xs text-left border font-medium transition-all min-h-[44px] flex items-center justify-between ${
                        selectedIssue === issue
                          ? "border-indigo-600 bg-indigo-500/10 text-foreground font-semibold"
                          : "border-border/60 hover:border-border text-muted-foreground"
                      }`}
                    >
                      <span>{issue}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Estimated Output Card */}
            <div className="md:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-5 shadow-inner border border-white/10">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  Estimated Repair Cost
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">£{estimatedPrice}</span>
                  <span className="text-xs text-slate-400">Including VAT and Labour</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Device:</span>
                  <span className="font-semibold text-white">{selectedModel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Repair Time:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {issueMeta.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Warranty:</span>
                  <span className="font-semibold text-indigo-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    12-Month Warranty
                  </span>
                </div>
              </div>

              <Button
                asChild
                className="w-full rounded-xl h-12 text-sm font-semibold"
              >
                <Link to="/book">
                  Book This Repair <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>

              <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Free Diagnosis. No Repair If We Can't Fix It.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
