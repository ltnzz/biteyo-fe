import React, { useMemo, useState } from "react";
import { AlertCircle, Loader2, SearchX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ActionMessage from "../components/profile/ActionMessage";
import LoginRequired from "../components/profile/LoginRequired";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabPlaceholder from "../components/profile/ProfileTabPlaceholder";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileTimeline from "../components/profile/ProfileTimeline";
import { useBiteMutations } from "../hooks/useBiteMutations";
import { useFeedSocket } from "../hooks/useFeedSocket";
import { useProfileData } from "../hooks/useProfileData";
import { getStoredUser } from "../utils/auth";
import { getProfileViewModel } from "../utils/profile";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const {
    bites,
    bitesError,
    bitesLoading,
    error,
    fetchSavedBites,
    fetchProfile,
    fetchUserBites,
    followLoading,
    isFollowing,
    isOwnProfile,
    loading,
    profile,
    profileForm,
    profileNotFound,
    profileUsername,
    savedBites,
    savedError,
    savedLoading,
    savingProfile,
    saveProfile,
    setAvatarFile,
    setBannerFile,
    setBites,
    setProfile,
    setSavedBites,
    toggleFollow,
    updateProfileForm,
  } = useProfileData(currentUser, username);
  const biteActions = useBiteMutations({
    currentUser,
    refresh: fetchUserBites,
    setActionMessage,
    setBites,
  });
  const savedBiteActions = useBiteMutations({
    currentUser,
    refresh: fetchSavedBites,
    setActionMessage,
    setBites: setSavedBites,
  });
  const resolvedActiveTab = !isOwnProfile && activeTab === "save" ? "posts" : activeTab;
  const acceptsProfileBite = (bite) => {
    const profileKey = profileUsername?.toLowerCase();

    if (!profileKey) return false;

    return [
      bite?.user,
      bite?.author,
      bite?.createdBy,
      bite?.owner,
      bite?.username,
      bite?.authorName,
    ].some((value) => {
      if (!value) return false;
      if (typeof value === "string") return value.toLowerCase() === profileKey;

      return [value.username, value.name, value.email]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase() === profileKey);
    });
  };

  useFeedSocket(bites, setBites, {
    acceptNewBite: acceptsProfileBite,
    profile,
    setProfile,
  });
  useFeedSocket(savedBites, setSavedBites, { acceptNewBite: () => false });

  if (!profileUsername) return <LoginRequired />;

  const {
    avatar,
    banner,
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

  const handleCloseEditor = () => {
    setAvatarFile(null);
    setBannerFile(null);
    setEditorOpen(false);
  };

  const handleToggleFollow = async () => {
    setActionMessage({ type: "", text: "" });

    try {
      await toggleFollow();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const openBiteDetail = (bite) => {
    const biteId = bite?._id || bite?.id || bite?.biteId;
    if (biteId) navigate(`/bites/${biteId}`);
  };

  const renderProfileState = (type) => {
    const isNotFound = type === "not-found";
    const Icon = isNotFound ? SearchX : AlertCircle;

    return (
      <section className="px-6 py-20 text-center">
        <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-extrabold text-gray-900">
          {isNotFound ? "Profil tidak ditemukan" : "Profil gagal dimuat"}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {isNotFound
            ? "Username ini belum terdaftar atau sudah tidak tersedia."
            : error}
        </p>
        {!isNotFound && (
          <button
            type="button"
            onClick={fetchProfile}
            className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
          >
            Coba lagi
          </button>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto border-x border-gray-100 min-h-screen">
        <div className="sticky top-[65px] z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-extrabold text-gray-900">
            {loading ? "Profile" : displayName}
          </h1>
          <p className="text-sm text-gray-500">{bites.length} bites</p>
        </div>

        <ActionMessage message={actionMessage} />

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        ) : profileNotFound ? (
          renderProfileState("not-found")
        ) : error ? (
          renderProfileState("error")
        ) : (
          <>
            <ProfileHeader
              avatar={avatar}
              banner={banner}
              bio={bio}
              bitesCount={bites.length}
              displayName={displayName}
              editorOpen={editorOpen}
              followLoading={followLoading}
              followersCount={profile?.followersCount}
              followingCount={profile?.followingCount}
              handle={handle}
              isFollowing={isFollowing}
              isOwnProfile={isOwnProfile}
              joinedAt={joinedAt}
              location={location}
              profileForm={profileForm}
              savingProfile={savingProfile}
              onAvatarChange={setAvatarFile}
              onBannerChange={setBannerFile}
              onCloseEditor={handleCloseEditor}
              onEditProfile={() => setEditorOpen(true)}
              onProfileChange={updateProfileForm}
              onSaveProfile={handleSaveProfile}
              onToggleFollow={handleToggleFollow}
            />

            <ProfileTabs
              activeTab={resolvedActiveTab}
              showSaved={isOwnProfile}
              onChange={setActiveTab}
            />

            {resolvedActiveTab === "posts" ? (
              <ProfileTimeline
                avatar={avatar}
                bites={bites}
                canManage={isOwnProfile}
                deletingBiteId={biteActions.deletingBiteId}
                displayName={displayName}
                editForm={biteActions.editForm}
                editingId={biteActions.editingId}
                error={bitesError}
                handle={handle}
                commentErrors={biteActions.commentErrors}
                commentingBiteIds={biteActions.commentingBiteIds}
                likingBiteIds={biteActions.likingBiteIds}
                loading={bitesLoading}
                currentUser={currentUser}
                savingBiteId={biteActions.savingBiteId}
                showCreateAction={isOwnProfile}
                onCancelEdit={biteActions.cancelEdit}
                onDeleteBite={biteActions.deleteBite}
                onEditBite={biteActions.startEdit}
                onEditChange={biteActions.updateEditForm}
                onOpenBite={openBiteDetail}
                onPhotoChange={biteActions.setEditPhotoFile}
                onRetry={fetchUserBites}
                onSubmitComment={biteActions.submitComment}
                onToggleLike={biteActions.toggleLike}
                onUpdateBite={biteActions.updateBite}
              />
            ) : resolvedActiveTab === "save" ? (
              <ProfileTimeline
                avatar={avatar}
                bites={savedBites}
                canManage={false}
                displayName={displayName}
                emptyDescription="Bite yang kamu simpan akan muncul di sini."
                emptyTitle="Belum ada saved bite"
                error={savedError}
                handle={handle}
                commentErrors={savedBiteActions.commentErrors}
                commentingBiteIds={savedBiteActions.commentingBiteIds}
                likingBiteIds={savedBiteActions.likingBiteIds}
                loading={savedLoading}
                currentUser={currentUser}
                onOpenBite={openBiteDetail}
                onRetry={fetchSavedBites}
                onSubmitComment={savedBiteActions.submitComment}
                onToggleLike={savedBiteActions.toggleLike}
              />
            ) : (
              <ProfileTabPlaceholder type={resolvedActiveTab} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
