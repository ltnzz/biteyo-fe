export const AUTH_CHANGE_EVENT = "biteyo-auth-change";

const TOKEN_KEY = "biteyo_token";
const USER_KEY = "biteyo_user";
const AUTH_MAX_AGE = 7 * 24 * 60 * 60;

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

  return localStorage.getItem(TOKEN_KEY) || getCookie("token");
};

export const getStoredUser = () => {
  if (!hasBrowserStorage()) return null;

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

  notifyAuthChange();
};

export const clearAuth = () => {
  if (!hasBrowserStorage()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  deleteCookie("token");
  deleteCookie("user");
  notifyAuthChange();
};

export const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};
