import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import LoginRequired from "../components/profile/LoginRequired";
import { requestJson } from "../services/profileApi";
import { getStoredUser, isAuthenticated } from "../utils/auth";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const formatMonth = (key) => {
  const [, m] = key.split("-");
  return MONTH_LABELS[Number(m) - 1] ?? key;
};

export default function ActivityPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const hasSession = useMemo(() => isAuthenticated(), []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSession) return undefined;

    let cancelled = false;
    const username =
      currentUser?.username || currentUser?.name || currentUser?.id;

    if (!username) {
      setLoading(false);
      setError("Tidak bisa menentukan profil saat ini.");
      return undefined;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await requestJson(
          `/api/profile/${encodeURIComponent(username)}/activity`,
          {},
          "Gagal memuat aktivitas.",
        );
        if (!cancelled) setData(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Gagal memuat aktivitas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser, hasSession]);

  if (!hasSession) return <LoginRequired />;

  const totalBites = data?.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const mostActive = data?.reduce(
    (best, item) => (item.count > (best?.count ?? -1) ? item : best),
    null,
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
        <main className="min-h-screen w-full max-w-2xl border-x border-cream-300 bg-white">
          <div className="sticky top-[65px] lg:top-0 z-20 flex items-center gap-3 bg-white/85 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">
                Aktivitas Posting
              </h1>
              <p className="text-sm text-gray-500">6 bulan terakhir</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center px-6 py-20">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-red-500">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-pink-500"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-5 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl2 border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">
                    Total Bite (6 bulan)
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-gray-900">
                    {totalBites}
                  </p>
                </div>
                <div className="rounded-xl2 border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">
                    Bulan Teraktif
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xl font-extrabold text-pink-500">
                    <Trophy className="h-5 w-5" />
                    {mostActive ? formatMonth(mostActive.month) : "-"}
                    <span className="text-sm font-bold text-gray-400">
                      ({mostActive?.count ?? 0})
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl2 border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-bold text-gray-900">
                  Bite per Bulan
                </h2>
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f3f4f6"
                      />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(236, 72, 153, 0.08)" }}
                        formatter={(value) => [`${value} bite`, null]}
                        labelFormatter={(label) => formatMonth(label)}
                      />
                      <Bar
                        dataKey="count"
                        name="Bite"
                        fill="#ec4899"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
        <AdvertisementSidebar />
      </div>
    </div>
  );
}
