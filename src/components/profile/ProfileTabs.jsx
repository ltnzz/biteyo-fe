const tabs = [
  { value: "posts", label: "Posts" },
  { value: "likes", label: "Likes" },
  { value: "save", label: "Save" },
];

export default function ProfileTabs({ activeTab, onChange, showSaved = true }) {
  const visibleTabs = tabs.filter((tab) => tab.value !== "save" || showSaved);

  return (
    <div className="border-b border-gray-100">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`relative py-4 text-sm font-bold transition-colors ${
                isActive
                  ? "text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
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
