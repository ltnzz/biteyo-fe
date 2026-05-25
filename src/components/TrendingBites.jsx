import React, { useEffect, useMemo, useState } from "react";
import {
  Coffee,
  Flame,
  Gem,
  LockKeyhole,
  Loader2,
  MapPin,
  Star,
  TrendingUp,
  Utensils,
  Wine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBitesByCategory, getFeedBites } from "../services/feedApi";
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
  toCategoryParam,
} from "../utils/bites";
import {
  getBiteAuthorAvatar,
  getBiteAuthorName,
  getBiteId,
} from "../utils/biteEngagement";
import { isAuthenticated } from "../utils/auth";

const categoryChips = [
  { label: "All", value: "all", icon: Utensils },
  { label: "Street Food", value: "street_food", icon: Utensils },
  { label: "Cafe", value: "cafe", icon: Coffee },
  { label: "Fine Dining", value: "fine_dining", icon: Wine },
  { label: "Viral", value: "viral", icon: Flame },
  { label: "Hidden Gems", value: "hidden_gems", icon: Gem },
];

const HOME_TRENDING_LIMIT = 6;

const getCategoryStats = (data) => {
  const candidates = [
    data?.categories,
    data?.trendingCategories,
    data?.categoryStats,
    data?.data?.categories,
    data?.data?.trendingCategories,
    data?.data?.categoryStats,
  ];
  const list = candidates.find(Array.isArray) || [];

  return list
    .map((item) => {
      const rawValue = item?.value || item?.category || item?.name || item?.label || "";
      const value = normalizeCategoryValue(rawValue);
      const count = Number(item?.count ?? item?.total ?? item?.uses ?? item?.posts ?? 0);

      return value ? { value, count: Number.isFinite(count) ? count : 0 } : null;
    })
    .filter(Boolean);
};

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
      className="group mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-pink-100 hover:shadow-md"
    >
      <div className="relative bg-pink-50">
        {image ? (
          <img src={image} alt={title} className="h-auto w-full" loading="lazy" />
        ) : (
          <div className="flex min-h-48 w-full items-center justify-center">
            <Utensils className="h-9 w-9 text-pink-300" />
          </div>
        )}
        {primaryCategory && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-pink-600 shadow-sm">
            {getCategoryLabel(primaryCategory)}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-pink-100">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-extrabold text-pink-500">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="min-w-0 truncate text-xs font-semibold text-gray-500">{authorName}</p>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-extrabold text-gray-900 group-hover:text-pink-600">
          {title}
        </h3>

        {description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-400" />
            <span className="truncate">{getDisplayLocation(bite)}</span>
          </div>

          {rating > 0 && (
            <div className="flex shrink-0 items-center gap-0.5">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${
                    index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TrendingBites() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [bites, setBites] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasSession = useMemo(() => isAuthenticated(), []);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchTrending = async () => {
      if (!hasSession) {
        setBites([]);
        setCategoryStats([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data =
          activeCategory === "all"
            ? await getFeedBites({ signal: controller.signal })
            : await getBitesByCategory(toCategoryParam(activeCategory), {
                signal: controller.signal,
              });

        setBites(normalizeBites(data).slice(0, HOME_TRENDING_LIMIT));
        if (activeCategory === "all" && categoryStats.length === 0) {
          setCategoryStats(getCategoryStats(data));
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setBites([]);
        setError(err.message || "Trending bites belum bisa dimuat.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchTrending();

    return () => controller.abort();
  }, [activeCategory, categoryStats.length, hasSession]);

  const categoryCounts = useMemo(() => {
    const counts = new Map(categoryStats.map((item) => [item.value, item.count]));

    bites.forEach((bite) => {
      normalizeCategories(bite.category || bite.categories).forEach((category) => {
        const value = normalizeCategoryValue(category);
        if (!value || counts.has(value)) return;
        counts.set(value, (counts.get(value) || 0) + 1);
      });
    });

    return counts;
  }, [bites, categoryStats]);

  const selectedCategory = categoryChips.find((item) => item.value === activeCategory);

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-gray-900">
          <TrendingUp className="h-6 w-6 shrink-0 text-pink-500" />
          <span className="truncate">Trending Bites</span>
        </h2>
        <button
          type="button"
          onClick={() =>
            navigate(
              activeCategory === "all"
                ? "/explore"
                : `/explore?category=${encodeURIComponent(activeCategory)}`,
            )
          }
          className="shrink-0 text-sm font-medium text-pink-500 hover:underline"
        >
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categoryChips.map((item) => {
          const Icon = item.icon;
          const active = activeCategory === item.value;
          const count = item.value === "all" ? 0 : categoryCounts.get(item.value) || 0;

          return (
            <button
              type="button"
              key={item.value}
              onClick={() => setActiveCategory(item.value)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold shadow-sm transition-colors ${
                active
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  active ? "bg-white/20" : "bg-pink-50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-pink-500"}`} />
              </span>
              {item.label}
              {count > 0 && (
                <span className={active ? "text-white/80" : "text-gray-400"}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] animate-pulse rounded-lg bg-gray-100" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && bites.length === 0 && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-6 py-12 text-center">
          {hasSession ? (
            <Loader2 className="mx-auto mb-3 h-6 w-6 text-gray-300" />
          ) : (
            <LockKeyhole className="mx-auto mb-3 h-6 w-6 text-pink-300" />
          )}
          <h3 className="text-base font-extrabold text-gray-900">
            {hasSession ? "Belum ada trending bite" : "Login untuk melihat trending bites"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {!hasSession
              ? "Feed dari backend saat ini membutuhkan sesi login."
              : activeCategory === "all"
              ? "Postingan terbaru akan muncul di sini."
              : `Belum ada bite untuk ${selectedCategory?.label || "kategori ini"}.`}
          </p>
        </div>
      )}

      {!loading && !error && bites.length > 0 && (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {bites.map((bite, index) => {
            const biteId = getBiteId(bite);

            return (
              <TrendingBiteCard
                key={biteId || index}
                bite={bite}
                onOpen={() => {
                  if (biteId) navigate(`/bites/${biteId}`);
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
