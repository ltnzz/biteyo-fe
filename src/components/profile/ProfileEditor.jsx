import { useEffect, useRef, useState } from "react";
import { Camera, Crop, Image, Loader2, Save, Trash2, User, X } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import ImageCropperModal from "./ImageCropperModal";

export default function ProfileEditor({
  avatar,
  banner,
  displayName,
  form,
  saving,
  usernameError,
  removeAvatar,
  removeBanner,
  onAvatarChange,
  onBannerChange,
  onRemoveAvatar,
  onRemoveBanner,
  onClearRemoveAvatar,
  onClearRemoveBanner,
  onCancel,
  onChange,
  onSave,
}) {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // State for Cropper Modal
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperFile, setCropperFile] = useState(null);
  const [cropperSrc, setCropperSrc] = useState("");
  const [cropTarget, setCropTarget] = useState("banner"); // "banner" | "avatar"
  const [originalAvatarFile, setOriginalAvatarFile] = useState(null);
  const [originalBannerFile, setOriginalBannerFile] = useState(null);
  const [originalAvatarSrc, setOriginalAvatarSrc] = useState("");
  const [originalBannerSrc, setOriginalBannerSrc] = useState("");
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null); // "avatar" | "banner" | null

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving && !cropperOpen) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [cropperOpen, onCancel, saving]);

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

  const handleSelectBannerFile = (file) => {
    if (!file) return;
    setCropperFile(file);
    setOriginalBannerFile(file);
    setOriginalBannerSrc("");
    setCropperSrc("");
    setCropTarget("banner");
    setCropperOpen(true);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleSelectAvatarFile = (file) => {
    if (!file) return;
    setCropperFile(file);
    setOriginalAvatarFile(file);
    setOriginalAvatarSrc("");
    setCropperSrc("");
    setCropTarget("avatar");
    setCropperOpen(true);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCropComplete = (croppedFile) => {
    setCropperOpen(false);
    if (cropTarget === "banner") {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      onBannerChange(croppedFile);
      setBannerPreview(URL.createObjectURL(croppedFile));
    } else {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      onAvatarChange(croppedFile);
      setAvatarPreview(URL.createObjectURL(croppedFile));
    }
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setCropperFile(null);
    setCropperSrc("");
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteTarget === "avatar") onRemoveAvatar?.();
    if (confirmDeleteTarget === "banner") onRemoveBanner?.();
    setConfirmDeleteTarget(null);
  };

  const openRecropBanner = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // pakai original biar bisa kembali ke awal, bukan hasil crop sebelumnya
    const source = originalBannerFile || (originalBannerSrc ? originalBannerSrc : (bannerPreview || banner));
    const src = bannerPreview || banner;
    if (!source && !src) return;
    // simpan original pertama kali kalau belum ada
    if (!originalBannerFile && !originalBannerSrc && src && typeof src === "string" && src.startsWith("http")) {
      setOriginalBannerSrc(src);
    }
    if (originalBannerFile) {
      setCropperFile(originalBannerFile);
      setCropperSrc("");
    } else if (originalBannerSrc) {
      setCropperFile(null);
      setCropperSrc(originalBannerSrc);
    } else {
      setCropperFile(null);
      setCropperSrc(source);
    }
    setCropTarget("banner");
    setCropperOpen(true);
  };

  const openRecropAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const source = originalAvatarFile || (originalAvatarSrc ? originalAvatarSrc : (avatarPreview || avatar));
    const src = avatarPreview || avatar;
    if (!source && !src) return;
    if (!originalAvatarFile && !originalAvatarSrc && src && typeof src === "string" && src.startsWith("http")) {
      setOriginalAvatarSrc(src);
    }
    if (originalAvatarFile) {
      setCropperFile(originalAvatarFile);
      setCropperSrc("");
    } else if (originalAvatarSrc) {
      setCropperFile(null);
      setCropperSrc(originalAvatarSrc);
    } else {
      setCropperFile(null);
      setCropperSrc(source);
    }
    setCropTarget("avatar");
    setCropperOpen(true);
  };

  const handleResetToOriginal = () => {
    if (cropTarget === "banner") {
      if (originalBannerFile) {
        setCropperFile(originalBannerFile);
        setCropperSrc("");
      } else if (originalBannerSrc) {
        setCropperFile(null);
        setCropperSrc(originalBannerSrc);
      } else if (banner) {
        setCropperFile(null);
        setCropperSrc(banner);
      }
    } else {
      if (originalAvatarFile) {
        setCropperFile(originalAvatarFile);
        setCropperSrc("");
      } else if (originalAvatarSrc) {
        setCropperFile(null);
        setCropperSrc(originalAvatarSrc);
      } else if (avatar) {
        setCropperFile(null);
        setCropperSrc(avatar);
      }
    }
  };

  const closeFromBackdrop = (event) => {
    if (event.target === event.currentTarget && !saving && !cropperOpen) {
      onCancel();
    }
  };

  const currentAvatar = avatarPreview || avatar;
  const currentBanner = bannerPreview || banner;
  const initial = (displayName || form.username || "B").charAt(0).toUpperCase();

  return (
    <>
      <div
        className="animate-modal-fade fixed inset-0 z-[10000] flex items-center justify-center bg-gray-950/50 p-0 backdrop-blur-sm sm:p-4"
        onMouseDown={closeFromBackdrop}
        role="presentation"
      >
        <div className="animate-modal-rise flex h-full w-full flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl transition-all duration-200 sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">
          {/* Header */}
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
            {/* Banner Section */}
            <div className="relative z-10 h-44 bg-gray-200">
              {currentBanner && (
                <img
                  src={currentBanner}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}

              {/* Banner Upload & Recrop actions — z-20 biar tidak ketutup avatar bulat */}
              <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/25 opacity-90 transition-colors hover:bg-black/35">
                <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 hover:scale-105" title="Ganti Banner">
                  <Image className="h-5 w-5" />
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleSelectBannerFile(event.target.files[0] || null)
                    }
                    className="sr-only"
                  />
                </label>

                {currentBanner && !removeBanner && (
                  <button
                    type="button"
                    onClick={openRecropBanner}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 hover:scale-105"
                    title="Crop, Putar & Balik Banner"
                  >
                    <Crop className="h-5 w-5" />
                  </button>
                )}
                {currentBanner && !removeBanner && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteTarget("banner")}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur transition hover:bg-red-600 hover:scale-105"
                    title="Hapus Banner"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Avatar & Form Section */}
            <div className="px-4">
              <div className="relative z-30 -mt-12 mb-6 h-28 w-28 rounded-full border-4 border-white bg-pink-100 shadow-md">
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

                <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm opacity-90 transition-colors hover:bg-white/80">
                  <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 hover:scale-105" title="Ganti Foto Profil">
                    <Camera className="h-4 w-4" />
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleSelectAvatarFile(event.target.files[0] || null)
                      }
                      className="sr-only"
                    />
                  </label>

                  {currentAvatar && !removeAvatar && (
                    <button
                      type="button"
                      onClick={openRecropAvatar}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 hover:scale-105"
                      title="Sesuaikan Foto Profil"
                    >
                      <Crop className="h-4 w-4" />
                    </button>
                  )}
                  {currentAvatar && !removeAvatar && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteTarget("avatar")}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur transition hover:bg-red-600 hover:scale-105"
                      title="Hapus Foto Profil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    Nama Lengkap <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    value={form.name ?? ""}
                    onChange={(event) => onChange("name", event.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    placeholder="Nama Lengkap"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span className="text-gray-400 font-bold text-xs">@</span>
                    Username <span className="text-red-500">*</span>
                  </span>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-4 text-sm font-bold text-gray-400">
                      @
                    </span>
                    <input
                      required
                      value={form.username}
                      onChange={(event) => {
                        if (usernameError) onChange("username", event.target.value.replace(/^@/, ""));
                        else onChange("username", event.target.value.replace(/^@/, ""));
                      }}
                      className={`w-full rounded-2xl border bg-white py-3 pl-8 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                        usernameError
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-300 focus:border-pink-400 focus:ring-pink-100"
                      }`}
                      placeholder="username"
                    />
                  </div>
                  {usernameError && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">{usernameError}</p>
                  )}
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

      {/* Image Crop & Transformation Modal */}
      {cropperOpen && (
        <ImageCropperModal
          imageFile={cropperFile}
          imageSrc={cropperSrc}
          title={cropTarget === "banner" ? "Sesuaikan Background / Banner" : "Sesuaikan Foto Profil"}
          aspectRatio={cropTarget === "banner" ? 3 / 1 : 1}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onResetToOriginal={handleResetToOriginal}
        />
      )}

      <ConfirmDialog
        open={!!confirmDeleteTarget}
        title={confirmDeleteTarget === "avatar" ? "Hapus foto profil?" : "Hapus banner?"}
        description={
          confirmDeleteTarget === "avatar"
            ? "Foto profil akan dihapus dan kembali ke default. Lanjutkan?"
            : "Banner akan dihapus. Lanjutkan?"
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onCancel={() => setConfirmDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
