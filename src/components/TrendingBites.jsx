import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function TrendingBites() {
  const categories = [
    { icon: '🌮', label: 'Street Food' },
    { icon: '☕', label: 'Cafe' },
    { icon: '🍷', label: 'Fine Dining' },
    { icon: '🔥', label: 'Viral' },
    { icon: '💎', label: 'Hidden Gems' },
  ];

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <TrendingUp className="text-pink-500 w-6 h-6" />
          Trending Bites
        </h2>
        <button className="text-pink-500 font-medium text-sm hover:underline">
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* Pil Aktif */}
        <button className="bg-pink-500 text-white px-6 py-2.5 rounded-full whitespace-nowrap flex items-center gap-2 font-medium shadow-sm transition-transform active:scale-95">
          <div className="bg-white/20 p-1 rounded-full"><span className="text-xs">🍽️</span></div>
          All
        </button>
        
        {/* Pil Tidak Aktif */}
        {categories.map((item, idx) => (
          <button 
            key={idx} 
            className="bg-white text-gray-700 px-6 py-2.5 rounded-full whitespace-nowrap flex items-center gap-2 font-medium shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
