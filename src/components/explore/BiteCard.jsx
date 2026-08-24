import {
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import {
  getDisplayLocation,
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../../utils/bites";
import { formatAbsoluteDateTime, formatRelativeTime } from "../../utils/relativeTime";
import {
  getBiteAuthorAvatar,
  getBiteAuthorHandle,
  getBiteAuthorName,
  getCommentCount,
  getLikeCount,
  isBiteLiked,
  isBiteSaved,
} from "../../utils/biteEngagement";
import { getBiteCreatedAt } from "../../utils/bites";
import MentionText from "../MentionText";
import BiteEditForm from "./BiteEditForm";

export default function BiteCard({
  bite,
  biteId,
  currentUser,
  deletingId,
  editForm,
  followLoading = false,
  isEditing,
  isFollowing,
  manageable,
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
  onToggleFollow,
  onUpdate,
}) {
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
      className="cursor-pointer border-b border-gray-200 bg-white px-4 py-4 transition-colors duration-150 hover:bg-gray-50/60"
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleOpenProfile}
          disabled={!authorHandle}
          className="w-11 h-11 rounded-full bg-pink-100 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-pink-100/80 transition-opacity hover:opacity-80 disabled:hover:opacity-100"
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
              <p
                className="text-xs text-gray-500 truncate"
                title={formatAbsoluteDateTime(getBiteCreatedAt(bite))}
              >
                {displayLocation}
                {formatRelativeTime(getBiteCreatedAt(bite)) &&
                  ` · ${formatRelativeTime(getBiteCreatedAt(bite))}`}
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
                <MentionText
                  text={bite.review || bite.description}
                  onOpenProfile={onOpenProfile}
                />
              </p>

              {(bite.photoUrl || bite.image) && (
                <img
                  src={bite.photoUrl || bite.image}
                  alt={bite.foodName || bite.title || "Food"}
                  className="mt-3 w-full max-h-[520px] rounded-xl2 object-cover border border-gray-200/80 shadow-card"
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

              <div className="mt-3 flex items-center gap-2 -ml-2 text-gray-400">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleLike?.(bite);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
                    liked
                      ? "text-pink-500"
                      : "hover:bg-pink-50 hover:text-pink-500"
                  }`}
                  aria-label={liked ? "Unlike bite" : "Like bite"}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  <span>{getLikeCount(bite)}</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleSave?.(bite);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
                    saved
                      ? "text-pink-500"
                      : "hover:bg-pink-50 hover:text-pink-500"
                  }`}
                  aria-label={saved ? "Unsave bite" : "Save bite"}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenBite?.(bite);
                  }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Lihat komentar di halaman detail"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{getCommentCount(bite)}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
