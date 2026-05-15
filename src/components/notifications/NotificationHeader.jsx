import { RefreshCw } from "lucide-react";

export default function NotificationHeader({
  loading,
  unreadCount,
  onMarkAllRead,
  onRefresh,
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">
          Notifications
        </h1>
        <p className="text-sm text-gray-500">
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          title="Refresh notifikasi"
          aria-label="Refresh notifikasi"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={loading || unreadCount === 0}
          className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>
    </div>
  );
}
