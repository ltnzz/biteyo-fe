import { useCallback, useEffect, useMemo, useState } from "react";
import LoginRequired from "../components/profile/LoginRequired";
import NotificationFeedback from "../components/notifications/NotificationFeedback";
import NotificationHeader from "../components/notifications/NotificationHeader";
import NotificationList from "../components/notifications/NotificationList";
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
} from "../components/notifications/NotificationState";
import PushNotificationControls from "../components/notifications/PushNotificationControls";
import { isAuthenticated } from "../utils/auth";
import {
  clearStoredFcmToken,
  deleteNotification,
  fetchNotifications,
  getNotificationId,
  getStoredFcmToken,
  isNotificationRead,
  markNotificationAsRead,
  registerFcmToken,
  unregisterFcmToken,
} from "../utils/notifications";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [readingIds, setReadingIds] = useState(() => new Set());
  const [deletingId, setDeletingId] = useState("");
  const [pushLoading, setPushLoading] = useState(false);
  const [storedFcmToken, setStoredFcmToken] = useState(getStoredFcmToken);
  const hasSession = useMemo(() => isAuthenticated(), []);

  const unreadCount = notifications.filter(
    (item) => !isNotificationRead(item),
  ).length;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setNotifications(await fetchNotifications());
    } catch (err) {
      setNotifications([]);
      setError(err.message || "Gagal memuat notifikasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasSession) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [hasSession, loadNotifications]);

  useEffect(() => {
    const token = getStoredFcmToken();

    if (!token || !hasSession) return;

    registerFcmToken(token)
      .then(() => setStoredFcmToken(token))
      .catch((err) => {
        console.warn("Failed to register FCM token:", err);
      });
  }, [hasSession]);

  const updateReadState = (notificationId, read) => {
    setNotifications((prev) =>
      prev.map((item) =>
        getNotificationId(item) === notificationId
          ? {
              ...item,
              read,
              isRead: read,
              readAt: read
                ? item.readAt || new Date().toISOString()
                : item.readAt,
            }
          : item,
      ),
    );
  };

  const handleMarkRead = async (notification) => {
    const notificationId = getNotificationId(notification);

    if (
      !notificationId ||
      isNotificationRead(notification) ||
      readingIds.has(notificationId)
    ) {
      return;
    }

    setActionMessage({ type: "", text: "" });
    setReadingIds((prev) => new Set(prev).add(notificationId));
    updateReadState(notificationId, true);

    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      updateReadState(notificationId, false);
      setActionMessage({
        type: "error",
        text: err.message || "Gagal menandai notifikasi sebagai dibaca.",
      });
    } finally {
      setReadingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter(
      (item) => !isNotificationRead(item),
    );

    if (unreadItems.length === 0) return;

    setActionMessage({ type: "", text: "" });
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
        isRead: true,
        readAt: item.readAt || new Date().toISOString(),
      })),
    );

    const results = await Promise.allSettled(
      unreadItems.map((item) => markNotificationAsRead(getNotificationId(item))),
    );
    const failedIds = results
      .map((result, index) =>
        result.status === "rejected"
          ? getNotificationId(unreadItems[index])
          : "",
      )
      .filter(Boolean);

    if (failedIds.length === 0) return;

    setNotifications((prev) =>
      prev.map((item) =>
        failedIds.includes(getNotificationId(item))
          ? { ...item, read: false, isRead: false, readAt: null }
          : item,
      ),
    );
    setActionMessage({
      type: "error",
      text: "Sebagian notifikasi gagal ditandai sebagai dibaca.",
    });
  };

  const handleDelete = async (event, notification) => {
    event.stopPropagation();

    const notificationId = getNotificationId(notification);
    if (!notificationId || !window.confirm("Hapus notifikasi ini?")) return;

    setDeletingId(notificationId);
    setActionMessage({ type: "", text: "" });

    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((item) => getNotificationId(item) !== notificationId),
      );
      setActionMessage({ type: "success", text: "Notifikasi dihapus." });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.message || "Gagal menghapus notifikasi.",
      });
    } finally {
      setDeletingId("");
    }
  };

  const handleRegisterPush = async () => {
    const token = getStoredFcmToken();

    setPushLoading(true);
    setActionMessage({ type: "", text: "" });

    try {
      const result = await registerFcmToken(token);

      if (result?.skipped) {
        setActionMessage({
          type: "error",
          text: "FCM token belum tersedia di browser ini.",
        });
      } else {
        setStoredFcmToken(token);
        setActionMessage({ type: "success", text: "Push notification aktif." });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.message || "Gagal mengaktifkan push notification.",
      });
    } finally {
      setPushLoading(false);
    }
  };

  const handleUnregisterPush = async () => {
    setPushLoading(true);
    setActionMessage({ type: "", text: "" });

    try {
      await unregisterFcmToken();
      clearStoredFcmToken();
      setStoredFcmToken("");
      setActionMessage({
        type: "success",
        text: "Push notification dimatikan.",
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.message || "Gagal mematikan push notification.",
      });
    } finally {
      setPushLoading(false);
    }
  };

  if (!hasSession) return <LoginRequired />;

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto min-h-screen max-w-2xl border-x border-gray-100">
        <div className="sticky top-[65px] z-20 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
          <NotificationHeader
            loading={loading}
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onRefresh={loadNotifications}
          />
          <PushNotificationControls
            loading={pushLoading}
            storedFcmToken={storedFcmToken}
            onRegister={handleRegisterPush}
            onUnregister={handleUnregisterPush}
          />
        </div>

        <NotificationFeedback message={actionMessage} />

        {loading ? (
          <NotificationLoadingState />
        ) : error ? (
          <NotificationErrorState error={error} onRetry={loadNotifications} />
        ) : notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <NotificationList
            deletingId={deletingId}
            notifications={notifications}
            readingIds={readingIds}
            onDelete={handleDelete}
            onMarkRead={handleMarkRead}
          />
        )}
      </main>
    </div>
  );
}
