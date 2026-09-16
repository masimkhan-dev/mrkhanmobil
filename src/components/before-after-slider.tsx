import { useState, useRef, useCallback, useEffect } from "react";
import screenBefore from "@/assets/screen_before.webp";
import screenAfter from "@/assets/screen_after.webp";
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
    <section className="py-16 sm:py-24 bg-[#f7f7f5] border-y border-[#e3e5e8]">
      <div className="container-x">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#07101d] via-[#0b1728] to-[#07101d] text-white p-6 sm:p-10 lg:p-12 border border-slate-800/80 shadow-xl overflow-hidden">
          {/* Background Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand/15 blur-[140px] pointer-events-none rounded-full" />

          <div className="relative text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <Badge
              variant="secondary"
              className="mb-3 rounded-full py-1 px-3.5 bg-brand-subtle text-brand border border-brand/30 gap-1.5 font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Before &amp; After Quality
            </Badge>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
              See the difference a <span className="text-brand">professional repair</span> makes
            </h2>
            <p className="mt-2 text-slate-300 text-sm sm:text-base">
              Drag the slider to compare genuine-grade glass finish before and after repair.
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
              className="relative h-[280px] sm:h-[380px] md:h-[440px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl bg-slate-900 touch-pan-y focus:outline-none focus:ring-2 focus:ring-brand"
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
              {/* After Image (Full width background) */}
              <img
                src={screenAfter}
                alt="Repaired phone screen in pristine condition"
                width={1200}
                height={800}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Before Image (Clipped overlay) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={screenBefore}
                  alt="Damaged phone screen before repair"
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="absolute inset-y-0 left-0 h-full object-cover max-w-none pointer-events-none"
                  style={{ width: containerWidth > 0 ? `${containerWidth}px` : "100%" }}
                  draggable={false}
                />
              </div>

              {/* Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#111318] shadow-lg flex items-center justify-center border-2 border-brand">
                  <ArrowLeftRight className="w-4 h-4 text-brand" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none z-10 border border-white/10">
                BEFORE
              </div>
              <div className="absolute top-4 right-4 bg-brand/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none z-10 border border-white/10">
                AFTER
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs text-slate-400 font-medium inline-flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-brand" />
                Drag slider or use arrow keys to inspect screen quality
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
