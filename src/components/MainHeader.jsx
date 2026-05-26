import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchBites } from "../services/feedApi";
import {
  biteCategories,
  getBiteDescription,
  getBiteImage,
  getBiteTitle,
  getDisplayLocation,
  normalizeBites,
  normalizeCategories,
  normalizeCategoryValue,
  getCategoryLabel,
} from "../utils/bites";
import { getBiteId } from "../utils/biteEngagement";

export default function MainHeader() {
  const [query, setQuery] = useState("");
  const [showTrending, setShowTrending] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef(null);
  const trendingRef = useRef(null);
  const navigate = useNavigate();
  const trimmedQuery = query.trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!trendingRef.current?.contains(event.target)) {
        setShowTrending(false);
      }

      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      setHasSearched(false);
      return undefined;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");
    setHasSearched(false);

    const timeoutId = setTimeout(async () => {
      setHasSearched(true);

      try {
        const data = await searchBites(trimmedQuery, { signal: controller.signal });
        setSearchResults(normalizeBites(data));
        setSearchOpen(true);
      } catch (err) {
        if (err.name === "AbortError") return;
        setSearchResults([]);
        setSearchError(err.message || "Gagal mencari bites.");
        setSearchOpen(true);
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  const openBite = (bite) => {
    const biteId = getBiteId(bite);

    setSearchOpen(false);
    if (biteId) navigate(`/bites/${biteId}`);
    else if (trimmedQuery) navigate(`/explore?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setSearchOpen(Boolean(e.target.value.trim()));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (trimmedQuery) {
      setSearchOpen(false);
      navigate(`/explore?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 bg-white z-50 border-b border-gray-100 py-3">
      <div className="flex items-center gap-2 px-3 sm:gap-4 sm:px-4">
        {/* Search Bar */}
        <form ref={searchRef} onSubmit={handleSearch} className="relative min-w-0 flex-1 max-w-3xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setSearchOpen(Boolean(trimmedQuery))}
            placeholder="Search bites..."
            className="w-full bg-gray-50 border border-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm transition-all"
          />

          {searchOpen && trimmedQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Search results
                </p>
              </div>

              {searchLoading && (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                  Searching bites...
                </div>
              )}

              {!searchLoading && searchError && (
                <div className="px-4 py-4 text-sm text-red-500">{searchError}</div>
              )}

              {!searchLoading && !searchError && hasSearched && searchResults.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-gray-900">No bites found</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Try another food, review, or location keyword.
                  </p>
                </div>
              )}

              {!searchLoading && !searchError && searchResults.length > 0 && (
                <div className="max-h-[420px] overflow-y-auto py-1">
                  {searchResults.map((bite, index) => {
                    const image = getBiteImage(bite);
                    const categories = normalizeCategories(bite.category || bite.categories);

                    return (
                      <button
                        type="button"
                        key={getBiteId(bite) || index}
                        onClick={() => openBite(bite)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-pink-50"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-pink-50">
                          {image ? (
                            <img
                              src={image}
                              alt={getBiteTitle(bite)}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Search className="h-4 w-4 text-pink-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {getBiteTitle(bite)}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {getDisplayLocation(bite)}
                          </p>
                          {getBiteDescription(bite) && (
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600">
                              {getBiteDescription(bite)}
                            </p>
                          )}
                          {categories.length > 0 && (
                            <p className="mt-1 text-[11px] font-semibold text-pink-500">
                              {getCategoryLabel(normalizeCategoryValue(categories[0]))}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Trending Dropdown */}
        <div ref={trendingRef} className="relative">
          <button
            onClick={() => setShowTrending(!showTrending)}
            className="flex items-center gap-2 rounded-full px-2 py-2 text-gray-600 transition-colors hover:bg-gray-100 sm:px-3"
          >
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium hidden sm:block">Trending</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTrending ? 'rotate-180' : ''}`} />
          </button>

          {showTrending && (
            <div className="absolute top-full right-0 mt-2 bg-white shadow-xl border border-gray-100 rounded-xl p-3 min-w-[200px] z-50">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 px-2">Popular now</p>
              {biteCategories.map((category) => (
                <span
                  key={category.value}
                  onClick={() => {
                    navigate(`/explore?category=${category.value}`);
                    setShowTrending(false);
                  }}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 cursor-pointer transition-colors"
                >
                  #{category.label}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
