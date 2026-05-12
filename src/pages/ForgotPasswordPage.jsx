import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('https://biteyo-be.vercel.app/api/auth/forgot-password', {
        method: 'POST',
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
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

        {/* === LEFT: FORM === */}
        <div className="w-full lg:w-[460px] shrink-0">
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="BiteYo Logo"
              className="w-[100px] h-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-50/50">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-500 mb-6 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Lupa Kata Sandi?</h1>
            <p className="text-sm text-gray-500 mb-8">
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

              <p className="text-center text-sm text-gray-600 mt-8">
                Ingat kata sandi Anda?{' '}
                <Link to="/login" className="text-pink-500 font-semibold hover:underline">
                  Masuk
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* === RIGHT: INFO PANEL === */}
        <div className="hidden lg:flex flex-col flex-1 justify-center py-10">
          <h2 className="text-5xl font-extrabold text-pink-500 leading-[1.15] mb-4">
            Kami Bantu Kamu Kembali
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-md leading-relaxed">
            Jangan khawatir! Masukkan email kamu dan kami akan kirimkan tautan reset dalam hitungan detik.
          </p>
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50/50 max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Langkah reset kata sandi</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">1</span>
                Masukkan email yang terdaftar di BiteYo
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">2</span>
                Cek kotak masuk email kamu untuk tautan reset
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">3</span>
                Buat kata sandi baru dan masuk kembali
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
