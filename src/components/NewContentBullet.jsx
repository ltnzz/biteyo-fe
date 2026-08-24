import { requestNewContentRefresh } from "../utils/feedSignals";

/**
 * Bullet kecil penanda "ada konten baru", di-overlay di atas icon nav.
 * Klik bullet memicu refresh feed (bukan navigasi).
 */
export default function NewContentBullet() {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        requestNewContentRefresh();
      }}
      className="absolute -right-1.5 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full"
      aria-label="Konten baru tersedia, klik untuk refresh"
      title="Konten baru — klik untuk refresh"
    >
      <span className="block h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-white transition-transform hover:scale-110" />
    </button>
  );
}
