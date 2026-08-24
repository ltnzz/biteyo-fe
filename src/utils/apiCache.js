/**
 * Cache sederhana berbasis localStorage untuk respons API GET.
 * - Key di-scope per user agar tidak bocor antar akun.
 * - Data tetap tersedia saat re-enter web (persisten antar sesi browser).
 * - Mutation (like/save/comment/follow) mem-bersihkan cache supaya tidak stale.
 */

const PREFIX = "biteyo_api_cache";
const USER_KEY = "biteyo_user";

export const TTL_FEED_MS = 3 * 60 * 1000;
export const TTL_BITE_MS = 2 * 60 * 1000;
export const TTL_COMMENTS_MS = 60 * 1000;
export const TTL_PROFILE_MS = 3 * 60 * 1000;

const hasStorage = () => typeof window !== "undefined" && window.localStorage;

const getUserScope = () => {
  if (!hasStorage()) return "guest";

  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return user?.id || user?._id || user?.username || "guest";
  } catch {
    return "guest";
  }
};

const fullKey = (key) => `${PREFIX}:${getUserScope()}:${key}`;

export const readCache = (key, { maxAgeMs = TTL_FEED_MS } = {}) => {
  if (!hasStorage()) return null;

  try {
    const raw = localStorage.getItem(fullKey(key));
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (!entry || typeof entry.t !== "number") return null;
    if (Date.now() - entry.t > maxAgeMs) {
      localStorage.removeItem(fullKey(key));
      return null;
    }

    return entry.d ?? null;
  } catch {
    return null;
  }
};

export const writeCache = (key, data) => {
  if (!hasStorage() || data === null || data === undefined) return;

  try {
    localStorage.setItem(
      fullKey(key),
      JSON.stringify({ t: Date.now(), d: data }),
    );
  } catch {
    // storage penuh/kuota — abaikan, cache bersifat best-effort
  }
};

export const clearApiCache = () => {
  if (!hasStorage()) return;

  try {
    const doomed = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};

/**
 * Invalidasi terarah: hanya hapus cache dengan key berawalan prefix.
 * Contoh: invalidateApiCache("feed") menghapus "feed", "feed:trending",
 * "feed:category:viral" — tanpa menyentuh "profile:*" atau "bite:*".
 */
export const invalidateApiCache = (prefix) => {
  if (!hasStorage() || !prefix) return;

  try {
    const scopePrefix = `${PREFIX}:${getUserScope()}:`;
    const doomed = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`${scopePrefix}${prefix}`)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};

/**
 * Jalankan fetcher dengan cache.
 * @returns {Promise<{data: any, fromCache: boolean}>}
 */
export const fetchWithCache = async (
  key,
  fetcher,
  { ttlMs = TTL_FEED_MS, force = false } = {},
) => {
  if (!force) {
    const cached = readCache(key, { maxAgeMs: ttlMs });
    if (cached !== null) return { data: cached, fromCache: true };
  }

  const data = await fetcher();
  writeCache(key, data);

  return { data, fromCache: false };
};
