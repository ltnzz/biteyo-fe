import React, { useState } from "react";
import MainHeader from "../components/MainHeader";
import BottomNav from "../components/BottomNav";
import { Camera, Star } from "lucide-react";

const categories = [
  "Street Food",
  "Cafe",
  "Fine Dining",
  "Dessert",
  "Viral",
  "Hidden Gems",
];

export default function AddPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [photo, setPhoto] = useState(null);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <MainHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-800">Add Your Bite</h1>

          {/* Food Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Photo
            </label>
            <label className="flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-gray-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors overflow-hidden">
              {photo ? (
                <img
                  src={photo}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="w-10 h-10 text-orange-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">
                    Tap to add photo
                  </span>
                  <span className="text-xs text-gray-400">
                    Make it look delicious! (Recommended size: 800x800px)
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          </div>

          {/* 2 kolom di desktop untuk field input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What did you eat?
              </label>
              <input
                type="text"
                placeholder="e.g., Truffle Burger, Matcha Latte..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where?
              </label>
              <input
                type="text"
                placeholder="Restaurant or location..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hovered || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Your Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              placeholder="Tell us about it! Was it fire? Would you eat it again?"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity">
            Post Your Bite Now!
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
