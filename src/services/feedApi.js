import { API_BASE, parseApiError } from "../utils/api";
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

  if (!response.ok) {
    throw new Error(await parseApiError(response, fallback));
  }

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

export const getBiteDetail = async (biteId) => {
  if (!biteId) throw new Error("Bite id is required.");

  return requestJson(
    `/api/feed/bites/${encodeURIComponent(biteId)}`,
    { method: "GET" },
    "Gagal memuat postingan.",
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
