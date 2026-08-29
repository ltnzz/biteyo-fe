import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hammer, Users } from "lucide-react";

/**
 * Halaman Komunitas — belum tersedia.
 * Placeholder publik agar navigasi bisa dipasang lebih awal.
 */
export default function CommunityPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
        <main className="flex min-h-screen w-full max-w-2xl items-center justify-center bg-white px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
              <Users className="h-8 w-8 text-pink-500" />
            </div>
            <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold text-gray-900">
              Komunitas
              <span className="rounded-full bg-gray-100 px-2.5 py-1 align-middle text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Segera Hadir
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              Ruang untuk berdiskusi resep, tips kuliner, dan bertemu foodies
              lain sedang kami siapkan.
            </p>

            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600">
              <Hammer className="h-3.5 w-3.5" />
              Sedang dibangun
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mr-2 rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-2 rounded-full bg-pink-500 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-pink-600 sm:mt-0"
              >
                Jelajahi Bite
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
