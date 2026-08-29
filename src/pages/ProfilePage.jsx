import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, SearchX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdvertisementSidebar from "../components/AdvertisementSidebar";
import BiteLoader from "../components/BiteLoader";
import ConfirmDialog from "../components/ConfirmDialog";
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [saveFieldError, setSaveFieldError] = useState("");
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
    savedBites,
    savedError,
    savedLoading,
    savingProfile,
    saveProfile,
    setAvatarFile,
    setBannerFile,
    removeAvatar,
    removeBanner,
    setRemoveAvatar,
    setRemoveBanner,
    handleRemoveAvatar,
    handleRemoveBanner,
    handleClearRemoveAvatar,
    handleClearRemoveBanner,
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
      setSavedBites((prev) =>
        prev.map((item) =>
          getBiteId(item) === biteId ? { ...item, ...nextBite } : item,
        ),
      );
    },
    [setBites, setLikedBites, setSavedBites],
  );
  const biteActions = useBiteMutations({
    currentUser,
    onLikeChange: syncLikedBites,
    onSaveChange: syncSavedBites,
    refresh: fetchUserBites,
    setBites,
  });
  const savedBiteActions = useBiteMutations({
    currentUser,
    onLikeChange: syncLikedBites,
    onSaveChange: syncSavedBites,
    refresh: fetchSavedBites,
    removeOnUnsave: true,
    setBites: setSavedBites,
  });
  const likedBiteActions = useBiteMutations({
    currentUser,
    onLikeChange: syncLikedBites,
    onSaveChange: syncSavedBites,
    refresh: fetchLikedBites,
    setBites: setLikedBites,
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
    try {
      setSaveFieldError("");
      const updated = await saveProfile();
      setEditorOpen(false);
      showSnackbar({
        message: "Profil berhasil diperbarui!",
        variant: "success",
      });
      if (updated?.username && updated.username !== profileUsername) {
        navigate(`/profile/${encodeURIComponent(updated.username)}`, { replace: true });
      } else {
        await fetchProfile({ force: true });
      }
    } catch (err) {
      const msg = err.message || "Gagal memperbarui profil";
      // inline field error untuk username taken agar terlihat di dalam modal (snackbar ada di belakang modal sebelumnya)
      if (/username.*taken/i.test(msg) || /username.*dipakai/i.test(msg)) {
        setSaveFieldError("Username sudah dipakai, coba yang lain");
      } else {
        setSaveFieldError("");
      }
      // translate generic taken message ke ID
      const displayMsg = /Username already taken/i.test(msg) ? "Username sudah dipakai" : msg;
      showSnackbar({
        message: displayMsg,
        variant: "error",
      });
    }
  };

  const handleCloseEditor = () => {
    setAvatarFile(null);
    setBannerFile(null);
    setRemoveAvatar(false);
    setRemoveBanner(false);
    setSaveFieldError("");
    setEditorOpen(false);
  };

  const handleProfileChange = (field, value) => {
    if (field === "username" && saveFieldError) setSaveFieldError("");
    updateProfileForm(field, value);
  };

  const handleToggleFollow = async () => {
    try {
      await toggleFollow();
    } catch (err) {
      showSnackbar({
        message: err.message || "Gagal mengubah status follow",
        variant: "error",
      });
    }
  };

  const openBiteDetail = (bite) => {
    const biteId = bite?._id || bite?.id || bite?.biteId;
    if (biteId) navigate(`/status/${biteId}`);
  };

  const openUserProfile = (targetUsername) => {
    if (targetUsername) navigate(`/profile/${encodeURIComponent(targetUsername)}`);
  };

  const renderProfileState = (type) => {
    const isNotFound = type === "not-found";
    const Icon = isNotFound ? SearchX : AlertCircle;
    const isServerError = !isNotFound && error?.includes?.("Server");

    return (
      <section className="px-6 py-20 text-center">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${isNotFound ? "bg-gray-50" : "bg-red-50"}`}>
          <Icon className={`w-7 h-7 ${isNotFound ? "text-gray-300" : "text-red-400"}`} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">
          {isNotFound
            ? "Profil tidak ditemukan"
            : isServerError
              ? "Server sedang bermasalah"
              : "Profil gagal dimuat"}
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
          {isNotFound
            ? "Username ini belum terdaftar atau sudah tidak tersedia."
            : isServerError
              ? "Server sedang mengalami gangguan. Coba lagi dalam beberapa saat."
              : error}
        </p>
        {!isNotFound && (
          <button
            type="button"
            onClick={() => fetchProfile({ force: true })}
            className="inline-flex mt-5 items-center gap-2 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition"
          >
            <ArrowLeft className="h-4 w-4 rotate-[135deg]" />
            Coba lagi
          </button>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-start px-4">
        <main className="min-h-screen w-full max-w-2xl bg-white">
          <div className="sticky top-[65px] lg:top-0 z-20 flex items-center gap-3 border-b border-cream-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
              aria-label="Kembali"
              title="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base sm:text-lg font-black text-gray-900 leading-tight">
                {loading ? "Memuat Profil..." : displayName}
              </h1>
              <p className="text-[11px] font-semibold text-gray-400">
                {bites.length} {bites.length === 1 ? "bite" : "bites"}
              </p>
            </div>
          </div>

          {loading ? (
            <BiteLoader label="Sedang memuat profil..." />
          ) : profileNotFound ? (
            renderProfileState("not-found")
          ) : error ? (
            renderProfileState("error")
          ) : (
            <>
              <ProfileHeader
                avatar={removeAvatar ? "" : avatar}
                banner={removeBanner ? "" : banner}
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
                usernameError={saveFieldError}
                removeAvatar={removeAvatar}
                removeBanner={removeBanner}
                onAvatarChange={setAvatarFile}
                onBannerChange={setBannerFile}
                onRemoveAvatar={handleRemoveAvatar}
                onRemoveBanner={handleRemoveBanner}
                onClearRemoveAvatar={handleClearRemoveAvatar}
                onClearRemoveBanner={handleClearRemoveBanner}
                onCloseEditor={handleCloseEditor}
                onEditProfile={() => setEditorOpen(true)}
                onProfileChange={handleProfileChange}
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
    </div>
  );
}
