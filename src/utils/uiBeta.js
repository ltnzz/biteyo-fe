/**
 * Flag fitur UI beta (sidebar & navbar mockup).
 * Hanya aktif di development (localhost) — bundle produksi
 * tidak mengenal komponen/route beta sama sekali.
 */
export const SHOW_UI_BETA = import.meta.env.DEV;

/**
 * Kelas offset untuk header sticky halaman:
 * mobile memakai navbar atas (65px), desktop beta tidak punya navbar atas.
 */
export const STICKY_HEADER_CLASS = SHOW_UI_BETA
  ? "top-[65px] lg:top-0"
  : "top-[65px]";
