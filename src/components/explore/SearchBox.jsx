import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Loader2, Search, TrendingUp } from "lucide-react";
import { searchBites } from "../../services/feedApi";
import { getBiteId } from "../../utils/biteEngagement";
import {
  getBiteTitle,
  getDisplayLocation,
  normalizeBites,
} from "../../utils/bites";
import { isAuthenticated } from "../../utils/auth";

/**
 * Pill search dengan dropdown live:
 * - hasil bite (debounce 450ms)
 * - section keyword trending mingguan (endpoint publik)
 *
 * variant:
 * - "bar"     : drop-down ke bawah, selebar kontainer (default)
 * - "sidebar" : panel melebar ke kanan (untuk sidebar 256px)
 * Tamu yang mencari diarahkan ke login.
 */
export default function SearchBox({ variant = "bar", placeholder = "Cari makanan, tempat, review..." }) {
  const navigate = useNavigate();
  const isSidebar = variant === "sidebar";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const searchRef = useRef(null);
  const trimmedQuery = query.trim();
  const loggedIn = isAuthenticated();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // keyword trending: dimuat saat fokus tanpa teks, atau saat mengetik
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const params = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : "";
        const response = await fetch(
          `${(import.meta.env.VITE_API_BASE_URL || "")}/api/feed/trending-keywords${params}`,
          { signal: controller.signal, credentials: "include" },
        );
        if (!response.ok) return;
        const json = await response.json();
        if (!controller.signal.aborted) {
          setTrending(Array.isArray(json?.data) ? json.data : []);
        }
      } catch {
        // trending bersifat dekoratif — gagal diabaikan
      }
    };

    load();
    return () => controller.abort();
  }, [trimmedQuery]);

  // hasil bite live
  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchBites(trimmedQuery, { signal: controller.signal });
        setResults(normalizeBites(data));
        setOpen(true);
      } catch (err) {
        if (err.name === "AbortError") return;
        setResults([]);
        setError(err.message || "Gagal mencari bites.");
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  const goToSearchPage = (keyword) => {
    setOpen(false);
    navigate(`/explore?q=${encodeURIComponent(keyword)}`);
  };

  const openBite = (bite) => {
    const biteId = getBiteId(bite);
    setOpen(false);

    if (!loggedIn) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/bites/${biteId}`)}`,
      );
      return;
    }

    if (biteId) navigate(`/bites/${biteId}`);
    else if (trimmedQuery) goToSearchPage(trimmedQuery);
  };

  return (
    <form
      ref={searchRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmedQuery) goToSearchPage(trimmedQuery);
      }}
      className="relative w-full"
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(Boolean(e.target.value.trim()));
            }}
            onFocus={() => setOpen(true)}
            placeholder="Cari makanan, tempat, review..."
            className="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-pink-200 focus:ring-2 focus:ring-pink-100"
          />
        </div>
      </div>

      {open && (
        <div
          className={
            isSidebar
              ? "absolute left-full top-0 z-40 ml-2 w-[400px] overflow-hidden rounded-xl border border-cream-300 bg-white shadow-pop"
              : "absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-cream-300 bg-white shadow-pop"
          }
        >
          {/* hasil bite */}
          <div className="border-b border-cream-200 px-4 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Hasil pencarian
            </p>
          </div>

          {!loggedIn && trimmedQuery && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/login?redirect=${encodeURIComponent(`/explore?q=${trimmedQuery}`)}`,
                )
              }
              className="w-full px-4 py-3 text-left text-sm font-semibold text-pink-600 hover:bg-pink-50"
            >
              Login untuk melihat hasil "{trimmedQuery}"
            </button>
          )}

          {loggedIn && loading && (
            <div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
              Mencari...
            </div>
          )}

          {loggedIn && !loading && error && (
            <div className="px-4 py-3 text-sm text-red-500">{error}</div>
          )}

          {loggedIn && !loading && !error && results.length > 0 && (
            <div className="max-h-72 overflow-y-auto py-1">
              {results.map((bite, index) => (
                <button
                  type="button"
                  key={getBiteId(bite) || index}
                  onClick={() => openBite(bite)}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-cream-200/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {getBiteTitle(bite)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {getDisplayLocation(bite)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* keyword trending */}
          {trending.length > 0 && (
            <>
              <div className="border-b border-cream-200 border-t px-4 py-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  Trending minggu ini
                </p>
              </div>
              <div className="py-1">
                {trending.map((item) => (
                  <button
                    key={item.keyword}
                    type="button"
                    onClick={() => goToSearchPage(item.keyword)}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-cream-200/60"
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize text-gray-700">
                      {item.keyword}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-gray-400">
                      {item.count} bite
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </form>
  );
}
