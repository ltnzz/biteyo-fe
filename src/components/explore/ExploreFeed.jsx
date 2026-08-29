import { AlertCircle, Camera, RefreshCw } from "lucide-react";
import BiteLoader from "../BiteLoader";
import BiteCard from "./BiteCard";

export default function ExploreFeed({
  bites,
  canManageBite,
  currentUser,
  deletingId,
  editForm,
  editingId,
  feedError,
  feedLoading,
  followLoadingUsers = new Set(),
  followingUsers,
  getBiteId,
  getFollowKey,
  canFollowBite,
  savingId,
  onAddBite,
  onCancelEdit,
  onDelete,
  onEditChange,
  onOpenBite,
  onOpenProfile,
  onRetry,
  onStartEdit,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  onUpdate,
}) {
  if (feedLoading) {
    return (
      <section>
        <BiteLoader compact />
      </section>
    );
  }

  if (feedError) {
    return (
      <section>
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Gagal memuat feed
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xs mx-auto">
            {feedError}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pink-600"
            >
              <RefreshCw className="h-4 w-4" />
              Coba lagi
            </button>
          )}
        </div>
      </section>
    );
  }

  if (bites.length === 0) {
    return (
      <section>
        <div className="px-6 py-16 text-center">
          <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Belum ada bite di feed</h2>
          <p className="text-sm text-gray-500 mt-1">
            Jadilah yang pertama share makanan di sini.
          </p>
          <button
            onClick={onAddBite}
            className="mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition-colors"
          >
            Post a Bite
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div>
        {bites.map((bite, index) => {
          const biteId = getBiteId(bite);
          const followKey = getFollowKey(bite) || `bite-${index}`;
          const showFollow = canFollowBite ? canFollowBite(bite) : true;

          return (
            <BiteCard
              key={biteId || index}
              bite={bite}
              biteId={biteId}
              currentUser={currentUser}
              deletingId={deletingId}
              editForm={editForm}
              followKey={followKey}
              isEditing={editingId === biteId}
              isFollowing={followingUsers.has(followKey)}
              followLoading={followLoadingUsers.has(followKey)}
              showFollow={showFollow}
              manageable={canManageBite(bite)}
              savingId={savingId}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onEditChange={onEditChange}
              onOpenBite={onOpenBite}
              onOpenProfile={onOpenProfile}
              onStartEdit={onStartEdit}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              onToggleFollow={onToggleFollow}
              onUpdate={onUpdate}
            />
          );
        })}
      </div>
    </section>
  );
}
