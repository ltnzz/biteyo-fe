import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-8 w-full max-w-7xl mx-auto">
        
        {/* Logo - Link kembali ke Home */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
            className="w-full bg-gray-50 border border-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-4 ml-auto">
         <Link 
            to="/login"
           className="text-gray-700 font-medium text-sm hover:text-gray-900 hidden sm:block"
          >
            Login
          </Link>
          
          {/* Tombol Sign Up - Link ke /signup */}
          <Link 
            to="/signup"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm inline-block"
          >
            Sign Up
          </Link>
        </div>
        
      </div>
    </header>
  );
}
