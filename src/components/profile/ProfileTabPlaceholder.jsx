import { Bookmark, Heart } from "lucide-react";

const tabCopy = {
  likes: {
    icon: Heart,
    title: "Belum ada likes",
    description: "Bite yang kamu sukai akan muncul di sini.",
  },
  save: {
    icon: Bookmark,
    title: "Belum ada saved bite",
    description: "Bite yang kamu simpan akan muncul di sini.",
  },
};

export default function ProfileTabPlaceholder({ type }) {
  const content = tabCopy[type] || tabCopy.likes;
  const Icon = content.icon;

  return (
    <section className="px-6 py-16 text-center">
      <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-gray-900">{content.title}</h2>
      <p className="text-sm text-gray-500 mt-1">{content.description}</p>
    </section>
  );
}
