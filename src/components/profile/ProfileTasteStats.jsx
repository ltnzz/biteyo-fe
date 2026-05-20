import { MapPin, Star, Utensils } from "lucide-react";
import {
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../../utils/bites";

const getAverageRating = (bites) => {
  const ratings = bites
    .map((bite) => Number(bite.rating || 0))
    .filter((rating) => rating > 0);

  if (ratings.length === 0) return "0.0";

  return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
};

const getFavoriteCategory = (bites) => {
  const categoryCounts = new Map();

  bites.forEach((bite) => {
    normalizeCategories(bite.category || bite.categories).forEach((category) => {
      const value = normalizeCategoryValue(category);

      if (value) categoryCounts.set(value, (categoryCounts.get(value) || 0) + 1);
    });
  });

  const favorite = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return favorite ? getCategoryLabel(favorite) : "Belum ada";
};

const getTopLocation = (bites) => {
  const locationCounts = new Map();

  bites.forEach((bite) => {
    const location = bite.locationName || bite.location;

    if (location) locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  });

  return [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Belum ada";
};

export default function ProfileTasteStats({ bites = [] }) {
  const stats = [
    { label: "Avg rating", value: getAverageRating(bites), icon: Star },
    { label: "Favorite", value: getFavoriteCategory(bites), icon: Utensils },
    { label: "Top area", value: getTopLocation(bites), icon: MapPin },
  ];

  return (
    <div className="mt-4 border-y border-gray-100 py-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-pink-500" />
        <h3 className="text-sm font-extrabold text-gray-900">Taste stats</h3>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="truncate text-sm font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
