import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { API_BASE, normalizeAuthResponse, postJson } from "../utils/api";
import { saveAuth } from "../utils/auth";

// --- KOMPONEN INPUT (Diperbarui untuk menerima state) ---
const InputField = ({
  label,
  icon,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  required,
}) => {
  const Icon = icon;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Icon size={18} />
        </div>
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm text-gray-800 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get("redirect") || "";
    const stateRedirect = `${location.state?.from?.pathname || "/"}${
      location.state?.from?.search || ""
    }`;

    if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
      return redirectParam;
    }

    return stateRedirect;
  }, [location.search, location.state]);
  const [loginNotice] = useState(() => {
    if (location.state?.message) return location.state.message;

    try {
      return window.sessionStorage.getItem("biteyo_login_notice") || "";
    } catch {
      return "";
    }
  });

  // State untuk form login
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      window.sessionStorage.removeItem("biteyo_login_notice");
    } catch {
      // No-op when sessionStorage is unavailable.
    }
  }, []);

  // Menangani perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Hilangkan error saat user mulai mengetik lagi
  };

  // Fungsi saat form dikirim
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/signin`,
        formData,
        { withCredentials: true },
      );

      saveAuth({
        token: response.data.token,
        user: response.data.user,
      });

      navigate(redirectTarget, { replace: true });
    } catch (err) {
      // Tangkap pesan error dari backend
      const message =
        err.response?.data?.message ||
        "Gagal masuk. Periksa email dan kata sandi Anda.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Token Google tidak ditemukan. Silakan coba lagi.");
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      const data = await postJson(
        "/api/auth/google",
        {
          id_token: credentialResponse.credential,
        },
        { fallback: "Gagal masuk dengan Google. Silakan coba lagi." },
      );
      const { token, user } = normalizeAuthResponse(data);

      if (!token && !user) {
        throw new Error("Respons Google login tidak valid dari server.");
      }

      saveAuth({ token, user });
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(
        err.message || "Gagal masuk dengan Google. Silakan coba lagi.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError("Login Google gagal.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-pink-50/40 to-white font-sans flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* === LEFT: LOGIN FORM === */}
        <div className="w-full lg:w-[460px] shrink-0">
          <Link to="/" className="inline-block mb-3">
            <img
              src={logo}
              alt="Biteyo Logo"
              className="w-[100px] h-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="bg-white p-7 sm:p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100/80">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">
              Masuk
            </h1>
            <p className="text-sm text-gray-500 mb-6 sm:mb-8">
              Selamat datang kembali! Masuk ke akun Biteyo Anda
            </p>

            {/* Pesan Error */}
            {loginNotice && !error && (
              <div className="mb-6 p-4 bg-pink-50 border-l-4 border-pink-500 text-pink-700 flex items-center gap-3 rounded-r-xl animate-in fade-in duration-300">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{loginNotice}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl animate-in fade-in duration-300">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <InputField
                label="Alamat Email"
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@anda.com"
                required
              />
              <InputField
                label="Kata Sandi"
                icon={Lock}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi Anda"
                required
              />

              <div className="flex items-center justify-end mb-6">
                <Link
                  to="/forgotpassword"
                  className="text-sm text-pink-500 font-semibold hover:text-pink-600 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-pink-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Masuk <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-100" />
                <span className="px-4 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Atau masuk dengan
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              <div className="flex justify-center">
                <div className="relative inline-flex justify-center overflow-hidden rounded">
                  <div className={loading || googleLoading ? "pointer-events-none opacity-50" : ""}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                    />
                  </div>
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/85">
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mt-7">
                Belum punya akun?{" "}
                <Link
                  to="/signup"
                  className="text-pink-500 font-bold hover:underline"
                >
                  Daftar
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* === RIGHT: sejajar card kiri (bukan center) === */}
        <div className="hidden lg:flex flex-col flex-1 self-start pt-[64px] pl-4 lg:pl-8">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-pink-500 leading-tight mb-2">
            Kembali ke Perjalanan Kuliner Anda
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-md">
            Masuk untuk menyimpan restoran favorit, menulis ulasan, dan terhubung dengan komunitas pecinta kuliner.
          </p>
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-extrabold shrink-0">
                1
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Simpan Favorit & Wishlist</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Simpan restoran dan buat daftar kuliner yang ingin dicoba.</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-extrabold shrink-0">
                2
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Tulis Ulasan & Bagikan</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Bantu pecinta kuliner lain menemukan tempat terbaik.</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-extrabold shrink-0">
                3
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Rekomendasi Personal</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Dapatkan inspirasi kuliner yang disesuaikan dengan seleramu.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
