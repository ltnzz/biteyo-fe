import { Loader2, MapPin } from "lucide-react";

export default function LocationResults({ error, loading, query, results }) {
  if (!query) return null;

  return (
    <section className="border-b border-gray-100 p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">
        Hasil lokasi untuk "{query}"
      </h2>

      {loading && (
        <div className="py-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-3">
          {error}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((place) => (
            <div
              key={place.placeId}
              className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{place.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {place.lat}, Lng: {place.lng}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <p className="text-sm text-gray-400">Lokasi tidak ditemukan.</p>
      )}
    </section>
  );
}
