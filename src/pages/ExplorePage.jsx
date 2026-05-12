import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders, getStoredUser } from "../utils/auth";
import {
  API_BASE,
  biteCategories,
  getCategoryLabel,
  normalizeBites,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";

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
      setBites(normalizeBites(data));
    } catch (err) {
      console.error("Feed error:", err);
      setFeedError("Feed belum bisa dimuat. Coba refresh halaman.");
      setBites([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-100 min-h-screen">
        <div className="sticky top-[65px] bg-white/95 backdrop-blur z-20 border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-extrabold text-gray-900">Explore</h1>
          <p className="text-sm text-gray-500">
            {category ? `Latest in ${getCategoryLabel(category)}` : "Latest bites from everyone"}
          </p>
        </div>

        {actionMessage.text && (
          <div
            className={`px-4 py-3 text-sm font-medium border-b ${
              actionMessage.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {query && (
          <section className="border-b border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              Hasil lokasi untuk "{query}"
            </h2>

            {loadingSearch && (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-3">
                {error}
              </div>
            )}

            {!loadingSearch && results.length > 0 && (
              <div className="space-y-2">
                {results.map((place) => (
                  <div
                    key={place.placeId}
                    className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{place.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Lat: {place.lat}, Lng: {place.lng}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingSearch && results.length === 0 && !error && (
              <p className="text-sm text-gray-400">Lokasi tidak ditemukan.</p>
            )}
          </section>
        )}

        <section>
          {feedLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            </div>
          ) : feedError ? (
            <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
              {feedError}
            </div>
          ) : filteredBites.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900">Belum ada bite di feed</h2>
              <p className="text-sm text-gray-500 mt-1">
                Jadilah yang pertama share makanan di sini.
              </p>
              <button
                onClick={() => navigate("/add")}
                className="mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition-colors"
              >
                Post a Bite
              </button>
            </div>
          ) : (
            <div>
              {filteredBites.map((bite, index) => {
                const biteId = getBiteId(bite);
                const isEditing = editingId === biteId;
                const manageable = canManageBite(bite);

                return (
                  <article
                    key={biteId || index}
                    className="border-b border-gray-100 px-4 py-4 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-pink-500">
                          {(bite.user?.username || bite.user?.name || "B").charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 truncate">
                              {bite.user?.username || bite.user?.name || "BiteYo User"}
                            </h2>
                            <p className="text-xs text-gray-500 truncate">
                              {bite.locationName || bite.location || "Unknown location"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Number(bite.rating || 0)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>

                            {manageable && !isEditing && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(bite)}
                                  className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  aria-label="Edit bite"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(bite)}
                                  disabled={deletingId === biteId}
                                  className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  aria-label="Delete bite"
                                >
                                  {deletingId === biteId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="mt-3 space-y-3">
                            <input
                              value={editForm.foodName}
                              onChange={(e) => handleEditChange("foodName", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                              placeholder="Food name"
                            />
                            <input
                              value={editForm.locationName}
                              onChange={(e) => handleEditChange("locationName", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                              placeholder="Location"
                            />
                            <textarea
                              value={editForm.review}
                              onChange={(e) => handleEditChange("review", e.target.value)}
                              rows={3}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-200"
                              placeholder="Review"
                            />

                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleEditChange("rating", star)}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= editForm.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {biteCategories.map((cat) => (
                                <button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => handleEditChange("category", cat.value)}
                                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                                    editForm.category === cat.value
                                      ? "bg-pink-500 text-white border-pink-500"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                                  }`}
                                >
                                  {cat.label}
                                </button>
                              ))}
                            </div>

                            <label className="block text-xs text-gray-500">
                              Replace photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditPhotoFile(e.target.files[0] || null)}
                                className="mt-1 block w-full text-sm text-gray-600"
                              />
                            </label>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdate(bite)}
                                disabled={savingId === biteId}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 disabled:opacity-50"
                              >
                                {savingId === biteId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="mt-2 font-semibold text-gray-900">
                              {bite.foodName || bite.title || "Untitled Bite"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {bite.review || bite.description}
                            </p>

                            {(bite.photoUrl || bite.image) && (
                              <img
                                src={bite.photoUrl || bite.image}
                                alt={bite.foodName || bite.title || "Food"}
                                className="mt-3 w-full max-h-[520px] rounded-2xl object-cover border border-gray-100"
                                loading="lazy"
                              />
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                              {normalizeCategories(bite.category || bite.categories).map((cat) => (
                                <span
                                  key={cat}
                                  className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full font-medium"
                                >
                                  {getCategoryLabel(normalizeCategoryValue(cat))}
                                </span>
                              ))}
                            </div>

                            <div className="mt-3 flex items-center gap-6 text-gray-400">
                              <button className="flex items-center gap-1.5 text-sm hover:text-pink-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{bite.likesCount || bite.likes?.length || 0}</span>
                              </button>
                              <button className="flex items-center gap-1.5 text-sm hover:text-pink-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span>{bite.commentsCount || bite.comments?.length || 0}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
