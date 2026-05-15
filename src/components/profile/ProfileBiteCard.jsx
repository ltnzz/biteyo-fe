import { Heart, Loader2, MessageCircle, Pencil, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../../utils/bites";
import {
  getCommentCount,
  getLikeCount,
  isBiteLiked,
} from "../../utils/biteEngagement";
import BiteCommentBox from "../BiteCommentBox";
import BiteEditForm from "./BiteEditForm";

export default function ProfileBiteCard({
  avatar,
  bite,
  canManage = false,
  commentError = "",
  commenting = false,
  currentUser,
  displayName,
  deleting,
  editForm,
  editing,
  handle,
  liking = false,
  saving,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditChange,
  onOpenBite,
  onPhotoChange,
  onSubmitComment,
  onToggleLike,
  onUpdate,
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const liked = isBiteLiked(bite, currentUser);

  const handleOpenBite = () => {
    if (editing) return;

    onOpenBite?.(bite);
  };

  return (
    <article
      onClick={handleOpenBite}
      className="cursor-pointer border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50/70"
    >
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-pink-100 overflow-hidden flex items-center justify-center shrink-0">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-extrabold text-pink-500">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 truncate">{displayName}</h2>
              <p className="text-xs text-gray-500 truncate">
                @{handle} - {bite.locationName || bite.location || "Unknown location"}
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

              {canManage && !editing && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit();
                    }}
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete();
                    }}
                    disabled={deleting}
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {editing ? (
            <BiteEditForm
              form={editForm}
              saving={saving}
              onCancel={onCancelEdit}
              onChange={onEditChange}
              onPhotoChange={onPhotoChange}
              onSave={onUpdate}
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
