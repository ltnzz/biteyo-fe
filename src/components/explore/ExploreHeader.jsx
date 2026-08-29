import { getCategoryLabel } from "../../utils/bites";

export default function ExploreHeader({ category, query = "" }) {
  const subtitle = query
    ? `Search results for "${query}"`
    : category
      ? `Latest in ${getCategoryLabel(category)}`
      : "Latest bites from everyone";

  return (
    <div className="sticky top-[65px] lg:top-0 z-20 flex items-center gap-3 border-b border-cream-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="truncate text-base sm:text-lg font-black text-gray-900 leading-tight">Explore</h1>
        <p className="truncate text-[11px] font-semibold text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
