import { Loader2, Save, Star, X } from "lucide-react";
import { biteCategories } from "../../utils/bites";

export default function BiteEditForm({
  form,
  saving,
  onCancel,
  onChange,
  onPhotoChange,
  onSave,
}) {
  return (
    <div className="mt-3 space-y-3">
      <input
        value={form.foodName}
        onChange={(e) => onChange("foodName", e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        placeholder="Food name"
      />
      <input
        value={form.locationName}
        onChange={(e) => onChange("locationName", e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        placeholder="Location"
      />
      <textarea
        value={form.review}
        onChange={(e) => onChange("review", e.target.value)}
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-200"
        placeholder="Review"
      />

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange("rating", star)}>
            <Star
              className={`w-5 h-5 ${
                star <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
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
            onClick={() => onChange("category", cat.value)}
            className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
              form.category === cat.value
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
          onChange={(e) => onPhotoChange(e.target.files[0] || null)}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
