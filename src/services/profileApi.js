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

const getStringValue = (...values) => {
  const value = values.find(
    (item) => typeof item === "string" && item.trim().length > 0,
  );

  return value ? value.trim() : "";
};

const getMentionCandidates = (data) => {
  const candidates = [
    data,
    data?.data,
    data?.users,
    data?.profiles,
    data?.mentions,
    data?.data?.users,
    data?.data?.profiles,
    data?.data?.mentions,
    data?.data?.items,
    data?.items,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeMentionUser = (item) => {
  const user = item?.user || item?.profile || item?.account || item || {};
  const username = getStringValue(
    user.username,
    user.handle,
    user.userName,
    user.slug,
    item?.username,
    item?.handle,
  ).replace(/^@+/, "");

  if (!username) return null;

  return {
    id: user.id || user._id || user.userId || item?.id || item?._id || username,
    username,
    displayName:
      getStringValue(
        user.displayName,
        user.name,
        user.fullName,
        user.full_name,
        item?.displayName,
        item?.name,
      ) || username,
    avatar:
      getStringValue(
        user.avatar,
        user.avatarUrl,
        user.avatar_url,
        user.photoUrl,
        user.photo_url,
        user.image,
        user.profilePicture,
        user.profile_picture,
        item?.avatar,
        item?.avatarUrl,
      ) || "",
  };
};

const normalizeMentionUsers = (data) => {
  const seen = new Set();

  return getMentionCandidates(data)
    .map(normalizeMentionUser)
    .filter(Boolean)
    .filter((user) => {
      const key = String(user.username || user.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

export const getMentionUsers = async () => {
  const data = await requestJson("/api/profile/mentions", {
    fallback: "Failed to load mention users",
  });

  return normalizeMentionUsers(data);
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
