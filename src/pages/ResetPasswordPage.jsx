import React, { useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE } from "../utils/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi
    if (formData.password !== formData.confirm_password) {
      setError('Konfirmasi kata sandi tidak cocok!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Kata sandi minimal 8 karakter!');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/auth/reset-password/${token}`,
        { password: formData.password, confirm_password: formData.confirm_password, }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal reset password. Token mungkin sudah expired.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-pink-50/40 to-white font-sans flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Berhasil!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Kata sandi berhasil diubah. Kamu akan diarahkan ke halaman login dalam 3 detik.
          </p>
          <Link 
            to="/login" 
            className="inline-block w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-pink-50/40 to-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back to Login */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-500 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Kata Sandi</h1>
          <p className="text-sm text-gray-500 mb-8">
            Buat kata sandi baru untuk akunmu.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Password Baru */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Min. 8 karakter</p>
            </div>

            {/* Konfirmasi Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Memproses...' : 'Reset Kata Sandi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
