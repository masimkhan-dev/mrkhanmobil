import { useState, useRef, useCallback, useEffect } from "react";
import screenBefore from "@/assets/screen_before.png";
import screenAfter from "@/assets/screen_after.png";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeftRight } from "lucide-react";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="container-x relative">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <Badge
            variant="secondary"
            className="mb-3 rounded-full py-1 px-3.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Before &amp; After
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Before &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-sky-300 bg-clip-text text-transparent">
              After
            </span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            See the difference a professional repair can make.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div
            ref={containerRef}
            tabIndex={0}
            role="slider"
            aria-label="Before and after screen repair comparison"
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuemin={0}
            aria-valuemax={100}
            onKeyDown={handleKeyDown}
            className="relative h-[300px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl bg-slate-900 touch-pan-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleMove(e.touches[0].clientX);
            }}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Pristine) - Full background */}
            <img
              src={screenAfter}
              alt="Repaired phone screen after repair"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <Badge className="bg-emerald-500/90 text-white text-xs font-semibold shadow-md border-0 px-2.5 py-1">
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
                alt="Cracked phone screen before repair"
                className="absolute inset-y-0 left-0 h-full max-w-none object-cover"
                style={{ width: containerWidth > 0 ? `${containerWidth}px` : "100%" }}
              />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                <Badge className="bg-rose-500/90 text-white text-xs font-semibold shadow-md border-0 px-2.5 py-1">
                  BEFORE: Shattered Glass
                </Badge>
              </div>
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute inset-y-0 z-20 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border-2 border-blue-500 font-bold min-h-[44px] min-w-[44px]">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>← Drag left/right or use arrow keys to compare →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
