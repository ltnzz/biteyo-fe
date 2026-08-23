import { AlertCircle, Bell } from "lucide-react";
import BiteLoader from "../BiteLoader";

export function NotificationLoadingState() {
  return <BiteLoader label="Sedang memuat notifikasi..." />;
}

export function NotificationErrorState({ error, onRetry }) {
  return (
    <div className="mx-4 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold">Notifikasi belum bisa dimuat.</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            Coba lagi
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationEmptyState() {
  return (
    <div className="flex min-h-[calc(100vh-154px)] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-400 shadow-sm">
        <Bell className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900">
        Belum ada notifikasi
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Aktivitas terbaru dari akunmu akan muncul di sini.
      </p>
    </div>
  );
}
