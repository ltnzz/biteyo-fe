import { CalendarDays, MapPin, Pencil } from "lucide-react";
import { formatProfileDate } from "../../utils/profile";
import ProfileEditor from "./ProfileEditor";

export default function ProfileHeader({
  avatar,
  bio,
  bitesCount,
  displayName,
  editorOpen,
  followersCount,
  followingCount,
  handle,
  joinedAt,
  location,
  profileForm,
  savingProfile,
  onAvatarChange,
  onCloseEditor,
  onEditProfile,
  onProfileChange,
  onSaveProfile,
}) {
  return (
    <section className="border-b border-gray-100">
      <div className="h-40 bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300" />
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start">
          <div className="-mt-16 w-32 h-32 rounded-full border-4 border-white bg-pink-100 overflow-hidden flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-extrabold text-pink-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
            Edit profile
          </button>
        </div>

        {editorOpen && (
          <ProfileEditor
            form={profileForm}
            saving={savingProfile}
            onAvatarChange={onAvatarChange}
            onCancel={onCloseEditor}
            onChange={onProfileChange}
            onSave={onSaveProfile}
          />
        )}

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

          <div className="mt-4 flex gap-5 text-sm">
            <span>
              <strong className="text-gray-900">{bitesCount}</strong>{" "}
              <span className="text-gray-500">Bites</span>
            </span>
            <span>
              <strong className="text-gray-900">{followersCount || 0}</strong>{" "}
              <span className="text-gray-500">Followers</span>
            </span>
            <span>
              <strong className="text-gray-900">{followingCount || 0}</strong>{" "}
              <span className="text-gray-500">Following</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
