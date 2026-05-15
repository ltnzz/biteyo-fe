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

  const normalized = value.toLowerCase().replaceAll(" ", "_");
  const match = biteCategories.find(
    (category) =>
      category.value === normalized ||
      category.label.toLowerCase() === value.toLowerCase(),
  );

  return match?.value || normalized;
};

export const normalizeBites = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bites)) return data.bites;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.posts)) return data.posts;

  return [];
};

export const normalizeCategories = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];

  return [];
};
