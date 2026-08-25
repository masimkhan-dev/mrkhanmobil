import { cn } from "@/lib/utils";

export interface CompactConfirmModalDetail {
  label: string;
  value: string;
}

export interface CompactConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  details?: CompactConfirmModalDetail[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy?: boolean;
  danger?: boolean;
}

export function CompactConfirmModal({
  open,
  title,
  description,
  details,
  confirmLabel = "Confirm & Print",
  cancelLabel = "Go Back",
  onConfirm,
  onCancel,
  isBusy,
  danger,
}: CompactConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-[var(--kimi-radius-card)] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <h3 className="text-[20px] font-bold text-slate-900">{title}</h3>
        {description && <p className="text-[14px] text-slate-500">{description}</p>}

        {details && details.length > 0 && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-2 text-[13px]">
            {details.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-500">{d.label}</span>
                <span className="font-semibold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-[var(--kimi-radius-btn)] border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={cn(
              "rounded-[var(--kimi-radius-btn)] px-6 py-2.5 text-[14px] font-bold text-white transition-all min-h-[44px]",
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--kimi-accent)] hover:bg-[var(--kimi-accent-hover)]",
            )}
          >
            {isBusy ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
