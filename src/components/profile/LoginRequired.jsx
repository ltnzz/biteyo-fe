import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginRequired({
  from,
  description = "Masuk dulu untuk mengakses halaman ini.",
  loginMessage = "Please login first",
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-6 h-6 text-pink-500" />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">Login required</h1>
        <p className="text-sm text-gray-500 mt-2">
          {description}
        </p>
        <Link
          to="/login"
          state={from ? { from, message: loginMessage } : undefined}
          className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
