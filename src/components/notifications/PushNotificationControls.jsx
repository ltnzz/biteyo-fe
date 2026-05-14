import { Bell, BellOff, Loader2 } from "lucide-react";

export default function PushNotificationControls({
  loading,
  storedFcmToken,
  onRegister,
  onUnregister,
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={onRegister}
        disabled={loading}
        title={
          storedFcmToken
            ? "Daftarkan FCM token"
            : "FCM token belum tersedia di browser ini"
        }
        className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-100 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {storedFcmToken ? "Aktifkan push" : "Token belum ada"}
      </button>
      <button
        type="button"
        onClick={onUnregister}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        Matikan push
      </button>
    </div>
  );
}
