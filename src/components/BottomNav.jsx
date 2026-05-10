import React from 'react';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className="flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200/40"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        {/* Home */}
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/' ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        {/* Explore */}
        <Link 
          to="/explore" 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/explore' ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        {/* Add (Floating di tengah, lebih besar) */}
        <div className="relative -top-3 mx-2">
          <button className="bg-pink-500 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200 border-4 border-white hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Alerts */}
        <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-400 hover:text-pink-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Alerts</span>
        </button>
        
        {/* Profile */}
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/profile' ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}