import React, { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ambil query dari URL (dari MainHeader search)
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    if (query) {
      handleSearchLocation(query);
    }
  }, [query]);

  const handleSearchLocation = async (searchQuery) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `https://biteyo-be.vercel.app/api/maps/location/search?q=${encodeURIComponent(searchQuery)}`
      );
      setResults(response.data);
    } catch (err) {
      setError("Gagal mencari lokasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hasil Pencarian */}
      <div className="max-w-2xl mx-auto p-4">
        {query && (
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Hasil untuk "{query}"
          </h2>
        )}

        {category && (
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Kategori: #{category}
          </h2>
        )}

        {loading && (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((place) => (
              <div
                key={place.placeId}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Lat: {place.lat}, Lng: {place.lng}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-12 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Lokasi tidak ditemukan untuk "{query}"</p>
          </div>
        )}

        {!query && !category && (
          <div className="text-center py-12 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Cari lokasi di search bar di atas</p>
          </div>
        )}
      </div>
    </div>
  );
}