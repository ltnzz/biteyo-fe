import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gray-50 px-4 py-16">
      <section className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-pink-100 bg-white shadow-sm">
          <SearchX className="h-9 w-9 text-pink-500" />
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-500">
          404
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
          Link yang kamu buka mungkin sudah berubah, dihapus, atau alamatnya salah.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-pink-600 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Ke homepage
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </div>
      </section>
    </main>
  );
}
