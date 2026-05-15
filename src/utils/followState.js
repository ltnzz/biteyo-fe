const FOLLOWING_CACHE_PREFIX = "biteyo_following_users";

const getIdentityKey = (user) =>
  user?._id || user?.id || user?.userId || user?.email || user?.username || "guest";

const getStorageKey = (user) => `${FOLLOWING_CACHE_PREFIX}:${getIdentityKey(user)}`;

const normalizeUsername = (username) => username?.trim().toLowerCase() || "";

export const getCachedFollowingUsers = (user) => {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = JSON.parse(window.localStorage.getItem(getStorageKey(user)) || "[]");

    return new Set(
      Array.isArray(stored)
        ? stored.map(normalizeUsername).filter(Boolean)
        : [],
    );
  } catch {
    return new Set();
  }
};

export const saveCachedFollowingUsers = (user, usernames) => {
  if (typeof window === "undefined") return;

  const values = [...usernames].map(normalizeUsername).filter(Boolean);
  window.localStorage.setItem(getStorageKey(user), JSON.stringify([...new Set(values)]));
};

export const cacheFollowState = (user, username, following) => {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) return;

  const next = getCachedFollowingUsers(user);

  if (following) next.add(normalizedUsername);
  else next.delete(normalizedUsername);

  saveCachedFollowingUsers(user, next);
};

export const mergeFollowingUsers = (user, usernames) => {
  const next = getCachedFollowingUsers(user);

  usernames.forEach((username) => {
    const normalizedUsername = normalizeUsername(username);
    if (normalizedUsername) next.add(normalizedUsername);
  });
  saveCachedFollowingUsers(user, next);

  return next;
};

export const toFollowKey = normalizeUsername;
