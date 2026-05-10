import React, { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function MainHeader() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const readUser = () => {
      const stored = localStorage.getItem("biteyo_user");
      setCurrentUser(stored ? JSON.parse(stored) : null);
    };

    readUser();
    window.addEventListener("storage", readUser);
    return () => window.removeEventListener("storage", readUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("biteyo_token");
    localStorage.removeItem("biteyo_user");
    setCurrentUser(null);
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <header className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity group"
        >
          <img
            src={logo}
            alt="BiteYo Logo"
            className="w-[100px] h-auto object-cover group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bites..."
            className="w-full bg-gray-50 border border-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm transition-all"
          />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4 ml-auto">
          {currentUser ? (
            <div className="flex items-center gap-5">
              <button className="text-gray-400 hover:text-pink-500 transition-colors relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="relative group cursor-pointer flex items-center gap-2 p-1 pr-2 rounded-full border border-transparent hover:bg-gray-50 transition-colors">
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Halo,
                  </p>
                  <p className="text-sm font-bold text-gray-800 max-w-[100px] truncate">
                    {currentUser.username ||
                      currentUser.name ||
                      currentUser.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-pink-500 transition-colors" />

                {/* Dropdown */}
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden min-w-[160px]">
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 font-medium text-sm hover:text-pink-500 transition-colors hidden sm:block"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm inline-block"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
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
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
