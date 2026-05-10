import React, { useState, useEffect } from 'react';
import { Home, Search, Bell, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const readUser = () => {
      const stored = localStorage.getItem('biteyo_user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    };

    readUser();

    window.addEventListener('storage', readUser);

    return () => window.removeEventListener('storage', readUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('biteyo_token');
    localStorage.removeItem('biteyo_user');

    setCurrentUser(null);
    setShowLogoutModal(false);
    setShowDropdown(false);

    navigate('/');

    // trigger refresh component lain
    window.dispatchEvent(new Event('storage'));
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: User, label: 'Profile' },
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
                    ? 'font-bold text-gray-900'
                    : 'font-normal text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-2'
                  }`}
                />

                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Post Button */}
        <button className="mt-4 mx-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-sm">
          Post
        </button>

        {/* Bottom Profile Section */}
        <div className="mt-auto pt-4 relative">
          {currentUser ? (
            <>
              {/* Profile Button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-50 transition-colors w-full"
              >
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-pink-500" />
                </div>

                <div className="text-left overflow-hidden flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {currentUser.username || currentUser.name}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    @{currentUser.username}
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
                <p className="text-xs text-gray-500">
                  Untuk mulai menjelajah
                </p>
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
    </>
  );
}