import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, MessageCircle, Sparkles } from "lucide-react";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import SearchBox from "../components/explore/SearchBox";
import TrendingList from "../components/TrendingList";
import { getFeedBites } from "../services/feedApi";
import { getStoredUser, isAuthenticated } from "../utils/auth";
import { normalizeBites } from "../utils/bites";

/**
 * Mockup homepage baru ala Twitter/X (route /beranda).
 * - User login : welcome strip + feed bite terbaru
 * - Tamu       : hero marketing + CTA login
 * Kolom kanan  : trending vertikal (publik) + sponsor.
 */
export default function BerandaPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const hasSession = useMemo(() => isAuthenticated(), []);
  const [bites, setBites] = useState([]);
  const [loading, setLoading] = useState(hasSession);

  useEffect(() => {
    if (!hasSession) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getFeedBites();
        if (!cancelled) setBites(normalizeBites(data));
      } catch {
        if (!cancelled) setBites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [hasSession]);

  const displayName = useMemo(
    () => currentUser?.name || currentUser?.username || "",
    [currentUser],
  );

  const openExplore = useCallback(() => navigate("/explore"), [navigate]);

  // ── TAMU: hero marketing + trending vertikal ──
  if (!hasSession) {
    return (
      <div className="min-h-screen bg-cream-100">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
          <main className="min-h-screen w-full max-w-2xl border-x border-cream-300 bg-white shadow-card">
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-50/80 via-orange-50/50 to-white px-6 py-14 text-center sm:px-10 sm:py-20">
              <h1 className="bg-gradient-to-r from-pink-500 via-pink-600 to-orange-500 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
                Bite it. Rate it.
                <span className="block text-pink-500">BiteYo.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base">
                Temukan makanan trending, hidden gems, dan review jujur dari
                foodies di sekitarmu.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full max-w-xs rounded-full bg-pink-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition-all hover:-translate-y-0.5 hover:bg-pink-600 sm:w-auto"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="w-full max-w-xs rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:bg-gray-50 sm:w-auto"
                >
                  Daftar
                </button>
              </div>
            </div>

            <div className="p-4">
              <SearchBox />
            </div>
          </main>

          <aside className="hidden w-80 shrink-0 space-y-4 px-4 lg:block xl:w-96">
            <TrendingList />
            <AdvertisementSidebar />
          </aside>
        </div>
      </div>
    );
  }

  // ── USER LOGIN: welcome strip + feed bite terbaru ──

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
        {/* kolom tengah */}
        <main className="min-h-screen w-full max-w-2xl border-x border-cream-300 bg-white shadow-card">
          <div className="border-b border-cream-200 bg-gradient-to-br from-pink-50/70 via-orange-50/40 to-white px-4 py-5">
            <h1 className="inline-flex items-center gap-2 text-xl font-extrabold text-gray-900">
              <Sparkles className="h-5 w-5 text-pink-500" />
              Selamat datang kembali{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Ini yang hangat dibahas di Biteyo minggu ini.
            </p>
            <div className="mt-3">
              <SearchBox />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : bites.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-500">Belum ada bite untuk ditampilkan.</p>
            </div>
          ) : (
            <ul className="divide-y divide-cream-200">
              {bites.map((bite) => (
                <li key={bite.id || bite._id}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/bites/${bite.id || bite._id}`)
                    }
                    className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-cream-200/50"
                  >
                    {(bite.photoUrl || bite.image) && (
                      <img
                        src={bite.photoUrl || bite.image}
                        alt={bite.foodName || bite.title || "Food"}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover border border-gray-200/80"
                        loading="lazy"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-gray-900">
                        {bite.foodName || bite.title || "Untitled Bite"}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        @{bite.user?.username || "anonim"} ·{" "}
                        {bite.locationName?.split(",")[0] || "Unknown location"}
                      </span>
                      {bite.review && (
                        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-gray-600">
                          {bite.review}
                        </span>
                      )}
                      <span className="mt-1.5 inline-flex items-center gap-3 text-xs font-semibold text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {bite.likesCount ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {bite.commentsCount ?? 0}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-cream-200 p-4 text-center">
            <button
              type="button"
              onClick={openExplore}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-600 transition-colors duration-150 hover:border-pink-300 hover:text-pink-500"
            >
              Lihat semua di Explore
            </button>
          </div>
        </main>

        {/* kolom kanan: trending vertikal + sponsor */}
        <aside className="hidden w-80 shrink-0 space-y-4 px-4 lg:block xl:w-96">
          <TrendingList />
          <AdvertisementSidebar />
        </aside>
      </div>
    </div>
  );
}
