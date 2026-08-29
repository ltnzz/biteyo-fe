import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { AtSign, Mail, Lock, ArrowRight, PenTool, Search, Users, Loader2, AlertCircle, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import LegalModal from "../components/LegalModal"; 
import { API_BASE, normalizeAuthResponse, postJson } from "../utils/api";
import { saveAuth } from "../utils/auth";

// --- KOMPONEN INPUT ---
const InputField = ({ label, icon, type = "text", placeholder, note, error, name, value, onChange, required }) => {
  const Icon = icon;

  return (
    <div className="mb-3.5">
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
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm text-gray-800 placeholder-gray-400 ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30" : "border-gray-200 focus:border-pink-500 focus:ring-pink-500/20"}`}
        />
      </div>
      {error ? <p className="text-xs text-red-500 mt-1 font-medium">{error}</p> : note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  );
};

// --- KOMPONEN KARTU FITUR ---
const FeatureCard = ({ icon, title, description, iconBg, iconColor }) => {
  const Icon = icon;

  return (
    <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/80 transition-all hover:border-pink-200">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA SIGN UP ---
export default function SignupPage() {
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "terms" });
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const passwordValid = formData.password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d).+$/.test(formData.password);
  const passwordsMatch = formData.confirm_password.length > 0 && formData.password === formData.confirm_password;
  const passwordHintError = !passwordValid && formData.password.length > 0 ? "Kata sandi harus 8+ karakter, ada huruf & angka" : "";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.email.trim()) {
        setError("Email wajib diisi.");
        return false;
      }
      if (!formData.email.endsWith("@gmail.com")) {
        setError("Email wajib menggunakan @gmail.com.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.name.trim()) {
        setError("Nama lengkap wajib diisi.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.username.trim()) {
        setError("Username wajib diisi.");
        return false;
      }
      if (formData.username.trim().length < 3) {
        setError("Username minimal 3 karakter.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!passwordValid) {
      setError("Kata sandi harus 8+ karakter, ada huruf & angka.");
      setLoading(false);
      return;
    }

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
      const data = err.response?.data;
      const firstIssue = data?.errors?.[0] || data?.issues?.[0];
      let message = firstIssue?.message || data?.message || "Gagal mendaftar. Silakan coba lagi.";
      if (/Password must contain letters and numbers/i.test(message) || /invalid_format/i.test(firstIssue?.code || "")) {
        message = "Kata sandi harus ada huruf dan angka (min. 8 karakter). Contoh: Biteyo123";
      }
      // arahkan ke step yang relevan biar inline error kelihatan
      if (/Username/i.test(message)) setStep(3);
      else if (/Email/i.test(message)) setStep(1);
      else if (/Nama/i.test(message)) setStep(2);
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
      
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* === LEFT: FORM === */}
        <div className="w-full lg:w-[480px] shrink-0">
          <Link to="/" className="inline-block mb-3">
            <img
              src={logo}
              alt="Biteyo Logo"
              className="w-[100px] h-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
          
          <div className="bg-white p-6 sm:p-7 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100/80">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">Buat Akun</h1>
            <p className="text-sm text-gray-500 mb-6">Daftar sekarang untuk mulai menjelajah kuliner</p>

            <form onSubmit={(e) => { e.preventDefault(); if (step < totalSteps) nextStep(); else handleSubmit(e); }}>
              {/* Stepper — 4 langkah: email → nama → usn → pw */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-pink-500">Langkah {step} dari {totalSteps}</span>
                  <span className="text-xs text-gray-400">
                    {step === 1 ? "Email" : step === 2 ? "Nama" : step === 3 ? "Username" : "Keamanan"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-pink-500" : "bg-gray-200"}`} />
                  ))}
                </div>
              </div>

              <div className="min-h-[160px]">
                {step === 1 && (
                  <div className="space-y-1">
                    <InputField
                      label="Alamat Email"
                      icon={Mail}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@gmail.com"
                      error={/Email/i.test(error) ? error : ""}
                      required
                    />
                    {!/Email/i.test(error) && <p className="text-xs text-gray-400">Wajib @gmail.com</p>}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-1">
                    <InputField
                      label="Nama Lengkap"
                      icon={User}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nama Kamu"
                      error={/Nama/i.test(error) ? error : ""}
                      required
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-1">
                    <InputField
                      label="Nama Pengguna"
                      icon={AtSign}
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="username123"
                      error={/Username/i.test(error) ? error : ""}
                      required
                    />
                    {!/Username/i.test(error) && <p className="text-xs text-gray-400">Min. 3, huruf/angka/_</p>}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <InputField
                        label="Kata Sandi"
                        icon={Lock}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        note="8+ huruf & angka"
                        error={passwordHintError || (/Password|Kata sandi/i.test(error) ? error : "")}
                        required
                      />
                      <InputField
                        label="Konfirmasi"
                        icon={Lock}
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={formData.confirm_password && !passwordsMatch ? "Konfirmasi belum cocok" : /Konfirmasi/i.test(error) ? error : ""}
                        required
                      />
                    </div>
                  <div className="flex flex-col gap-1 text-xs -mt-1">
                    <span className={passwordValid ? "text-green-600 font-medium" : formData.password ? "text-red-500" : "text-gray-400"}>
                      {passwordValid ? "✓ 8+ huruf & angka terpenuhi" : "• 8+ huruf & angka"}
                    </span>
                    {formData.confirm_password && (
                      <span className={passwordsMatch ? "text-green-600 font-medium" : "text-red-500"}>
                        {passwordsMatch ? "✓ Konfirmasi cocok" : "✗ Konfirmasi belum cocok"}
                      </span>
                    )}
                  </div>
                    <div className="mt-2 text-xs sm:text-sm text-gray-600">
                      Saya setuju dengan{" "}
                      <span onClick={() => setModalConfig({ isOpen: true, type: "terms" })} className="text-pink-500 font-bold cursor-pointer hover:underline">
                        Syarat Layanan
                      </span>{" "}
                      dan{" "}
                      <span onClick={() => setModalConfig({ isOpen: true, type: "privacy" })} className="text-pink-500 font-bold cursor-pointer hover:underline">
                        Kebijakan Privasi
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={loading || googleLoading}
                    className="flex-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    Kembali
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-pink-200"
                  >
                    Lanjut <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-pink-200"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Buat Akun <ArrowRight size={18} /></>}
                  </button>
                )}
              </div>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-100" />
                <span className="px-4 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Atau daftar dengan
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

              <p className="text-center text-sm text-gray-600 mt-4">
                Sudah punya akun?{" "}
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
            Bergabung dengan Komunitas Biteyo
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-md">
            Mulai jelajah, bagikan kuliner favorit, dan temukan rekomendasi terbaik bersama foodies lainnya.
          </p>
          <div className="space-y-3 max-w-md">
            <FeatureCard
              icon={PenTool}
              title="Tulis Ulasan & Rating"
              description="Bagikan rasa makanan favorit dan pengalaman kulinermu."
              iconBg="bg-pink-100"
              iconColor="text-pink-500"
            />
            <FeatureCard
              icon={Search}
              title="Eksplorasi Kuliner"
              description="Temukan permata kuliner tersembunyi dan tempat viral terkini."
              iconBg="bg-orange-100"
              iconColor="text-orange-500"
            />
            <FeatureCard
              icon={Users}
              title="Interaksi Sesama Foodies"
              description="Ikuti foodies lain yang sefrekuensi dan bangun relasi kuliner."
              iconBg="bg-purple-100"
              iconColor="text-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
