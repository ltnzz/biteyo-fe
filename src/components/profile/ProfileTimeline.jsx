import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { getBiteId } from "../../hooks/useBiteMutations";
import ProfileBiteCard from "./ProfileBiteCard";

export default function ProfileTimeline({
  avatar,
  bites,
  displayName,
  deletingBiteId,
  editForm,
  editingId,
  handle,
  savingBiteId,
  onCancelEdit,
  onDeleteBite,
  onEditBite,
  onEditChange,
  onPhotoChange,
  onUpdateBite,
}) {
  return (
    <section>
      {bites.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Belum ada bite</h2>
          <p className="text-sm text-gray-500 mt-1">
            Post dari Add Page akan muncul di timeline profil ini.
          </p>
          <Link
            to="/add"
            className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
          >
            Post a Bite
          </Link>
        </div>
      ) : (
        bites.map((bite, index) => {
          const biteId = getBiteId(bite);

          return (
            <ProfileBiteCard
              key={biteId || index}
              avatar={avatar}
              bite={bite}
              deleting={deletingBiteId === biteId}
              displayName={displayName}
              editForm={editForm}
              editing={editingId === biteId}
              handle={handle}
              saving={savingBiteId === biteId}
              onCancelEdit={onCancelEdit}
              onDelete={() => onDeleteBite(bite)}
              onEdit={() => onEditBite(bite)}
              onEditChange={onEditChange}
              onPhotoChange={onPhotoChange}
              onUpdate={() => onUpdateBite(bite)}
            />
          );
        })
      )}
    </section>
  );
}
