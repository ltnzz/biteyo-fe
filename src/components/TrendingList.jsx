import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { getTrendingKeywords } from "../services/feedApi";

/**
 * Widget vertikal "Sedang Tren" ala Twitter/X:
 * daftar keyword mingguan dengan jumlah bite, urut skor engagement.
 * Endpoint publik — tamu juga bisa melihatnya.
 */
export default function TrendingList({ limit = 8 }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getTrendingKeywords();
        if (!cancelled) setItems(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      } catch {
        // biarkan kosong saat gagal
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl2 border border-cream-300 bg-white p-4 shadow-card">
        <div className="mb-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-gray-900">
          <TrendingUp className="h-4 w-4 text-pink-500" />
          Sedang Tren
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="rounded-xl2 border border-cream-300 bg-white">
      <div className="border-b border-cream-300 px-4 py-3">
        <h2 className="inline-flex items-center gap-1.5 text-base font-extrabold text-gray-900">
          <TrendingUp className="h-4 w-4 text-pink-500" />
          Sedang Tren
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Paling banyak dibahas 7 hari terakhir
        </p>
      </div>

      <ol className="divide-y divide-cream-200">
        {items.slice(0, limit).map((item, index) => (
          <li key={item.keyword}>
            <button
              type="button"
              onClick={() =>
                navigate(`/explore?q=${encodeURIComponent(item.keyword)}`)
              }
              className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-cream-200/60"
            >
              <span className="w-5 shrink-0 pt-0.5 text-right text-base font-extrabold text-gray-300">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold capitalize text-gray-900 transition-colors group-hover:text-pink-500">
                  #{item.keyword.replace(/\s+/g, "")}
                </span>
                <span className="block text-xs text-gray-500">
                  {item.count} bite · skor {item.score}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
