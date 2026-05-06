import React, { useState, useEffect } from 'react';
import { MapPin, SlidersHorizontal, Star } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import BottomNav from '../components/BottomNav';

export default function ExplorePage() {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { icon: '🍽️', label: 'All' },
    { icon: '🌮', label: 'Street Food' },
    { icon: '☕', label: 'Cafe' },
    { icon: '🍷', label: 'Fine Dining' },
    { icon: '🔥', label: 'Viral' },
    { icon: '💎', label: 'Hidden Gems' },
  ];

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Ganti dengan pemanggilan API backend
        setTimeout(() => {
          const dummyData = [
            {
              id: 1,
              title: "The Burger Joint",
              category: "Street Food",
              rating: 4.8,
              reviewCount: 234,
              distance: "0.5 mi",
              imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"
            },
            {
              id: 2,
              title: "Cafe Mocha",
              category: "Cafe",
              rating: 4.9,
              reviewCount: 189,
              distance: "1.2 mi",
              imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop"
            },
            {
              id: 3,
              title: "Authentic Taco Truck",
              category: "Street Food",
              rating: 4.7,
              reviewCount: 412,
              distance: "0.8 mi",
              imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop"
            },
            {
              id: 4,
              title: "Avocado Toast Bar",
              category: "Cafe",
              rating: 4.6,
              reviewCount: 128,
              distance: "2.1 mi",
              imageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=600&auto=format&fit=crop"
            }
          ];
          setPlaces(dummyData);
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error("Gagal mengambil data explore:", error);
        setIsLoading(false);
      }
    };

    fetchExploreData();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <MainHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Jelajahi Sekitar Anda
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-gray-500">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Pusat Kota, Jakarta</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto py-6 scrollbar-hide">
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(cat.label)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap flex items-center gap-2 font-medium shadow-sm transition-all border
                ${activeCategory === cat.label 
                  ? 'bg-pink-500 text-white border-pink-500 active:scale-95' 
                  : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                }`}
            >
              {activeCategory === cat.label && cat.label === 'All' ? (
                <div className="bg-white/20 p-1 rounded-full"><span className="text-xs">{cat.icon}</span></div>
              ) : (
                <span>{cat.icon}</span>
              )}
              {cat.label === 'All' ? 'Semua' : cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div 
                key={place.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative z-0"
              >
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                  {place.distance}
                </div>

                <div className="h-48 w-full overflow-hidden bg-gray-100">
                  <img 
                    src={place.imageUrl} 
                    alt={place.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{place.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{place.category}</p>
                  
                  <div className="flex items-center gap-1">
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(place.rating) ? 'fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-500 ml-1">
                      ({place.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}