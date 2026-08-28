import { Bot, CalendarDays, Loader2, MapPin, Pencil, Share2, UserCheck, UserPlus } from "lucide-react";
import { formatProfileDate } from "../../utils/profile";
import { notifyShareResult } from "../../utils/share";
import ProfileEditor from "./ProfileEditor";

export default function ProfileHeader({
  avatar,
  banner,
  bio,
  bitesCount,
  displayName,
  editorOpen,
  followersCount,
  followingCount,
  handle,
  isFollowing,
  isOwnProfile,
  joinedAt,
  location,
  followLoading,
  profileForm,
  savingProfile,
  usernameError,
  onAvatarChange,
  onBannerChange,
  onCloseEditor,
  onEditProfile,
  onToggleFollow,
  onProfileChange,
  onSaveProfile,
}) {
  const isBot = handle === "biteyo_bot";

  const handleShareProfile = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${displayName} (@${handle}) di BiteYo`,
          text: `Lihat rekomendasi kuliner dari ${displayName} di BiteYo!`,
          url,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      notifyShareResult({ copied: true });
    } catch {
      notifyShareResult({ failed: true });
    }
  };

  return (
    <section className="border-b border-cream-300 bg-white">
      {/* Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400">
        {banner ? (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        )}
      </div>

      {/* Profile Body */}
      <div className="px-4 pb-5 sm:px-6">
        {/* Top bar: Avatar + Action buttons */}
        <div className="flex items-end justify-between">
          <div className="relative -mt-14 sm:-mt-16 flex h-28 w-28 sm:h-32 sm:w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-pink-100 shadow-[0_8px_30px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
            {avatar ? (
              <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-black text-pink-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 bg-white text-gray-600 shadow-sm transition-all hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-600"
              aria-label="Bagikan profil"
              title="Bagikan profil"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm transition-all hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-600"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                  isFollowing
                    ? "border border-cream-300 bg-white text-gray-800 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    : "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-md"
                }`}
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="mt-3.5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">
              {displayName}
            </h2>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-gray-400">
                @{handle}
              </span>
              {isBot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-blue-200/60">
                  <Bot className="h-2.5 w-2.5" />
                  Bot
                </span>
              )}
            </div>
          </div>

          {bio ? (
            <p className="mt-2.5 text-sm text-gray-700 leading-relaxed max-w-xl whitespace-pre-line">
              {bio}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-gray-400">Belum ada bio.</p>
          )}

          {/* Info meta (Location & Joined Date) */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
            {location && (
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-pink-500" />
                {location}
              </span>
            )}
            {joinedAt && (
              <span className="inline-flex items-center gap-1.5 text-gray-500">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                Bergabung {formatProfileDate(joinedAt)}
              </span>
            )}
          </div>

          {/* Counts Row - Clean & Full Width */}
          <div className="mt-4 flex items-center justify-between border-t border-cream-200/80 pt-3 text-sm sm:justify-start sm:gap-8">
            <span>
              <strong className="font-extrabold text-gray-900">{bitesCount}</strong>{" "}
              <span className="text-gray-500">Bites</span>
            </span>
            <span className="h-4 w-px bg-cream-300 sm:hidden" aria-hidden="true" />
            <span>
              <strong className="font-extrabold text-gray-900">{followersCount || 0}</strong>{" "}
              <span className="text-gray-500">Followers</span>
            </span>
            <span className="h-4 w-px bg-cream-300 sm:hidden" aria-hidden="true" />
            <span>
              <strong className="font-extrabold text-gray-900">{followingCount || 0}</strong>{" "}
              <span className="text-gray-500">Following</span>
            </span>
          </div>
        </div>
      </div>

      {editorOpen && (
        <ProfileEditor
          avatar={avatar}
          banner={banner}
          displayName={displayName}
          form={profileForm}
          saving={savingProfile}
          usernameError={usernameError}
          onAvatarChange={onAvatarChange}
          onBannerChange={onBannerChange}
          onCancel={onCloseEditor}
          onChange={onProfileChange}
          onSave={onSaveProfile}
        />
      )}
    </section>
  );
}
