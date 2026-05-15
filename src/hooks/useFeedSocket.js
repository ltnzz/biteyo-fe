import { useEffect, useRef } from "react";
import socket from "../lib/socket";
import {
  getBiteComments,
  getBiteId,
  getCommentCount,
  getCommentId,
  getLikeCount,
  normalizeUpdatedBite,
} from "../utils/biteEngagement";
import { toFollowKey } from "../utils/followState";

const isDevelopment = import.meta.env.DEV;

const logSocketEvent = (event, payload) => {
  if (isDevelopment) console.log(`[socket] ${event}`, payload);
};

const getPayloadBite = (payload) =>
  normalizeUpdatedBite(payload) ||
  normalizeUpdatedBite(payload?.bite) ||
  normalizeUpdatedBite(payload?.data?.bite);

const getPayloadBiteId = (payload) =>
  getBiteId(getPayloadBite(payload)) ||
  payload?.biteId ||
  payload?.id ||
  payload?._id ||
  payload?.data?.biteId ||
  payload?.data?.id ||
  "";

const getUserIdentityValues = (value) => {
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

const sameIdentity = (a, b) => {
  const left = getUserIdentityValues(a).map((value) => value.toLowerCase());
  const right = getUserIdentityValues(b).map((value) => value.toLowerCase());

  return left.some((value) => right.includes(value));
};

const mergeBite = (bite, updates) => {
  if (!updates) return bite;

  return {
    ...bite,
    ...updates,
  };
};

const setLikeState = (bite, payload, liked) => {
  const nextCount = payload?.likesCount ?? payload?.likeCount ?? getLikeCount(bite);

  return {
    ...bite,
    isLiked: liked,
    liked,
    likedByMe: liked,
    likedByCurrentUser: liked,
    likesCount: nextCount,
    likeCount: nextCount,
  };
};

const setEngagementState = (bite, payload) => {
  const likesCount = payload?.likesCount ?? payload?.likeCount ?? getLikeCount(bite);
  const commentsCount =
    payload?.commentsCount ?? payload?.commentCount ?? getCommentCount(bite);

  return {
    ...bite,
    likesCount,
    likeCount: likesCount,
    commentsCount,
    commentCount: commentsCount,
  };
};

const getCommentPayload = (payload) =>
  payload?.comment ||
  payload?.data?.comment ||
  payload?.data ||
  payload;

const appendComment = (bite, payload) => {
  const comment = getCommentPayload(payload);
  const commentId = getCommentId(comment);
  const comments = getBiteComments(bite);
  const hasComment =
    commentId && comments.some((item) => getCommentId(item) === commentId);
  const nextComments = hasComment ? comments : [...comments, comment];
  const nextCount =
    payload?.commentsCount ??
    payload?.commentCount ??
    Math.max(getCommentCount(bite) + (hasComment ? 0 : 1), nextComments.length);

  return {
    ...bite,
    comments: nextComments,
    commentsCount: nextCount,
    commentCount: nextCount,
  };
};

const getFollowTargetValues = (payload) =>
  [
    payload?.user,
    payload?.targetUser,
    payload?.followedUser,
    payload?.following,
    payload?.profile,
    payload?.username,
    payload?.userId,
    payload?.targetUserId,
    payload?.data?.user,
    payload?.data?.targetUser,
    payload?.data?.username,
    payload?.data?.userId,
  ].flatMap(getUserIdentityValues);

const getFollowState = (payload) =>
  Boolean(
    payload?.isFollowing ??
      payload?.following ??
      payload?.followedByMe ??
      payload?.is_following ??
      payload?.data?.isFollowing ??
      payload?.data?.following,
  );

const getFollowCount = (payload) =>
  payload?.followersCount ??
  payload?.followerCount ??
  payload?.data?.followersCount ??
  payload?.data?.followerCount;

export const useFeedSocket = (
  feed,
  setFeed,
  {
    acceptNewBite,
    setFollowingUsers,
    profile,
    setProfile,
  } = {},
) => {
  const feedRef = useRef(feed);
  const acceptNewBiteRef = useRef(acceptNewBite);

  useEffect(() => {
    feedRef.current = feed;
  }, [feed]);

  useEffect(() => {
    acceptNewBiteRef.current = acceptNewBite;
  }, [acceptNewBite]);

  useEffect(() => {
    if (!setFeed) return undefined;

    const handleNewBite = (payload) => {
      logSocketEvent("new_bite", payload);
      const bite = getPayloadBite(payload) || payload;
      const biteId = getBiteId(bite);

      if (!biteId) return;
      if (acceptNewBiteRef.current && !acceptNewBiteRef.current(bite)) return;

      setFeed((prev) => {
        if (prev.some((item) => getBiteId(item) === biteId)) return prev;
        return [bite, ...prev];
      });
    };

    const handleUpdateBite = (payload) => {
      logSocketEvent("update_bite", payload);
      const updated = getPayloadBite(payload) || payload;
      const biteId = getPayloadBiteId(payload);

      if (!biteId) return;

      setFeed((prev) =>
        prev.map((bite) =>
          getBiteId(bite) === biteId ? mergeBite(bite, updated) : bite,
        ),
      );
    };

    const handleDeleteBite = (payload) => {
      logSocketEvent("delete_bite", payload);
      const biteId = getPayloadBiteId(payload);

      if (!biteId) return;
      setFeed((prev) => prev.filter((bite) => getBiteId(bite) !== biteId));
    };

    const handleBiteLiked = (payload) => {
      logSocketEvent("bite_liked", payload);
      const biteId = getPayloadBiteId(payload);

      if (!biteId) return;
      setFeed((prev) =>
        prev.map((bite) =>
          getBiteId(bite) === biteId ? setLikeState(bite, payload, true) : bite,
        ),
      );
    };

    const handleBiteUnliked = (payload) => {
      logSocketEvent("bite_unliked", payload);
      const biteId = getPayloadBiteId(payload);

      if (!biteId) return;
      setFeed((prev) =>
        prev.map((bite) =>
          getBiteId(bite) === biteId ? setLikeState(bite, payload, false) : bite,
        ),
      );
    };

    const handleEngagementUpdated = (payload) => {
      logSocketEvent("bite_engagement_updated", payload);
      const biteId = getPayloadBiteId(payload);

      if (!biteId) return;
      setFeed((prev) =>
        prev.map((bite) =>
          getBiteId(bite) === biteId ? setEngagementState(bite, payload) : bite,
        ),
      );
    };

    const handleNewComment = (payload) => {
      logSocketEvent("new_comment", payload);
      const biteId = getPayloadBiteId(payload);
      const updated = getPayloadBite(payload);

      if (!biteId) return;
      setFeed((prev) =>
        prev.map((bite) =>
          getBiteId(bite) === biteId
            ? updated && getBiteId(updated)
              ? mergeBite(bite, updated)
              : appendComment(bite, payload)
            : bite,
        ),
      );
    };

    const handleFollowStatusUpdated = (payload) => {
      logSocketEvent("follow_status_updated", payload);
      const targetValues = getFollowTargetValues(payload);
      const isFollowing = getFollowState(payload);

      if (setFollowingUsers) {
        setFollowingUsers((prev) => {
          const next = new Set(prev);
          targetValues.forEach((value) => {
            const followKey = toFollowKey(value);
            if (!followKey) return;

            if (isFollowing) next.add(followKey);
            else next.delete(followKey);
          });
          return next;
        });
      }

      if (setProfile && profile && targetValues.some((value) => sameIdentity(value, profile))) {
        setProfile((prev) => {
          if (!prev) return prev;

          const followersCount = getFollowCount(payload) ?? prev.followersCount;

          return {
            ...prev,
            isFollowing,
            following: isFollowing,
            followedByMe: isFollowing,
            followersCount,
          };
        });
      }
    };

    socket.on("new_bite", handleNewBite);
    socket.on("update_bite", handleUpdateBite);
    socket.on("delete_bite", handleDeleteBite);
    socket.on("bite_liked", handleBiteLiked);
    socket.on("bite_unliked", handleBiteUnliked);
    socket.on("bite_engagement_updated", handleEngagementUpdated);
    socket.on("new_comment", handleNewComment);
    socket.on("follow_status_updated", handleFollowStatusUpdated);

    return () => {
      socket.off("new_bite", handleNewBite);
      socket.off("update_bite", handleUpdateBite);
      socket.off("delete_bite", handleDeleteBite);
      socket.off("bite_liked", handleBiteLiked);
      socket.off("bite_unliked", handleBiteUnliked);
      socket.off("bite_engagement_updated", handleEngagementUpdated);
      socket.off("new_comment", handleNewComment);
      socket.off("follow_status_updated", handleFollowStatusUpdated);
    };
  }, [profile, setFeed, setFollowingUsers, setProfile]);
};
