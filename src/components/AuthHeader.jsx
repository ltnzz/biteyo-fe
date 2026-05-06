import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthHeader() {
  return (
    <header className="bg-transparent py-6 px-6 md:px-12 flex items-center justify-between absolute top-0 w-full z-50">
      <div className="w-full max-w-7xl mx-auto">
        {/* Logo Saja */}
        <Link to="/" className="inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <span className="text-pink-500 font-bold text-xl tracking-tight">BiteYo</span>
        </Link>
      </div>
    </header>
  );
}