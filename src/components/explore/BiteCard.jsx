import {
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  getDisplayLocation,
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../../utils/bites";
import {
  getBiteAuthorAvatar,
  getBiteAuthorHandle,
  getBiteAuthorName,
  getCommentCount,
  getLikeCount,
  isBiteLiked,
  isBiteSaved,
} from "../../utils/biteEngagement";
import BiteCommentBox from "../BiteCommentBox";
import BiteEditForm from "./BiteEditForm";

export default function BiteCard({
  bite,
  biteId,
  currentUser,
  deletingId,
  editForm,
  commentError = "",
  commenting = false,
  followLoading = false,
  isEditing,
  isFollowing,
  liking = false,
  manageable,
  saveLoading = false,
  savingId,
  showFollow = true,
  onCancelEdit,
  onDelete,
  onEditChange,
  onOpenBite,
  onOpenProfile,
  onStartEdit,
  onToggleLike,
  onToggleSave,
  onSubmitComment,
  onToggleFollow,
  onUpdate,
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const liked = isBiteLiked(bite, currentUser);
  const saved = isBiteSaved(bite, currentUser);
  const authorName = getBiteAuthorName(bite);
  const authorHandle = getBiteAuthorHandle(bite);
  const authorAvatar = getBiteAuthorAvatar(bite);
  const displayLocation = getDisplayLocation(bite);

  const handleOpenBite = () => {
    if (!biteId || isEditing) return;

    onOpenBite?.(bite);
  };

  const handleOpenProfile = (event) => {
    event.stopPropagation();
    if (authorHandle) onOpenProfile?.(authorHandle);
  };

  return (
    <article
      onClick={handleOpenBite}
      className="cursor-pointer border-b border-gray-200 bg-white px-4 py-4 transition-colors hover:bg-gray-50/80"
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleOpenProfile}
          disabled={!authorHandle}
          className="w-11 h-11 rounded-full bg-pink-100 overflow-hidden flex items-center justify-center shrink-0 transition-opacity hover:opacity-80 disabled:hover:opacity-100"
          aria-label={`Open ${authorName} profile`}
        >
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-extrabold text-pink-500">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={handleOpenProfile}
                disabled={!authorHandle}
                className="block max-w-full truncate text-left font-bold text-gray-900 transition-colors hover:text-pink-500 disabled:hover:text-gray-900"
              >
                {authorName}
              </button>
              <p className="text-xs text-gray-500 truncate">
                {displayLocation}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
              {showFollow && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFollow(bite);
                  }}
                  disabled={followLoading}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                    isFollowing
                      ? "bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-red-500 hover:border-red-200"
                      : "bg-white text-gray-900 border-gray-300 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              )}

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
                    onClick={(event) => {
                      event.stopPropagation();
                      onStartEdit(bite);
                    }}
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    aria-label="Edit bite"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(bite);
                    }}
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
            <BiteEditForm
              bite={bite}
              biteId={biteId}
              editForm={editForm}
              savingId={savingId}
              onCancelEdit={onCancelEdit}
              onEditChange={onEditChange}
              onUpdate={onUpdate}
            />
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
                  className="mt-3 w-full max-h-[520px] rounded-2xl object-cover border border-gray-200 shadow-sm"
                  loading="lazy"
                />
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {normalizeCategories(bite.category || bite.categories).map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-pink-200 bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600"
                  >
                    {getCategoryLabel(normalizeCategoryValue(cat))}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-6 text-gray-400">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleLike?.(bite);
                  }}
                  disabled={liking}
                  className={`flex items-center gap-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    liked ? "text-pink-500" : "hover:text-pink-500"
                  }`}
                  aria-label={liked ? "Unlike bite" : "Like bite"}
                >
                  {liking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  )}
                  <span>{getLikeCount(bite)}</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleSave?.(bite);
                  }}
                  disabled={saveLoading}
                  className={`flex items-center gap-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    saved ? "text-pink-500" : "hover:text-pink-500"
                  }`}
                  aria-label={saved ? "Unsave bite" : "Save bite"}
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setCommentsOpen((open) => !open);
                  }}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    commentsOpen ? "text-pink-500" : "hover:text-pink-500"
                  }`}
                  aria-expanded={commentsOpen}
                  aria-label="Toggle comment box"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{getCommentCount(bite)}</span>
                </button>
              </div>

              {commentsOpen && (
                <BiteCommentBox
                  bite={bite}
                  error={commentError}
                  onOpenProfile={onOpenProfile}
                  submitting={commenting}
                  onSubmitComment={onSubmitComment}
                />
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
