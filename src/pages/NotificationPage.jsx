import { useCallback, useEffect, useMemo, useState } from "react";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import ConfirmDialog from "../components/ConfirmDialog";
import LoginRequired from "../components/profile/LoginRequired";
import NotificationFeedback from "../components/notifications/NotificationFeedback";
import NotificationHeader from "../components/notifications/NotificationHeader";
import NotificationList from "../components/notifications/NotificationList";
import NotificationSidebar from "../components/notifications/NotificationSidebar";
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
} from "../components/notifications/NotificationState";
import {
  filterNotifications,
  getNotificationFilterCounts,
} from "../components/notifications/notificationFilters";
import { supabase } from "../lib/supabase";
import { getStoredUser, isAuthenticated } from "../utils/auth";
import {
  deleteNotification,
  fetchNotifications,
  getNotificationId,
  isNotificationRead,
  markNotificationAsRead,
} from "../utils/notifications";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [readingIds, setReadingIds] = useState(() => new Set());
  const [deletingId, setDeletingId] = useState("");
  const [pendingDeleteNotification, setPendingDeleteNotification] =
    useState(null);
  const hasSession = useMemo(() => isAuthenticated(), []);

  const unreadCount = notifications.filter(
    (item) => !isNotificationRead(item),
  ).length;
  const filterCounts = useMemo(
    () => getNotificationFilterCounts(notifications),
    [notifications],
  );
  const visibleNotifications = useMemo(
    () => filterNotifications(notifications, activeFilter),
    [activeFilter, notifications],
  );

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
    if (!hasSession) return undefined;

    const currentUser = getStoredUser();
    const currentUserId =
      currentUser?._id || currentUser?.id || currentUser?.userId || "";
    const subscription = {
      event: "*",
      schema: "public",
      table: "notifications",
      ...(currentUserId ? { filter: `to_user_id=eq.${currentUserId}` } : {}),
    };
    const channel = supabase
      .channel(`notifications-realtime-${crypto.randomUUID()}`)
      .on("postgres_changes", subscription, loadNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasSession, loadNotifications]);

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
    if (!notificationId) return;

    setPendingDeleteNotification(notification);
  };

  const confirmDeleteNotification = async () => {
    const notificationId = getNotificationId(pendingDeleteNotification);
    if (!notificationId) return;

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
      setPendingDeleteNotification(null);
    }
  };

  if (!hasSession) return <LoginRequired />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex w-full items-stretch justify-start px-4">
        <NotificationSidebar
          activeFilter={activeFilter}
          counts={filterCounts}
          onChange={setActiveFilter}
        />

        <main className="min-h-screen w-full max-w-2xl border-x border-gray-200 bg-white shadow-[0_0_24px_rgba(15,23,42,0.04)]">
          <div className="sticky top-[65px] z-20 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-[0_1px_10px_rgba(15,23,42,0.035)] backdrop-blur">
            <NotificationHeader
              loading={loading}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onRefresh={loadNotifications}
            />
          </div>

          <NotificationFeedback message={actionMessage} />

          <section className="min-h-[calc(100vh-154px)] bg-white">
            {loading ? (
              <NotificationLoadingState />
            ) : error ? (
              <NotificationErrorState error={error} onRetry={loadNotifications} />
            ) : notifications.length === 0 ? (
              <NotificationEmptyState />
            ) : visibleNotifications.length === 0 ? (
              <div className="flex min-h-[calc(100vh-154px)] flex-col items-center justify-center px-6 py-16 text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Tidak ada notifikasi di filter ini
                </h2>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Pilih kategori lain atau refresh untuk melihat update terbaru.
                </p>
              </div>
            ) : (
              <NotificationList
                deletingId={deletingId}
                notifications={visibleNotifications}
                readingIds={readingIds}
                onDelete={handleDelete}
                onMarkRead={handleMarkRead}
              />
            )}
          </section>
        </main>

        <AdvertisementSidebar />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteNotification)}
        loading={deletingId === getNotificationId(pendingDeleteNotification)}
        title="Hapus notifikasi?"
        description="Notifikasi ini akan dihapus dari daftar kamu. Aksi ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onCancel={() => setPendingDeleteNotification(null)}
        onConfirm={confirmDeleteNotification}
      />
    </div>
  );
}
