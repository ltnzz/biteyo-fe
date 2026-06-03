import { isSupabaseConfigured, supabase } from "../lib/supabase";
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

export const fetchNotifications = async () => {
  const data = await requestJson(
    "/api/notifications/",
    {},
    "Gagal memuat notifikasi.",
  );

  return normalizeNotifications(data);
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

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (!error) return { deleted: true };

    throw new Error(error.message || "Gagal menghapus notifikasi.");
  }

  const response = await fetch(`${API_BASE}/api/notifications/${notificationId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (response.status === 404) {
    return { deleted: true, alreadyGone: true };
  }

  await ensureOkResponse(response, "Gagal menghapus notifikasi.");

  return response.json().catch(() => ({ deleted: true }));
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
