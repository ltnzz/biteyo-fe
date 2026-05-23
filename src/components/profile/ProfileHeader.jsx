import { CalendarDays, Loader2, MapPin, Pencil, UserCheck, UserPlus } from "lucide-react";
import { formatProfileDate } from "../../utils/profile";
import ProfileEditor from "./ProfileEditor";
import ProfileTasteStats from "./ProfileTasteStats";

export default function ProfileHeader({
  avatar,
  banner,
  bio,
  bites = [],
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
  onAvatarChange,
  onBannerChange,
  onCloseEditor,
  onEditProfile,
  onToggleFollow,
  onProfileChange,
  onSaveProfile,
}) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="h-40 bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300">
        {banner && (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start">
          <div className="-mt-16 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-pink-100 shadow-[0_8px_24px_rgba(15,23,42,0.14)] ring-1 ring-gray-200">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-extrabold text-pink-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {isOwnProfile ? (
            <button
              type="button"
              onClick={onEditProfile}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4" />
              Edit profile
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleFollow}
              disabled={followLoading}
              className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                isFollowing
                  ? "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                  : "border-pink-500 bg-pink-500 text-white hover:bg-pink-600"
              }`}
            >
              {followLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="mt-3">
          <h2 className="text-2xl font-extrabold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">@{handle}</p>
          <p className="mt-3 text-sm text-gray-800 leading-relaxed">{bio}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location}
              </span>
            )}
            {joinedAt && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Bergabung {formatProfileDate(joinedAt)}
              </span>
            )}
          </div>

          <ProfileTasteStats bites={bites} />

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span>
              <strong className="text-gray-900">{bitesCount}</strong>{" "}
              <span className="text-gray-500">Bites</span>
            </span>
            <span className="h-5 w-px bg-gray-200" aria-hidden="true" />
            <span>
              <strong className="text-gray-900">{followersCount || 0}</strong>{" "}
              <span className="text-gray-500">Followers</span>
            </span>
            <span className="h-5 w-px bg-gray-200" aria-hidden="true" />
            <span>
              <strong className="text-gray-900">{followingCount || 0}</strong>{" "}
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
