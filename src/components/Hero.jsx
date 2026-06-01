import React from 'react';
import { Coffee, PlusCircle, Star, TrendingUp, Users, Utensils, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';

const floatingFoods = [
  { icon: Utensils, delay: '0s', duration: '6s', top: '10%', left: '5%', size: 'w-16 h-16', color: 'text-pink-500', bg: 'bg-pink-100/80' },
  { icon: Star, delay: '1s', duration: '7s', top: '20%', right: '10%', size: 'w-20 h-20', color: 'text-amber-500', bg: 'bg-amber-100/80' },
  { icon: Coffee, delay: '2s', duration: '5s', bottom: '20%', left: '8%', size: 'w-14 h-14', color: 'text-orange-500', bg: 'bg-orange-100/80' },
  { icon: Wine, delay: '0.5s', duration: '8s', top: '60%', right: '5%', size: 'w-16 h-16', color: 'text-rose-500', bg: 'bg-rose-100/80' },
  { icon: TrendingUp, delay: '1.5s', duration: '6s', bottom: '30%', right: '15%', size: 'w-14 h-14', color: 'text-fuchsia-500', bg: 'bg-fuchsia-100/80' },
  { icon: Users, delay: '2.5s', duration: '7s', top: '40%', left: '3%', size: 'w-12 h-12', color: 'text-sky-500', bg: 'bg-sky-100/80' },
  { icon: Star, delay: '3s', duration: '5s', bottom: '10%', left: '20%', size: 'w-14 h-14', color: 'text-yellow-500', bg: 'bg-yellow-100/80' },
];

const mobileFloatingFoods = [
  { icon: Utensils, className: 'left-2 top-5 h-10 w-10 bg-pink-100/70 text-pink-500' },
  { icon: Star, className: 'right-2 top-20 h-11 w-11 bg-amber-100/70 text-amber-500' },
];

const stats = [
  { icon: Users, value: '12.4K+', label: 'foodies already here' },
  { icon: Star, value: '5K+', label: 'Restaurants' },
  { icon: TrendingUp, value: '2.1K', label: 'Reviews today' },
];

export default function Hero() {
  return (
    <section className="relative mx-0 mt-2 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50/80 via-orange-50/60 to-white px-4 py-8 sm:mx-4 sm:mt-4 sm:rounded-3xl sm:px-6 sm:py-16 lg:px-8">
      <div className="absolute top-10 left-1/4 hidden w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-pulse-slow sm:block" />
      <div className="absolute bottom-10 right-1/4 hidden w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse-slow sm:block" style={{ animationDelay: '2s' }} />

      {mobileFloatingFoods.map((food, index) => {
        const Icon = food.icon;

        return (
          <div
            key={index}
            className={`absolute z-0 flex items-center justify-center rounded-full border border-white/70 shadow-sm animate-float opacity-60 sm:hidden ${food.className}`}
          >
            <Icon className="h-1/2 w-1/2" />
          </div>
        );
      })}

      {floatingFoods.map((food, index) => {
        const Icon = food.icon;

        return (
          <div
            key={index}
            className={`absolute ${food.size} ${food.bg} ${food.color} hidden items-center justify-center rounded-full border border-white/70 shadow-sm animate-float opacity-70 transition-all duration-300 hover:scale-110 hover:opacity-100 sm:flex`}
            style={{
              top: food.top,
              left: food.left,
              right: food.right,
              bottom: food.bottom,
              animationDelay: food.delay,
              animationDuration: food.duration,
            }}
          >
            <Icon className="h-1/2 w-1/2" />
          </div>
        );
      })}

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm animate-fade-up sm:mb-8">
          <span className="flex gap-1">
            <Utensils className="h-4 w-4 text-pink-500" />
            <Coffee className="h-4 w-4 text-orange-500" />
            <Star className="h-4 w-4 text-yellow-500" />
          </span>
          <span className="text-sm font-medium text-gray-600">Discover your next bite</span>
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-pink-500 via-pink-600 to-orange-500 bg-clip-text text-4xl font-extrabold leading-tight text-transparent animate-fade-up sm:mb-6 sm:text-6xl lg:text-7xl">
          Bite it. Rate it.<br />
          <span className="text-pink-500">BiteYo.</span>
        </h1>

        <p className="mx-auto mb-0 max-w-sm text-sm leading-relaxed text-gray-600 animate-fade-up sm:mb-10 sm:max-w-2xl sm:text-xl" style={{ animationDelay: '0.2s' }}>
          Discover trending foods, hidden gems, viral cafés, and honest restaurant reviews from real foodies around you.
        </p>

        <div className="hidden flex-col items-center justify-center gap-4 mb-12 animate-fade-up sm:flex sm:flex-row" style={{ animationDelay: '0.4s' }}>
          <Link to="/explore" className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all hover:-translate-y-0.5 text-base">
            Explore Now
          </Link>
          <Link to="/add" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-base flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-pink-500" />
            Start Posting
          </Link>
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-6 animate-fade-up sm:flex sm:gap-10" style={{ animationDelay: '0.6s' }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${['bg-purple-400', 'bg-blue-400', 'bg-pink-400'][i]}`} />
                  ))}
                </div>
                <Icon className="h-4 w-4 text-pink-500" />
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
