export const getBiteId = (bite) => bite?._id || bite?.id || bite?.biteId || "";

const getIdentityValues = (value) => {
  if (!value) return [];
  if (typeof value === "string" || typeof value === "number") return [String(value)];

  return [
    value._id,
    value.id,
    value.userId,
    value.username,
    value.email,
  ].filter(Boolean).map(String);
};

const currentUserMatches = (value, currentUser) => {
  const currentValues = getIdentityValues(currentUser);
  if (currentValues.length === 0) return false;

  return getIdentityValues(value).some((item) => currentValues.includes(item));
};

export const getLikeCount = (bite) => {
  const count = bite?.likesCount ?? bite?.likeCount;
  if (Number.isFinite(Number(count))) return Number(count);
  if (Array.isArray(bite?.likes)) return bite.likes.length;

  return 0;
};

export const getCommentCount = (bite) => {
  const count = bite?.commentsCount ?? bite?.commentCount;
  if (Number.isFinite(Number(count))) return Number(count);
  if (Array.isArray(bite?.comments)) return bite.comments.length;

  return 0;
};

export const getBiteComments = (bite) => {
  if (Array.isArray(bite?.comments)) return bite.comments;
  if (Array.isArray(bite?.commentList)) return bite.commentList;
  if (Array.isArray(bite?.data?.comments)) return bite.data.comments;

  return [];
};

export const normalizeBiteComments = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.comments)) return data.data.comments;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

export const isBiteLiked = (bite, currentUser) => {
  const explicit =
    bite?.isLiked ??
    bite?.liked ??
    bite?.likedByMe ??
    bite?.likedByCurrentUser ??
    bite?.hasLiked;

  if (typeof explicit === "boolean") return explicit;

  return Array.isArray(bite?.likes)
    ? bite.likes.some((like) => currentUserMatches(like, currentUser))
    : false;
};

export const getCommentId = (comment) =>
  comment?._id || comment?.id || comment?.commentId || "";

export const getCommentAuthorName = (comment) => {
  const author =
    comment?.user ||
    comment?.author ||
    comment?.createdBy ||
    comment?.fromUser;
  if (typeof author === "string") return author;

  return (
    author?.username ||
    author?.name ||
    comment?.username ||
    comment?.authorName ||
    "User"
  );
};

export const getCommentAuthorAvatar = (comment) => {
  const author =
    comment?.user ||
    comment?.author ||
    comment?.createdBy ||
    comment?.fromUser;

  if (!author || typeof author === "string") return "";

  return author.avatarUrl || author.avatar || author.imageUrl || author.photoUrl || "";
};

export const getCommentContent = (comment) =>
  comment?.content || comment?.comment || comment?.text || comment?.message || "";

export const normalizeCreatedComment = (data, content, currentUser) => {
  const comment =
    data?.comment ||
    data?.data?.comment ||
    data?.data ||
    data;

  if (comment && typeof comment === "object" && !Array.isArray(comment)) {
    return {
      content,
      ...comment,
    };
  }

  return {
    id: `temp-${Date.now()}`,
    content,
    user: currentUser,
    createdAt: new Date().toISOString(),
  };
};

const looksLikeBite = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (
        value.foodName ||
        value.title ||
        value.review ||
        value.description ||
        value.locationName ||
        value.location ||
        value.photoUrl ||
        value.image ||
        value.rating ||
        value.likesCount !== undefined ||
        value.likeCount !== undefined ||
        value.commentsCount !== undefined ||
        value.commentCount !== undefined ||
        Array.isArray(value.comments)
      ),
  );

export const normalizeUpdatedBite = (data) => {
  const candidates = [
    data?.bite,
    data?.data?.bite,
    data?.post,
    data?.data?.post,
    data?.data,
    data,
  ];
  const bite = candidates.find(looksLikeBite);

  return bite || null;
};
