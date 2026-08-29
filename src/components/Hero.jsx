import React, { useEffect, useState } from 'react';
import { Coffee, LogIn, PlusCircle, Star, TrendingUp, UserPlus, Users, Utensils, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AUTH_CHANGE_EVENT, isAuthenticated } from '../utils/auth';

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
  const [hasSession, setHasSession] = useState(() => isAuthenticated());

  useEffect(() => {
    const syncAuthState = () => setHasSession(isAuthenticated());

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, []);

  return (
    <section className="relative mx-0 mt-2 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50/80 via-orange-50/60 to-white px-4 py-6 sm:mx-4 sm:mt-3 sm:rounded-3xl sm:px-6 sm:py-9 lg:px-8">
      <div className="absolute top-6 left-1/4 hidden w-60 h-60 bg-pink-200/30 rounded-full blur-3xl animate-pulse-slow sm:block" />
      <div className="absolute bottom-6 right-1/4 hidden w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-pulse-slow sm:block" style={{ animationDelay: '2s' }} />

      {mobileFloatingFoods.map((food, index) => {
        const Icon = food.icon;

        return (
          <div
            key={index}
            className={`absolute z-0 flex items-center justify-center rounded-full border border-white/70 shadow-sm animate-float opacity-50 sm:hidden ${food.className}`}
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
            className={`absolute ${food.size} ${food.bg} ${food.color} hidden items-center justify-center rounded-full border border-white/70 shadow-sm animate-float opacity-60 transition-all duration-300 hover:scale-110 hover:opacity-100 sm:flex`}
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

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm animate-fade-up sm:mb-4">
          <span className="flex gap-1">
            <Utensils className="h-3.5 w-3.5 text-pink-500" />
            <Coffee className="h-3.5 w-3.5 text-orange-500" />
            <Star className="h-3.5 w-3.5 text-yellow-500" />
          </span>
          <span className="text-xs font-medium text-gray-600">Discover your next bite</span>
        </div>

        <h1 className="mb-2.5 bg-gradient-to-r from-pink-500 via-pink-600 to-orange-500 bg-clip-text text-3xl font-extrabold leading-tight text-transparent animate-fade-up sm:mb-3.5 sm:text-5xl lg:text-5xl">
          Bite it. Rate it.<br />
          <span className="text-pink-500">Biteyo.</span>
        </h1>

        <p className="mx-auto mb-4 max-w-sm text-xs leading-relaxed text-gray-600 animate-fade-up sm:mb-6 sm:max-w-xl sm:text-sm md:text-base" style={{ animationDelay: '0.2s' }}>
          Discover trending foods, hidden gems, viral cafés, and honest restaurant reviews from real foodies around you.
        </p>

        <div className="flex flex-col items-center justify-center gap-2.5 animate-fade-up sm:hidden" style={{ animationDelay: '0.4s' }}>
          {hasSession ? (
            <>
              <Link to="/explore" className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-200 transition-colors hover:bg-pink-600">
                Explore Now
              </Link>
              <Link to="/add" className="inline-flex w-full max-w-xs items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                <PlusCircle className="h-3.5 w-3.5 text-pink-500" />
                Start Posting
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex w-full max-w-xs items-center justify-center gap-1.5 rounded-full bg-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-200 transition-colors hover:bg-pink-600">
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
              <Link to="/signup" className="inline-flex w-full max-w-xs items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                <UserPlus className="h-3.5 w-3.5 text-pink-500" />
                Daftar
              </Link>
            </>
          )}
        </div>

        <div className="hidden flex-col items-center justify-center gap-3.5 mb-6 animate-fade-up sm:flex sm:flex-row" style={{ animationDelay: '0.4s' }}>
          <Link to="/explore" className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-md shadow-pink-200 hover:shadow-pink-300 transition-all hover:-translate-y-0.5 text-sm">
            Explore Now
          </Link>
          <Link to="/add" className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-pink-500" />
            Start Posting
          </Link>
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-6 animate-fade-up sm:flex sm:gap-8" style={{ animationDelay: '0.6s' }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div key={index} className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${['bg-purple-400', 'bg-blue-400', 'bg-pink-400'][i]}`} />
                  ))}
                </div>
                <Icon className="h-3.5 w-3.5 text-pink-500" />
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">{stat.value}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{stat.label}</p>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden sm:block w-px h-6 bg-gray-200 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
