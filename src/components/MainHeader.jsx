import React, { useEffect, useRef, useState } from "react";
import { Search, MapPin, TrendingUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { biteCategories } from "../utils/bites";

export default function MainHeader() {
  const [query, setQuery] = useState("");
  const [showTrending, setShowTrending] = useState(false);
  const timeoutRef = useRef(null);
  const trendingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!trendingRef.current?.contains(event.target)) {
        setShowTrending(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        navigate(`/explore?q=${encodeURIComponent(value)}`);
      }
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 bg-white z-50 border-b border-gray-100 py-3">
      <div className="flex items-center gap-2 px-3 sm:gap-4 sm:px-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1 max-w-3xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search bites..."
            className="w-full bg-gray-50 border border-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm transition-all"
          />
        </form>

        {/* Trending Dropdown */}
        <div ref={trendingRef} className="relative">
          <button
            onClick={() => setShowTrending(!showTrending)}
            className="flex items-center gap-2 rounded-full px-2 py-2 text-gray-600 transition-colors hover:bg-gray-100 sm:px-3"
          >
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium hidden sm:block">Trending</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTrending ? 'rotate-180' : ''}`} />
          </button>

          {showTrending && (
            <div className="absolute top-full right-0 mt-2 bg-white shadow-xl border border-gray-100 rounded-xl p-3 min-w-[200px] z-50">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 px-2">Popular now</p>
              {biteCategories.map((category) => (
                <span
                  key={category.value}
                  onClick={() => {
                    navigate(`/explore?category=${category.value}`);
                    setShowTrending(false);
                  }}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 cursor-pointer transition-colors"
                >
                  #{category.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Maps Icon */}
        <button 
          onClick={() => navigate('/explore?maps=true')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-pink-500"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
