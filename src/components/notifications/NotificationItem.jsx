import {
  Bell,
  Heart,
  Loader2,
  MessageCircle,
  Trash2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotificationId, isNotificationRead } from "../../utils/notifications";
import {
  formatNotificationTime,
  getActorAvatar,
  getActorHandle,
  getActorName,
  getNotificationMessage,
  getNotificationTarget,
  getNotificationTime,
} from "./notificationViewModel";

const getIconMeta = (notification) => {
  const type = String(
    notification.type || notification.category || notification.event || "",
  ).toLowerCase();
  const message = getNotificationMessage(notification).toLowerCase();
  const value = `${type} ${message}`;

  if (value.includes("like")) {
    return {
      bg: "bg-pink-50",
      icon: <Heart className="h-4 w-4 text-pink-500" />,
    };
  }

  if (value.includes("comment") || value.includes("komentar")) {
    return {
      bg: "bg-sky-50",
      icon: <MessageCircle className="h-4 w-4 text-sky-500" />,
    };
  }

  if (value.includes("follow")) {
    return {
      bg: "bg-emerald-50",
      icon: <UserPlus className="h-4 w-4 text-emerald-500" />,
    };
  }

  if (value.includes("trend")) {
    return {
      bg: "bg-orange-50",
      icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
    };
  }

  return {
    bg: "bg-gray-100",
    icon: <Bell className="h-4 w-4 text-gray-500" />,
  };
};

export default function NotificationItem({
  deletingId,
  notification,
  readingIds,
  onDelete,
  onMarkRead,
}) {
  const navigate = useNavigate();
  const notificationId = getNotificationId(notification);
  const actorName = getActorName(notification);
  const actorAvatar = getActorAvatar(notification);
  const actorHandle = getActorHandle(notification);
  const message = getNotificationMessage(notification);
  const target = getNotificationTarget(notification);
  const read = isNotificationRead(notification);
  const iconMeta = getIconMeta(notification);

  const handleOpenProfile = (event) => {
    event.stopPropagation();
    if (!actorHandle) return;

    onMarkRead(notification);
    navigate(`/profile/${encodeURIComponent(actorHandle)}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onMarkRead(notification);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onMarkRead(notification)}
      onKeyDown={handleKeyDown}
      className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
        read ? "bg-white hover:bg-gray-50/90" : "bg-pink-50/80 hover:bg-pink-100/60"
      }`}
    >
      <button
        type="button"
        onClick={handleOpenProfile}
        disabled={!actorHandle}
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 to-orange-300 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:hover:opacity-100"
        aria-label={`Buka profil ${actorName}`}
      >
        {actorAvatar ? (
          <img
            src={actorAvatar}
            alt={actorName}
            className="h-full w-full object-cover"
          />
        ) : (
          actorName.charAt(0).toUpperCase()
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-gray-700">
          <button
            type="button"
            onClick={handleOpenProfile}
            disabled={!actorHandle}
            className="font-semibold text-gray-900 transition-colors hover:text-pink-600 disabled:hover:text-gray-900"
          >
            {actorName}
          </button>{" "}
          {message}{" "}
          {target && (
            <span className="font-semibold text-gray-900">{target}</span>
          )}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`rounded-full p-1 ${iconMeta.bg}`}>
            {iconMeta.icon}
          </span>
          <span className="text-xs text-gray-500">
            {formatNotificationTime(getNotificationTime(notification))}
          </span>
          {readingIds.has(notificationId) && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-500" />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!read && (
          <span
            className="mt-2 h-2.5 w-2.5 rounded-full bg-pink-500"
            aria-label="Belum dibaca"
          />
        )}
        <button
          type="button"
          onClick={(event) => onDelete(event, notification)}
          disabled={deletingId === notificationId}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 group-hover:bg-white/80"
          title="Hapus notifikasi"
          aria-label="Hapus notifikasi"
        >
          {deletingId === notificationId ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
