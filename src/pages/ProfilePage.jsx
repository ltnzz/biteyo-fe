import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, SearchX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import BiteLoader from "../components/BiteLoader";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastMessage from "../components/ToastMessage";
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
import { getBiteId } from "../utils/biteEngagement";
import { getProfileViewModel } from "../utils/profile";
import { showSnackbar } from "../utils/snackbar";

const getBiteTitle = (bite) =>
  bite?.foodName || bite?.title || bite?.locationName || "postingan ini";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [toastMessage, setToastMessage] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const {
    bites,
    bitesError,
    bitesLoading,
    error,
    fetchLikedBites,
    fetchSavedBites,
    fetchProfile,
    fetchUserBites,
    followLoading,
    isFollowing,
    isOwnProfile,
    likedBites,
    likedError,
    likedLoading,
    loading,
    profile,
    profileForm,
    profileNotFound,
    profileUsername,
    refreshAll,
    savedBites,
    savedError,
    savedLoading,
    savingProfile,
    saveProfile,
    setAvatarFile,
    setBannerFile,
    setBites,
    setLikedBites,
    setProfile,
    setSavedBites,
    toggleFollow,
    updateProfileForm,
  } = useProfileData(currentUser, username);
  const syncSavedBites = useCallback(
    ({ bite, biteId, saved, updatedBite }) => {
      const nextBite = {
        ...bite,
        ...(updatedBite || {}),
        isSaved: saved,
        saved,
        savedByMe: saved,
        savedByCurrentUser: saved,
        bookmarked: saved,
        isBookmarked: saved,
      };

      setBites((prev) =>
        prev.map((item) =>
          getBiteId(item) === biteId ? { ...item, ...nextBite } : item,
        ),
      );
      setLikedBites((prev) =>
        prev.map((item) =>
          getBiteId(item) === biteId ? { ...item, ...nextBite } : item,
        ),
      );
      setSavedBites((prev) => {
        if (!saved) return prev.filter((item) => getBiteId(item) !== biteId);

        return prev.some((item) => getBiteId(item) === biteId)
          ? prev.map((item) =>
              getBiteId(item) === biteId ? { ...item, ...nextBite } : item,
            )
          : [nextBite, ...prev];
      });
    },
    [setBites, setLikedBites, setSavedBites],
  );
  const syncLikedBites = useCallback(
    ({ bite, biteId, liked, likeCount, updatedBite }) => {
      const nextBite = {
        ...bite,
        ...(updatedBite || {}),
        isLiked: liked,
        liked,
        likedByMe: liked,
        likedByCurrentUser: liked,
        likesCount: likeCount,
        likeCount,
      };
      const syncList = (prev) =>
        prev.map((item) =>
          getBiteId(item) === biteId ? { ...item, ...nextBite } : item,
        );

      setBites(syncList);
      setSavedBites(syncList);
      setLikedBites((prev) => {
        if (!liked) return prev.filter((item) => getBiteId(item) !== biteId);

        return prev.some((item) => getBiteId(item) === biteId)
          ? prev.map((item) =>
              getBiteId(item) === biteId ? { ...item, ...nextBite } : item,
            )
          : [nextBite, ...prev];
      });
    },
    [setBites, setLikedBites, setSavedBites],
  );
  const biteActions = useBiteMutations({
    currentUser,
    onLikeChange: syncLikedBites,
    onSaveChange: syncSavedBites,
    refresh: fetchUserBites,
    setActionMessage,
    setBites,
    setToastMessage,
  });
  const savedBiteActions = useBiteMutations({
    currentUser,
    onLikeChange: syncLikedBites,
    onSaveChange: syncSavedBites,
    refresh: fetchSavedBites,
    removeOnUnsave: true,
    setActionMessage,
    setBites: setSavedBites,
    setToastMessage,
  });
  const likedBiteActions = useBiteMutations({
    currentUser,
    onLikeChange: syncLikedBites,
    onSaveChange: syncSavedBites,
    refresh: fetchLikedBites,
    setActionMessage,
    setBites: setLikedBites,
    setToastMessage,
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
  useFeedSocket(likedBites, setLikedBites, { acceptNewBite: () => false });
  const closeToast = useCallback(() => setToastMessage(null), []);

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

  const openUserProfile = (targetUsername) => {
    if (targetUsername) navigate(`/profile/${encodeURIComponent(targetUsername)}`);
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
    <div className="min-h-screen bg-cream-100">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
        <main className="min-h-screen w-full max-w-2xl border-x border-cream-300 bg-white shadow-card">
          <div className="sticky top-[65px] z-20 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-[0_1px_10px_rgba(15,23,42,0.035)] backdrop-blur">
            <h1 className="text-xl font-extrabold text-gray-900">
              {loading ? "Profile" : displayName}
            </h1>
            <p className="text-sm text-gray-500">{bites.length} bites</p>
          </div>

          <ActionMessage message={actionMessage} />

          {loading ? (
            <BiteLoader label="Sedang memuat profil..." />
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
                bites={bites}
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

              <div className="px-4">
                <button
                  type="button"
                  onClick={() => navigate("/activity")}
                  className="mt-4 flex w-full items-center justify-between rounded-xl2 border border-gray-200 bg-white p-4 text-left shadow-soft transition-colors duration-150 hover:border-pink-200 hover:bg-pink-50/50"
                >
                  <span>
                    <span className="block text-sm font-bold text-gray-900">
                      Aktivitas Posting
                    </span>
                    <span className="block text-xs text-gray-500">
                      Lihat grafik bite kamu 6 bulan terakhir
                    </span>
                  </span>
                  <span className="text-lg font-bold text-pink-500">→</span>
                </button>
              </div>

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
                  loading={bitesLoading}
                  currentUser={currentUser}
                  savingBiteId={biteActions.savingBiteId}
                  showCreateAction={isOwnProfile}
                  onCancelEdit={biteActions.cancelEdit}
                  onDeleteBite={biteActions.deleteBite}
                  onEditBite={biteActions.startEdit}
                  onEditChange={biteActions.updateEditForm}
                  onOpenBite={openBiteDetail}
                  onOpenProfile={openUserProfile}
                  onRetry={fetchUserBites}
                  onToggleLike={biteActions.toggleLike}
                  onToggleSave={biteActions.toggleSave}
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
                  loading={savedLoading}
                  currentUser={currentUser}
                  useBiteAuthor
                  onOpenBite={openBiteDetail}
                  onOpenProfile={openUserProfile}
                  onRetry={fetchSavedBites}
                  onToggleLike={savedBiteActions.toggleLike}
                  onToggleSave={savedBiteActions.toggleSave}
                />
              ) : resolvedActiveTab === "likes" ? (
                <ProfileTimeline
                  avatar={avatar}
                  bites={likedBites}
                  canManage={false}
                  displayName={displayName}
                  emptyDescription="Bite yang kamu sukai akan muncul di sini."
                  emptyTitle="Belum ada likes"
                  error={likedError}
                  handle={handle}
                  loading={likedLoading}
                  currentUser={currentUser}
                  useBiteAuthor
                  onOpenBite={openBiteDetail}
                  onOpenProfile={openUserProfile}
                  onRetry={fetchLikedBites}
                  onToggleLike={likedBiteActions.toggleLike}
                  onToggleSave={likedBiteActions.toggleSave}
                />
              ) : (
                <ProfileTabPlaceholder type={resolvedActiveTab} />
              )}
            </>
          )}
        </main>

        <AdvertisementSidebar />
      </div>

      <ConfirmDialog
        open={Boolean(biteActions.pendingDeleteBite)}
        loading={
          biteActions.deletingBiteId === getBiteId(biteActions.pendingDeleteBite)
        }
        title="Hapus postingan?"
        description={`"${getBiteTitle(
          biteActions.pendingDeleteBite,
        )}" akan dihapus permanen dari profil kamu.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onCancel={biteActions.cancelDeleteBite}
        onConfirm={biteActions.confirmDeleteBite}
      />
      <ToastMessage message={toastMessage} onClose={closeToast} />
    </div>
  );
}
