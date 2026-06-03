import { useState } from "react";
import { postBiteComment, toggleLikeBite, toggleSaveBite } from "../services/feedApi";
import { broadcastFeedChange } from "../services/feedRealtime";
import { getAuthHeaders } from "../utils/auth";
import {
  getBiteComments,
  getBiteId as readBiteId,
  getCommentCount,
  getLikeCount,
  isBiteLiked,
  isBiteSaved,
  normalizeCreatedComment,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import { ensureOkResponse } from "../utils/api";
import {
  API_BASE,
  biteCategories,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";

export const getBiteId = readBiteId;

export const useBiteMutations = ({
  currentUser,
  onLikeChange,
  onSaveChange,
  removeOnUnsave = false,
  refresh,
  setBites,
  setActionMessage,
  setToastMessage,
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
  const [commentingBiteIds, setCommentingBiteIds] = useState(() => new Set());
  const [commentErrors, setCommentErrors] = useState({});

  const updateBiteInState = (biteId, updater) => {
    setBites((prev) =>
      prev.map((item) => (getBiteId(item) === biteId ? updater(item) : item)),
    );
  };

  const startEdit = (bite) => {
    setActionMessage({ type: "", text: "" });
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
      setActionMessage({ type: "error", text: "Food, location, and review are required." });
      return;
    }

    if (!biteCategories.some((item) => item.value === payload.category)) {
      setActionMessage({ type: "error", text: "Please choose a valid category." });
      return;
    }

    setSavingBiteId(biteId);
    setActionMessage({ type: "", text: "" });

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

      setActionMessage({ type: "success", text: "Bite updated." });
      cancelEdit();
      broadcastFeedChange({ type: "refresh", biteId });
      refresh();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
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
    setActionMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/api/feed/bites/${biteId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      await ensureOkResponse(res, "Failed to delete bite");

      setBites((prev) => prev.filter((item) => getBiteId(item) !== biteId));
      broadcastFeedChange({ type: "delete", biteId });
      setActionMessage({ type: "success", text: "Bite deleted." });
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
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
      broadcastFeedChange({ type: "refresh", biteId });

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

  const toggleSave = async (bite) => {
    const biteId = getBiteId(bite);
    if (!biteId || savingBiteIds.has(biteId)) return;

    const wasSaved = isBiteSaved(bite, currentUser);
    const nextSaved = !wasSaved;

    setActionMessage({ type: "", text: "" });
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
      setToastMessage?.({
        icon: "bookmark",
        text: nextSaved
          ? "Added to your saved posts."
          : "Removed from your saved posts.",
        type: "success",
      });

      if (removeOnUnsave && !nextSaved) {
        setBites((prev) => prev.filter((item) => getBiteId(item) !== biteId));
      }
      broadcastFeedChange({ type: "refresh", biteId });
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
      setActionMessage({
        type: "error",
        text: err.message || "Gagal memperbarui saved bite.",
      });
    } finally {
      setSavingBiteIds((prev) => {
        const next = new Set(prev);
        next.delete(biteId);
        return next;
      });
    }
  };

  const submitComment = async (bite, content) => {
    const biteId = getBiteId(bite);
    const cleanedContent = content?.trim();

    if (!biteId) return false;

    if (!cleanedContent) {
      setCommentErrors((prev) => ({
        ...prev,
        [biteId]: "Komentar tidak boleh kosong.",
      }));
      return false;
    }

    if (commentingBiteIds.has(biteId)) return false;

    setActionMessage({ type: "", text: "" });
    setCommentErrors((prev) => ({ ...prev, [biteId]: "" }));
    setCommentingBiteIds((prev) => new Set(prev).add(biteId));

    try {
      const data = await postBiteComment(biteId, cleanedContent);
      const updatedBite = normalizeUpdatedBite(data);
      const nextComment = normalizeCreatedComment(data, cleanedContent, currentUser);

      updateBiteInState(biteId, (item) => {
        if (updatedBite && getBiteId(updatedBite)) {
          return { ...item, ...updatedBite };
        }

        const previousCount = getCommentCount(item);
        const comments = [...getBiteComments(item), nextComment];
        const count = Math.max(previousCount + 1, comments.length);

        return {
          ...item,
          comments,
          commentsCount: count,
          commentCount: count,
        };
      });
      broadcastFeedChange({ type: "refresh", biteId });

      return true;
    } catch (err) {
      setCommentErrors((prev) => ({
        ...prev,
        [biteId]: err.message || "Gagal mengirim komentar.",
      }));
      return false;
    } finally {
      setCommentingBiteIds((prev) => {
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
    commentingBiteIds,
    commentErrors,
    startEdit,
    cancelEdit,
    updateEditForm,
    updateBite,
    deleteBite,
    cancelDeleteBite,
    confirmDeleteBite,
    toggleLike,
    toggleSave,
    submitComment,
  };
};
