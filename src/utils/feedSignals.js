export const NEW_CONTENT_EVENT = "biteyo:new-content";
export const NEW_CONTENT_REFRESH_EVENT = "biteyo:new-content-refresh";

/** Panggil saat ada bite baru masuk lewat realtime. */
export const notifyNewContent = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NEW_CONTENT_EVENT));
};

/** Panggil setelah feed berhasil di-refresh agar bullet hilang. */
export const clearNewContent = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NEW_CONTENT_EVENT, { detail: { cleared: true } }));
};

/**
 * Dipicu saat user mengeklik bullet di icon Search/Explore.
 * Halaman feed yang memasang listener akan menjalankan refresh.
 */
export const requestNewContentRefresh = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NEW_CONTENT_REFRESH_EVENT));
};
