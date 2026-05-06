import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import TrendingBites from '../components/TrendingBites';
import BottomNav from '../components/BottomNav';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-24 relative">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <Hero />
        <TrendingBites />
      </main>
      
      <BottomNav />
    </div>
  );
}