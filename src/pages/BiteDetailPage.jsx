import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Star,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import {
  getBiteComments as fetchBiteComments,
  getBiteDetail,
  postBiteComment,
  toggleLikeBite,
} from "../services/feedApi";
import { getStoredUser } from "../utils/auth";
import {
  getBiteComments,
  getBiteId,
  getCommentAuthorAvatar,
  getCommentAuthorName,
  getCommentContent,
  getCommentCount,
  getCommentId,
  getLikeCount,
  isBiteLiked,
  normalizeBiteComments,
  normalizeCreatedComment,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import {
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../utils/bites";

const getAuthor = (bite) => bite?.user || bite?.author || bite?.createdBy || {};

const getAuthorName = (bite) => {
  const author = getAuthor(bite);

  if (typeof author === "string") return author;

  return author?.username || author?.name || bite?.username || "BiteYo User";
};

const getAuthorInitial = (bite) => getAuthorName(bite).charAt(0).toUpperCase();

export default function BiteDetailPage() {
  const { biteId } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const [bite, setBite] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [liking, setLiking] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState("");

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

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    setCommentsError("");

    try {
      const data = await fetchBiteComments(biteId);
      const nextComments = normalizeBiteComments(data);

      setComments(nextComments);
      setBite((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          comments: nextComments,
          commentsCount: nextComments.length,
          commentCount: nextComments.length,
        };
      });
    } catch (err) {
      setCommentsError(err.message || "Komentar belum bisa dimuat.");
    } finally {
      setCommentsLoading(false);
    }
  }, [biteId]);

  useEffect(() => {
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
      const returnedComments = normalizeBiteComments(data);

      setBite((prev) => {
        if (!prev) return prev;

        const nextComments =
          returnedComments.length > 0 ? returnedComments : [...comments, nextComment];
        const count = Math.max(getCommentCount(prev) + 1, nextComments.length);

        return {
          ...prev,
          ...(updatedBite && getBiteId(updatedBite) ? updatedBite : {}),
          comments: nextComments,
          commentsCount: count,
          commentCount: count,
        };
      });
      setComments((prev) =>
        returnedComments.length > 0 ? returnedComments : [...prev, nextComment],
      );
      setCommentDraft("");
      loadComments();
    } catch (err) {
      setCommentError(err.message || "Gagal mengirim komentar.");
    } finally {
      setCommenting(false);
    }
  };

  const displayedComments = comments.length > 0 ? comments : getBiteComments(bite);
  const displayedCommentCount = Math.max(
    getCommentCount(bite),
    displayedComments.length,
  );
  const liked = isBiteLiked(bite, currentUser);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex w-full items-start justify-start px-4">
        <main className="min-h-screen w-full max-w-2xl border-x border-gray-100">
        <div className="sticky top-[65px] z-20 flex items-center gap-3 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Postingan</h1>
            <p className="text-sm text-gray-500">{displayedCommentCount} komentar</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
          </div>
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
            <article className="border-b border-gray-100 px-4 py-5">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-extrabold text-pink-500">
                  {getAuthorInitial(bite)}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900">{getAuthorName(bite)}</h2>
                  <p className="text-xs text-gray-500">
                    {bite.locationName || bite.location || "Unknown location"}
                  </p>

                  <h3 className="mt-3 text-lg font-bold text-gray-900">
                    {bite.foodName || bite.title || "Untitled Bite"}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {bite.review || bite.description}
                  </p>

                  {(bite.photoUrl || bite.image) && (
                    <img
                      src={bite.photoUrl || bite.image}
                      alt={bite.foodName || bite.title || "Food"}
                      className="mt-4 max-h-[560px] w-full rounded-2xl border border-gray-100 object-cover"
                    />
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {normalizeCategories(bite.category || bite.categories).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600"
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

            <div className="flex items-center gap-8 border-b border-gray-100 px-4 py-3 text-gray-500">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={liking}
                className={`inline-flex items-center gap-2 text-sm font-semibold disabled:opacity-60 ${
                  liked ? "text-pink-500" : "hover:text-pink-500"
                }`}
              >
                {liking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                )}
                {getLikeCount(bite)}
              </button>
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <MessageCircle className="h-4 w-4" />
                {displayedCommentCount}
              </span>
            </div>

            <form onSubmit={handleSubmitComment} className="border-b border-gray-100 p-4">
              <textarea
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                disabled={commenting}
                placeholder="Tulis komentar..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-red-500">{commentError}</p>
                <button
                  type="submit"
                  disabled={commenting}
                  className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  {commenting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Kirim
                </button>
              </div>
            </form>

            <section className="divide-y divide-gray-100">
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
                displayedComments.map((comment, index) => {
                  const commentId =
                    getCommentId(comment) || `${getCommentContent(comment)}-${index}`;
                  const authorAvatar = getCommentAuthorAvatar(comment);
                  const authorName = getCommentAuthorName(comment);

                  return (
                    <article key={commentId} className="flex gap-3 px-4 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {authorAvatar ? (
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          authorName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {authorName}
                        </h3>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                          {getCommentContent(comment)}
                        </p>
                      </div>
                    </article>
                  );
                })
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
