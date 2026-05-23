import { Loader2, Save, Star, X } from "lucide-react";
import { biteCategories } from "../../utils/bites";

export default function BiteEditForm({
  bite,
  biteId,
  editForm,
  savingId,
  onCancelEdit,
  onEditChange,
  onPhotoChange,
  onUpdate,
}) {
  return (
    <div className="mt-3 space-y-3">
      <input
        value={editForm.foodName}
        onChange={(e) => onEditChange("foodName", e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        placeholder="Food name"
      />
      <input
        value={editForm.locationName}
        onChange={(e) => onEditChange("locationName", e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        placeholder="Location"
      />
      <textarea
        value={editForm.review}
        onChange={(e) => onEditChange("review", e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        placeholder="Review"
      />

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onEditChange("rating", star)}
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
            onClick={() => onEditChange("category", cat.value)}
            className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
              editForm.category === cat.value
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white text-gray-600 border-gray-300 hover:border-pink-300 hover:bg-pink-50"
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
          onChange={(e) => onPhotoChange(e.target.files[0] || null)}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onUpdate(bite)}
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
          onClick={onCancelEdit}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
