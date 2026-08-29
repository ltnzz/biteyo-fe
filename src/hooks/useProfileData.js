import { useCallback, useEffect, useState } from "react";
import {
  followUser,
  getLikedBites,
  getSavedBites,
  getUserBites,
  getUserProfile,
  unfollowUser,
} from "../services/profileApi";
import { getAuthHeaders, getStoredUser, saveAuth } from "../utils/auth";
import { API_BASE } from "../utils/bites";
import { ensureOkResponse } from "../utils/api";
import { invalidateApiCache } from "../utils/apiCache";
import { cacheFollowState } from "../utils/followState";
import { compressImageFile } from "../utils/imageCompression";
import { getProfileUsername, normalizeProfile } from "../utils/profile";

const normalizeUsername = (username) => username?.trim().toLowerCase() || "";

const getFollowingState = (profile) =>
  Boolean(
    profile?.isFollowing ??
      profile?.following ??
      profile?.followedByMe ??
      profile?.is_following,
  );

const updateFollowerCount = (value, delta) => {
  const count = Number(value);

  if (!Number.isFinite(count)) return delta > 0 ? 1 : 0;

  return Math.max(0, count + delta);
};

const markBiteSaved = (bite) => ({
  ...bite,
  isSaved: true,
  saved: true,
  savedByMe: true,
  savedByCurrentUser: true,
  bookmarked: true,
  isBookmarked: true,
});

const markBiteLiked = (bite) => ({
  ...bite,
  isLiked: true,
  liked: true,
  likedByMe: true,
  likedByCurrentUser: true,
});

export const useProfileData = (currentUser, routeUsername = "") => {
  const initialUsername = getProfileUsername(currentUser);
  const [ownUsername, setOwnUsername] = useState(initialUsername);
  const profileUsername = routeUsername || ownUsername;
  const [profile, setProfile] = useState(currentUser);
  const [bites, setBites] = useState([]);
  const [likedBites, setLikedBites] = useState([]);
  const [savedBites, setSavedBites] = useState([]);
  const [profileLoading, setProfileLoading] = useState(Boolean(profileUsername));
  const [profileError, setProfileError] = useState("");
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [bitesLoading, setBitesLoading] = useState(Boolean(profileUsername));
  const [bitesError, setBitesError] = useState("");
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState("");
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    username: initialUsername,
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile =
    Boolean(profileUsername) &&
    normalizeUsername(profileUsername) === normalizeUsername(ownUsername);
  const isFollowing = getFollowingState(profile);

  const fetchProfile = useCallback(async ({ force = false } = {}) => {
    if (!profileUsername) return;

    setProfileLoading(true);
    setProfileError("");
    setProfileNotFound(false);

    try {
      const nextProfile = await getUserProfile(profileUsername, { force });

      if (!nextProfile) {
        setProfile(null);
        setBites([]);
        setProfileNotFound(true);
        return;
      }

      setProfile(nextProfile);
      if (!isOwnProfile) {
        cacheFollowState(currentUser, profileUsername, getFollowingState(nextProfile));
      }
      setProfileForm({
        name: nextProfile?.name || "",
        username: nextProfile?.username || profileUsername,
        bio: nextProfile?.bio || "",
      });
    } catch (err) {
      console.error("Profile error:", err);
      const is500 = err.status >= 500;
      setProfileError(
        is500
          ? "Server sedang mengalami gangguan. Coba lagi dalam beberapa saat."
          : err.message || "Profil belum bisa dimuat. Coba refresh halaman.",
      );
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser, isOwnProfile, profileUsername]);

  const fetchUserBites = useCallback(async ({ force = false } = {}) => {
    if (!profileUsername) return;

    setBitesLoading(true);
    setBitesError("");

    try {
      setBites(await getUserBites(profileUsername, { force }));
    } catch (err) {
      console.error("Profile bites error:", err);
      const is500 = err.status >= 500;
      setBitesError(
        is500
          ? "Gagal memuat postingan. Server sedang bermasalah."
          : err.message || "Bite profil belum bisa dimuat.",
      );
    } finally {
      setBitesLoading(false);
    }
  }, [profileUsername]);

  const fetchSavedBites = useCallback(async ({ force = false } = {}) => {
    if (!isOwnProfile) {
      setSavedBites([]);
      setSavedError("");
      setSavedLoading(false);
      return;
    }

    setSavedLoading(true);
    setSavedError("");

    try {
      setSavedBites(
        (await getSavedBites({ force })).map(markBiteSaved),
      );
    } catch (err) {
      console.error("Saved bites error:", err);
      const is500 = err.status >= 500;
      setSavedError(
        is500
          ? "Gagal memuat saved bites. Server sedang bermasalah."
          : err.message || "Saved bites belum bisa dimuat.",
      );
    } finally {
      setSavedLoading(false);
    }
  }, [isOwnProfile]);

  const fetchLikedBites = useCallback(async ({ force = false } = {}) => {
    if (!profileUsername) return;

    setLikedLoading(true);
    setLikedError("");

    try {
      setLikedBites(
        (await getLikedBites(profileUsername, { force })).map(markBiteLiked),
      );
    } catch (err) {
      console.error("Liked bites error:", err);
      const is500 = err.status >= 500;
      setLikedError(
        is500
          ? "Gagal memuat liked bites. Server sedang bermasalah."
          : err.message || "Liked bites belum bisa dimuat.",
      );
    } finally {
      setLikedLoading(false);
    }
  }, [profileUsername]);

  useEffect(() => {
    fetchProfile();
    fetchUserBites();
  }, [fetchProfile, fetchUserBites]);

  useEffect(() => {
    fetchSavedBites();
  }, [fetchSavedBites]);

  useEffect(() => {
    fetchLikedBites();
  }, [fetchLikedBites]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchProfile({ force: true }),
      fetchUserBites({ force: true }),
      fetchSavedBites({ force: true }),
      fetchLikedBites({ force: true }),
    ]);
  }, [fetchProfile, fetchUserBites, fetchSavedBites, fetchLikedBites]);

  const updateProfileForm = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSetAvatarFile = (file) => {
    setAvatarFile(file);
    if (file) setRemoveAvatar(false);
  };

  const handleSetBannerFile = (file) => {
    setBannerFile(file);
    if (file) setRemoveBanner(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setRemoveAvatar(true);
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setRemoveBanner(true);
  };

  const handleClearRemoveAvatar = () => setRemoveAvatar(false);
  const handleClearRemoveBanner = () => setRemoveBanner(false);

  const saveProfile = async () => {
    const originalName = (profile?.name || "").trim();
    const originalUsername = (profile?.username || profileUsername || "").trim();
    const originalBio = (profile?.bio || "").trim();

    const trimmedName = profileForm.name?.trim() ?? "";
    const trimmedUsername = profileForm.username.trim();
    const trimmedBio = profileForm.bio.trim();

    // hanya kirim field yang benar-benar berubah (sesuai request: "yang baru diketik aja")
    const payload = {};
    if (trimmedName !== originalName) payload.name = trimmedName;
    if (trimmedUsername !== originalUsername) payload.username = trimmedUsername;
    if (trimmedBio !== originalBio) payload.bio = trimmedBio;

    const hasTextChange = Object.keys(payload).length > 0;
    const hasFileChange = Boolean(avatarFile || bannerFile || removeAvatar || removeBanner);

    if (!hasTextChange && !hasFileChange) {
      throw new Error("Tidak ada perubahan untuk disimpan.");
    }

    // validasi hanya untuk field yang dikirim
    if (payload.name !== undefined && !payload.name) {
      throw new Error("Nama lengkap wajib diisi.");
    }
    if (payload.username !== undefined && !payload.username) {
      throw new Error("Username is required.");
    }

    // sertakan flag hapus jika diminta
    if (removeAvatar) payload.removeAvatar = true;
    if (removeBanner) payload.removeBanner = true;

    setSavingProfile(true);

    try {
      let body = JSON.stringify(payload);
      let headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };

      if (avatarFile || bannerFile || removeAvatar || removeBanner) {
        const formData = new FormData();
        if (payload.name !== undefined) formData.append("name", payload.name);
        if (payload.username !== undefined) formData.append("username", payload.username);
        if (payload.bio !== undefined) formData.append("bio", payload.bio);
        if (payload.removeAvatar) formData.append("removeAvatar", "true");
        if (payload.removeBanner) formData.append("removeBanner", "true");
        if (avatarFile) formData.append("avatar", await compressImageFile(avatarFile));
        if (bannerFile) formData.append("banner", await compressImageFile(bannerFile));

        body = formData;
        headers = getAuthHeaders();
      }

      const res = await fetch(`${API_BASE}/api/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers,
        body,
      });

      await ensureOkResponse(res, "Failed to update profile");

      const data = await res.json().catch(() => null);
      const rawUser = data?.user || data?.profile || data?.data?.user || data?.data || data;
      const nextName =
        rawUser?.name ?? (payload.name !== undefined ? payload.name : profile?.name ?? "");
      const nextUsername =
        rawUser?.username ?? (payload.username !== undefined ? payload.username : profile?.username ?? profileUsername);
      const nextBio =
        rawUser?.bio !== undefined
          ? rawUser.bio
          : payload.bio !== undefined
            ? payload.bio
            : profile?.bio ?? "";
      const nextAvatar = rawUser?.avatarUrl !== undefined ? rawUser.avatarUrl : payload.removeAvatar ? null : profile?.avatarUrl;
      const nextBanner = rawUser?.bannerUrl !== undefined ? rawUser.bannerUrl : payload.removeBanner ? null : profile?.bannerUrl;

      const mergedProfile = {
        ...profile,
        ...(rawUser || {}),
        name: nextName,
        username: nextUsername,
        bio: nextBio,
        avatarUrl: nextAvatar,
        bannerUrl: nextBanner,
      };

      setProfile(mergedProfile);
      if (nextUsername) setOwnUsername(nextUsername);
      setAvatarFile(null);
      setBannerFile(null);
      setRemoveAvatar(false);
      setRemoveBanner(false);
      setProfileForm({
        name: nextName || "",
        username: nextUsername || "",
        bio: nextBio || "",
      });

      const updatedStoredUser = {
        ...(getStoredUser() || currentUser || {}),
        ...(rawUser || {}),
        name: nextName,
        username: nextUsername,
        bio: nextBio,
        avatarUrl: nextAvatar,
        bannerUrl: nextBanner,
      };
      saveAuth({ user: updatedStoredUser });

      invalidateApiCache(`profile:${nextUsername}`);
      invalidateApiCache(`profile:${ownUsername}`);
      invalidateApiCache("profile:");
      invalidateApiCache("feed:");
      invalidateApiCache("bites:");

      return mergedProfile;
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleFollow = async () => {
    if (!profileUsername || isOwnProfile || followLoading) return;

    const wasFollowing = isFollowing;
    const delta = wasFollowing ? -1 : 1;

    setFollowLoading(true);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !wasFollowing,
            following: !wasFollowing,
            followedByMe: !wasFollowing,
            followersCount: updateFollowerCount(prev.followersCount, delta),
          }
        : prev,
    );
    cacheFollowState(currentUser, profileUsername, !wasFollowing);

    try {
      const data = wasFollowing
        ? await unfollowUser(profileUsername)
        : await followUser(profileUsername);
      const updatedProfile = normalizeProfile(data);

      if (updatedProfile) {
        setProfile((prev) => ({ ...prev, ...updatedProfile }));
      }
    } catch (err) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: wasFollowing,
              following: wasFollowing,
              followedByMe: wasFollowing,
              followersCount: updateFollowerCount(prev.followersCount, -delta),
            }
          : prev,
      );
      cacheFollowState(currentUser, profileUsername, wasFollowing);
      throw err;
    } finally {
      setFollowLoading(false);
    }
  };

  return {
    profileUsername,
    profile,
    bites,
    likedBites,
    savedBites,
    setBites,
    setLikedBites,
    setProfile,
    setSavedBites,
    loading: profileLoading,
    error: profileError,
    profileLoading,
    profileError,
    profileNotFound,
    bitesLoading,
    bitesError,
    likedLoading,
    likedError,
    savedLoading,
    savedError,
    isOwnProfile,
    isFollowing,
    followLoading,
    profileForm,
    avatarFile,
    bannerFile,
    removeAvatar,
    removeBanner,
    savingProfile,
    fetchProfile,
    fetchUserBites,
    fetchLikedBites,
    fetchSavedBites,
    refreshAll,
    toggleFollow,
    updateProfileForm,
    setAvatarFile: handleSetAvatarFile,
    setBannerFile: handleSetBannerFile,
    setRemoveAvatar,
    setRemoveBanner,
    handleRemoveAvatar,
    handleRemoveBanner,
    handleClearRemoveAvatar,
    handleClearRemoveBanner,
    saveProfile,
  };
};
