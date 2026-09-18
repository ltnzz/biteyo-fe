import { API_BASE, ensureOkResponse } from "./api";
import { getAuthHeaders } from "./auth";

export const FCM_TOKEN_KEY = "biteyo_fcm_token";
export const NOTIFICATIONS_UPDATED_EVENT = "biteyo:notifications-updated";

export const notifyNotificationsUpdated = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};

const requestJson = async (path, options = {}, fallback = "Request failed") => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  await ensureOkResponse(response, fallback);

  return response.json().catch(() => null);
};

export const normalizeNotifications = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.notifications)) return data.data.notifications;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

export const getNotificationId = (notification) =>
  notification?._id || notification?.id || notification?.notificationId || "";

export const isNotificationRead = (notification) =>
  Boolean(
    notification?.read ??
      notification?.isRead ??
      notification?.readAt ??
      notification?.seen,
  );

export const fetchNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({
    page: String(Math.max(page, 1)),
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });
  const data = await requestJson(
    `/api/notifications/?${params.toString()}`,
    {},
    "Gagal memuat notifikasi.",
  );

  const items = normalizeNotifications(data);
  const pagination = data?.pagination || data?.data?.pagination || null;
  const total = Number(pagination?.total ?? pagination?.count);
  const hasMore =
    typeof pagination?.hasMore === "boolean"
      ? pagination.hasMore
      : Number.isFinite(total) && total > 0
        ? Math.max(page, 1) * Math.min(Math.max(limit, 1), 50) < total
        : items.length >= Math.min(Math.max(limit, 1), 50);

  return {
    items,
    page: Math.max(page, 1),
    hasMore,
    total: Number.isFinite(total) && total > 0 ? total : null,
  };
};

export const fetchUnreadCount = async () => {
  try {
    const data = await requestJson(
      "/api/notifications/unread-count",
      {},
      "Gagal memuat jumlah notifikasi.",
    );
    const count = Number(
      data?.unreadCount ?? data?.count ?? data?.data?.unreadCount ?? data?.data?.count,
    );
    if (Number.isFinite(count)) return Math.max(0, count);
  } catch {
    // backend belum menyediakan endpoint — fallback ke halaman pertama
  }

  const { items } = await fetchNotifications({ page: 1, limit: 20 });
  return items.filter((item) => !isNotificationRead(item)).length;
};

export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) return null;

  return requestJson(
    `/api/notifications/${notificationId}/read`,
    { method: "PATCH" },
    "Gagal menandai notifikasi sebagai dibaca.",
  );
};

export const deleteNotification = async (notificationId) => {
  if (!notificationId) return null;

  return requestJson(
    `/api/notifications/${notificationId}`,
    { method: "DELETE" },
    "Gagal menghapus notifikasi.",
  );
};

export const getStoredFcmToken = () => {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(FCM_TOKEN_KEY) || "";
};

export const saveStoredFcmToken = (token) => {
  if (typeof window === "undefined" || !token) return;

  window.localStorage.setItem(FCM_TOKEN_KEY, token);
};

export const clearStoredFcmToken = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(FCM_TOKEN_KEY);
};

export const registerFcmToken = async (token) => {
  const cleanedToken = typeof token === "string" ? token.trim() : "";

  if (!cleanedToken) {
    return {
      skipped: true,
      message: "FCM token kosong, request register dilewati.",
    };
  }

  const data = await requestJson(
    "/api/notifications/fcm-token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: cleanedToken }),
    },
    "Gagal mendaftarkan push notification.",
  );

  saveStoredFcmToken(cleanedToken);

  return data;
};

export const unregisterFcmToken = async () => {
  const storedToken = getStoredFcmToken();

  if (!storedToken) {
    clearStoredFcmToken();
    return {
      skipped: true,
      message: "FCM token kosong, request unregister dilewati.",
    };
  }

  const data = await requestJson(
    "/api/notifications/fcm-token",
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: storedToken }),
    },
    "Gagal menonaktifkan push notification.",
  );

  clearStoredFcmToken();

  return data;
};
