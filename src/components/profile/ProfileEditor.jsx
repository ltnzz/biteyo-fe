import { useEffect, useState } from "react";
import { Camera, Image, Loader2, Save, User, X } from "lucide-react";

export default function ProfileEditor({
  avatar,
  banner,
  displayName,
  form,
  saving,
  onAvatarChange,
  onBannerChange,
  onCancel,
  onChange,
  onSave,
}) {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel, saving]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const handleAvatarFile = (file) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    onAvatarChange(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleBannerFile = (file) => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);

    onBannerChange(file);
    setBannerPreview(file ? URL.createObjectURL(file) : "");
  };

  const closeFromBackdrop = (event) => {
    if (event.target === event.currentTarget && !saving) {
      onCancel();
    }
  };

  const currentAvatar = avatarPreview || avatar;
  const currentBanner = bannerPreview || banner;
  const initial = (displayName || form.username || "B").charAt(0).toUpperCase();

  return (
    <div
      className="animate-modal-fade fixed inset-0 z-[10000] flex items-center justify-center bg-gray-950/50 p-0 backdrop-blur-sm sm:p-4"
      onMouseDown={closeFromBackdrop}
      role="presentation"
    >
      <div className="animate-modal-rise flex h-full w-full flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl transition-all duration-200 sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
              aria-label="Close edit profile"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-extrabold text-gray-900">
              Edit profile
            </h3>
          </div>
        </div>

        <div className="overflow-y-auto pb-5">
          <div className="relative h-44 bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300">
            {currentBanner && (
              <img
                src={currentBanner}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/25 text-white transition-colors hover:bg-black/35">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur">
                <Image className="h-5 w-5" />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleBannerFile(event.target.files[0] || null)
                }
                className="sr-only"
              />
            </label>
          </div>

          <div className="px-4">
            <div className="relative -mt-12 mb-6 h-28 w-28 rounded-full border-4 border-white bg-pink-100">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={displayName || form.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full">
                  <span className="text-4xl font-extrabold text-pink-500">
                    {initial}
                  </span>
                </div>
              )}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/40">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur">
                  <Camera className="h-5 w-5" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleAvatarFile(event.target.files[0] || null)
                  }
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  Username
                </span>
                <input
                  value={form.username}
                  onChange={(event) => onChange("username", event.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  placeholder="Username"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-gray-700">
                  Bio
                </span>
                <textarea
                  value={form.bio}
                  onChange={(event) => onChange("bio", event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  placeholder="Tell people about your favorite bites"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pink-600 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
