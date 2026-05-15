import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Home, Search, Bell, User, LogOut, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getUserProfile } from "../services/profileApi";
import { postJson } from "../utils/api";
import { AUTH_CHANGE_EVENT, clearAuth, getAuthHeaders, getStoredUser, saveAuth } from "../utils/auth";
import { unregisterFcmToken } from "../utils/notifications";
import { getProfileAvatar, getProfileUsername } from "../utils/profile";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const profileMenuRef = useRef(null);
  const profileUsername = getProfileUsername(currentUser);
  const profileAvatar = getProfileAvatar(currentUser);
  const profileName = currentUser?.username || currentUser?.name || "BiteYo User";

  useEffect(() => {
    const readUser = () => {
      setCurrentUser(getStoredUser());
    };

    readUser();

    window.addEventListener("storage", readUser);
    window.addEventListener(AUTH_CHANGE_EVENT, readUser);

    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener(AUTH_CHANGE_EVENT, readUser);
    };
  }, []);

  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!profileUsername) return undefined;

    let ignore = false;

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(profileUsername);
        if (ignore || !profile) return;

        const mergedUser = { ...(getStoredUser() || {}), ...profile };
        setCurrentUser(mergedUser);
        saveAuth({ user: mergedUser });
      } catch (err) {
        console.warn("Failed to load sidebar profile:", err);
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [profileUsername]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    setLogoutError("");

    try {
      unregisterFcmToken().catch((err) => {
        console.warn("Failed to unregister FCM token during logout:", err);
      });

      await postJson("/api/auth/logout", null, {
        fallback: "Gagal logout. Silakan coba lagi.",
        headers: getAuthHeaders(),
      });

      clearAuth();
      setCurrentUser(null);
      setShowLogoutModal(false);
      setShowDropdown(false);
      navigate("/login", { replace: true });
    } catch (err) {
      setLogoutError(err.message || "Gagal logout. Silakan coba lagi.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/explore", icon: Search, label: "Explore" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      <div className="h-full flex flex-col px-4 py-4 relative">
        {/* Logo */}
        <Link to="/" className="mb-4 px-3">
          <img
            src={logo}
            alt="BiteYo"
            className="w-[130px] h-auto object-contain hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Nav Items */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                  isActive
                    ? "font-bold text-gray-900"
                    : "font-normal text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "stroke-[2.5px]" : "stroke-2"
                  }`}
                />

                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Post Button */}
        <button
          onClick={() => navigate("/add")}
          className="mt-4 mx-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-sm"
        >
          Post
        </button>
        {/* Bottom Profile Section */}
        <div ref={profileMenuRef} className="mt-auto pt-4 relative">
          {currentUser ? (
            <>
              {/* Profile Button */}
              <button
                onClick={() => {
                  setLogoutError("");
                  setShowDropdown(!showDropdown);
                }}
                className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-50 transition-colors w-full"
              >
                <div className="w-10 h-10 bg-pink-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt={profileName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-extrabold text-pink-500">
                      {profileName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="text-left overflow-hidden flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {profileName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    @{currentUser.username || profileUsername}
                  </p>
                </div>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-full z-50">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-50 transition-colors w-full"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>

              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Login</p>
                <p className="text-xs text-gray-500">Untuk mulai menjelajah</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="text-red-500" size={22} />
            </div>

            <h2 className="text-lg font-extrabold text-gray-900 text-center mb-1">
              Keluar dari BiteYo?
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
              Kamu harus login lagi untuk mengakses akun dan fitur personalmu.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!logoutLoading) setShowLogoutModal(false);
                }}
                disabled={logoutLoading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                Batal
              </button>

              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-70"
              >
                {logoutLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Keluar...
                  </span>
                ) : (
                  "Ya, Keluar"
                )}
              </button>
            </div>

            {logoutError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                <span>{logoutError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
