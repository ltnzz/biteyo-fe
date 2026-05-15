export const normalizeProfile = (data) =>
  data?.profile ||
  data?.user ||
  data?.data?.profile ||
  data?.data?.user ||
  data?.data ||
  data ||
  null;

const mediaFields = [
  "avatar",
  "avatarUrl",
  "imageUrl",
  "photoUrl",
  "profileImage",
  "profileImageUrl",
  "profilePicture",
  "profilePictureUrl",
  "profilePic",
  "picture",
];

const getFirstString = (value, fields) => {
  if (!value || typeof value !== "object") return "";

  return fields.map((field) => value[field]).find((item) => typeof item === "string" && item) || "";
};

export const getProfileAvatar = (profile) => getFirstString(profile, mediaFields);

export const getProfileBanner = (profile) =>
  getFirstString(profile, ["banner", "bannerUrl", "coverImage", "coverImageUrl"]);

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
    avatar: getProfileAvatar(profile),
    banner: getProfileBanner(profile),
    bio: profile?.bio || "Sharing every bite worth remembering.",
    location: profile?.location || profile?.locationName,
    joinedAt: profile?.createdAt || profile?.joinedAt,
  };
};
