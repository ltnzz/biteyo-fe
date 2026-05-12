import React, { useState } from "react";
import { Camera, Star, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../utils/auth";
import {
  API_BASE,
  biteCategories,
} from "../utils/bites";

export default function AddPage() {
  const navigate = useNavigate();

  // Form states
  const [foodName, setFoodName] = useState("");
  const [location, setLocation] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const resetForm = () => {
    setFoodName("");
    setLocation("");
    setReview("");
    setRating(0);
    setSelectedCategory("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!selectedCategory) {
      setMessage({ type: "error", text: "Please choose one category." });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("foodName", foodName);
      formData.append("locationName", location);
      formData.append("review", review);
      formData.append("rating", rating);
      formData.append("category", selectedCategory);
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch(`${API_BASE}/api/feed/bites`, {
        method: "POST",
        credentials: "include", // HTTP Cookie (JWT)
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save bite");
      }

      await res.json().catch(() => null);
      setMessage({
        type: "success",
        text: "Bite posted successfully!",
      });

      resetForm();
      navigate("/explore");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Alert Message */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              Add Your Bite
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Food Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Photo
              </label>
              <label className="flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-gray-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors overflow-hidden relative">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        clearPhoto();
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
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
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Truffle Burger, Matcha Latte..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where?
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Restaurant or location..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  required
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
                    type="button"
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
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about it! Was it fire? Would you eat it again?"
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {biteCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedCategory === cat.value
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Your Bite Now!
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
