import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import ActionMessage from "../components/explore/ActionMessage";
import ExploreFeed from "../components/explore/ExploreFeed";
import ExploreHeader from "../components/explore/ExploreHeader";
import LocationResults from "../components/explore/LocationResults";
import { useBiteMutations } from "../hooks/useBiteMutations";
import { useFeedSocket } from "../hooks/useFeedSocket";
import { toggleLikeBite } from "../services/feedApi";
import { followUser, unfollowUser } from "../services/profileApi";
import { getAuthHeaders, getStoredUser, getToken } from "../utils/auth";
import {
  getLikeCount,
  isBiteLiked,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import { API_BASE, biteCategories, normalizeBites, normalizeCategories, 
         normalizeCategoryValue, } from "../utils/bites";
import {
  cacheFollowState,
  getCachedFollowingUsers,
  mergeFollowingUsers,
  toFollowKey,
} from "../utils/followState";

const parseApiError = async (response, fallback) => {
  const data = await response.json().catch(() => null);

  if (data?.message) return data.message;
  if (Array.isArray(data?.errors)) {
    return data.errors.map((error) => error.message).filter(Boolean).join(", ");
  }
  if (Array.isArray(data?.issues)) {
    return data.issues.map((issue) => issue.message).filter(Boolean).join(", ");
  }

  return fallback;
};

const getIdValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  return value._id || value.id || value.userId || "";
};

const getOwnerValues = (bite) =>
  [
    getIdValue(bite.user),
    getIdValue(bite.author),
    getIdValue(bite.createdBy),
    getIdValue(bite.owner),
    bite.userId,
    bite.authorId,
    bite.createdById,
    bite.ownerId,
    bite.user?.username,
    bite.author?.username,
    bite.user?.email,
    bite.author?.email,
  ].filter(Boolean).map(String);

const getCurrentUserValues = (user) =>
  [
    user?._id,
    user?.id,
    user?.userId,
    user?.username,
    user?.email,
  ].filter(Boolean).map(String);

const getFollowUsername = (bite) => {
  const owner = bite?.user || bite?.author || bite?.createdBy || bite?.owner;

  if (typeof owner === "string") return bite?.username || bite?.createdByUsername || "";

  return (
    owner?.username ||
    bite?.username ||
    bite?.createdByUsername ||
    ""
  );
};

const getFollowState = (bite) => {
  const owner = bite?.user || bite?.author || bite?.createdBy || bite?.owner;

  return Boolean(
    bite?.isFollowingAuthor ??
      bite?.isFollowingUser ??
      bite?.isFollowing ??
      owner?.isFollowing ??
      owner?.following ??
      owner?.followedByMe,
  );
};

const isOwnBite = (bite, currentUser) => {
  if (!currentUser) return false;

  const ownerValues = getOwnerValues(bite).map((value) => value.toLowerCase());
  const currentValues = getCurrentUserValues(currentUser).map((value) =>
    value.toLowerCase(),
  );

  return ownerValues.some((value) => currentValues.includes(value));
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedError, setFeedError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [bites, setBites] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    foodName: "",
    locationName: "",
    review: "",
    rating: 0,
    category: "",
  });
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(() =>
    getCachedFollowingUsers(getStoredUser()),
  );
  const [followLoadingUsers, setFollowLoadingUsers] = useState(() => new Set());
  const [likingBiteIds, setLikingBiteIds] = useState(() => new Set());

  const query = searchParams.get("q") || "";
  const category = normalizeCategoryValue(searchParams.get("category") || "");
  const currentUser = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const handleSearchLocation = async () => {
      setLoadingSearch(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_BASE}/api/maps/location/search?q=${encodeURIComponent(query)}`,
        );
        setResults(response.data);
      } catch {
        setError("Gagal mencari lokasi. Coba lagi.");
      } finally {
        setLoadingSearch(false);
      }
    };

    handleSearchLocation();
  }, [query]);

  const fetchFeed = useCallback(async () => {
    setFeedLoading(true);
    setFeedError("");

    try {
      const res = await fetch(`${API_BASE}/api/feed/bites`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to load bites");

      const data = await res.json();
      const normalizedBites = normalizeBites(data);
      setBites(normalizedBites);
      const followedFromFeed = normalizedBites
        .filter(getFollowState)
        .map(getFollowUsername)
        .filter(Boolean);

      setFollowingUsers(mergeFollowingUsers(currentUser, followedFromFeed));
    } catch (err) {
      console.error("Feed error:", err);
      setFeedError("Feed belum bisa dimuat. Coba refresh halaman.");
      setBites([]);
    } finally {
      setFeedLoading(false);
    }
  }, [currentUser]);

  const biteActions = useBiteMutations({
    currentUser,
    refresh: fetchFeed,
    setActionMessage,
    setBites,
  });

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useFeedSocket(bites, setBites, { setFollowingUsers });

  const filteredBites = useMemo(() => {
    if (!category) return bites;

    return bites.filter((bite) =>
      normalizeCategories(bite.category || bite.categories).some(
        (item) => normalizeCategoryValue(item) === category,
      ),
    );
  }, [bites, category]);

  const canManageBite = (bite) => {
    if (!currentUser) return false;

    const ownerValues = getOwnerValues(bite);
    if (ownerValues.length === 0) return true;

    const currentValues = getCurrentUserValues(currentUser);

    return ownerValues.some((value) => currentValues.includes(value));
  };

  const getBiteId = (bite) => bite._id || bite.id;

  const updateBiteInState = (biteId, updater) => {
    setBites((prev) =>
      prev.map((item) => (getBiteId(item) === biteId ? updater(item) : item)),
    );
  };

  const getFollowKey = (bite) => toFollowKey(getFollowUsername(bite));

  const canFollowBite = (bite) =>
    Boolean(getFollowUsername(bite)) && !isOwnBite(bite, currentUser);

  const toggleFollow = async (bite) => {
    if (!getToken()) {
      setActionMessage({
        type: "error",
        text: "Sesi login tidak valid. Silakan login ulang.",
      });
      return;
    }

    const username = getFollowUsername(bite);
    const followKey = toFollowKey(username);

    if (!username || !followKey || isOwnBite(bite, currentUser) || followLoadingUsers.has(followKey)) {
      return;
    }

    const wasFollowing = followingUsers.has(followKey) || getFollowState(bite);

    setActionMessage({ type: "", text: "" });
    setFollowLoadingUsers((prev) => new Set(prev).add(followKey));
    setFollowingUsers((prev) => {
      const next = new Set(prev);

      if (wasFollowing) next.delete(followKey);
      else next.add(followKey);

      return next;
    });
    cacheFollowState(currentUser, username, !wasFollowing);

    try {
      if (wasFollowing) await unfollowUser(username);
      else await followUser(username);
    } catch (err) {
      setFollowingUsers((prev) => {
        const next = new Set(prev);

        if (wasFollowing) next.add(followKey);
        else next.delete(followKey);

        return next;
      });
      cacheFollowState(currentUser, username, wasFollowing);
      setActionMessage({
        type: "error",
        text: err.message || "Gagal memperbarui follow.",
      });
    } finally {
      setFollowLoadingUsers((prev) => {
        const next = new Set(prev);
        next.delete(followKey);
        return next;
      });
    }
  };

  const startEdit = (bite) => {
    setActionMessage({ type: "", text: "" });
    setEditingId(getBiteId(bite));
    setEditPhotoFile(null);
    setEditForm({
      foodName: bite.foodName || bite.title || "",
      locationName: bite.locationName || bite.location || "",
      review: bite.review || bite.description || "",
      rating: Number(bite.rating || 0),
      category: normalizeCategoryValue(bite.category || normalizeCategories(bite.categories)[0] || ""),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPhotoFile(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (bite) => {
    if (!getToken()) {
      setActionMessage({
        type: "error",
        text: "Sesi login tidak valid. Silakan login ulang.",
      });
      return;
    }

    const biteId = getBiteId(bite);
    if (!biteId) return;

    const payload = {
      foodName: editForm.foodName.trim(),
      locationName: editForm.locationName.trim(),
      review: editForm.review.trim(),
      rating: Number(editForm.rating),
      category: normalizeCategoryValue(editForm.category),
    };

    if (!payload.foodName || !payload.locationName || !payload.review) {
      setActionMessage({ type: "error", text: "Food, location, and review are required." });
      return;
    }

    if (!biteCategories.some((item) => item.value === payload.category)) {
      setActionMessage({ type: "error", text: "Please choose a valid category." });
      return;
    }

    setSavingId(biteId);
    setActionMessage({ type: "", text: "" });

    try {
      let body = JSON.stringify(payload);
      let headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };

      if (editPhotoFile) {
        const formData = new FormData();
        formData.append("foodName", payload.foodName);
        formData.append("locationName", payload.locationName);
        formData.append("review", payload.review);
        formData.append("rating", payload.rating);
        formData.append("category", payload.category);
        formData.append("photo", editPhotoFile);

        body = formData;
        headers = getAuthHeaders();
      }

      const res = await fetch(`${API_BASE}/api/feed/bites/${biteId}`, {
        method: "PATCH",
        credentials: "include",
        headers,
        body,
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, "Failed to update bite"));
      }

      setActionMessage({ type: "success", text: "Bite updated." });
      cancelEdit();
      fetchFeed();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (bite) => {
    if (!getToken()) {
      setActionMessage({
        type: "error",
        text: "Sesi login tidak valid. Silakan login ulang.",
      });
      return;
    }

    const biteId = getBiteId(bite);
    if (!biteId || !window.confirm("Delete this bite?")) return;

    setDeletingId(biteId);
    setActionMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/api/feed/bites/${biteId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, "Failed to delete bite"));
      }

      setBites((prev) => prev.filter((item) => getBiteId(item) !== biteId));
      setActionMessage({ type: "success", text: "Bite deleted." });
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleLike = async (bite) => {
    if (!getToken()) {
      setActionMessage({
        type: "error",
        text: "Sesi login tidak valid. Silakan login ulang.",
      });
      return;
    }

    const biteId = getBiteId(bite);
    if (!biteId || likingBiteIds.has(biteId)) return;

    const wasLiked = isBiteLiked(bite, currentUser);
    const previousLikeCount = getLikeCount(bite);
    const nextLiked = !wasLiked;
    const nextLikeCount = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));

    setActionMessage({ type: "", text: "" });
    setLikingBiteIds((prev) => new Set(prev).add(biteId));
    updateBiteInState(biteId, (item) => ({
      ...item,
      isLiked: nextLiked,
      liked: nextLiked,
      likedByMe: nextLiked,
      likedByCurrentUser: nextLiked,
      likesCount: nextLikeCount,
      likeCount: nextLikeCount,
    }));

    try {
      const data = await toggleLikeBite(biteId);
      const updatedBite = normalizeUpdatedBite(data);

      if (updatedBite && getBiteId(updatedBite)) {
        updateBiteInState(biteId, (item) => ({ ...item, ...updatedBite }));
      }
    } catch (err) {
      updateBiteInState(biteId, (item) => ({
        ...item,
        isLiked: wasLiked,
        liked: wasLiked,
        likedByMe: wasLiked,
        likedByCurrentUser: wasLiked,
        likesCount: previousLikeCount,
        likeCount: previousLikeCount,
      }));
      setActionMessage({
        type: "error",
        text: err.message || "Gagal memperbarui like.",
      });
    } finally {
      setLikingBiteIds((prev) => {
        const next = new Set(prev);
        next.delete(biteId);
        return next;
      });
    }
  };

  const openBiteDetail = (bite) => {
    const biteId = getBiteId(bite);
    if (biteId) navigate(`/bites/${biteId}`);
  };

  const openUserProfile = (username) => {
    if (username) navigate(`/profile/${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex w-full items-start justify-start px-4">
        <main className="w-full max-w-2xl border-x border-gray-100 min-h-screen">
          <ExploreHeader category={category} />
          <ActionMessage message={actionMessage} />
          <LocationResults
            error={error}
            loading={loadingSearch}
            query={query}
            results={results}
          />
          <ExploreFeed
            bites={filteredBites}
            canManageBite={canManageBite}
            currentUser={currentUser}
            deletingId={deletingId}
            editForm={editForm}
            editingId={editingId}
            feedError={feedError}
            feedLoading={feedLoading}
            followLoadingUsers={followLoadingUsers}
            followingUsers={followingUsers}
            getBiteId={getBiteId}
            getFollowKey={getFollowKey}
            canFollowBite={canFollowBite}
            commentErrors={biteActions.commentErrors}
            commentingBiteIds={biteActions.commentingBiteIds}
            likingBiteIds={likingBiteIds}
            savingBiteIds={biteActions.savingBiteIds}
            savingId={savingId}
            onAddBite={() => navigate("/add")}
            onCancelEdit={cancelEdit}
            onDelete={handleDelete}
            onEditChange={handleEditChange}
            onOpenBite={openBiteDetail}
            onOpenProfile={openUserProfile}
            onPhotoChange={setEditPhotoFile}
            onStartEdit={startEdit}
            onToggleLike={handleToggleLike}
            onToggleSave={biteActions.toggleSave}
            onSubmitComment={biteActions.submitComment}
            onToggleFollow={toggleFollow}
            onUpdate={handleUpdate}
          />
        </main>
        <AdvertisementSidebar />
      </div>
    </div>
  );
}
