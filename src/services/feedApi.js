import { API_BASE, ensureOkResponse } from "../utils/api";
import { getAuthHeaders } from "../utils/auth";
import {
  fetchWithCache,
  invalidateApiCache,
  TTL_FEED_MS,
  TTL_BITE_MS,
  TTL_COMMENTS_MS,
} from "../utils/apiCache";

const requestJson = async (path, options = {}, fallback = "Request failed") => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  await ensureOkResponse(response, fallback);

  return response.json().catch(() => null);
};

export const toggleLikeBite = async (biteId) => {
  if (!biteId) throw new Error("Bite id is required.");

  const data = await requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/like`,
    { method: "POST" },
    "Gagal memperbarui like.",
  );

  // like mengubah counter bite + engagement di semua daftar feed
  invalidateApiCache("feed");
  invalidateApiCache(`bite:${biteId}`);
  return data;
};

export const toggleSaveBite = async (biteId) => {
  if (!biteId) throw new Error("Bite id is required.");

  const data = await requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/save`,
    { method: "POST" },
    "Gagal memperbarui saved bite.",
  );

  invalidateApiCache("feed");
  invalidateApiCache(`bite:${biteId}`);
  return data;
};

export const getBiteDetail = async (biteId, { force = false } = {}) => {
  if (!biteId) throw new Error("Bite id is required.");

  const { data } = await fetchWithCache(
    `bite:${biteId}`,
    () =>
      requestJson(
        `/api/feed/bites/${encodeURIComponent(biteId)}`,
        { method: "GET" },
        "Gagal memuat postingan.",
      ),
    { ttlMs: TTL_BITE_MS, force },
  );

  return data;
};

export const searchBites = async (query, options = {}) => {
  const cleanedQuery = query?.trim();
  if (!cleanedQuery) return [];

  return requestJson(
    `/api/feed/bites/search?q=${encodeURIComponent(cleanedQuery)}`,
    { method: "GET", ...options },
    "Gagal mencari bites.",
  );
};

export const getFeedBites = async (options = {}) => {
  const { force = false, signal, scope = "all" } = options;

  const { data } = await fetchWithCache(
    scope === "following" ? "feed:following" : "feed:all",
    () =>
      requestJson(
        `/api/feed/bites${scope === "following" ? "?scope=following" : ""}`,
        { method: "GET", signal },
        "Gagal memuat bites.",
      ),
    { ttlMs: TTL_FEED_MS, force },
  );

  return data;
};

export const getTrendingBites = async ({ force = false, signal } = {}) => {
  const { data } = await fetchWithCache(
    "feed:trending",
    () =>
      requestJson(
        "/api/feed/bites/trending",
        { method: "GET", signal },
        "Gagal memuat trending bites.",
      ),
    { ttlMs: TTL_FEED_MS, force },
  );

  return data;
};

export const getTrendingKeywords = async ({ force = false, signal } = {}) => {
  const { data } = await fetchWithCache(
    "trending:keywords",
    () =>
      requestJson(
        "/api/feed/trending-keywords",
        { method: "GET", signal },
        "Gagal memuat trending keywords.",
      ),
    { ttlMs: TTL_FEED_MS, force },
  );

  return data;
};

export const getBiteCategories = async ({ force = false, signal } = {}) => {
  const { data } = await fetchWithCache(
    "feed:categories",
    () =>
      requestJson(
        "/api/feed/categories",
        { method: "GET", signal },
        "Gagal memuat kategori.",
      ),
    { ttlMs: TTL_FEED_MS, force },
  );

  return data;
};

export const getBitesByCategory = async (category, options = {}) => {
  if (!category) return [];

  const { force = false, signal } = options;

  const { data } = await fetchWithCache(
    `feed:cat:${category}`,
    () =>
      requestJson(
        `/api/feed/bites/category/${encodeURIComponent(category)}`,
        { method: "GET", signal },
        "Gagal memuat bites berdasarkan kategori.",
      ),
    { ttlMs: TTL_FEED_MS, force },
  );

  return data;
};

export const getBiteComments = async (
  biteId,
  { force = false, page = 1, limit = 20, sort = "desc" } = {},
) => {
  if (!biteId) throw new Error("Bite id is required.");

  const cacheKey = `comments:${biteId}:p${page}:l${limit}:${sort}`;
  const { data } = await fetchWithCache(
    cacheKey,
    () =>
      requestJson(
        `/api/feed/bites/${encodeURIComponent(biteId)}/comments?page=${page}&limit=${limit}&sort=${encodeURIComponent(sort)}`,
        { method: "GET" },
        "Gagal memuat komentar.",
      ),
    { ttlMs: TTL_COMMENTS_MS, force },
  );

  return data;
};

export const postBiteComment = async (biteId, content) => {
  if (!biteId) throw new Error("Bite id is required.");

  const cleanedContent = content?.trim();
  if (!cleanedContent) throw new Error("Komentar tidak boleh kosong.");

  const data = await requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: cleanedContent }),
    },
    "Gagal mengirim komentar.",
  );

  invalidateApiCache("feed");
  invalidateApiCache(`bite:${biteId}`);
  invalidateApiCache(`comments:${biteId}`);
  return data;
};

export const editBiteComment = async (biteId, commentId, content) => {
  if (!biteId) throw new Error("Bite id is required.");
  if (!commentId) throw new Error("Comment id is required.");
  const cleaned = content?.trim();
  if (!cleaned) throw new Error("Komentar tidak boleh kosong.");
  const data = await requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: cleaned }),
    },
    "Gagal mengubah komentar.",
  );
  invalidateApiCache(`comments:${biteId}`);
  invalidateApiCache(`bite:${biteId}`);
  return data;
};

export const deleteBiteComment = async (biteId, commentId) => {
  if (!biteId) throw new Error("Bite id is required.");
  if (!commentId) throw new Error("Comment id is required.");
  const data = await requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
    "Gagal menghapus komentar.",
  );
  invalidateApiCache(`comments:${biteId}`);
  invalidateApiCache(`bite:${biteId}`);
  invalidateApiCache("feed");
  return data;
};
