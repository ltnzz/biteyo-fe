import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { AtSign, Mail, Lock, ArrowRight, PenTool, Search, Users, Loader2, AlertCircle, } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import LegalModal from "../components/LegalModal"; 
import { API_BASE, normalizeAuthResponse, postJson } from "../utils/api";
import { saveAuth } from "../utils/auth";

// --- KOMPONEN INPUT ---
const InputField = ({ label, icon, type = "text", placeholder, note, name, value, onChange, required }) => {
  const Icon = icon;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
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
      {note && <p className="text-xs text-gray-400 mt-1.5">{note}</p>}
    </div>
  );
};

// --- KOMPONEN KARTU FITUR ---
const FeatureCard = ({ icon, title, description, iconBg, iconColor }) => {
  const Icon = icon;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 min-w-[240px]">
      <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mb-4`}>
        <Icon size={24} className={iconColor} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
};

// --- HALAMAN UTAMA SIGN UP ---
export default function SignupPage() {
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "terms" });
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Konfirmasi kata sandi tidak cocok!");
      setLoading(false);
      return;
    }

    if (!formData.email.endsWith("@gmail.com")) {
      setError("Email wajib menggunakan @gmail.com sesuai kebijakan sistem.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/auth/signup`,
        formData,
        { withCredentials: true },
      );
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.";
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
        { fallback: "Gagal mendaftar dengan Google. Silakan coba lagi." },
      );
      const { token, user } = normalizeAuthResponse(data);

      if (!token && !user) {
        throw new Error("Respons Google register tidak valid dari server.");
      }

      saveAuth({ token, user });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message || "Gagal mendaftar dengan Google. Silakan coba lagi.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError("Register Google gagal.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-pink-50/40 to-white font-sans flex items-center justify-center p-4 md:p-8">
      <LegalModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
      
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        <div className="w-full lg:w-[460px] shrink-0">
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="BiteYo Logo"
              className="w-[100px] h-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Buat Akun</h1>
            <p className="text-sm text-gray-500 mb-8">Daftar sekarang untuk mulai menjelajah kuliner</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl animate-in fade-in duration-300">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <InputField label="Nama Pengguna" icon={AtSign} name="username" value={formData.username} onChange={handleChange} placeholder="username123" required />
              <InputField label="Alamat Email" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nama@gmail.com" required />
              <InputField label="Kata Sandi" icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" note="Min. 8 karakter (Huruf besar, kecil, & angka)" required />
              <InputField label="Konfirmasi Kata Sandi" icon={Lock} type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="••••••••" required />

              <div className="mt-6 mb-6 text-sm text-gray-600">
                Saya setuju dengan{" "}
                <span onClick={() => setModalConfig({ isOpen: true, type: "terms" })} className="text-pink-500 font-bold cursor-pointer hover:underline">
                  Syarat Layanan
                </span>{" "}
                dan{" "}
                <span onClick={() => setModalConfig({ isOpen: true, type: "privacy" })} className="text-pink-500 font-bold cursor-pointer hover:underline">
                  Kebijakan Privasi
                </span>
              </div>

              <button type="submit" disabled={loading || googleLoading} className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <>Buat Akun <ArrowRight size={18} /></>}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Atau</span></div>
              </div>

              <div className="flex justify-center">
                <div className="relative inline-flex justify-center overflow-hidden rounded">
                  <div className={loading || googleLoading ? "pointer-events-none opacity-50" : ""}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signup_with"
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
                Sudah punya akun? <Link to="/login" className="text-pink-500 font-bold hover:underline">Masuk</Link>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex flex-col flex-1">
          <h2 className="text-5xl font-extrabold text-pink-500 mb-8 leading-tight">Bergabung dengan Komunitas BiteYo</h2>
          <div className="space-y-6">
            <FeatureCard icon={PenTool} title="Tulis Ulasan" description="Bagikan rasa makanan favorit Anda." iconBg="bg-pink-100" iconColor="text-pink-500" />
            <FeatureCard icon={Search} title="Eksplorasi" description="Temukan permata kuliner tersembunyi." iconBg="bg-orange-100" iconColor="text-orange-500" />
            <FeatureCard icon={Users} title="Interaksi" description="Ikuti foodies lain yang sefrekuensi." iconBg="bg-purple-100" iconColor="text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
