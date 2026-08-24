export const SNACKBAR_EVENT = "biteyo:snackbar";

/**
 * Tampilkan snackbar global (auto-dismiss).
 *
 * @param {object} options
 * @param {string} options.message   - teks yang ditampilkan (wajib)
 * @param {"info"|"success"|"error"} [options.variant] - gaya warna ikon
 * @param {number} [options.duration] - ms sebelum hilang otomatis (default 2400)
 */
export const showSnackbar = ({ message, variant = "info", duration = 2400 }) => {
  if (!message || typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(SNACKBAR_EVENT, {
      detail: { message, variant, duration, id: Date.now() + Math.random() },
    }),
  );
};
