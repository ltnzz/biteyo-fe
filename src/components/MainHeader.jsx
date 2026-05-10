import React, { useState, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function MainHeader() {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const readUser = () => {
      const stored = localStorage.getItem("biteyo_user");
      setCurrentUser(stored ? JSON.parse(stored) : null);
    };
    readUser();
    window.addEventListener("storage", readUser);
    return () => window.removeEventListener("storage", readUser);
  }, []);

  const trendingTags = ["Street Food", "Cafe", "Viral"];

  return (
    <>
      <header className="sticky top-0 bg-white z-50 border-b border-gray-100 py-3">
        <div className="flex items-center gap-4 px-4">
          {/* Search */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bites..."
              className="w-full bg-gray-50 border border-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm transition-all"
            />
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-500" />
            {trendingTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium cursor-pointer hover:bg-pink-100 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
          
        </div>
      </header>
    </>
  );
}