/**
 * PrintPreviewModal — In-app print preview with iframe isolation.
 *
 * Renders invoice or statement HTML inside a sandboxed iframe using srcDoc.
 * Printing is triggered via iframe.contentWindow.print() — no popup windows.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2, Printer, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { InvoiceKind } from "@/lib/counter.types";
import { getSavedPrinterFormat, setSavedPrinterFormat } from "@/components/counter/ds";

type Paper = "80MM" | "A4";
type ZoomMode = "FIT" | "75" | "100" | "125";

export interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  kind: InvoiceKind | "STATEMENT";
  invoiceNumber: string;
  html80mm: string;
  htmlA4: string;
  defaultPaper?: Paper;
}

const PAPER_OPTIONS: { value: Paper; label: string }[] = [
  { value: "80MM", label: "Thermal 80mm" },
  { value: "A4", label: "A4 Page" },
];

const ZOOM_OPTIONS: { value: ZoomMode; label: string }[] = [
  { value: "FIT", label: "Fit Width" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
  { value: "125", label: "125%" },
];

const KIND_LABELS: Record<InvoiceKind | "STATEMENT", string> = {
  REPAIR: "Repair Invoice",
  SALE: "Sale Invoice",
  PURCHASE: "Purchase Receipt",
  STATEMENT: "Customer Statement",
};

// Dimensions at standard 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const THERMAL_WIDTH = 302;

export function PrintPreviewModal({
  open,
  onClose,
  kind,
  invoiceNumber,
  html80mm,
  htmlA4,
  defaultPaper,
}: PrintPreviewModalProps) {
  const isStatement = kind === "STATEMENT";
  const initialPaper = isStatement ? "A4" : defaultPaper || getSavedPrinterFormat();

  const [paper, setPaper] = useState<Paper>(initialPaper);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("FIT");
  const [previewReady, setPreviewReady] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [thermalHeight, setThermalHeight] = useState<number>(600);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Store active element to restore focus on close
  useEffect(() => {
    if (open) {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
      const timer = setTimeout(() => {
        printButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, [open]);

  // Focus trap inside dialog
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes modal
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Reset state when modal opens or paper changes
  useEffect(() => {
    if (open) {
      const activeFormat = isStatement ? "A4" : defaultPaper || getSavedPrinterFormat();
      setPaper(activeFormat);
      setZoomMode("FIT");
      setPreviewReady(false);
      setIsPrinting(false);
    }
  }, [open, defaultPaper, isStatement]);

  useEffect(() => {
    setPreviewReady(false);
    setIsPrinting(false);
  }, [paper, html80mm, htmlA4]);

  const handlePaperChange = (newPaper: Paper) => {
    setPaper(newPaper);
    if (!isStatement) {
      setSavedPrinterFormat(newPaper);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Measure canvas width with ResizeObserver to compute Fit Width scale
  useLayoutEffect(() => {
    if (!open || !canvasRef.current) return;
    const el = canvasRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth || 800);
    return () => observer.disconnect();
  }, [open]);

  // Calculate actual scale
  const baseWidth = paper === "80MM" ? THERMAL_WIDTH : A4_WIDTH;
  const baseHeight = paper === "80MM" ? thermalHeight : A4_HEIGHT;

  const availableWidth = Math.max(1, containerWidth);

  let scale = 1;
  if (zoomMode === "FIT") {
    scale = Math.min(availableWidth / baseWidth, 1);
    scale = Math.max(0.2, scale);
  } else if (zoomMode === "75") {
    scale = 0.75;
  } else if (zoomMode === "100") {
    scale = 1.0;
  } else if (zoomMode === "125") {
    scale = 1.25;
  }

  const handlePrint = useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || !previewReady || isPrinting) return;

    setIsPrinting(true);
    try {
      frameWindow.focus();
      frameWindow.print();
    } catch {
      toast.error("Printing could not be opened. Please try again.");
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  }, [previewReady, isPrinting]);

  if (!open) return null;

  const currentHtml = paper === "80MM" ? html80mm : htmlA4;
  const printLabel = paper === "80MM" ? "Print Thermal" : "Print A4";
  const baseLabel = KIND_LABELS[kind] ?? "Invoice";
  const kindLabel = isStatement ? `${baseLabel} — A4` : `${baseLabel}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-0 sm:p-6 lg:p-8 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Desktop Centred Dialog (1080px max-width, 86vh max-height) ─────── */}
      <div
        ref={dialogRef}
        className="relative flex h-full w-full flex-col overflow-hidden bg-white sm:h-[86vh] sm:max-h-[880px] sm:w-[calc(100vw-64px)] sm:max-w-[1080px] sm:rounded-2xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* ── Compact White Header (60px) ─────────────────────────────────── */}
        <header className="flex h-15 sm:h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          {/* Left: invoice type and number */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {kindLabel} Preview
              </span>
              <span
                id="print-preview-modal-title"
                className="font-mono text-[15px] sm:text-[17px] font-black text-slate-900 leading-tight"
              >
                {invoiceNumber}
              </span>
            </div>
          </div>

          {/* Centre: Segmented paper toggle */}
          {!isStatement ? (
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/90 p-1 shadow-inner">
              {PAPER_OPTIONS.map((opt) => {
                const isSelected = paper === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePaperChange(opt.value)}
                    aria-pressed={isSelected}
                    className={cn(
                      "rounded-md px-3.5 py-1.5 text-[12px] font-bold transition-all min-h-[32px]",
                      isSelected
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Right: Zoom controls, Close & Primary Print Button */}
          <div className="flex items-center gap-2">
            {/* Zoom selector */}
            <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Zoom:</span>
              {ZOOM_OPTIONS.map((z) => {
                const isSelected = zoomMode === z.value;
                return (
                  <button
                    key={z.value}
                    type="button"
                    onClick={() => setZoomMode(z.value)}
                    className={cn(
                      "px-2 py-1 text-[11px] font-bold rounded transition-colors",
                      isSelected
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100",
                    )}
                    aria-label={`Set zoom to ${z.label}`}
                  >
                    {z.label}
                  </button>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--kimi-radius-btn,8px)] border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Close print preview"
            >
              <X className="h-4 w-4 text-slate-500" />
              <span className="hidden sm:inline">Close</span>
            </button>

            {/* Primary Print Button */}
            <button
              ref={printButtonRef}
              type="button"
              onClick={handlePrint}
              disabled={!previewReady || isPrinting}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--kimi-radius-btn,8px)] bg-slate-900 px-5 text-[13px] font-bold text-white shadow-sm transition-all",
                previewReady && !isPrinting
                  ? "hover:bg-slate-800 active:scale-[0.98]"
                  : "opacity-50 cursor-not-allowed",
              )}
              aria-label={printLabel}
            >
              {!previewReady || isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Printer className="h-4 w-4 text-white" />
              )}
              <span>
                {isPrinting ? "Opening Print…" : previewReady ? printLabel : "Loading Preview…"}
              </span>
            </button>
          </div>
        </header>

        {/* ── Mobile Paper & Zoom Subheader ───────────────────────────────── */}
        <div className="flex sm:hidden items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
          {!isStatement ? (
            <div className="flex items-center gap-1 flex-1">
              {PAPER_OPTIONS.map((opt) => {
                const isSelected = paper === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePaperChange(opt.value)}
                    className={cn(
                      "flex-1 rounded py-1.5 text-[12px] font-bold transition-colors text-center",
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-500">A4 Statement Preview</span>
          )}

          <button
            type="button"
            onClick={() => setZoomMode((prev) => (prev === "FIT" ? "100" : "FIT"))}
            className="ml-2 px-2.5 py-1.5 text-xs font-bold rounded border border-slate-200 bg-white text-slate-700"
          >
            {zoomMode === "FIT" ? `Fit ${Math.round(scale * 100)}%` : "Fit Width"}
          </button>
        </div>

        {/* ── Preview Canvas (Scrollable Workspace with overflow-auto) ────── */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto bg-slate-100/90 p-4 sm:p-6 lg:p-8 overscroll-contain flex flex-col items-center"
        >
          {paper === "80MM" ? (
            /* Thermal 80mm preview */
            <div className="flex flex-col items-center my-auto py-2">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Thermal 80mm Receipt
              </div>
              <div
                style={{
                  width: `${THERMAL_WIDTH * scale}px`,
                  height: `${thermalHeight * scale}px`,
                  transition: "width 0.15s ease-out, height 0.15s ease-out",
                }}
                className="relative shrink-0"
              >
                <div
                  style={{
                    width: `${THERMAL_WIDTH}px`,
                    height: `${thermalHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                  className="bg-white rounded-xs border border-slate-300 shadow-lg overflow-hidden"
                >
                  <iframe
                    ref={iframeRef}
                    key={`thermal-${invoiceNumber}-${paper}`}
                    title="Thermal receipt preview"
                    srcDoc={currentHtml}
                    sandbox="allow-same-origin allow-modals"
                    style={{
                      width: `${THERMAL_WIDTH}px`,
                      minHeight: "520px",
                      height: "100%",
                      border: "none",
                      display: "block",
                    }}
                    onLoad={(e) => {
                      setPreviewReady(true);
                      const frame = e.currentTarget;
                      try {
                        const body = frame.contentDocument?.body;
                        if (body) {
                          const computed = Math.max(520, body.scrollHeight + 24);
                          setThermalHeight(computed);
                        }
                      } catch {
                        // cross-origin safety
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* A4 document preview — physical sheet with realistic shadow */
            <div className="flex flex-col items-center py-2">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                A4 Document Preview
              </div>
              <div
                style={{
                  width: `${A4_WIDTH * scale}px`,
                  height: `${A4_HEIGHT * scale}px`,
                  transition: "width 0.15s ease-out, height 0.15s ease-out",
                }}
                className="relative shrink-0"
              >
                <div
                  style={{
                    width: `${A4_WIDTH}px`,
                    height: `${A4_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                  className="bg-white rounded-[2px] border border-slate-300 shadow-xl overflow-hidden"
                >
                  <iframe
                    ref={iframeRef}
                    key={`a4-${invoiceNumber}-${paper}`}
                    title="A4 invoice preview"
                    srcDoc={currentHtml}
                    sandbox="allow-same-origin allow-modals"
                    style={{
                      width: `${A4_WIDTH}px`,
                      height: `${A4_HEIGHT}px`,
                      border: "none",
                      display: "block",
                    }}
                    onLoad={() => setPreviewReady(true)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
