import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Home,
  Loader2,
  LogOut,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import logo from "../assets/logo.png";
import SearchBox from "./explore/SearchBox";
import { biteCategories } from "../utils/bites";
import { logoutUser } from "../utils/logout";
import { getStoredUser } from "../utils/auth";

const isRouteActive = (pathname, targetPath) =>
  targetPath === "/"
    ? pathname === targetPath
    : pathname === targetPath || pathname.startsWith(`${targetPath}/`);

/**
 * MOCKUP BETA — sidebar all-in-one:
 * Logo -> Search -> Trending -> nav -> Post -> akun.
 * Hanya dirender di development (lihat gating di App.jsx).
 */
export default function SideBarBeta({ unreadNotifications = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTrending, setShowTrending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const trendingRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!trendingRef.current?.contains(event.target)) setShowTrending(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const currentUser = getStoredUser();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/explore", icon: Search, label: "Explore" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifications },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex h-full flex-col px-4 py-4">
      {/* Logo */}
      <Link to="/" className="mb-3 px-3">
        <img
          src={logo}
          alt="BiteYo"
          className="h-auto w-[110px] object-contain transition-opacity hover:opacity-80"
        />
      </Link>

      {/* Search + Trending */}
      <div className="mb-4 flex items-center gap-1.5">
        <SearchBox variant="sidebar" placeholder="Cari di Biteyo..." />
        <div ref={trendingRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTrending((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 bg-white text-gray-600 transition-colors duration-150 hover:border-pink-300 hover:text-pink-500"
            aria-label="Kategori trending"
          >
            <TrendingUp className="h-4 w-4 text-pink-500" />
          </button>

          {showTrending && (
            <div className="absolute left-full top-0 z-40 ml-2 w-52 overflow-hidden rounded-xl border border-cream-300 bg-white p-2 shadow-pop">
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
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(location.pathname, item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 rounded-full px-4 py-3 transition-colors duration-150 ${
                isActive
                  ? "bg-pink-50 font-bold text-pink-600"
                  : "font-normal text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="relative inline-flex h-6 w-6 items-center justify-center">
                <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                {item.badge > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-pink-500 px-1 text-[10px] font-extrabold leading-none text-white shadow-sm">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </span>
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Post Button */}
      <button
        type="button"
        onClick={() => navigate("/add")}
        className="mx-2 mt-4 rounded-full bg-pink-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pink-600"
      >
        Post
      </button>

      {/* Bottom Profile Section */}
      <div className="relative mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 p-2">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex min-w-0 items-center gap-2 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-extrabold text-pink-500">
              {(currentUser?.username || "U").charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 truncate text-sm font-bold text-gray-900">
              @{currentUser?.username || "guest"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            aria-label="Logout"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
