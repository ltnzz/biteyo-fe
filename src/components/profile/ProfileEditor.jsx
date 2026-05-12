import { Loader2, Save, X } from "lucide-react";

export default function ProfileEditor({
  form,
  saving,
  onAvatarChange,
  onCancel,
  onChange,
  onSave,
}) {
  return (
    <div className="mt-4 border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Edit profile</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-full text-gray-400 hover:bg-white hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <input
          value={form.username}
          onChange={(e) => onChange("username", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          placeholder="Username"
        />
        <textarea
          value={form.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-200"
          placeholder="Bio"
        />
        <label className="block text-xs text-gray-500">
          Avatar
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onAvatarChange(e.target.files[0] || null)}
            className="mt-1 block w-full text-sm text-gray-600"
          />
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save profile
        </button>
      </div>
    </div>
  );
}
