import React from 'react';
import bgHomepage from '../assets/bghomepage.jpg'; 

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 rounded-[2rem] p-8 md:p-16 text-center shadow-sm overflow-hidden min-h-[400px] flex flex-col justify-center">
      
      <img 
        src={bgHomepage} 
        alt="Background Homepage" 
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />

      {/* Layer blur tambahan agar teks tetap terbaca */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Pil Emoji */}
        <div className="bg-white rounded-full px-6 py-2.5 shadow-sm flex items-center gap-4 text-2xl mb-8">
          <span>🍕</span>
          <span>🍔</span>
          <span>🍜</span>
          <span>🍰</span>
        </div>

        {/* Judul Utama */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-pink-500 tracking-tight mb-4">
          Bite It. Rate It. BiteYo.
        </h1>
        
        {/* Sub-judul */}
        <p className="text-gray-700 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Your taste, your voice. Share what you're eating and discover the best bites near you.
        </p>

        {/* Bukti Sosial (Social Proof) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-700 font-medium">
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white shadow-sm z-40"></div>
            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white shadow-sm -ml-4 z-30"></div>
            <div className="w-10 h-10 rounded-full bg-pink-500 border-2 border-white shadow-sm -ml-4 z-20"></div>
            <div className="w-10 h-10 rounded-full bg-rose-600 border-2 border-white shadow-sm -ml-4 z-10"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-pink-600 font-bold">12.4K+</span> foodies already here 
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="text-pink-600 font-bold ml-1">5K+</span> Restaurants
          </div>
        </div>
      </div>
    </section>
  );
}
