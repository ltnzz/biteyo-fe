import React, { useState } from 'react'; 
import axios from 'axios';
import { Mail, Lock, ArrowRight, Facebook, Loader2, AlertCircle } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import logo from "../assets/logo.png";

const GoogleIcon = () => ( 
  <svg className="w-5 h-5" viewBox="0 0 24 24"> 
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /> 
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /> 
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /> 
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /> 
  </svg> 
); 

// --- KOMPONEN INPUT (Diperbarui untuk menerima state) ---
const InputField = ({ label, icon: Icon, type = "text", placeholder, name, value, onChange, required }) => ( 
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
  </div> 
); 

export default function LoginPage() { 
  const navigate = useNavigate();
  
  // State untuk form login
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Menangani perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Hilangkan error saat user mulai mengetik lagi
  };

  // Fungsi saat form dikirim
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://biteyo-be.vercel.app/api/auth/signin',
        formData,
        { withCredentials: true }
      );

      console.log('Login Berhasil:', response.data);
      
      // Opsional: Simpan token ke localStorage jika backend Anda mengirimkan token di body response
      if (response.data.token) {
        localStorage.setItem('biteyo_token', response.data.token);
      }
      const user = response.data.user;
      if (user) {
        localStorage.setItem('biteyo_user', JSON.stringify(user));
      }
      
      // Arahkan ke halaman utama (Homepage)
      navigate('/');
    } catch (err) {
      // Tangkap pesan error dari backend
      const message = err.response?.data?.message || 'Gagal masuk. Periksa email dan kata sandi Anda.';
      setError(message);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Masuk</h1> 
            <p className="text-sm text-gray-500 mb-8"> 
              Selamat datang kembali! Masuk ke akun BiteYo Anda 
            </p> 

            {/* Pesan Error */}
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
                <Link to="/forgotpassword" className="text-sm text-pink-500 font-semibold hover:text-pink-600 hover:underline" > 
                  Lupa kata sandi? 
                </Link> 
              </div> 
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-pink-200" 
              > 
                {loading ? <Loader2 className="animate-spin" /> : <>Masuk <ArrowRight size={18} /></>}
              </button> 
              
              <div className="flex items-center my-6"> 
                <div className="flex-1 border-t border-gray-100" /> 
                <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider"> Atau masuk dengan </span> 
                <div className="flex-1 border-t border-gray-100" /> 
              </div> 
              
              <div className="flex gap-4"> 
                <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors" > 
                  <GoogleIcon /> Google 
                </button> 
                <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors" > 
                  <Facebook className="text-blue-600" size={20} fill="currentColor" stroke="none" /> Facebook 
                </button> 
              </div> 
              
              <p className="text-center text-sm text-gray-600 mt-8"> 
                Belum punya akun?{' '} 
                <Link to="/signup" className="text-pink-500 font-semibold hover:underline"> Daftar </Link> 
              </p> 
            </form> 
          </div> 
        </div> 

        {/* === RIGHT: PROMO === */} 
        <div className="hidden lg:flex flex-col flex-1 justify-center py-10"> 
          <h2 className="text-5xl font-extrabold text-pink-500 leading-[1.15] mb-4"> Kembali ke Perjalanan Kuliner Anda </h2> 
          <p className="text-gray-600 text-lg mb-12 max-w-md leading-relaxed"> Masuk untuk menyimpan restoran favorit, menulis ulasan, dan terhubung dengan komunitas pecinta kuliner. </p> 
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50/50 max-w-md"> 
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mengapa bergabung?</h3> 
            <ul className="space-y-3 text-gray-600"> 
              <li className="flex items-center gap-3"> <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">1</span> Simpan restoran favorit dan buat daftar wishlist </li> 
              <li className="flex items-center gap-3"> <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">2</span> Tulis ulasan dan bantu orang lain menemukan tempat terbaik </li> 
              <li className="flex items-center gap-3"> <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold">3</span> Dapatkan rekomendasi personal berdasarkan preferensi Anda </li> 
            </ul> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}