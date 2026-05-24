import { BookmarkCheck, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export default function ToastMessage({ duration = 2400, message, onClose }) {
  useEffect(() => {
    if (!message?.text) return undefined;

    const timer = window.setTimeout(() => {
      onClose?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [duration, message?.text, onClose]);

  if (!message?.text) return null;

  const Icon = message.icon === "bookmark" ? BookmarkCheck : CheckCircle2;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-8">
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-2xl shadow-gray-900/15">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">{message.text}</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
