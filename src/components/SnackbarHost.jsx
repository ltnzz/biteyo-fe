import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { SNACKBAR_EVENT } from "../utils/snackbar";

const VARIANTS = {
  info: {
    icon: Info,
    iconClass: "bg-gray-100 text-gray-600",
    ringClass: "",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "bg-pink-50 text-pink-500",
    ringClass: "border-pink-200",
  },
  error: {
    icon: AlertCircle,
    iconClass: "bg-red-50 text-red-500",
    ringClass: "border-red-200",
  },
};

export default function SnackbarHost() {
  const [snackbars, setSnackbars] = useState([]);

  useEffect(() => {
    const handleShow = (event) => {
      const detail = event.detail || {};
      if (!detail.message) return;

      setSnackbars((prev) => [
        ...prev.slice(-2),
        {
          id: detail.id,
          message: detail.message,
          variant: VARIANTS[detail.variant] ? detail.variant : "info",
        },
      ]);

      window.setTimeout(() => {
        setSnackbars((prev) => prev.filter((item) => item.id !== detail.id));
      }, detail.duration || 2400);
    };

    window.addEventListener(SNACKBAR_EVENT, handleShow);
    return () => window.removeEventListener(SNACKBAR_EVENT, handleShow);
  }, []);

  if (snackbars.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8">
      {snackbars.map((snackbar) => {
        const variant = VARIANTS[snackbar.variant];
        const Icon = variant.icon;

        return (
          <div
            key={snackbar.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-gray-200 ${variant.ringClass} bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-xl shadow-gray-900/10 animate-modal-rise`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${variant.iconClass}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">{snackbar.message}</span>
            <button
              type="button"
              onClick={() =>
                setSnackbars((prev) => prev.filter((item) => item.id !== snackbar.id))
              }
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
