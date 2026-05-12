import { Heart, Loader2, MessageCircle, Pencil, Star, Trash2 } from "lucide-react";
import {
  getCategoryLabel,
  normalizeCategories,
  normalizeCategoryValue,
} from "../../utils/bites";
import BiteEditForm from "./BiteEditForm";

export default function ProfileBiteCard({
  avatar,
  bite,
  displayName,
  deleting,
  editForm,
  editing,
  handle,
  saving,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditChange,
  onPhotoChange,
  onUpdate,
}) {
  return (
    <article className="border-b border-gray-100 px-4 py-4 hover:bg-gray-50/70 transition-colors">
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

              {!editing && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
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
}
