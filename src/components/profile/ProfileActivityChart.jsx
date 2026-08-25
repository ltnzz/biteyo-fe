import { useEffect, useState } from "react";
import { requestJson } from "../../services/profileApi";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const monthLabel = (key) => {
  const [, m] = key.split("-");
  return MONTH_LABELS[Number(m) - 1] ?? key;
};

/**
 * Bar chart SVG sederhana: jumlah bite per bulan (6 bulan terakhir).
 * Tanpa library chart agar bundle tetap ringan.
 */
export default function ProfileActivityChart({ username }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);

      try {
        const res = await requestJson(
          `/api/profile/${encodeURIComponent(username)}/activity`,
        );
        if (!cancelled) setData(Array.isArray(res?.data) ? res.data : []);
      } catch {
        // grafik bersifat dekoratif — gagal load cukup disembunyikan
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading || !data || data.every((d) => d.count === 0)) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 100; // viewBox unit
  const barWidth = 10;
  const gap = (width - data.length * barWidth) / (data.length + 1);

  return (
    <div className="mt-4 rounded-xl2 border border-gray-200 bg-white p-4 shadow-soft">
      <h3 className="text-sm font-bold text-gray-900">Aktivitas Posting</h3>
      <p className="text-xs text-gray-500">6 bulan terakhir</p>

      <svg
        viewBox={`0 0 ${width} 42`}
        className="mt-3 w-full"
        role="img"
        aria-label="Grafik jumlah bite yang diposting per bulan"
      >
        {data.map((item, i) => {
          const x = gap + i * (barWidth + gap);
          const h = Math.max((item.count / max) * 28, item.count > 0 ? 3 : 1.5);
          const y = 32 - h;

          return (
            <g key={item.month}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={2}
                className={item.count > 0 ? "fill-pink-400" : "fill-gray-200"}
              >
                <title>{`${monthLabel(item.month)}: ${item.count} bite`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={38}
                textAnchor="middle"
                className="fill-gray-400"
                fontSize="4.5"
              >
                {monthLabel(item.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
