import { getCategoryLabel } from "../../utils/bites";

export default function ExploreHeader({ category, query = "" }) {
  const subtitle = query
    ? `Search results for "${query}"`
    : category
      ? `Latest in ${getCategoryLabel(category)}`
      : "Latest bites from everyone";

  return (
    <div className="sticky top-[65px] z-20 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-[0_1px_10px_rgba(15,23,42,0.035)] backdrop-blur">
      <h1 className="text-xl font-extrabold text-gray-900">Explore</h1>
      <p className="text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}
