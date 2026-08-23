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
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        {/* === LEFT: LOGIN FORM === */}
        <div className="w-full lg:w-[460px] shrink-0">
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="BiteYo Logo"
              className="w-[100px] h-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-50/50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Masuk
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Selamat datang kembali! Masuk ke akun BiteYo Anda
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
                <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  {" "}
                  Atau masuk dengan{" "}
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

              <p className="text-center text-sm text-gray-600 mt-8">
                Belum punya akun?{" "}
                <Link
                  to="/signup"
                  className="text-pink-500 font-semibold hover:underline"
                >
                  {" "}
                  Daftar{" "}
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* === RIGHT: PROMO === */}
        <div className="hidden lg:flex flex-col flex-1 justify-center py-10">
          <h2 className="text-5xl font-extrabold text-pink-500 leading-[1.15] mb-4">
            {" "}
            Kembali ke Perjalanan Kuliner Anda{" "}
          </h2>
          <p className="text-gray-600 text-lg mb-12 max-w-md leading-relaxed">
            {" "}
            Masuk untuk menyimpan restoran favorit, menulis ulasan, dan
            terhubung dengan komunitas pecinta kuliner.{" "}
          </p>
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50/50 max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Mengapa bergabung?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                {" "}
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">
                  1
                </span>{" "}
                Simpan restoran favorit dan buat daftar wishlist{" "}
              </li>
              <li className="flex items-center gap-3">
                {" "}
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">
                  2
                </span>{" "}
                Tulis ulasan dan bantu orang lain menemukan tempat terbaik{" "}
              </li>
              <li className="flex items-center gap-3">
                {" "}
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">
                  3
                </span>{" "}
                Dapatkan rekomendasi personal berdasarkan preferensi Anda{" "}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
