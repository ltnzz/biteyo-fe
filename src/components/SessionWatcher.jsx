import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, isAuthenticated, SESSION_EXPIRED_MESSAGE } from "../utils/auth";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 menit

/**
 * Pemeriksaan sesi proaktif: token bisa kedaluwarsa diam-diam
 * (tidak ada request yang gagal bila user idle). Komponen ini
 * memanggil /api/auth/me berkala; jika 401, anggap sesi berakhir:
 * bersihkan state lokal + arahkan ke login dengan pesan.
 */
export default function SessionWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) return undefined;

    const check = async () => {
      if (!isAuthenticated()) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/me`,
          { credentials: "include" },
        );

        if ([401, 419, 440].includes(response.status)) {
          clearAuth();
          try {
            window.sessionStorage.setItem(
              "biteyo_login_notice",
              SESSION_EXPIRED_MESSAGE,
            );
          } catch {
            // abaikan kegagalan storage
          }
          navigate("/login", { replace: true });
        }
      } catch {
        // offline / network error — coba lagi di interval berikutnya
      }
    };

    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [navigate]);

  return null;
}
