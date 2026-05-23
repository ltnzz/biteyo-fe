import { getNotificationId } from "../../utils/notifications";
import {
  getActorName,
  getNotificationMessage,
} from "./notificationViewModel";
import NotificationItem from "./NotificationItem";

export default function NotificationList({
  deletingId,
  notifications,
  readingIds,
  onDelete,
  onMarkRead,
}) {
  return (
    <div className="divide-y divide-gray-200 bg-white">
      {notifications.map((notification) => {
        const notificationId = getNotificationId(notification);
        const actorName = getActorName(notification);
        const message = getNotificationMessage(notification);

        return (
          <NotificationItem
            key={notificationId || `${actorName}-${message}`}
            deletingId={deletingId}
            notification={notification}
            readingIds={readingIds}
            onDelete={onDelete}
            onMarkRead={onMarkRead}
          />
        );
      })}
    </div>
  );
}
