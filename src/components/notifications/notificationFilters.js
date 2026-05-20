import { isNotificationRead } from "../../utils/notifications";
import { getNotificationMessage } from "./notificationViewModel";

export const notificationFilters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "likes", label: "Likes" },
  { value: "comments", label: "Comments" },
  { value: "follows", label: "Follows" },
];

export const getNotificationCategory = (notification) => {
  const rawType = String(
    notification?.type || notification?.category || notification?.event || "",
  ).toLowerCase();
  const message = getNotificationMessage(notification).toLowerCase();
  const value = `${rawType} ${message}`;

  if (value.includes("like")) return "likes";
  if (value.includes("comment") || value.includes("komentar")) return "comments";
  if (value.includes("follow")) return "follows";

  return "other";
};

export const filterNotifications = (notifications, activeFilter) => {
  if (activeFilter === "all") return notifications;
  if (activeFilter === "unread") {
    return notifications.filter((item) => !isNotificationRead(item));
  }

  return notifications.filter(
    (item) => getNotificationCategory(item) === activeFilter,
  );
};

export const getNotificationFilterCounts = (notifications) => {
  const counts = notificationFilters.reduce(
    (acc, filter) => ({ ...acc, [filter.value]: 0 }),
    {},
  );

  counts.all = notifications.length;
  counts.unread = notifications.filter((item) => !isNotificationRead(item)).length;

  notifications.forEach((item) => {
    const category = getNotificationCategory(item);

    if (counts[category] !== undefined) {
      counts[category] += 1;
    }
  });

  return counts;
};
