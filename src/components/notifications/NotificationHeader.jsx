import { RefreshCw } from "lucide-react";

export default function NotificationHeader({
  loading,
  unreadCount,
  onMarkAllRead,
  onRefresh,
}) {
  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="min-w-0">
        <h1 className="truncate text-base sm:text-lg font-black text-gray-900 leading-tight">
          Notifications
        </h1>
        <p className="truncate text-[11px] font-semibold text-gray-400">
          {unreadCount > 0
            ? `${unreadCount} belum dibaca`
            : "Semua sudah dibaca"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          title="Refresh notifikasi"
          aria-label="Refresh notifikasi"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={loading || unreadCount === 0}
          className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>
    </div>
  );
}
