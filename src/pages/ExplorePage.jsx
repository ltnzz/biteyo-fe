import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, MoreHorizontal, SlidersHorizontal, TrendingUp, UserPlus, X } from "lucide-react";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import ConfirmDialog from "../components/ConfirmDialog";
import ExploreFeed from "../components/explore/ExploreFeed";
import ExploreHeader from "../components/explore/ExploreHeader";
import LoginRequired from "../components/profile/LoginRequired";
import { useBiteMutations } from "../hooks/useBiteMutations";
import { useFeedSocket } from "../hooks/useFeedSocket";
import { getBitesByCategory, getFeedBites, searchBites, toggleLikeBite } from "../services/feedApi";
import { followUser, unfollowUser } from "../services/profileApi";
import { ensureOkResponse } from "../utils/api";
import { getAuthHeaders, getStoredUser, isAuthenticated } from "../utils/auth";
import { invalidateApiCache } from "../utils/apiCache";
import {
  clearNewContent,
  NEW_CONTENT_REFRESH_EVENT,
} from "../utils/feedSignals";
import { showSnackbar } from "../utils/snackbar";
import {
  getLikeCount,
  isBiteLiked,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import { API_BASE, biteCategories, normalizeBites, normalizeCategories, 
         normalizeCategoryValue, toCategoryParam, } from "../utils/bites";
import {
  cacheFollowState,
  getCachedFollowingUsers,
  mergeFollowingUsers,
  toFollowKey,
} from "../utils/followState";

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

const getBiteTitle = (bite) =>
  bite?.foodName || bite?.title || bite?.locationName || "postingan ini";

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
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [bites, setBites] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    foodName: "",
    locationName: "",
    review: "",
    rating: 0,
    category: "",
  });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteBite, setPendingDeleteBite] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(() =>
    getCachedFollowingUsers(getStoredUser()),
  );
  const [followLoadingUsers, setFollowLoadingUsers] = useState(() => new Set());
  const [likingBiteIds, setLikingBiteIds] = useState(() => new Set());

  const query = searchParams.get("q") || "";
  const category = normalizeCategoryValue(searchParams.get("category") || "");
  const currentUser = useMemo(() => getStoredUser(), []);
  const hasSession = useMemo(() => isAuthenticated(), []);
  const [scope, setScope] = useState("all");
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const isScopedFeed = !query.trim() && !category;

  const VISIBLE_CATEGORY_COUNT = 3;
  const primaryCategories = biteCategories.slice(0, VISIBLE_CATEGORY_COUNT);
  const extraCategories = biteCategories.slice(VISIBLE_CATEGORY_COUNT);
  const activeExtraCategory = extraCategories.find((c) => c.value === category);

  const fetchFeed = useCallback(async ({ force = false } = {}) => {
    if (!hasSession) {
      setFeedLoading(false);
      setFeedError("");
      setBites([]);
      return;
    }

    setFeedLoading(true);
    setFeedError("");

    try {
      const data = query.trim()
        ? await searchBites(query)
        : category
          ? await getBitesByCategory(toCategoryParam(category), { force })
          : await getFeedBites({ force, scope });
      const normalizedBites = normalizeBites(data);
      setBites(normalizedBites);
      const followedFromFeed = normalizedBites
        .filter(getFollowState)
        .map(getFollowUsername)
        .filter(Boolean);

      setFollowingUsers(mergeFollowingUsers(currentUser, followedFromFeed));
    } catch (err) {
      console.error("Feed error:", err);
      const is500 = err.status >= 500;
      setFeedError(
        is500
          ? "Server sedang bermasalah. Silakan coba lagi nanti."
          : err.message || "Feed belum bisa dimuat. Coba refresh halaman.",
      );
      setBites([]);
    } finally {
      setFeedLoading(false);
    }
  }, [category, currentUser, hasSession, query, scope]);

  const biteActions = useBiteMutations({
    currentUser,
    refresh: fetchFeed,
    setBites,
  });

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const refreshFeed = useCallback(async () => {
    showSnackbar({ message: "Memuat ulang feed...", duration: 1500 });

    try {
      await fetchFeed({ force: true });
      clearNewContent();
      showSnackbar({
        message: "Feed diperbarui",
        variant: "success",
      });
    } catch (err) {
      showSnackbar({
        message: err.message || "Gagal memperbarui feed.",
        variant: "error",
      });
    }
  }, [fetchFeed]);

  // bullet di icon Search/Explore nav diklik -> refresh dari mana pun
  useEffect(() => {
    window.addEventListener(NEW_CONTENT_REFRESH_EVENT, refreshFeed);
    return () => window.removeEventListener(NEW_CONTENT_REFRESH_EVENT, refreshFeed);
  }, [refreshFeed]);

  useFeedSocket(bites, hasSession ? setBites : null, { setFollowingUsers });

  if (!hasSession) return <LoginRequired />;

  const canManageBite = (bite) => {
    if (!currentUser) return false;

    const ownerValues = getOwnerValues(bite);
    if (ownerValues.length === 0) return true;

    const currentValues = getCurrentUserValues(currentUser);

    return ownerValues.some((value) => currentValues.includes(value));
  };

  const getBiteId = (bite) => bite?._id || bite?.id || bite?.biteId || "";

  const updateBiteInState = (biteId, updater) => {
    setBites((prev) =>
      prev.map((item) => (getBiteId(item) === biteId ? updater(item) : item)),
    );
  };

  const getFollowKey = (bite) => toFollowKey(getFollowUsername(bite));

  const canFollowBite = (bite) =>
    Boolean(getFollowUsername(bite)) && !isOwnBite(bite, currentUser);

  const toggleFollow = async (bite) => {
    const username = getFollowUsername(bite);
    const followKey = toFollowKey(username);

    if (!username || !followKey || isOwnBite(bite, currentUser) || followLoadingUsers.has(followKey)) {
      return;
    }

    const wasFollowing = followingUsers.has(followKey) || getFollowState(bite);

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

      // cache following pasti basi setelah perubahan follow,
      // apa pun tab yang sedang aktif
      invalidateApiCache("feed:following");

      // tab Following harus langsung mencerminkan perubahan follow
      if (scope === "following") await fetchFeed({ force: true });
    } catch (err) {
      setFollowingUsers((prev) => {
        const next = new Set(prev);

        if (wasFollowing) next.add(followKey);
        else next.delete(followKey);

        return next;
      });
      cacheFollowState(currentUser, username, wasFollowing);
      showSnackbar({
        variant: "error",
        message: err.message || "Gagal memperbarui follow.",
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
    setEditingId(getBiteId(bite));
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
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (bite) => {
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
      showSnackbar({ message: "Nama makanan, lokasi, dan review wajib diisi.", variant: "error" });
      return;
    }

    if (!biteCategories.some((item) => item.value === payload.category)) {
      showSnackbar({ message: "Pilih kategori makanan yang valid.", variant: "error" });
      return;
    }

    setSavingId(biteId);

    try {
      const res = await fetch(`${API_BASE}/api/feed/bites/${biteId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await ensureOkResponse(res, "Failed to update bite");

      showSnackbar({ message: "Postingan bite berhasil diperbarui!", variant: "success" });
      cancelEdit();
      fetchFeed();
    } catch (err) {
      showSnackbar({ message: err.message || "Gagal memperbarui bite.", variant: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (bite) => {
    const biteId = getBiteId(bite);
    if (!biteId) return;

    setPendingDeleteBite(bite);
  };

  const cancelDelete = () => {
    if (!deletingId) setPendingDeleteBite(null);
  };

  const confirmDelete = async () => {
    const biteId = getBiteId(pendingDeleteBite);
    if (!biteId) return;

    setDeletingId(biteId);

    try {
      const res = await fetch(`${API_BASE}/api/feed/status/${biteId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      await ensureOkResponse(res, "Failed to delete bite");

      setBites((prev) => prev.filter((item) => getBiteId(item) !== biteId));
      showSnackbar({ message: "Postingan bite berhasil dihapus!", variant: "success" });
    } catch (err) {
      showSnackbar({ message: err.message || "Gagal menghapus bite.", variant: "error" });
    } finally {
      setDeletingId(null);
      setPendingDeleteBite(null);
    }
  };

  const handleToggleLike = async (bite) => {
    const biteId = getBiteId(bite);
    if (!biteId || likingBiteIds.has(biteId)) return;

    const wasLiked = isBiteLiked(bite, currentUser);
    const previousLikeCount = getLikeCount(bite);
    const nextLiked = !wasLiked;
    const nextLikeCount = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));

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
      showSnackbar({
        message: err.message || "Gagal memperbarui like.",
        variant: "error",
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
    if (biteId) navigate(`/status/${biteId}`);
  };

  const openUserProfile = (username) => {
    if (username) navigate(`/profile/${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
        <main className="min-h-screen w-full max-w-2xl bg-white">
          <ExploreHeader category={category} query={query} />
          <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-4 py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                navigate("/explore");
                setScope("all");
              }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-150 ${
                !category && scope === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/explore");
                setScope("following");
              }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-150 ${
                !category && scope === "following"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              Following
            </button>

            {/* Kategori Trending Utama */}
            {primaryCategories.map((cat) => {
              const isCatActive = category === cat.value;

              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    navigate(`/explore?category=${cat.value}`);
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-150 ${
                    isCatActive
                      ? "bg-pink-500 text-white shadow-xs"
                      : "bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  <TrendingUp className={`h-3 w-3 ${isCatActive ? "text-white" : "text-pink-500"}`} />
                  <span>#{cat.label?.replace(/\s+/g, "") || cat.value}</span>
                </button>
              );
            })}

            {/* Tampilkan kategori ekstra jika sedang aktif */}
            {activeExtraCategory && (
              <button
                type="button"
                onClick={() => {
                  navigate(`/explore?category=${activeExtraCategory.value}`);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors duration-150"
              >
                <TrendingUp className="h-3 w-3 text-white" />
                <span>#{activeExtraCategory.label?.replace(/\s+/g, "") || activeExtraCategory.value}</span>
              </button>
            )}

            {/* Tombol Titik Tiga (...) untuk dialog sisa kategori trending */}
            <button
              type="button"
              onClick={() => setShowCategoryDialog(true)}
              className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 ${
                activeExtraCategory || showCategoryDialog
                  ? "bg-pink-50 text-pink-600 border border-pink-200"
                  : "bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-600"
              }`}
              title="Kategori & Trending Lainnya"
              aria-label="Kategori & Trending Lainnya"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          {scope === "following" && isScopedFeed && !feedLoading && !feedError && bites.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <UserPlus className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <h2 className="text-lg font-bold text-gray-900">
                Belum ada bite dari temuanmu
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Ikuti orang lewat kartu di tab Semua untuk melihat bite mereka
                di sini.
              </p>
              <button
                type="button"
                onClick={() => setScope("all")}
                className="mt-5 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pink-600"
              >
                Jelajahi Semua Bite
              </button>
            </div>
          ) : (
          <ExploreFeed
            bites={bites}
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
            savingId={savingId}
            onAddBite={() => navigate("/add")}
            onCancelEdit={cancelEdit}
            onDelete={handleDelete}
            onEditChange={handleEditChange}
            onOpenBite={openBiteDetail}
            onOpenProfile={openUserProfile}
            onRetry={() => fetchFeed({ force: true })}
            onStartEdit={startEdit}
            onToggleLike={handleToggleLike}
            onToggleSave={biteActions.toggleSave}
            onToggleFollow={toggleFollow}
            onUpdate={handleUpdate}
          />
          )}
        </main>
        <AdvertisementSidebar />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteBite)}
        loading={deletingId === getBiteId(pendingDeleteBite)}
        title="Hapus postingan?"
        description={`"${getBiteTitle(
          pendingDeleteBite,
        )}" akan dihapus permanen dari feed kamu.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Category Filter Dialog */}
      {showCategoryDialog && (
        <div
          className="animate-modal-fade fixed inset-0 z-[10000] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCategoryDialog(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-modal-rise flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Filter Kategori Trending
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pilih kategori untuk menyaring postingan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryDialog(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-2.5">
                {biteCategories.map((cat) => {
                  const isCatActive = category === cat.value;

                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        navigate(`/explore?category=${cat.value}`);
                        setShowCategoryDialog(false);
                      }}
                      className={`flex items-center justify-between gap-2 rounded-2xl border p-3.5 text-left transition-all ${
                        isCatActive
                          ? "border-pink-500 bg-pink-50 text-pink-600 ring-2 ring-pink-200"
                          : "border-gray-100 bg-gray-50/70 text-gray-800 hover:border-pink-200 hover:bg-pink-50/40 hover:text-pink-600"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className={`h-3.5 w-3.5 shrink-0 ${isCatActive ? "text-pink-500" : "text-gray-400"}`} />
                          <span className="truncate text-xs font-bold">
                            #{cat.label?.replace(/\s+/g, "") || cat.value}
                          </span>
                        </div>
                        <span className="block truncate text-[11px] text-gray-500 mt-0.5 font-medium">
                          {cat.label}
                        </span>
                      </div>
                      {isCatActive && (
                        <Check className="h-4 w-4 shrink-0 text-pink-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-5 py-3.5">
              <button
                type="button"
                onClick={() => {
                  navigate("/explore");
                  setScope("all");
                  setShowCategoryDialog(false);
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition"
              >
                Reset Semua
              </button>
              <button
                type="button"
                onClick={() => setShowCategoryDialog(false)}
                className="rounded-full bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-pink-500 transition shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
