import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import BiteLoader from "../components/BiteLoader";
import MentionText from "../components/MentionText";
import MentionTextarea from "../components/MentionTextarea";
import { showSnackbar } from "../utils/snackbar";
import {
  getBiteComments as fetchBiteComments,
  getBiteDetail,
  postBiteComment,
  editBiteComment,
  deleteBiteComment,
  toggleLikeBite,
  toggleSaveBite,
} from "../services/feedApi";
import { getStoredUser } from "../utils/auth";
import {
  getBiteComments,
  getBiteAuthorAvatar,
  getBiteAuthorHandle,
  getBiteAuthorName,
  getBiteId,
  getCommentAuthorAvatar,
  getCommentAuthorHandle,
  getCommentAuthorName,
  getCommentContent,
  getCommentCount,
  getCommentId,
  getLikeCount,
  isBiteLiked,
  isBiteSaved,
  normalizeBiteComments,
  normalizeCreatedComment,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import {
  getBiteCreatedAt,
  getDisplayLocation,
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";
import { formatAbsoluteDateTime, formatRelativeTime } from "../utils/relativeTime";
import { notifyShareResult, shareBite } from "../utils/share";

export default function BiteDetailPage() {
  const { biteId } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId = currentUser?.id || currentUser?._id || "";
  const [bite, setBite] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const loadBite = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getBiteDetail(biteId);
      const nextBite = normalizeUpdatedBite(data);

      if (!nextBite) {
        throw new Error("Postingan tidak ditemukan.");
      }

      setBite(nextBite);
      setComments((prev) => {
        const embeddedComments = getBiteComments(nextBite);

        return prev.length > 0 || embeddedComments.length === 0
          ? prev
          : embeddedComments;
      });
    } catch (err) {
      setError(err.message || "Postingan belum bisa dimuat.");
    } finally {
      setLoading(false);
    }
  }, [biteId]);

  const loadComments = useCallback(async ({ page = 1, append = false } = {}) => {
    if (append) setLoadingMore(true);
    else {
      setCommentsLoading(true);
      setCommentsError("");
    }

    try {
      const data = await fetchBiteComments(biteId, { page, limit: 20, sort: "desc" });
      const nextComments = normalizeBiteComments(data);
      const pagination = data?.pagination || data?.data?.pagination;
      const hasMore = pagination ? pagination.hasMore : false;
      const total = pagination?.total ?? data?.commentsCount ?? nextComments.length;

      if (append) {
        setComments((prev) => [...prev, ...nextComments]);
      } else {
        setComments(nextComments);
        setCommentPage(1);
      }
      setHasMoreComments(hasMore);
      if (hasMore) setCommentPage(page + 1);
      else if (!append) setCommentPage(2);

      setBite((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: append ? [...(prev.comments || []), ...nextComments] : nextComments,
          commentsCount: total,
          commentCount: total,
        };
      });
    } catch (err) {
      setCommentsError(err.message || "Komentar belum bisa dimuat.");
    } finally {
      setCommentsLoading(false);
      setLoadingMore(false);
    }
  }, [biteId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setComments([]);
    loadBite();
    loadComments();
  }, [loadBite, loadComments]);

  const handleToggleLike = async () => {
    if (!bite || liking) return;

    const wasLiked = isBiteLiked(bite, currentUser);
    const previousLikeCount = getLikeCount(bite);
    const nextLiked = !wasLiked;
    const nextLikeCount = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));

    setLiking(true);
    setBite((prev) => ({
      ...prev,
      isLiked: nextLiked,
      liked: nextLiked,
      likedByMe: nextLiked,
      likedByCurrentUser: nextLiked,
      likesCount: nextLikeCount,
      likeCount: nextLikeCount,
    }));

    try {
      const data = await toggleLikeBite(getBiteId(bite));
      const updatedBite = normalizeUpdatedBite(data);

      if (updatedBite) setBite((prev) => ({ ...prev, ...updatedBite }));
    } catch {
      setBite((prev) => ({
        ...prev,
        isLiked: wasLiked,
        liked: wasLiked,
        likedByMe: wasLiked,
        likedByCurrentUser: wasLiked,
        likesCount: previousLikeCount,
        likeCount: previousLikeCount,
      }));
    } finally {
      setLiking(false);
    }
  };

  const handleToggleSave = async () => {
    if (!bite || saving) return;

    const wasSaved = isBiteSaved(bite, currentUser);
    const nextSaved = !wasSaved;

    setSaving(true);
    setBite((prev) => ({
      ...prev,
      isSaved: nextSaved,
      saved: nextSaved,
      savedByMe: nextSaved,
      savedByCurrentUser: nextSaved,
      bookmarked: nextSaved,
      isBookmarked: nextSaved,
    }));

    try {
      const data = await toggleSaveBite(getBiteId(bite), nextSaved);
      const updatedBite = normalizeUpdatedBite(data);

      if (updatedBite) setBite((prev) => ({ ...prev, ...updatedBite }));
      showSnackbar({
        message: nextSaved
          ? "Ditambahkan ke wishlist."
          : "Dihapus dari wishlist.",
        variant: "success",
      });
    } catch {
      setBite((prev) => ({
        ...prev,
        isSaved: wasSaved,
        saved: wasSaved,
        savedByMe: wasSaved,
        savedByCurrentUser: wasSaved,
        bookmarked: wasSaved,
        isBookmarked: wasSaved,
      }));
      showSnackbar({
        message: "Gagal memperbarui wishlist.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    const content = commentDraft.trim();

    if (!content) {
      setCommentError("Komentar tidak boleh kosong.");
      return;
    }

    setCommenting(true);
    setCommentError("");

    try {
      const data = await postBiteComment(getBiteId(bite), content);
      const updatedBite = normalizeUpdatedBite(data);
      const nextComment = normalizeCreatedComment(data, content, currentUser);

      // prepend newest on top (desc order) — no extra fetch
      setComments((prev) => [nextComment, ...prev]);
      setBite((prev) => {
        if (!prev) return prev;
        const count = getCommentCount(prev) + 1;
        return {
          ...prev,
          ...(updatedBite && getBiteId(updatedBite) ? updatedBite : {}),
          commentsCount: count,
          commentCount: count,
        };
      });
      setCommentDraft("");
      showSnackbar({ message: "Komentar terkirim!", variant: "success" });
    } catch (err) {
      const msg = err.message || "Gagal mengirim komentar.";
      setCommentError(msg);
      showSnackbar({ message: msg, variant: "error" });
    } finally {
      setCommenting(false);
    }
  };

  const handleEditComment = async () => {
    if (!editingId) return;
    const content = editingContent.trim();
    if (!content) {
      showSnackbar({ message: "Komentar tidak boleh kosong.", variant: "error" });
      return;
    }
    setSavingEdit(true);
    try {
      const data = await editBiteComment(getBiteId(bite), editingId, content);
      const updated = data?.comment || data?.data?.comment || { id: editingId, content };
      const normalized = {
        ...updated,
        content: updated.content ?? content,
        updatedAt: updated.updatedAt || new Date().toISOString(),
        user: updated.user || comments.find((c) => getCommentId(c) === editingId)?.user,
      };
      setComments((prev) => prev.map((c) => (getCommentId(c) === editingId ? { ...c, ...normalized } : c)));
      setEditingId(null);
      setEditingContent("");
      setMenuOpenId(null);
      showSnackbar({ message: "Komentar diperbarui.", variant: "success" });
    } catch (err) {
      showSnackbar({ message: err.message || "Gagal mengubah komentar.", variant: "error" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    setDeletingId(commentId);
    try {
      await deleteBiteComment(getBiteId(bite), commentId);
      setComments((prev) => prev.filter((c) => getCommentId(c) !== commentId));
      setBite((prev) => {
        if (!prev) return prev;
        const count = Math.max(0, getCommentCount(prev) - 1);
        return { ...prev, commentsCount: count, commentCount: count };
      });
      setMenuOpenId(null);
      showSnackbar({ message: "Komentar dihapus.", variant: "success" });
    } catch (err) {
      showSnackbar({ message: err.message || "Gagal menghapus komentar.", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const openUserProfile = (username) => {
    if (username) navigate(`/profile/${encodeURIComponent(username)}`);
  };

  const displayedComments = comments.length > 0 ? comments : getBiteComments(bite);
  const displayedCommentCount = Math.max(
    getCommentCount(bite),
    displayedComments.length,
  );
  const liked = isBiteLiked(bite, currentUser);
  const saved = isBiteSaved(bite, currentUser);
  const biteAuthorName = bite ? getBiteAuthorName(bite) : "";
  const biteAuthorHandle = bite ? getBiteAuthorHandle(bite) : "";
  const biteAuthorAvatar = bite ? getBiteAuthorAvatar(bite) : "";
  const displayLocation = getDisplayLocation(bite);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex w-full items-start justify-start px-4">
        <main className="min-h-screen w-full max-w-2xl bg-white">
          <div className="sticky top-[65px] lg:top-0 z-20 flex items-center gap-3 border-b border-cream-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
              aria-label="Kembali"
              title="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base sm:text-lg font-black text-gray-900 leading-tight">Postingan</h1>
              <p className="truncate text-[11px] font-semibold text-gray-400">{displayedCommentCount} komentar</p>
            </div>
          </div>

          {loading ? (
            <BiteLoader label="Sedang memuat bite..." />
          ) : error ? (
            <section className="px-6 py-20 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-300" />
              <h2 className="text-lg font-bold text-gray-900">Postingan gagal dimuat</h2>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                type="button"
                onClick={loadBite}
                className="mt-5 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-pink-600"
              >
                Coba lagi
              </button>
            </section>
          ) : (
            <>
              <article className="border-b border-gray-200 bg-white px-4 py-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openUserProfile(biteAuthorHandle)}
                  disabled={!biteAuthorHandle}
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-100 text-sm font-extrabold text-pink-500 transition-opacity hover:opacity-80 disabled:hover:opacity-100"
                  aria-label={`Open ${biteAuthorName} profile`}
                >
                  {biteAuthorAvatar ? (
                    <img
                      src={biteAuthorAvatar}
                      alt={biteAuthorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    biteAuthorName.charAt(0).toUpperCase()
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => openUserProfile(biteAuthorHandle)}
                    disabled={!biteAuthorHandle}
                    className="text-left font-bold text-gray-900 transition-colors hover:text-pink-500 disabled:hover:text-gray-900"
                  >
                    {biteAuthorName}
                  </button>
                  <p className="text-xs text-gray-500">
                    {displayLocation}
                    {formatAbsoluteDateTime(getBiteCreatedAt(bite)) &&
                      ` · ${formatAbsoluteDateTime(getBiteCreatedAt(bite))}`}
                  </p>

                  <h3 className="mt-3 text-lg font-bold text-gray-900">
                    {bite.foodName || bite.title || "Untitled Bite"}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    <MentionText
                      text={bite.review || bite.description}
                      onOpenProfile={openUserProfile}
                    />
                  </p>

                  {(bite.photoUrl || bite.image) && (
                    <div className="mt-4 overflow-hidden rounded-xl2 border border-gray-200/80 bg-gray-50 shadow-card">
                      <img
                        src={bite.photoUrl || bite.image}
                        alt={bite.foodName || bite.title || "Food"}
                        className="max-h-[560px] w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {normalizeCategories(bite.category || bite.categories).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full border border-pink-200 bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600"
                      >
                        {getCategoryLabel(normalizeCategoryValue(cat))}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Number(bite.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              </article>

              <div className="flex items-center gap-6 border-b border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-400">
              <button
                type="button"
                onClick={handleToggleLike}
                className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                  liked ? "text-pink-500" : "hover:text-pink-500"
                }`}
                aria-label={liked ? "Unlike bite" : "Like bite"}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                {getLikeCount(bite)}
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                  saved ? "text-pink-500" : "hover:text-pink-500"
                }`}
                aria-label={saved ? "Unsave bite" : "Save bite"}
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              </button>
              <div className="inline-flex items-center gap-1.5 text-sm">
                <MessageCircle className="h-4 w-4" />
                <span>{displayedCommentCount}</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const result = await shareBite({
                    biteId: getBiteId(bite),
                    title: `Biteyo — ${bite.foodName || bite.title || "Food"}`,
                    text: `Lihat ${bite.foodName || "bite ini"} di Biteyo`,
                  });
                  notifyShareResult(result);
                }}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Bagikan bite"
              >
                <Share2 className="h-4 w-4" />
                Bagikan
              </button>
              </div>

              <form onSubmit={handleSubmitComment} className="border-b border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-100 text-xs font-bold text-pink-600">
                  {currentUser?.avatarUrl || currentUser?.avatar ? (
                    <img src={currentUser.avatarUrl || currentUser.avatar} alt={currentUser?.username || "you"} className="h-full w-full object-cover" />
                  ) : (
                    (currentUser?.username || "A").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <MentionTextarea
                    value={commentDraft}
                    onValueChange={setCommentDraft}
                    disabled={commenting}
                    placeholder="Tulis komentar... (mention @username)"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${commentDraft.length > 1000 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                        {commentDraft.length}/1000
                      </span>
                      {commentError && <span className="text-xs font-medium text-red-500">{commentError}</span>}
                    </div>
                    <button
                      type="submit"
                      disabled={commenting || !commentDraft.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pink-600 disabled:opacity-60"
                    >
                      {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
              </form>

              <section className="divide-y divide-gray-200 bg-white">
              <div className="bg-gray-50/80 px-4 py-3">
                <h2 className="text-sm font-extrabold text-gray-900">
                  Komentar
                </h2>
              </div>
              {commentsLoading ? (
                <div className="flex justify-center px-6 py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                </div>
              ) : commentsError ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm font-medium text-red-500">{commentsError}</p>
                  <button
                    type="button"
                    onClick={loadComments}
                    className="mt-4 rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-pink-500"
                  >
                    Muat ulang komentar
                  </button>
                </div>
              ) : displayedComments.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <MessageCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <h2 className="text-lg font-bold text-gray-900">Belum ada komentar</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Jadilah yang pertama membuka obrolan di postingan ini.
                  </p>
                </div>
              ) : (
                <>
                  {displayedComments.map((comment, index) => {
                    const commentId = getCommentId(comment) || `${getCommentContent(comment)}-${index}`;
                    const authorAvatar = getCommentAuthorAvatar(comment);
                    const authorName = getCommentAuthorName(comment);
                    const authorHandle = getCommentAuthorHandle(comment);
                    const isOwner = String(comment?.user?.id || comment?.userId || "") === String(currentUserId);
                    const isEditing = editingId === commentId;
                    const createdAt = comment?.createdAt || comment?.created_at;
                    const updatedAt = comment?.updatedAt || comment?.updated_at;
                    const isEdited = updatedAt && createdAt && new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
                    const timeLabel = formatRelativeTime(createdAt);
                    const timeAbsolute = formatAbsoluteDateTime(createdAt);

                    return (
                      <article key={commentId} className="flex gap-3 px-4 py-4 transition-colors duration-150 hover:bg-gray-50/60">
                        <button
                          type="button"
                          onClick={() => openUserProfile(authorHandle)}
                          disabled={!authorHandle}
                          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-100 text-xs font-bold text-gray-600 transition-opacity hover:opacity-80 disabled:hover:opacity-100"
                          aria-label={`Open ${authorName} profile`}
                        >
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                          ) : (
                            authorName.charAt(0).toUpperCase()
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="rounded-2xl bg-gray-50/90 px-4 py-3 border border-gray-100/80">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => openUserProfile(authorHandle)}
                                  disabled={!authorHandle}
                                  className="text-left text-sm font-bold text-gray-900 hover:text-pink-500 disabled:hover:text-gray-900"
                                >
                                  {authorName}
                                </button>
                                <span className="ml-1.5 text-xs text-gray-400">@{authorHandle}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span title={timeAbsolute} className="text-xs text-gray-400">
                                  {timeLabel}
                                </span>
                                {isOwner && !isEditing && (
                                  <div className="relative ml-1">
                                    <button
                                      type="button"
                                      onClick={() => setMenuOpenId(menuOpenId === commentId ? null : commentId)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-gray-700"
                                      aria-label="More"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                    {menuOpenId === commentId && (
                                      <div className="absolute right-0 top-8 z-10 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingId(commentId);
                                            setEditingContent(getCommentContent(comment));
                                            setMenuOpenId(null);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                          <Pencil className="h-3.5 w-3.5" /> Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(commentId)}
                                          disabled={deletingId === commentId}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                          {deletingId === commentId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Hapus
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="mt-2">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  rows={3}
                                  maxLength={1000}
                                  className="w-full resize-none rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                  placeholder="Tulis komentar..."
                                />
                                <div className="mt-2 flex items-center justify-between">
                                  <span className={`text-xs ${editingContent.length > 1000 ? "text-red-500" : "text-gray-400"}`}>{editingContent.length}/1000</span>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => { setEditingId(null); setEditingContent(""); }} className="rounded-full px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100">Batal</button>
                                    <button type="button" onClick={handleEditComment} disabled={savingEdit || !editingContent.trim()} className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 disabled:opacity-50">
                                      {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Simpan
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                                  <MentionText text={getCommentContent(comment)} onOpenProfile={openUserProfile} />
                                </p>
                                {isEdited && <span className="mt-1 inline-block text-[11px] text-gray-400">(diedit)</span>}
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {hasMoreComments && (
                    <div className="flex justify-center py-4">
                      <button
                        type="button"
                        onClick={() => loadComments({ page: commentPage, append: true })}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Muat lebih banyak
                      </button>
                    </div>
                  )}
                </>
              )}
              </section>
            </>
          )}
        </main>
        <AdvertisementSidebar />
      </div>
    </div>
  );
}
