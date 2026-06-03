export const AUTH_CHANGE_EVENT = "biteyo-auth-change";

const TOKEN_KEY = "biteyo_token";
const USER_KEY = "biteyo_user";
const AUTH_EXPIRES_AT_KEY = "biteyo_auth_expires_at";
const AUTH_EXPIRES_AT_COOKIE = "auth_expires_at";
const AUTH_MAX_AGE = 30 * 24 * 60 * 60;
const AUTH_MAX_AGE_MS = AUTH_MAX_AGE * 1000;
const UNAUTHORIZED_STATUSES = new Set([401, 419, 440]);

export const SESSION_EXPIRED_MESSAGE =
  "Sesi login telah berakhir. Silakan masuk kembali.";

const hasBrowserStorage = () => typeof window !== "undefined" && window.localStorage;

const setCookie = (name, value) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${AUTH_MAX_AGE}; SameSite=Lax`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const prefix = `${name}=`;
  const found = cookies.find((cookie) => cookie.startsWith(prefix));

  return found ? decodeURIComponent(found.slice(prefix.length)) : "";
};

const parseJson = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getToken = () => {
  if (!hasBrowserStorage()) return "";
  if (clearExpiredAuth()) return "";

  return localStorage.getItem(TOKEN_KEY) || getCookie("token");
};

export const getStoredUser = () => {
  if (!hasBrowserStorage()) return null;
  if (clearExpiredAuth()) return null;

  return parseJson(localStorage.getItem(USER_KEY)) || parseJson(getCookie("user"));
};

export const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const saveAuth = ({ token, user }) => {
  if (!hasBrowserStorage()) return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie("token", token);
  }

  if (user) {
    const serializedUser = JSON.stringify(user);
    localStorage.setItem(USER_KEY, serializedUser);
    setCookie("user", serializedUser);
  }

  if (token || user) {
    const hasExpiry =
      localStorage.getItem(AUTH_EXPIRES_AT_KEY) || getCookie(AUTH_EXPIRES_AT_COOKIE);

    if (token || !hasExpiry) {
      const expiresAt = String(Date.now() + AUTH_MAX_AGE_MS);
      localStorage.setItem(AUTH_EXPIRES_AT_KEY, expiresAt);
      setCookie(AUTH_EXPIRES_AT_COOKIE, expiresAt);
    }
  }

  notifyAuthChange();
};

export const clearAuth = () => {
  if (!hasBrowserStorage()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  deleteCookie("token");
  deleteCookie("user");
  deleteCookie(AUTH_EXPIRES_AT_COOKIE);
  notifyAuthChange();
};

export const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => Boolean(getToken() || getStoredUser());

export const clearExpiredAuth = () => {
  if (!hasBrowserStorage()) return false;

  const expiresAt = Number(
    localStorage.getItem(AUTH_EXPIRES_AT_KEY) || getCookie(AUTH_EXPIRES_AT_COOKIE),
  );

  if (!expiresAt || Date.now() < expiresAt) return false;

  clearAuth();
  return true;
};

const getCurrentPath = () => {
  if (typeof window === "undefined") return "/";

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
};

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

  if (window.location.pathname.startsWith("/login")) return true;

  const currentPath = getCurrentPath();
  const loginPath =
    currentPath && currentPath !== "/"
      ? `/login?redirect=${encodeURIComponent(currentPath)}`
      : "/login";

  window.location.replace(loginPath);
  return true;
};
