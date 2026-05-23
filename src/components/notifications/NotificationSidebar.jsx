import { Bell, CheckCheck, MessageCircle, UserPlus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { notificationFilters } from "./notificationFilters";

const filterIcons = {
  all: Bell,
  unread: CheckCheck,
  likes: Heart,
  comments: MessageCircle,
  follows: UserPlus,
};

export default function NotificationSidebar({
  activeFilter,
  counts,
  onChange,
}) {
  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-[86px] space-y-4 pr-4">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="p-2">
            {notificationFilters.map((filter) => {
              const Icon = filterIcons[filter.value] || Bell;
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onChange(filter.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-pink-50 font-bold text-pink-600 shadow-sm"
                      : "font-semibold text-gray-700 hover:bg-gray-100/80"
                  }`}
                >
                  <span className="inline-flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{filter.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? "bg-white text-pink-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {counts[filter.value] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <h3 className="text-sm font-extrabold text-gray-900">Keep exploring</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold">
            <Link to="/explore" className="rounded-xl px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100/80">
              Explore bites
            </Link>
            <Link to="/add" className="rounded-xl px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100/80">
              Post a bite
            </Link>
            <Link to="/profile" className="rounded-xl px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100/80">
              View profile
            </Link>
          </div>
        </section>
      </div>
    </aside>
  );
}
