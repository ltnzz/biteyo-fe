import React, { useState } from 'react';
import MainHeader from '../components/MainHeader';
import BottomNav from '../components/BottomNav';
import { MapPin, Settings, Bookmark, Star } from 'lucide-react';

const reviewImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=80',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&q=80',
];

const savedImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80',
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('reviews');
  const images = activeTab === 'reviews' ? reviewImages : savedImages;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="relative bg-gradient-to-br from-pink-400 via-pink-500 to-orange-400 pt-10 pb-6 px-6 flex flex-col items-center">
          <button className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 rounded-full bg-white/30 border-4 border-white/60 flex items-center justify-center mb-3">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-white font-bold text-lg">@yourfoodname</h2>
          <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>San Francisco, CA</span>
          </div>
          <p className="text-white/80 text-xs mt-2 text-center max-w-xs leading-relaxed">
            Living for good food & great vibes.  Always hunting for the next bite.
          </p>
          <div className="flex gap-8 mt-4">
            {[
              { label: 'Reviews', value: '42' },
              { label: 'Followers', value: '1.2k' },
              { label: 'Following', value: '328' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-white font-bold text-base">{stat.value}</span>
                <span className="text-white/70 text-[10px]">{stat.label}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 bg-white text-pink-500 font-semibold text-sm px-8 py-2 rounded-full shadow hover:bg-pink-50 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="flex bg-white border-b border-gray-100 px-6">
          {[
            { key: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
            { key: 'saved', label: 'Saved', icon: <Bookmark className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-0.5 bg-gray-200">
          {images.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={src}
                alt={`food ${i}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}