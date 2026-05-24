export { API_BASE } from "./api";

export const biteCategories = [
  { label: "Street Food", value: "street_food" },
  { label: "Cafe", value: "cafe" },
  { label: "Fine Dining", value: "fine_dining" },
  { label: "Dessert", value: "dessert" },
  { label: "Viral", value: "viral" },
  { label: "Hidden Gems", value: "hidden_gems" },
];

export const getCategoryLabel = (value) =>
  biteCategories.find((category) => category.value === value)?.label || value;

export const normalizeCategoryValue = (value) => {
  if (!value) return "";

  const normalized = value.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
  const match = biteCategories.find(
    (category) =>
      category.value === normalized ||
      category.label.toLowerCase() === value.toLowerCase(),
  );

  return match?.value || normalized;
};

export const toCategoryParam = (value) => normalizeCategoryValue(value);

export const normalizeBites = (data) => {
  const candidates = [
    data,
    data?.bites,
    data?.data,
    data?.data?.bites,
    data?.data?.items,
    data?.data?.posts,
    data?.data?.results,
    data?.data?.trendingBites,
    data?.items,
    data?.posts,
    data?.results,
    data?.trendingBites,
  ];

  const list = candidates.find(Array.isArray);
  if (list) return list;

  return [];
};

export const normalizeCategories = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];

  return [];
};

export const getDisplayLocation = (bite) => {
  const location = bite?.locationName || bite?.location || "";

  return location.split(",")[0].trim() || "Unknown location";
};

export const getBiteTitle = (bite) =>
  bite?.foodName || bite?.title || bite?.name || "Untitled Bite";

export const getBiteDescription = (bite) =>
  bite?.review || bite?.description || bite?.caption || bite?.content || "";

export const getBiteImage = (bite) => {
  const firstImage = Array.isArray(bite?.images) ? bite.images[0] : null;

  if (typeof firstImage === "string") return firstImage;

  return (
    bite?.photoUrl ||
    bite?.image ||
    bite?.imageUrl ||
    bite?.thumbnail ||
    firstImage?.url ||
    firstImage?.src ||
    ""
  );
};

export const getBiteRating = (bite) => {
  const rating = Number(bite?.rating ?? bite?.score ?? 0);

  return Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
};
