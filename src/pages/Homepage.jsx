import React from 'react';
import Hero from '../components/Hero';
import TrendingBites from '../components/TrendingBites';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-24 relative">
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-2 sm:mt-6">
        <Hero />
        <TrendingBites />
      </main>
      
    </div>
  );
}
