import { API_BASE, parseApiError } from "../utils/api";
import { getAuthHeaders } from "../utils/auth";
import { normalizeBites } from "../utils/bites";
import { normalizeProfile } from "../utils/profile";

const isEmptyProfile = (data, profile) =>
  !profile ||
  Array.isArray(profile) ||
  (typeof profile === "object" && Object.keys(profile).length === 0) ||
  data?.profile === null ||
  data?.user === null ||
  data?.data === null ||
  data?.data?.profile === null ||
  data?.data?.user === null ||
  (profile?.message && !profile?.username && !profile?.name && !profile?.id && !profile?._id);

const requestJson = async (
  path,
  { method = "GET", fallback = "Request failed", allowNotFound = false } = {},
) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (allowNotFound && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response, fallback));
  }

  return response.json().catch(() => null);
};

export const getUserProfile = async (username) => {
  if (!username) throw new Error("Username is required.");

  const data = await requestJson(`/api/profile/${encodeURIComponent(username)}`, {
    fallback: "Failed to load profile",
    allowNotFound: true,
  });

  const profile = data ? normalizeProfile(data) : null;

  return isEmptyProfile(data, profile) ? null : profile;
};

export const getUserBites = async (username) => {
  if (!username) throw new Error("Username is required.");

  const data = await requestJson(`/api/profile/${encodeURIComponent(username)}/bites`, {
    fallback: "Failed to load profile bites",
  });

  return normalizeBites(data);
};

export const getSavedBites = async () => {
  const data = await requestJson("/api/profile/saved", {
    fallback: "Failed to load saved bites",
  });

  return normalizeBites(data);
};

export const getLikedBites = async (username = "") => {
  const paths = username
    ? [
        `/api/profile/${encodeURIComponent(username)}/likes`,
        `/api/profile/${encodeURIComponent(username)}/liked`,
      ]
    : ["/api/profile/likes", "/api/profile/liked"];

  let lastError = null;

  for (const path of paths) {
    try {
      const data = await requestJson(path, {
        fallback: "Failed to load liked bites",
        allowNotFound: true,
      });

      if (data !== null) return normalizeBites(data);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;

  return [];
};

export const followUser = async (username) => {
  if (!username) throw new Error("Username is required.");

  return requestJson(`/api/profile/${encodeURIComponent(username)}/follow`, {
    method: "POST",
    fallback: "Failed to follow user",
  });
};

export const unfollowUser = async (username) => {
  if (!username) throw new Error("Username is required.");

  return requestJson(`/api/profile/${encodeURIComponent(username)}/follow`, {
    method: "DELETE",
    fallback: "Failed to unfollow user",
  });
};
