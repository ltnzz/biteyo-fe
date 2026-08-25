import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  Settings,
  TrendingUp,
  User,
  UserPlus,
} from "lucide-react";
import SearchBox from "./explore/SearchBox";
import { biteCategories } from "../utils/bites";
import { getStoredUser } from "../utils/auth";

/**
 * MOCKUP BETA — navbar mobile satu baris:
 * [Biteyo] [🔍 pill ringkas] [📈 trending] [⚙️ akun]
 * Hanya dirender di development (lihat gating di App.jsx).
 */
export default function MainHeaderBeta() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const [showTrending, setShowTrending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const trendingRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!trendingRef.current?.contains(event.target)) setShowTrending(false);
      if (!settingsRef.current?.contains(event.target)) setSettingsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const gearMenuButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100";

  return (
    <header className="sticky top-0 z-50 border-b border-cream-300 bg-white/95 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2 px-3">
        {/* Logo teks (mobile) — sembunyikan saat search expand */}
        {!searchExpanded && (
          <Link to="/" className="shrink-0 text-lg font-extrabold text-pink-500">
            BiteYo
          </Link>
        )}

        {/* Search pill ringkas */}
        <div
          className={`min-w-0 flex-1 ${searchExpanded ? "" : "sm:max-w-none"}`}
        >
          <SearchBox placeholder="Cari di Biteyo..." />
        </div>

        {/* Trending */}
        <div ref={trendingRef} className={`relative shrink-0 ${searchExpanded ? "hidden" : ""}`}>
          <button
            type="button"
            onClick={() => setShowTrending((v) => !v)}
            aria-label="Kategori trending"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          >
            <TrendingUp className="h-[18px] w-[18px] text-pink-500" />
          </button>

          {showTrending && (
            <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-cream-300 bg-white p-2 shadow-pop">
              <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                Popular now
              </p>
              {biteCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setShowTrending(false);
                    navigate(`/explore?category=${category.value}`);
                  }}
                  className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-600"
                >
                  #{category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Akun (mobile) */}
        <div ref={settingsRef} className={`relative shrink-0 ${searchExpanded ? "hidden" : ""}`}>
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="Pengaturan akun"
            aria-expanded={settingsOpen}
            className={gearMenuButton}
          >
            <Settings className="h-5 w-5" />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // beta: logout sederhana tanpa modal konfirmasi
                      await import("../utils/logout").then((m) => m.logoutUser());
                      navigate("/login", { replace: true });
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
