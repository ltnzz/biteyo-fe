import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import ActionMessage from "../components/profile/ActionMessage";
import LoginRequired from "../components/profile/LoginRequired";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTimeline from "../components/profile/ProfileTimeline";
import { useBiteMutations } from "../hooks/useBiteMutations";
import { useProfileData } from "../hooks/useProfileData";
import { getStoredUser } from "../utils/auth";
import { getProfileViewModel } from "../utils/profile";

export default function ProfilePage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [editorOpen, setEditorOpen] = useState(false);
  const {
    bites,
    error,
    fetchProfile,
    loading,
    profile,
    profileForm,
    profileUsername,
    savingProfile,
    saveProfile,
    setAvatarFile,
    setBites,
    updateProfileForm,
  } = useProfileData(currentUser);
  const biteActions = useBiteMutations({
    refresh: fetchProfile,
    setActionMessage,
    setBites,
  });

  if (!profileUsername) return <LoginRequired />;

  const {
    avatar,
    bio,
    displayName,
    handle,
    joinedAt,
    location,
  } = getProfileViewModel(profile, profileUsername);

  const handleSaveProfile = async () => {
    setActionMessage({ type: "", text: "" });

    try {
      await saveProfile();
      setEditorOpen(false);
      setActionMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-100 min-h-screen">
        <div className="sticky top-[65px] z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-extrabold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500">{bites.length} bites</p>
        </div>

        <ActionMessage message={actionMessage} />

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            {error && (
              <div className="px-4 py-3 text-sm font-medium text-red-700 bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            <ProfileHeader
              avatar={avatar}
              bio={bio}
              bitesCount={bites.length}
              displayName={displayName}
              editorOpen={editorOpen}
              followersCount={profile?.followersCount}
              followingCount={profile?.followingCount}
              handle={handle}
              joinedAt={joinedAt}
              location={location}
              profileForm={profileForm}
              savingProfile={savingProfile}
              onAvatarChange={setAvatarFile}
              onCloseEditor={() => setEditorOpen(false)}
              onEditProfile={() => setEditorOpen(true)}
              onProfileChange={updateProfileForm}
              onSaveProfile={handleSaveProfile}
            />

            <div className="border-b border-gray-100">
              <button className="w-full py-4 text-sm font-bold text-pink-500 border-b-2 border-pink-500">
                Bites
              </button>
            </div>

            <ProfileTimeline
              avatar={avatar}
              bites={bites}
              deletingBiteId={biteActions.deletingBiteId}
              displayName={displayName}
              editForm={biteActions.editForm}
              editingId={biteActions.editingId}
              handle={handle}
              savingBiteId={biteActions.savingBiteId}
              onCancelEdit={biteActions.cancelEdit}
              onDeleteBite={biteActions.deleteBite}
              onEditBite={biteActions.startEdit}
              onEditChange={biteActions.updateEditForm}
              onPhotoChange={biteActions.setEditPhotoFile}
              onUpdateBite={biteActions.updateBite}
            />
          </>
        )}
      </div>
    </div>
  );
}
