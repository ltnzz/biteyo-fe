import React from 'react';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function MainHeader({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-8 w-full max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="text-pink-500 font-bold text-xl tracking-tight">BiteYo</span>
        </Link>

        {/* Kolom Pencarian */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bites..."
            className="w-full bg-gray-50 border border-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm transition-all"
          />
        </div>

        {/* LOGIKA LOGIN / LOGOUT */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            // JIKA SUDAH LOGIN
            <div className="flex items-center gap-5">
              <button className="text-gray-400 hover:text-pink-500 transition-colors relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="relative group cursor-pointer flex items-center gap-2 p-1 pr-2 rounded-full border border-transparent hover:bg-gray-50 transition-colors">
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100"
                />
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Halo,</p>
                  <p className="text-sm font-bold text-gray-800 max-w-[100px] truncate">{user.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-pink-500 transition-colors" />
                
                {/* DROPDOWN LOGOUT (Muncul saat hover profil) */}
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden min-w-[160px]">
                    <button 
                      onClick={onLogout} 
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
            // JIKA BELUM LOGIN
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
    </header>
  );
}