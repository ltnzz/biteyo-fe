import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { API_BASE } from "../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Tautan reset kata sandi telah dikirim ke email Anda. Silakan cek kotak masuk Anda.',
        });
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Email tidak ditemukan.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-pink-50/40 to-white font-sans flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

        {/* === LEFT: FORM === */}
        <div className="w-full lg:w-[460px] shrink-0">
          <Link to="/" className="inline-block mb-3">
            <img
              src={logo}
              alt="Biteyo Logo"
              className="w-[100px] h-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="bg-white p-7 sm:p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100/80">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-500 mb-6 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">Lupa Kata Sandi?</h1>
            <p className="text-sm text-gray-500 mb-6 sm:mb-8">
              Masukkan alamat email terdaftar Anda. Kami akan mengirimkan tautan untuk mereset kata sandi.
            </p>

            {/* Pesan sukses / error */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium border-l-4 ${
                message.type === 'error'
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-green-50 border-green-500 text-green-700'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@anda.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-pink-200"
              >
                {isLoading
                  ? <Loader2 className="animate-spin" size={20} />
                  : 'Kirim Tautan Reset'
                }
              </button>

              <p className="text-center text-sm text-gray-600 mt-7">
                Ingat kata sandi Anda?{' '}
                <Link to="/login" className="text-pink-500 font-bold hover:underline">
                  Masuk
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* === RIGHT: sejajar card kiri === */}
        <div className="hidden lg:flex flex-col flex-1 self-start pt-[64px] pl-4 lg:pl-8">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-pink-500 leading-tight mb-2">
            Kami Bantu Anda Kembali
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-md">
            Jangan khawatir! Masukkan email Anda dan tautan reset kata sandi akan dikirim segera.
          </p>
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-extrabold shrink-0">1</span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Masukkan Email</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Gunakan email yang terdaftar di akun Biteyo Anda.</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-extrabold shrink-0">2</span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Cek Kotak Masuk</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Buka email Anda dan klik tautan verifikasi reset.</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-extrabold shrink-0">3</span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Buat Kata Sandi Baru</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Simpan kata sandi baru Anda dan nikmati kembali Biteyo.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
