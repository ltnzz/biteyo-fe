import { API_BASE, ensureOkResponse } from "../utils/api";
import { getAuthHeaders } from "../utils/auth";

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

  return requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/like`,
    { method: "POST" },
    "Gagal memperbarui like.",
  );
};

export const toggleSaveBite = async (biteId) => {
  if (!biteId) throw new Error("Bite id is required.");

  return requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/save`,
    { method: "POST" },
    "Gagal memperbarui saved bite.",
  );
};

export const getBiteDetail = async (biteId) => {
  if (!biteId) throw new Error("Bite id is required.");

  return requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}`,
    { method: "GET" },
    "Gagal memuat postingan.",
  );
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

export const getFeedBites = async (options = {}) =>
  requestJson(
    "/api/feed/bites",
    { method: "GET", ...options },
    "Gagal memuat bites.",
  );

export const getTrendingBites = async (options = {}) =>
  requestJson(
    "/api/feed/bites/trending",
    { method: "GET", ...options },
    "Gagal memuat trending bites.",
  );

export const getBitesByCategory = async (category, options = {}) => {
  if (!category) return [];

  return requestJson(
    `/api/feed/bites/category/${encodeURIComponent(category)}`,
    { method: "GET", ...options },
    "Gagal memuat bites berdasarkan kategori.",
  );
};

export const getBiteComments = async (biteId) => {
  if (!biteId) throw new Error("Bite id is required.");

  return requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/comments`,
    { method: "GET" },
    "Gagal memuat komentar.",
  );
};

export const postBiteComment = async (biteId, content) => {
  if (!biteId) throw new Error("Bite id is required.");

  const cleanedContent = content?.trim();
  if (!cleanedContent) throw new Error("Komentar tidak boleh kosong.");

  return requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: cleanedContent }),
    },
    "Gagal mengirim komentar.",
  );
};
