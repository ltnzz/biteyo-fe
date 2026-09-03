import { showSnackbar } from "./snackbar";

export const buildShareUrl = (biteId) =>
  `${window.location.origin}/status/${encodeURIComponent(biteId)}`;

export const buildProfileShareUrl = (username) => {
  const clean = String(username || "")
    .trim()
    .replace(/^@+/, "");
  if (!clean) return `${window.location.origin}/profile`;
  return `${window.location.origin}/u/${encodeURIComponent(clean)}`;
};

export const getProfilePath = (username) => {
  const clean = String(username || "")
    .trim()
    .replace(/^@+/, "");
  return clean ? `/u/${encodeURIComponent(clean)}` : "/profile";
};

/**
 * Bagikan bite lewat Web Share API; fallback ke copy-link.
 * Mengembalikan aksi yang terjadi untuk feedback snackbar.
 */
export const shareBite = async ({ biteId, title, text }) => {
  if (!biteId) return { skipped: true };

  const url = buildShareUrl(biteId);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { shared: true };
    } catch (err) {
      if (err?.name === "AbortError") return { cancelled: true };
      // fallthrough ke clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { copied: true };
  } catch {
    showSnackbar({
      message: "Gagal menyalin link. Coba lagi.",
      variant: "error",
    });
    return { failed: true };
  }
};

/** Feedback snackbar berdasarkan hasil shareBite. */
export const notifyShareResult = (result) => {
  if (result?.shared) {
    showSnackbar({ message: "Bite dibagikan!", variant: "success" });
  } else if (result?.copied) {
    showSnackbar({ message: "Link bite disalin", variant: "success" });
  }
};

/**
 * Bagikan profil lewat Web Share API; fallback ke copy-link.
 * URL selalu unik: /u/:username (bukan /profile tanpa USN).
 */
export const shareProfile = async ({ username, displayName }) => {
  const clean = String(username || "")
    .trim()
    .replace(/^@+/, "");
  if (!clean) return { skipped: true };

  const url = buildProfileShareUrl(clean);
  const title = displayName
    ? `Profil ${displayName} (@${clean}) di Biteyo`
    : `Profil @${clean} di Biteyo`;
  const text = displayName
    ? `Lihat rekomendasi kuliner dari ${displayName} di Biteyo!`
    : `Lihat profil @${clean} di Biteyo!`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { shared: true };
    } catch (err) {
      if (err?.name === "AbortError") return { cancelled: true };
      // fallthrough ke clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { copied: true };
  } catch {
    showSnackbar({
      message: "Gagal menyalin link profil. Coba lagi.",
      variant: "error",
    });
    return { failed: true };
  }
};

export const notifyProfileShareResult = (result) => {
  if (result?.shared) {
    showSnackbar({ message: "Profil dibagikan!", variant: "success" });
  } else if (result?.copied) {
    showSnackbar({ message: "Link profil disalin", variant: "success" });
  }
};
