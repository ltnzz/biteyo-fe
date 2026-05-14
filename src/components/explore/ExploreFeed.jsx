import { Camera, Loader2 } from "lucide-react";
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
  followingUsers,
  getBiteId,
  getFollowKey,
  commentErrors = {},
  commentingBiteIds = new Set(),
  likingBiteIds = new Set(),
  savingId,
  onAddBite,
  onCancelEdit,
  onDelete,
  onEditChange,
  onOpenBite,
  onPhotoChange,
  onStartEdit,
  onToggleLike,
  onSubmitComment,
  onToggleFollow,
  onUpdate,
}) {
  if (feedLoading) {
    return (
      <section>
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      </section>
    );
  }

  if (feedError) {
    return (
      <section>
        <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {feedError}
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

          return (
            <BiteCard
              key={biteId || index}
              bite={bite}
              biteId={biteId}
              currentUser={currentUser}
              deletingId={deletingId}
              editForm={editForm}
              followKey={followKey}
              commentError={commentErrors[biteId] || ""}
              commenting={commentingBiteIds.has(biteId)}
              isEditing={editingId === biteId}
              isFollowing={followingUsers.has(followKey)}
              liking={likingBiteIds.has(biteId)}
              manageable={canManageBite(bite)}
              savingId={savingId}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onEditChange={onEditChange}
              onOpenBite={onOpenBite}
              onPhotoChange={onPhotoChange}
              onStartEdit={onStartEdit}
              onToggleLike={onToggleLike}
              onSubmitComment={onSubmitComment}
              onToggleFollow={onToggleFollow}
              onUpdate={onUpdate}
            />
          );
        })}
      </div>
    </section>
  );
}
