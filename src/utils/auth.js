export const AUTH_CHANGE_EVENT = "biteyo-auth-change";

import { clearApiCache } from "./apiCache";

const USER_KEY = "biteyo_user";
const LEGACY_KEYS = ["biteyo_token", "biteyo_auth_expires_at"];
const AUTH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const UNAUTHORIZED_STATUSES = new Set([401, 419, 440]);

export const SESSION_EXPIRED_MESSAGE =
  "Sesi login telah berakhir. Silakan masuk kembali.";

const hasBrowserStorage = () => typeof window !== "undefined" && window.localStorage;

const parseJson = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Token hanya hidup di cookie httpOnly milik backend.
// Frontend tidak menyimpan atau membaca token sama sekali.
export const getToken = () => "";

const purgeLegacyAuthArtifacts = () => {
  if (!hasBrowserStorage()) return;

  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }

  // bersihkan cookie non-httpOnly peninggalan model lama
  for (const name of ["token", "user", "auth_expires_at"]) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=None; Secure`;
  }
};

export const getStoredUser = () => {
  if (!hasBrowserStorage()) return null;

  return parseJson(localStorage.getItem(USER_KEY));
};

export const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const saveAuth = ({ user }) => {
  if (!hasBrowserStorage()) return;

  purgeLegacyAuthArtifacts();

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  notifyAuthChange();
};

export const clearAuth = () => {
  if (!hasBrowserStorage()) return;

  localStorage.removeItem(USER_KEY);

  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }

  clearApiCache();
  notifyAuthChange();
};

// Kompatibilitas call site lama: header tidak lagi dibutuhkan,
// autentikasi dikirim otomatis via cookie (credentials: include).
export const getAuthHeaders = () => ({});

// Bersihkan peninggalan model auth lama (token di localStorage/JS cookie)
// sekali saat aplikasi dimuat, bukan hanya saat login berikutnya.
purgeLegacyAuthArtifacts();

export const isAuthenticated = () => Boolean(getStoredUser());

export const handleUnauthorizedResponse = (
  response,
  { message = SESSION_EXPIRED_MESSAGE } = {},
) => {
  if (!response || !UNAUTHORIZED_STATUSES.has(response.status)) return false;

  clearAuth();

  if (typeof window === "undefined") return true;

  try {
    window.sessionStorage.setItem("biteyo_login_notice", message);
  } catch {
    // Ignore storage failures; redirect is the important part.
  }

  return true;
};
