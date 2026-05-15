import { getCategoryLabel } from "../../utils/bites";

export default function ExploreHeader({ category }) {
  return (
    <div className="sticky top-[65px] bg-white/95 backdrop-blur z-20 border-b border-gray-100 px-4 py-3">
      <h1 className="text-xl font-extrabold text-gray-900">Explore</h1>
      <p className="text-sm text-gray-500">
        {category ? `Latest in ${getCategoryLabel(category)}` : "Latest bites from everyone"}
      </p>
    </div>
  );
}
