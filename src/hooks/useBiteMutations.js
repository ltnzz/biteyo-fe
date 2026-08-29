import { useState } from "react";
import { toggleLikeBite, toggleSaveBite } from "../services/feedApi";
import { getAuthHeaders } from "../utils/auth";
import {
  getBiteId as readBiteId,
  getLikeCount,
  isBiteLiked,
  isBiteSaved,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import { ensureOkResponse } from "../utils/api";
import {
  API_BASE,
  biteCategories,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";
import { showSnackbar } from "../utils/snackbar";

export const getBiteId = readBiteId;

export const useBiteMutations = ({
  currentUser,
  onLikeChange,
  onSaveChange,
  removeOnUnsave = false,
  refresh,
  setBites,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    foodName: "",
    locationName: "",
    review: "",
    rating: 0,
    category: "",
  });
  const [savingBiteId, setSavingBiteId] = useState(null);
  const [deletingBiteId, setDeletingBiteId] = useState(null);
  const [pendingDeleteBite, setPendingDeleteBite] = useState(null);
  const [likingBiteIds, setLikingBiteIds] = useState(() => new Set());
  const [savingBiteIds, setSavingBiteIds] = useState(() => new Set());

  const updateBiteInState = (biteId, updater) => {
    setBites((prev) =>
      prev.map((item) => (getBiteId(item) === biteId ? updater(item) : item)),
    );
  };

  const startEdit = (bite) => {
    setEditingId(getBiteId(bite));
    setEditForm({
      foodName: bite.foodName || bite.title || "",
      locationName: bite.locationName || bite.location || "",
      review: bite.review || bite.description || "",
      rating: Number(bite.rating || 0),
      category: normalizeCategoryValue(
        bite.category || normalizeCategories(bite.categories)[0] || "",
      ),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateEditForm = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateBite = async (bite) => {
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

    setSavingBiteId(biteId);

    try {
      const res = await fetch(`${API_BASE}/api/feed/status/${biteId}`, {
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
      refresh();
    } catch (err) {
      showSnackbar({ message: err.message || "Gagal memperbarui bite.", variant: "error" });
    } finally {
      setSavingBiteId(null);
    }
  };

  const deleteBite = async (bite) => {
    const biteId = getBiteId(bite);
    if (!biteId) return;

    setPendingDeleteBite(bite);
  };

  const cancelDeleteBite = () => {
    if (!deletingBiteId) setPendingDeleteBite(null);
  };

  const confirmDeleteBite = async () => {
    const bite = pendingDeleteBite;
    const biteId = getBiteId(bite);
    if (!biteId) return;

    setDeletingBiteId(biteId);

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
      setDeletingBiteId(null);
      setPendingDeleteBite(null);
    }
  };

  const toggleLike = async (bite) => {
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

      onLikeChange?.({
        bite,
        biteId,
        likeCount: updatedBite ? getLikeCount(updatedBite) : nextLikeCount,
        liked: nextLiked,
        updatedBite,
      });
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

  const toggleSave = async (bite) => {
    const biteId = getBiteId(bite);
    if (!biteId || savingBiteIds.has(biteId)) return;

    const wasSaved = isBiteSaved(bite, currentUser);
    const nextSaved = !wasSaved;

    setSavingBiteIds((prev) => new Set(prev).add(biteId));
    updateBiteInState(biteId, (item) => ({
      ...item,
      isSaved: nextSaved,
      saved: nextSaved,
      savedByMe: nextSaved,
      savedByCurrentUser: nextSaved,
      bookmarked: nextSaved,
      isBookmarked: nextSaved,
    }));

    showSnackbar({
      message: nextSaved
        ? "Ditambahkan ke wishlist."
        : "Dihapus dari wishlist.",
      variant: "success",
    });

    try {
      const data = await toggleSaveBite(biteId, nextSaved);
      const updatedBite = normalizeUpdatedBite(data);

      if (updatedBite && getBiteId(updatedBite)) {
        updateBiteInState(biteId, (item) => ({ ...item, ...updatedBite }));
      }

      onSaveChange?.({
        bite,
        biteId,
        saved: nextSaved,
        updatedBite,
      });

      if (removeOnUnsave && !nextSaved) {
        setBites((prev) => prev.filter((item) => getBiteId(item) !== biteId));
      }
    } catch (err) {
      updateBiteInState(biteId, (item) => ({
        ...item,
        isSaved: wasSaved,
        saved: wasSaved,
        savedByMe: wasSaved,
        savedByCurrentUser: wasSaved,
        bookmarked: wasSaved,
        isBookmarked: wasSaved,
      }));
      showSnackbar({
        message: err.message || "Gagal memperbarui wishlist.",
        variant: "error",
      });
    } finally {
      setSavingBiteIds((prev) => {
        const next = new Set(prev);
        next.delete(biteId);
        return next;
      });
    }
  };

  return {
    editingId,
    editForm,
    pendingDeleteBite,
    savingBiteId,
    deletingBiteId,
    likingBiteIds,
    savingBiteIds,
    startEdit,
    cancelEdit,
    updateEditForm,
    updateBite,
    deleteBite,
    cancelDeleteBite,
    confirmDeleteBite,
    toggleLike,
    toggleSave,
  };
};
