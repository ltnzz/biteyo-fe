import { Bookmark, Grid3x3, Heart } from "lucide-react";

const tabs = [
  { value: "posts", label: "Posts", icon: Grid3x3 },
  { value: "likes", label: "Likes", icon: Heart },
  { value: "save", label: "Save", icon: Bookmark },
];

export default function ProfileTabs({ activeTab, onChange, showSaved = true }) {
  const visibleTabs = tabs.filter((tab) => tab.value !== "save" || showSaved);

  return (
    <div className="border-b border-gray-200 bg-white">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`relative flex items-center justify-center gap-1.5 py-4 text-sm font-bold transition-colors ${
                isActive
                  ? "text-gray-900"
                  : "text-gray-500 hover:bg-gray-50/90 hover:text-gray-800"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-pink-500" : "text-gray-400"}`} />
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-8 bottom-0 h-1 rounded-full bg-pink-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
