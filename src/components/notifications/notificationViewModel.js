export const getActorName = (notification) => {
  const actor =
    notification.user ||
    notification.actor ||
    notification.sender ||
    notification.from;

  if (typeof actor === "string") return actor;

  return (
    actor?.username ||
    actor?.name ||
    actor?.displayName ||
    notification.userName ||
    notification.actorName ||
    notification.senderName ||
    notification.title ||
    "BiteYo"
  );
};

export const getNotificationMessage = (notification) =>
  notification.message ||
  notification.body ||
  notification.text ||
  notification.content ||
  notification.action ||
  "Ada notifikasi baru untuk kamu.";

export const getNotificationTarget = (notification) => {
  const target = notification.target || notification.bite || notification.post;

  if (typeof target === "string") return target;

  return (
    target?.foodName ||
    target?.title ||
    target?.name ||
    notification.targetName ||
    notification.foodName ||
    ""
  );
};

export const getNotificationTime = (notification) =>
  notification.createdAt ||
  notification.created_at ||
  notification.updatedAt ||
  notification.time;

export const formatNotificationTime = (value) => {
  if (!value) return "Baru saja";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );
  const units = [
    { label: "tahun", seconds: 31536000 },
    { label: "bulan", seconds: 2592000 },
    { label: "hari", seconds: 86400 },
    { label: "jam", seconds: 3600 },
    { label: "menit", seconds: 60 },
  ];
  const unit = units.find((item) => diffInSeconds >= item.seconds);

  if (!unit) return "Baru saja";

  return `${Math.floor(diffInSeconds / unit.seconds)} ${unit.label} lalu`;
};
