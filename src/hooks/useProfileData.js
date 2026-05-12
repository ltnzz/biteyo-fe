import { useCallback, useEffect, useState } from "react";
import { getAuthHeaders, saveAuth } from "../utils/auth";
import { API_BASE, normalizeBites } from "../utils/bites";
import { parseApiError } from "../utils/api";
import { getProfileUsername, normalizeProfile } from "../utils/profile";

export const useProfileData = (currentUser) => {
  const initialUsername = getProfileUsername(currentUser);
  const [profileUsername, setProfileUsername] = useState(initialUsername);
  const [profile, setProfile] = useState(currentUser);
  const [bites, setBites] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialUsername));
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState({
    username: initialUsername,
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!profileUsername) return;

    setLoading(true);
    setError("");

    try {
      const [profileRes, bitesRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile/${encodeURIComponent(profileUsername)}`, {
          credentials: "include",
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE}/api/profile/${encodeURIComponent(profileUsername)}/bites`, {
          credentials: "include",
          headers: getAuthHeaders(),
        }),
      ]);

      if (!profileRes.ok) {
        throw new Error(await parseApiError(profileRes, "Failed to load profile"));
      }
      if (!bitesRes.ok) {
        throw new Error(await parseApiError(bitesRes, "Failed to load profile bites"));
      }

      const nextProfile = normalizeProfile(await profileRes.json());
      const bitesData = await bitesRes.json();

      setProfile(nextProfile);
      setProfileForm({
        username: nextProfile?.username || profileUsername,
        bio: nextProfile?.bio || "",
      });
      setBites(normalizeBites(bitesData));
    } catch (err) {
      console.error("Profile error:", err);
      setError(err.message || "Profil belum bisa dimuat. Coba refresh halaman.");
    } finally {
      setLoading(false);
    }
  }, [profileUsername]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

      if (avatarFile) {
        const formData = new FormData();
        formData.append("username", payload.username);
        formData.append("bio", payload.bio);
        formData.append("avatar", avatarFile);

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
      setProfileUsername(nextUsername);
      setAvatarFile(null);
      saveAuth({ user: { ...currentUser, ...updatedProfile, username: nextUsername } });

      return updatedProfile;
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    profileUsername,
    profile,
    bites,
    setBites,
    loading,
    error,
    profileForm,
    avatarFile,
    savingProfile,
    fetchProfile,
    updateProfileForm,
    setAvatarFile,
    saveProfile,
  };
};
