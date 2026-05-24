import React, { useEffect, useRef, useState } from "react";
import { Camera, Star, Loader2, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../utils/auth";
import {
  API_BASE,
  biteCategories,
} from "../utils/bites";
import { broadcastFeedChange } from "../services/feedRealtime";
import { getBiteId, normalizeUpdatedBite } from "../utils/biteEngagement";
import { compressImageFile } from "../utils/imageCompression";

const LOCATION_SEARCH_DEBOUNCE_MS = 350;

const getTextValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  return value.text || value.name || "";
};

const getLocationName = (place) =>
  getTextValue(place?.name) ||
  getTextValue(place?.displayName) ||
  getTextValue(place?.structuredFormatting?.mainText) ||
  "";

const getLocationLabel = (place) =>
  getLocationName(place) ||
  getTextValue(place?.formattedAddress) ||
  getTextValue(place?.address) ||
  getTextValue(place?.description) ||
  "";

const getLocationAddress = (place) =>
  getTextValue(place?.formattedAddress) ||
  getTextValue(place?.address) ||
  getTextValue(place?.vicinity) ||
  "";

const normalizeLocationResults = (data) => {
  const candidates = [
    data,
    data?.data,
    data?.results,
    data?.items,
    data?.locations,
    data?.places,
  ];
  const results = candidates.find(Array.isArray) || [];

  return results.filter((place) => getLocationLabel(place));
};

export default function AddPage() {
  const navigate = useNavigate();
  const locationInputFocusedRef = useRef(false);

  // Form states
  const [foodName, setFoodName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [hasSearchedLocation, setHasSearchedLocation] = useState(false);

  useEffect(() => {
    const query = location.trim();

    if (query.length < 2 || getLocationLabel(selectedLocation) === query) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      setLocationError("");
      setHasSearchedLocation(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLocationLoading(true);
      setLocationError("");
      setHasSearchedLocation(true);

      try {
        const response = await fetch(
          `${API_BASE}/api/maps/location/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Gagal mencari lokasi.");
        }

        const data = await response.json().catch(() => []);
        setLocationSuggestions(normalizeLocationResults(data));
        if (locationInputFocusedRef.current) {
          setShowLocationSuggestions(true);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setLocationSuggestions([]);
        setLocationError("Gagal mencari lokasi. Coba lagi.");
      } finally {
        if (!controller.signal.aborted) setLocationLoading(false);
      }
    }, LOCATION_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [location, selectedLocation]);

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
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setReview("");
    setRating(0);
    setSelectedCategory("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleLocationChange = (e) => {
    locationInputFocusedRef.current = true;
    setLocation(e.target.value);
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setLocationError("");
    setHasSearchedLocation(false);
    setShowLocationSuggestions(true);
  };

  const handleLocationSelect = (place) => {
    setLocation(getLocationName(place) || getLocationLabel(place));
    setSelectedLocation(place);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setLocationError("");
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
      formData.append(
        "locationName",
        selectedLocation
          ? getLocationName(selectedLocation) || location.trim()
          : location.trim(),
      );
      if (selectedLocation) {
        const placeId =
          selectedLocation.placeId ||
          selectedLocation.place_id ||
          selectedLocation.id ||
          "";
        const lat =
          selectedLocation.lat ??
          selectedLocation.latitude ??
          selectedLocation.geometry?.location?.lat;
        const lng =
          selectedLocation.lng ??
          selectedLocation.longitude ??
          selectedLocation.geometry?.location?.lng;
        const address = getLocationAddress(selectedLocation);

        if (placeId) formData.append("locationPlaceId", placeId);
        if (lat !== undefined && lat !== null) formData.append("locationLat", lat);
        if (lng !== undefined && lng !== null) formData.append("locationLng", lng);
        if (address) formData.append("locationAddress", address);
      }
      formData.append("review", review);
      formData.append("rating", rating);
      formData.append("category", selectedCategory);
      if (photoFile) {
        formData.append("photo", await compressImageFile(photoFile));
      }

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

      const data = await res.json().catch(() => null);
      const createdBite = normalizeUpdatedBite(data);
      const createdBiteId = getBiteId(createdBite);

      if (createdBiteId) {
        broadcastFeedChange({ type: "create", biteId: createdBiteId });
      }

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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where?
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => {
                    locationInputFocusedRef.current = true;
                    setShowLocationSuggestions(true);
                  }}
                  onBlur={() => {
                    locationInputFocusedRef.current = false;
                    setTimeout(() => setShowLocationSuggestions(false), 120);
                  }}
                  placeholder="Restaurant or location..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  autoComplete="off"
                  required
                />
                {showLocationSuggestions && location.trim().length >= 2 && !selectedLocation && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {locationLoading && (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                        Searching location...
                      </div>
                    )}

                    {!locationLoading && locationError && (
                      <p className="px-4 py-3 text-sm text-red-600">
                        {locationError}
                      </p>
                    )}

                    {!locationLoading && !locationError && locationSuggestions.length > 0 && (
                      <div className="max-h-60 overflow-y-auto py-1">
                        {locationSuggestions.map((place, index) => {
                          const label = getLocationLabel(place);
                          const address = getLocationAddress(place);
                          const key =
                            place.placeId ||
                            place.place_id ||
                            place.id ||
                            `${label}-${index}`;

                          return (
                            <button
                              key={key}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleLocationSelect(place)}
                              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-pink-50"
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                                <MapPin className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-gray-800">
                                  {label}
                                </span>
                                {address && (
                                  <span className="mt-0.5 block truncate text-xs text-gray-500">
                                    {address}
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!locationLoading &&
                      !locationError &&
                      hasSearchedLocation &&
                      locationSuggestions.length === 0 && (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          Lokasi tidak ditemukan.
                        </p>
                      )}
                  </div>
                )}
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
