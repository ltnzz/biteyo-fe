export const normalizeProfile = (data) =>
  data?.profile ||
  data?.user ||
  data?.data?.profile ||
  data?.data?.user ||
  data?.data ||
  data ||
  null;

export const formatProfileDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export const getProfileUsername = (user) => user?.username || user?.name || "";

export const getProfileViewModel = (profile, fallbackUsername) => {
  const displayName = profile?.name || profile?.username || fallbackUsername;
  const handle = profile?.username || fallbackUsername;

  return {
    displayName,
    handle,
    avatar: profile?.avatar || profile?.avatarUrl || profile?.photoUrl,
    banner: profile?.banner || profile?.bannerUrl || profile?.coverImage,
    bio: profile?.bio || "Sharing every bite worth remembering.",
    location: profile?.location || profile?.locationName,
    joinedAt: profile?.createdAt || profile?.joinedAt,
  };
};
