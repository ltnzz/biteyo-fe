import React from 'react';
import { MapPin, Star, TrendingUp, Users } from 'lucide-react';

// Floating food images (gunakan emoji atau gambar dari assets)
const floatingFoods = [
  { emoji: '🍕', delay: '0s', duration: '6s', top: '10%', left: '5%', size: 'w-16 h-16' },
  { emoji: '🍔', delay: '1s', duration: '7s', top: '20%', right: '10%', size: 'w-20 h-20' },
  { emoji: '🍜', delay: '2s', duration: '5s', bottom: '20%', left: '8%', size: 'w-14 h-14' },
  { emoji: '🍣', delay: '0.5s', duration: '8s', top: '60%', right: '5%', size: 'w-16 h-16' },
  { emoji: '☕', delay: '1.5s', duration: '6s', bottom: '30%', right: '15%', size: 'w-14 h-14' },
  { emoji: '🧋', delay: '2.5s', duration: '7s', top: '40%', left: '3%', size: 'w-12 h-12' },
  { emoji: '🍰', delay: '3s', duration: '5s', bottom: '10%', left: '20%', size: 'w-14 h-14' },
];

const stats = [
  { icon: Users, value: '12.4K+', label: 'foodies already here' },
  { icon: Star, value: '5K+', label: 'Restaurants' },
  { icon: TrendingUp, value: '2.1K', label: 'Reviews today' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pink-50/80 via-orange-50/60 to-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 mt-4">
      {/* Background blur blobs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Floating food elements */}
      {floatingFoods.map((food, index) => (
        <div
          key={index}
          className={`absolute ${food.size} flex items-center justify-center text-4xl animate-float opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-default select-none`}
          style={{
            top: food.top,
            left: food.left,
            right: food.right,
            bottom: food.bottom,
            animationDelay: food.delay,
            animationDuration: food.duration,
          }}
        >
          {food.emoji}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-pink-100 shadow-sm mb-8 animate-fade-up">
          <span className="flex gap-1">
            <span className="text-lg">🍕</span>
            <span className="text-lg">🍔</span>
            <span className="text-lg">🍜</span>
            <span className="text-lg">🍰</span>
          </span>
          <span className="text-sm font-medium text-gray-600">Discover your next bite</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-orange-500 mb-6 animate-fade-up leading-tight">
          Bite it. Rate it.<br />
          <span className="text-pink-500">BiteYo.</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
          Discover trending foods, hidden gems, viral cafés, and honest restaurant reviews from real foodies around you.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <button className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all hover:-translate-y-0.5 text-base">
            Explore Now
          </button>
          <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-500" />
            Find Near Me
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${['bg-purple-400', 'bg-blue-400', 'bg-pink-400'][i]}`} />
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden sm:block w-px h-8 bg-gray-200 ml-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}