import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_CHANGE_EVENT, clearAuth, isAuthenticated, saveAuth, SESSION_EXPIRED_MESSAGE } from "../utils/auth";
import { API_BASE } from "../utils/api";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 menit

// Prefix route yang membutuhkan login aktif
const PROTECTED_PREFIXES = [
  "/profile",
  "/add",
  "/notifications",
  "/explore",
  "/activity",
  "/status",
  "/u/",
  "/@",
  "/bites/",
  "/biteyo/",
  "/post",
];

/**
 * Validasi sesi dari sumber data backend:
 * FE hanya menerima data dari server tanpa melakukan perhitungan kadaluwarsa sendiri.
 * Backend /api/auth/me adalah single source of truth:
 * - 200 OK: perbarui state user dengan data terbaru dari database.
 * - 401/403/419/440: sesi berakhir/tidak sah, bersihkan data lokal (clearAuth)
 *   dan redirect ke /login bila user berada di route terproteksi.
 *
 * Dijalankan langsung saat komponen dimount (on load), dan secara berkala via interval.
 */
export default function SessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const syncAuthState = () => setAuthed(isAuthenticated());

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, []);

  useEffect(() => {
    // Jika tidak ada data sesi di storage, tidak perlu periksa
    if (!authed) return undefined;

    let cancelled = false;

    const check = async () => {
      if (!isAuthenticated() || cancelled) return;

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        if (cancelled) return;

        if ([401, 403, 419, 440].includes(response.status)) {
          clearAuth();
          try {
            window.sessionStorage.setItem(
              "biteyo_login_notice",
              SESSION_EXPIRED_MESSAGE,
            );
          } catch {
            // abaikan kegagalan storage
          }

          const currentPath = locationRef.current?.pathname || "";
          const isCurrentlyProtected = PROTECTED_PREFIXES.some((prefix) =>
            currentPath.startsWith(prefix),
          );

          if (isCurrentlyProtected) {
            navigate("/login", {
              replace: true,
              state: { from: locationRef.current },
            });
          }
          return;
        }

        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data?.user && !cancelled) {
            saveAuth({ user: data.user });
          }
        }
      } catch {
        // offline / network error — abaikan, coba lagi di interval berikutnya
      }
    };

    // Panggil langsung saat mount
    check();

    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [authed, navigate]);

  return null;
}
