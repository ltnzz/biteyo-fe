import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
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
 *
 * variant:
 * - "bar"     : drop-down ke bawah, selebar kontainer (default)
 * - "sidebar" : panel melebar ke kanan (untuk sidebar 256px)
 * - "compact" : icon-only button dengan modal/popover pencarian
 * Tamu yang mencari diarahkan ke login.
 */
export default function SearchBox({ variant = "bar", placeholder = "Cari makanan, tempat, review...", compact = false }) {
  const navigate = useNavigate();
  const isCompact = variant === "compact" || compact;
  const isSidebar = variant === "sidebar" || isCompact;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
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
    setError("");

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchBites(trimmedQuery, { signal: controller.signal });
        setResults(normalizeBites(data));
      } catch (err) {
        if (err.name === "AbortError") return;
        setResults([]);
        setError(err.message || "Gagal mencari bites.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  const handleSelectBite = (bite) => {
    const biteId = getBiteId(bite);
    setOpen(false);

    if (biteId) navigate(`/status/${biteId}`);
    else if (trimmedQuery) goToSearchPage(trimmedQuery);
  };

  const goToSearchPage = (q) => {
    setOpen(false);
    navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      ref={searchRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmedQuery) goToSearchPage(trimmedQuery);
      }}
      className={isCompact ? "relative" : "relative w-full"}
    >
      {isCompact ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-150 ${
            open
              ? "border-pink-300 bg-pink-50 text-pink-600 ring-2 ring-pink-100"
              : "border-cream-300 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-500"
          }`}
          aria-label="Cari"
          title="Cari di Biteyo"
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
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
              placeholder={placeholder}
              className="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-pink-200 focus:ring-2 focus:ring-pink-100"
            />
          </div>
        </div>
      )}

      {open && (
        <div
          className={
            isSidebar
              ? "absolute left-full top-0 z-50 ml-2 w-[340px] sm:w-[380px] overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-left-2 duration-150"
              : "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-2xl ring-1 ring-black/5"
          }
        >
          {isCompact && (
            <div className="p-2.5 border-b border-cream-200 bg-cream-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  placeholder={placeholder}
                  className="w-full rounded-full border border-cream-300 bg-white py-2 pl-9 pr-4 text-xs text-gray-700 outline-none transition-all focus:border-pink-200 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>
          )}

          {/* Konten Pencarian */}
          <div className="min-h-[60px] flex flex-col justify-center">
            {!loggedIn && trimmedQuery && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/login?redirect=${encodeURIComponent(`/explore?q=${trimmedQuery}`)}`,
                  )
                }
                className="w-full px-4 py-3.5 text-left text-sm font-semibold text-pink-600 hover:bg-pink-50 transition-colors"
              >
                Login untuk melihat hasil "{trimmedQuery}"
              </button>
            )}

            {loggedIn && loading && (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                <span>Mencari bites...</span>
              </div>
            )}

            {loggedIn && !loading && error && (
              <div className="px-4 py-4 text-center text-xs text-red-500">{error}</div>
            )}

            {loggedIn && !loading && !error && trimmedQuery && results.length === 0 && (
              <div className="px-4 py-5 text-center">
                <p className="text-sm font-semibold text-gray-800">Tidak ada bites ditemukan</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Coba kata kunci makanan, tempat, atau reviewer lain.
                </p>
              </div>
            )}

            {!trimmedQuery && (
              <div className="px-4 py-4 text-center text-xs text-gray-400">
                Ketik nama makanan, restoran, atau kota untuk mulai mencari...
              </div>
            )}

            {loggedIn && !loading && !error && results.length > 0 && (
              <div className="max-h-72 overflow-y-auto py-1">
                {results.map((bite, index) => (
                  <button
                    type="button"
                    key={getBiteId(bite) || index}
                    onClick={() => handleSelectBite(bite)}
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
          </div>
        </div>
      )}
    </form>
  );
}
