import { getCategoryLabel } from "../../utils/bites";

export default function ExploreHeader({ category, query = "" }) {
  const subtitle = query
    ? `Search results for "${query}"`
    : category
      ? `Latest in ${getCategoryLabel(category)}`
      : "Latest bites from everyone";

  return (
    <div className="sticky top-[65px] lg:top-0 z-20 bg-white/85 px-4 py-3 backdrop-blur-md">
      <h1 className="text-xl font-extrabold text-gray-900">Explore</h1>
      <p className="text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}
