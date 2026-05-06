import React from 'react';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-between items-center px-0 py-2 relative">
        
        {/* Tombol Home */}
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname === '/' ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        {/* Tombol Explore */}
         <Link 
          to="/explore" 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname === '/explore' ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        {/* Tombol Tambah (Mengambang di tengah) */}
        <div className="relative -top-6">
          <button className="bg-pink-500 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200 border-4 border-white hover:scale-105 transition-transform">
            <div className="border border-white/50 rounded-full p-1">
              <Plus className="w-6 h-6" />
            </div>
          </button>
          <span className="text-[10px] font-medium text-gray-400 absolute -bottom-5 left-1/2 transform -translate-x-1/2">
            Add
          </span>
        </div>

        {/* Tombol Alerts */}
        <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-pink-500 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="text-[10px] font-medium">Alerts</span>
        </button>
        
        {/* Tombol Profile */}
        <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-pink-500 transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

      </div>
    </nav>
  );
}