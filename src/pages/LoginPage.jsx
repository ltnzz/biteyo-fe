import React from 'react';
import { Mail, Lock, ArrowRight, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const InputField = ({ label, icon: Icon, type = "text", placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Icon size={18} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-gray-800 placeholder-gray-400"
      />
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-pink-50/40 to-white font-sans flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

        {/* === LEFT: LOGIN FORM === */}
        <div className="w-full lg:w-[460px] shrink-0">
          <Link
            to="/"
            className="inline-block text-pink-500 font-bold text-2xl mb-6 pl-2 tracking-tight hover:opacity-80 transition-opacity"
          >
            BiteYo
          </Link>

          <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-50/50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Masuk</h1>
            <p className="text-sm text-gray-500 mb-8">
              Selamat datang kembali! Masuk ke akun BiteYo Anda
            </p>

            <form>
              <InputField
                label="Alamat Email atau Nama Pengguna"
                icon={Mail}
                type="text"
                placeholder="email@anda.com atau username"
              />
              <InputField
                label="Kata Sandi"
                icon={Lock}
                type="password"
                placeholder="Masukkan kata sandi Anda"
              />

              <div className="flex items-center justify-end mb-6">
                <Link
                  to="/forgot-password"
                  className="text-sm text-pink-500 font-semibold hover:text-pink-600 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <button
                type="button"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-pink-200"
              >
                Masuk
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-100" />
                <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Atau masuk dengan
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  <GoogleIcon />
                  Google
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  <Facebook className="text-blue-600" size={20} fill="currentColor" stroke="none" />
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-8">
                Belum punya akun?{' '}
                <Link to="/signup" className="text-pink-500 font-semibold hover:underline">
                  Daftar
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* === RIGHT: PROMO === */}
        <div className="hidden lg:flex flex-col flex-1 justify-center py-10">
          <h2 className="text-5xl font-extrabold text-pink-500 leading-[1.15] mb-4">
            Kembali ke Perjalanan Kuliner Anda
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-md leading-relaxed">
            Masuk untuk menyimpan restoran favorit, menulis ulasan, dan terhubung dengan komunitas pecinta kuliner.
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50/50 max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mengapa bergabung?</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">1</span>
                Simpan restoran favorit dan buat daftar wishlist
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">2</span>
                Tulis ulasan dan bantu orang lain menemukan tempat terbaik
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">3</span>
                Dapatkan rekomendasi personal berdasarkan preferensi Anda
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
