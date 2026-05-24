import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AUTH_CHANGE_EVENT, getStoredUser, isAuthenticated } from "../utils/auth";
import {
  fetchNotifications,
  isNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from "../utils/notifications";

const getUserId = (user) =>
  user?._id || user?.id || user?.userId || user?.sub || "";

export default function useUnreadNotifications(user = null) {
  const [storedUser, setStoredUser] = useState(() => getStoredUser());
  const activeUser = user || storedUser;
  const activeUserId = getUserId(activeUser);
  const userKey = useMemo(
    () => activeUserId || activeUser?.username || activeUser?.email || "",
    [activeUser?.email, activeUser?.username, activeUserId],
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) return undefined;

    const readUser = () => setStoredUser(getStoredUser());

    window.addEventListener("storage", readUser);
    window.addEventListener(AUTH_CHANGE_EVENT, readUser);

    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener(AUTH_CHANGE_EVENT, readUser);
    };
  }, [user]);

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated() || !userKey) {
      setUnreadCount(0);
      return;
    }

    try {
      const notifications = await fetchNotifications();
      setUnreadCount(
        notifications.filter((item) => !isNotificationRead(item)).length,
      );
    } catch (err) {
      console.warn("Failed to load unread notifications:", err);
    }
  }, [userKey]);

  useEffect(() => {
    const timer = window.setTimeout(loadUnreadCount, 0);

    return () => window.clearTimeout(timer);
  }, [loadUnreadCount]);

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    };
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated() || !userKey) {
      return undefined;
    }

    const subscription = {
      event: "*",
      schema: "public",
      table: "notifications",
      ...(activeUserId ? { filter: `to_user_id=eq.${activeUserId}` } : {}),
    };
    const channel = supabase
      .channel(`sidebar-notifications-${crypto.randomUUID()}`)
      .on("postgres_changes", subscription, loadUnreadCount)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeUserId, loadUnreadCount, userKey]);

  return unreadCount;
}
