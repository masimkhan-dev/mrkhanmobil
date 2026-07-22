import { useState, useRef, useCallback } from "react";
import screenBefore from "@/assets/screen_before.png";
import screenAfter from "@/assets/screen_after.png";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeftRight } from "lucide-react";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="container-x relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge
            variant="secondary"
            className="mb-3 rounded-full py-1 px-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Before & After Precision Repair
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            See The{" "}
            <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              Transformation
            </span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Drag the slider to see how our express same-day screen replacement restores damaged
            devices to factory perfection.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div
            ref={containerRef}
            className="relative h-[320px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl bg-slate-900"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Pristine) - Full background */}
            <img
              src={screenAfter}
              alt="Repaired phone screen"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-emerald-500/90 text-white font-semibold shadow-md border-0 px-3 py-1">
                AFTER: Restored & Pristine
              </Badge>
            </div>

            {/* Before Image (Cracked) - Clipped by width */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={screenBefore}
                alt="Cracked phone screen"
                className="absolute inset-y-0 left-0 h-full max-w-none object-cover"
                style={{ width: containerRef.current?.getBoundingClientRect().width ?? "100%" }}
              />
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-rose-500/90 text-white font-semibold shadow-md border-0 px-3 py-1">
                  BEFORE: Shattered Glass
                </Badge>
              </div>
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute inset-y-0 z-20 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border-2 border-blue-500 font-bold">
                <ArrowLeftRight className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>← Drag left or right to compare →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
