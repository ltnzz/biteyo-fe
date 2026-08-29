import { showSnackbar } from "./snackbar";

export const buildShareUrl = (biteId) =>
  `${window.location.origin}/status/${encodeURIComponent(biteId)}`;

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
