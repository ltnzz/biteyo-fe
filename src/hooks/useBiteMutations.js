import { useState } from "react";
import { getAuthHeaders } from "../utils/auth";
import { parseApiError } from "../utils/api";
import {
  API_BASE,
  biteCategories,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";

export const getBiteId = (bite) => bite._id || bite.id;

export const useBiteMutations = ({ refresh, setBites, setActionMessage }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    foodName: "",
    locationName: "",
    review: "",
    rating: 0,
    category: "",
  });
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [savingBiteId, setSavingBiteId] = useState(null);
  const [deletingBiteId, setDeletingBiteId] = useState(null);

  const startEdit = (bite) => {
    setActionMessage({ type: "", text: "" });
    setEditingId(getBiteId(bite));
    setEditPhotoFile(null);
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
    setEditPhotoFile(null);
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
      refresh();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setSavingBiteId(null);
    }
  };

  const deleteBite = async (bite) => {
    const biteId = getBiteId(bite);
    if (!biteId || !window.confirm("Delete this bite?")) return;

    setDeletingBiteId(biteId);
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
      setDeletingBiteId(null);
    }
  };

  return {
    editingId,
    editForm,
    savingBiteId,
    deletingBiteId,
    startEdit,
    cancelEdit,
    updateEditForm,
    setEditPhotoFile,
    updateBite,
    deleteBite,
  };
};
