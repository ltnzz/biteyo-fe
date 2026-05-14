import { useCallback, useEffect, useState } from "react";
import {
  followUser,
  getSavedBites,
  getUserBites,
  getUserProfile,
  unfollowUser,
} from "../services/profileApi";
import { getAuthHeaders, saveAuth } from "../utils/auth";
import { API_BASE } from "../utils/bites";
import { parseApiError } from "../utils/api";
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

export const useProfileData = (currentUser, routeUsername = "") => {
  const initialUsername = getProfileUsername(currentUser);
  const [ownUsername, setOwnUsername] = useState(initialUsername);
  const profileUsername = routeUsername || ownUsername;
  const [profile, setProfile] = useState(currentUser);
  const [bites, setBites] = useState([]);
  const [savedBites, setSavedBites] = useState([]);
  const [profileLoading, setProfileLoading] = useState(Boolean(profileUsername));
  const [profileError, setProfileError] = useState("");
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [bitesLoading, setBitesLoading] = useState(Boolean(profileUsername));
  const [bitesError, setBitesError] = useState("");
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [profileForm, setProfileForm] = useState({
    username: initialUsername,
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile =
    Boolean(profileUsername) &&
    normalizeUsername(profileUsername) === normalizeUsername(ownUsername);
  const isFollowing = getFollowingState(profile);

  const fetchProfile = useCallback(async () => {
    if (!profileUsername) return;

    setProfileLoading(true);
    setProfileError("");
    setProfileNotFound(false);

    try {
      const nextProfile = await getUserProfile(profileUsername);

      if (!nextProfile) {
        setProfile(null);
        setBites([]);
        setProfileNotFound(true);
        return;
      }

      setProfile(nextProfile);
      setProfileForm({
        username: nextProfile?.username || profileUsername,
        bio: nextProfile?.bio || "",
      });
    } catch (err) {
      console.error("Profile error:", err);
      setProfileError(err.message || "Profil belum bisa dimuat. Coba refresh halaman.");
    } finally {
      setProfileLoading(false);
    }
  }, [profileUsername]);

  const fetchUserBites = useCallback(async () => {
    if (!profileUsername) return;

    setBitesLoading(true);
    setBitesError("");

    try {
      setBites(await getUserBites(profileUsername));
    } catch (err) {
      console.error("Profile bites error:", err);
      setBitesError(err.message || "Bite profil belum bisa dimuat.");
    } finally {
      setBitesLoading(false);
    }
  }, [profileUsername]);

  const fetchSavedBites = useCallback(async () => {
    if (!isOwnProfile) {
      setSavedBites([]);
      setSavedError("");
      setSavedLoading(false);
      return;
    }

    setSavedLoading(true);
    setSavedError("");

    try {
      setSavedBites(await getSavedBites());
    } catch (err) {
      console.error("Saved bites error:", err);
      setSavedError(err.message || "Saved bites belum bisa dimuat.");
    } finally {
      setSavedLoading(false);
    }
  }, [isOwnProfile]);

  useEffect(() => {
    fetchProfile();
    fetchUserBites();
  }, [fetchProfile, fetchUserBites]);

  useEffect(() => {
    fetchSavedBites();
  }, [fetchSavedBites]);

  const updateProfileForm = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    const payload = {
      username: profileForm.username.trim(),
      bio: profileForm.bio.trim(),
    };

    if (!payload.username) {
      throw new Error("Username is required.");
    }

    setSavingProfile(true);

    try {
      let body = JSON.stringify(payload);
      let headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };

      if (avatarFile || bannerFile) {
        const formData = new FormData();
        formData.append("username", payload.username);
        formData.append("bio", payload.bio);
        if (avatarFile) formData.append("avatar", avatarFile);
        if (bannerFile) formData.append("banner", bannerFile);

        body = formData;
        headers = getAuthHeaders();
      }

      const res = await fetch(`${API_BASE}/api/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers,
        body,
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, "Failed to update profile"));
      }

      const data = await res.json().catch(() => null);
      const updatedProfile = normalizeProfile(data) || { ...profile, ...payload };
      const nextUsername = updatedProfile?.username || payload.username;

      setProfile(updatedProfile);
      setOwnUsername(nextUsername);
      setAvatarFile(null);
      setBannerFile(null);
      saveAuth({ user: { ...currentUser, ...updatedProfile, username: nextUsername } });

      return updatedProfile;
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
      throw err;
    } finally {
      setFollowLoading(false);
    }
  };

  return {
    profileUsername,
    profile,
    bites,
    savedBites,
    setBites,
    setProfile,
    setSavedBites,
    loading: profileLoading,
    error: profileError,
    profileLoading,
    profileError,
    profileNotFound,
    bitesLoading,
    bitesError,
    savedLoading,
    savedError,
    isOwnProfile,
    isFollowing,
    followLoading,
    profileForm,
    avatarFile,
    bannerFile,
    savingProfile,
    fetchProfile,
    fetchUserBites,
    fetchSavedBites,
    toggleFollow,
    updateProfileForm,
    setAvatarFile,
    setBannerFile,
    saveProfile,
  };
};
