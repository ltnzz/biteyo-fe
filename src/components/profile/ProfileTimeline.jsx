import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getBiteId } from "../../hooks/useBiteMutations";
import ProfileBiteCard from "./ProfileBiteCard";

export default function ProfileTimeline({
  avatar,
  bites,
  canManage = false,
  currentUser,
  displayName,
  deletingBiteId,
  editForm,
  editingId,
  emptyDescription = "Post dari Add Page akan muncul di timeline profil ini.",
  emptyTitle = "Belum ada bite",
  error = "",
  handle,
  likingBiteIds = new Set(),
  loading = false,
  savingBiteId,
  showCreateAction = false,
  onCancelEdit,
  onDeleteBite,
  onEditBite,
  onEditChange,
  onOpenBite,
  onPhotoChange,
  onRetry,
  onToggleLike,
  onUpdateBite,
}) {
  if (loading) {
    return (
      <section className="px-6 py-16 text-center">
        <Loader2 className="w-8 h-8 text-pink-500 mx-auto animate-spin" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Bite gagal dimuat</h2>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
          >
            Coba lagi
          </button>
        )}
      </section>
    );
  }

  return (
    <section>
      {bites.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">{emptyTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">{emptyDescription}</p>
          {showCreateAction && (
            <Link
              to="/add"
              className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
            >
              Post a Bite
            </Link>
          )}
        </div>
      ) : (
        bites.map((bite, index) => {
          const biteId = getBiteId(bite);

          return (
            <ProfileBiteCard
              key={biteId || index}
              avatar={avatar}
              bite={bite}
              canManage={canManage}
              currentUser={currentUser}
              deleting={deletingBiteId === biteId}
              displayName={displayName}
              editForm={editForm}
              editing={editingId === biteId}
              handle={handle}
              liking={likingBiteIds.has(biteId)}
              saving={savingBiteId === biteId}
              onCancelEdit={onCancelEdit}
              onDelete={() => onDeleteBite(bite)}
              onEdit={() => onEditBite(bite)}
              onEditChange={onEditChange}
              onOpenBite={onOpenBite}
              onPhotoChange={onPhotoChange}
              onToggleLike={onToggleLike}
              onUpdate={() => onUpdateBite(bite)}
            />
          );
        })
      )}
    </section>
  );
}
