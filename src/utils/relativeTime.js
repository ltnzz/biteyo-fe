const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relativeFormatter =
  typeof Intl !== "undefined" && Intl.RelativeTimeFormat
    ? new Intl.RelativeTimeFormat("id", { numeric: "auto" })
    : null;

const absoluteFormatter =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const absoluteDateTimeFormatter =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

const asDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatRelativeTime = (value) => {
  const date = asDate(value);
  if (!date) return "";

  const elapsed = Date.now() - date.getTime();

  if (elapsed < MINUTE) return "baru saja";

  if (relativeFormatter) {
    if (elapsed < HOUR) {
      return relativeFormatter.format(-Math.floor(elapsed / MINUTE), "minute");
    }

    if (elapsed < DAY) {
      return relativeFormatter.format(-Math.floor(elapsed / HOUR), "hour");
    }

    if (elapsed < 7 * DAY) {
      return relativeFormatter.format(-Math.floor(elapsed / DAY), "day");
    }
  } else {
    if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} mnt lalu`;
    if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} jam lalu`;
    if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)} hari lalu`;
  }

  return formatAbsoluteDate(date);
};

export const formatAbsoluteDate = (value) => {
  const date = asDate(value);
  if (!date) return "";

  return absoluteFormatter ? absoluteFormatter.format(date) : date.toDateString();
};

export const formatAbsoluteDateTime = (value) => {
  const date = asDate(value);
  if (!date) return "";

  return absoluteDateTimeFormatter
    ? absoluteDateTimeFormatter.format(date)
    : date.toLocaleString();
};
