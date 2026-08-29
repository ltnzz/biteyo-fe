import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  TrendingUp,
  User,
} from "lucide-react";
import logo from "../assets/logo.png";
import ConfirmDialog from "./ConfirmDialog";
import { getBiteCategories, getFeedBites } from "../services/feedApi";
import { biteCategories } from "../utils/bites";
import { logoutUser } from "../utils/logout";
import { getStoredUser } from "../utils/auth";

const isRouteActive = (pathname, targetPath) =>
  targetPath === "/"
    ? pathname === targetPath
    : pathname === targetPath || pathname.startsWith(`${targetPath}/`);

/**
 * SIDEBAR BETA — layout ramping, rapi, dan proporsional (w-56) tanpa tombol trigger/icon ganda.
 */
export default function SideBarBeta({ unreadNotifications = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTrending, setShowTrending] = useState(false);
  const [categoriesData, setCategoriesData] = useState(biteCategories);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const trendingRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("biteyo-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("biteyo-auth-change", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCategoryCounts = async () => {
      try {
        const [catRes, bitesRes] = await Promise.allSettled([
          getBiteCategories(),
          getFeedBites(),
        ]);

        const list =
          catRes.status === "fulfilled"
            ? Array.isArray(catRes.value)
              ? catRes.value
              : Array.isArray(catRes.value?.data)
                ? catRes.value.data
                : []
            : [];

        const rawBites =
          bitesRes.status === "fulfilled" ? bitesRes.value : null;
        const bitesList = Array.isArray(rawBites)
          ? rawBites
          : Array.isArray(rawBites?.bites)
            ? rawBites.bites
            : Array.isArray(rawBites?.data)
              ? rawBites.data
              : [];

        const bitesCountMap = {};
        for (const b of bitesList) {
          const cat = b?.category
            ? String(b.category).toLowerCase().replace(/[\s-]/g, "_")
            : "";
          if (cat) bitesCountMap[cat] = (bitesCountMap[cat] || 0) + 1;
        }

        const baseCategories = list.length > 0 ? list : biteCategories;
        const mapped = baseCategories.map((c) => {
          const catVal = String(c.value || "").toLowerCase().replace(/[\s-]/g, "_");
          const backendCount = Number(c.count) || 0;
          const localCount = bitesCountMap[catVal] || 0;
          return {
            ...c,
            count: Math.max(backendCount, localCount),
          };
        });

        const sorted = [...mapped].sort(
          (a, b) => (Number(b.count) || 0) - (Number(a.count) || 0),
        );

        if (!cancelled) {
          setCategoriesData(sorted);
        }
      } catch {
        // fallback to default biteCategories
      }
    };

    loadCategoryCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!trendingRef.current?.contains(event.target)) setShowTrending(false);
      if (!profileMenuRef.current?.contains(event.target)) setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logoutUser();
      setShowLogoutModal(false);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifications },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex h-full flex-col px-3 py-4 select-none">
      {/* Logo */}
      <Link to="/" className="mb-4 px-3">
        <img
          src={logo}
          alt="Biteyo"
          className="h-auto w-[110px] object-contain transition-opacity hover:opacity-80"
        />
      </Link>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(location.pathname, item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3.5 rounded-full px-3.5 py-2.5 transition-colors duration-150 ${
                isActive
                  ? "bg-pink-50 font-bold text-pink-600"
                  : "font-medium text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="relative inline-flex h-5 w-5 items-center justify-center">
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                {item.badge > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* Trending Popover Menu Item */}
        <div ref={trendingRef} className="relative">
          <button
            type="button"
            onClick={() => setShowTrending((v) => !v)}
            className={`flex w-full items-center gap-3.5 rounded-full px-3.5 py-2.5 transition-colors duration-150 text-left ${
              showTrending
                ? "bg-pink-50 font-bold text-pink-600"
                : "font-medium text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-5 w-5 text-pink-500 shrink-0" />
            <span className="text-sm">Trending</span>
          </button>

          {showTrending && (
            <div className="absolute left-full top-0 z-50 ml-2 w-64 overflow-hidden rounded-2xl border border-cream-300 bg-white p-2.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-cream-200">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Trending sekarang
                </span>
                <TrendingUp className="h-3.5 w-3.5 text-pink-500" />
              </div>
              <div className="space-y-0.5 max-h-72 overflow-y-auto py-1">
                {categoriesData.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => {
                      setShowTrending(false);
                      navigate(`/explore?category=${category.value}`);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                      <span className="truncate font-semibold group-hover:text-pink-600">
                        #{category.label?.replace(/\s+/g, "") || category.value}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-gray-400 group-hover:text-pink-500 ml-2">
                      {typeof category.count === "number" ? `${category.count} postingan` : "0 postingan"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Post Button */}
      <button
        type="button"
        onClick={() => navigate("/add")}
        className="mx-1 mt-4 rounded-full bg-pink-500 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-pink-600 hover:shadow-md"
      >
        Post
      </button>

      {/* Bottom Profile Section */}
      <div ref={profileMenuRef} className="relative mt-auto pt-4">
        {currentUser ? (
          <>
            <button
              type="button"
              onClick={() => setShowDropdown((v) => !v)}
              className="flex w-full items-center gap-2.5 rounded-full p-2 transition-colors hover:bg-gray-50 text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-100 text-xs font-extrabold text-pink-500">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (currentUser?.name || currentUser?.username || "U").charAt(0).toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-gray-900">
                  {currentUser?.name || currentUser?.username || "User"}
                </span>
                <span className="block truncate text-[11px] text-gray-500">
                  @{currentUser?.username || "guest"}
                </span>
              </span>
            </button>

            {showDropdown && (
              <div className="absolute bottom-full left-0 right-0 z-50 mb-2">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            className="flex w-full items-center gap-2.5 rounded-full p-2 transition-colors hover:bg-gray-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <User className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-gray-900">Login</span>
            </span>
          </Link>
        )}
      </div>

      {/* Konfirmasi keluar */}
      <ConfirmDialog
        open={showLogoutModal}
        loading={loggingOut}
        title="Keluar dari Biteyo?"
        description="Kamu harus login lagi untuk mengakses akun dan fitur personalmu."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
