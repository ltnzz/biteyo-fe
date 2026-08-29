import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Flame,
  Loader2,
  LockKeyhole,
  MapPin,
  Star,
  Utensils,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFeedBites } from "../services/feedApi";
import {
  getBiteDescription,
  getBiteImage,
  getBiteRating,
  getBiteTitle,
  getCategoryLabel,
  getDisplayLocation,
  normalizeBites,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";
import {
  getBiteAuthorAvatar,
  getBiteAuthorName,
  getBiteId,
} from "../utils/biteEngagement";
import { isAuthenticated } from "../utils/auth";

const HOME_TRENDING_LIMIT = 6;

function TrendingBiteCard({ bite, onOpen }) {
  const image = getBiteImage(bite);
  const title = getBiteTitle(bite);
  const description = getBiteDescription(bite);
  const rating = getBiteRating(bite);
  const categories = normalizeCategories(bite.category || bite.categories);
  const primaryCategory = normalizeCategoryValue(categories[0] || "");
  const authorName = getBiteAuthorName(bite);
  const authorAvatar = getBiteAuthorAvatar(bite);

  return (
    <article
      onClick={onOpen}
      className="group flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-pink-50">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Utensils className="h-10 w-10 text-pink-300" />
          </div>
        )}
        {primaryCategory && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-pink-600 shadow-sm backdrop-blur-sm">
            {getCategoryLabel(primaryCategory)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-pink-100 ring-1 ring-pink-200">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-extrabold text-pink-500">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="min-w-0 truncate text-xs font-semibold text-gray-500">{authorName}</p>
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-base font-extrabold text-gray-900 transition-colors group-hover:text-pink-600">
          {title}
        </h3>

        {description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600">
            {description}
          </p>
        )}

        <div className="mt-auto pt-3.5 flex items-center justify-between gap-2 border-t border-gray-50 text-xs">
          <div className="flex min-w-0 items-center gap-1 text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-500" />
            <span className="truncate">{getDisplayLocation(bite)}</span>
          </div>

          {rating > 0 && (
            <div className="flex shrink-0 items-center gap-1 font-bold text-gray-800">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{Number(rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TrendingBites() {
  const [bites, setBites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasSession = useMemo(() => isAuthenticated(), []);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchTrending = async () => {
      if (!hasSession) {
        setBites([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getFeedBites({ signal: controller.signal });
        setBites(normalizeBites(data).slice(0, HOME_TRENDING_LIMIT));
      } catch (err) {
        if (err.name === "AbortError") return;
        setBites([]);
        setError(err.message || "Popular bites belum bisa dimuat.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchTrending();

    return () => controller.abort();
  }, [hasSession]);

  const handleLoadMore = () => {
    if (isAuthenticated()) {
      navigate("/explore");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="mt-6 sm:mt-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 ring-1 ring-orange-100">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Popular Bites
            </h2>
            <p className="text-xs text-gray-400 font-medium hidden sm:block">
              Kuliner paling populer dan banyak disukai
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="aspect-[16/10] animate-pulse rounded-xl bg-gray-100" />
              <div className="mt-3.5 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && bites.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
          {hasSession ? (
            <Loader2 className="mx-auto mb-3 h-6 w-6 text-gray-300" />
          ) : (
            <LockKeyhole className="mx-auto mb-3 h-6 w-6 text-pink-300" />
          )}
          <h3 className="text-base font-extrabold text-gray-900">
            {hasSession ? "Belum ada popular bite" : "Login untuk melihat popular bites"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {!hasSession
              ? "Feed saat ini membutuhkan sesi login."
              : "Postingan terbaru akan muncul di sini."}
          </p>
        </div>
      )}

      {!loading && !error && bites.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bites.map((bite, index) => {
              const biteId = getBiteId(bite);

              return (
                <TrendingBiteCard
                  key={biteId || index}
                  bite={bite}
                  onOpen={() => {
                    if (biteId) navigate(`/status/${biteId}`);
                  }}
                />
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-extrabold text-gray-800 shadow-sm transition-all hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-600 hover:shadow-md"
            >
              <span>Load more</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}

