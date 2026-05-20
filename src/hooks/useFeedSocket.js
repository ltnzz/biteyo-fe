import { useEffect, useRef } from "react";
import { getBiteDetail } from "../services/feedApi";
import { subscribeToFeedChanges } from "../services/feedRealtime";
import { supabase } from "../lib/supabase";
import { getStoredUser } from "../utils/auth";
import { getBiteId } from "../utils/biteEngagement";
import { toFollowKey } from "../utils/followState";

const isDevelopment = import.meta.env.DEV;

const logRealtimeEvent = (table, payload) => {
  if (isDevelopment) console.log(`[supabase:${table}]`, payload);
};

const getCurrentUserId = () => {
  const currentUser = getStoredUser();
  return currentUser?._id || currentUser?.id || currentUser?.userId || "";
};

const getChangedBiteId = (payload) =>
  payload?.new?.bite_id ||
  payload?.old?.bite_id ||
  payload?.new?.id ||
  payload?.old?.id ||
  "";

const refreshBite = async (biteId, setFeed) => {
  if (!biteId) return;

  try {
    const updatedBite = await getBiteDetail(biteId);

    if (!updatedBite || !getBiteId(updatedBite)) return;

    setFeed((prev) =>
      prev.map((bite) =>
        getBiteId(bite) === biteId ? { ...bite, ...updatedBite } : bite,
      ),
    );
  } catch (error) {
    if (isDevelopment) console.warn("[supabase] gagal refresh bite", error);
  }
};

const insertBite = async (biteId, setFeed, acceptNewBite) => {
  if (!biteId) return;

  try {
    const bite = await getBiteDetail(biteId);
    if (!bite || !getBiteId(bite)) return;
    if (acceptNewBite && !acceptNewBite(bite)) return;

    setFeed((prev) =>
      prev.some((item) => getBiteId(item) === biteId)
        ? prev
        : [bite, ...prev],
    );
  } catch (error) {
    if (isDevelopment) console.warn("[supabase] gagal ambil bite baru", error);
  }
};

const fetchUsername = async (userId) => {
  if (!userId) return "";

  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isDevelopment) console.warn("[supabase] gagal ambil username", error);
    return "";
  }

  return data?.username || "";
};

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

    const currentUserId = getCurrentUserId();
    const channel = supabase.channel(`feed-realtime-${crypto.randomUUID()}`);
    const unsubscribeFeedChanges = subscribeToFeedChanges((payload) => {
      const biteId = payload?.biteId;

      if (payload?.type === "create") {
        insertBite(biteId, setFeed, acceptNewBiteRef.current);
      }

      if (payload?.type === "refresh") {
        refreshBite(biteId, setFeed);
      }

      if (payload?.type === "delete" && biteId) {
        setFeed((prev) => prev.filter((bite) => getBiteId(bite) !== biteId));
      }
    });

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bites" },
        (payload) => {
          logRealtimeEvent("bites:insert", payload);
          insertBite(payload.new?.id, setFeed, acceptNewBiteRef.current);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bites" },
        (payload) => {
          logRealtimeEvent("bites:update", payload);
          refreshBite(payload.new?.id, setFeed);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "bites" },
        (payload) => {
          logRealtimeEvent("bites:delete", payload);
          const biteId = payload.old?.id;
          if (!biteId) return;

          setFeed((prev) => prev.filter((bite) => getBiteId(bite) !== biteId));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        (payload) => {
          logRealtimeEvent("likes", payload);
          refreshBite(getChangedBiteId(payload), setFeed);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          logRealtimeEvent("comments", payload);
          refreshBite(getChangedBiteId(payload), setFeed);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follows" },
        async (payload) => {
          logRealtimeEvent("follows", payload);
          const row = payload.new || payload.old;
          if (!row) return;

          const isFollowing = payload.eventType === "INSERT";
          const followerId = row.follower_id;
          const followingId = row.following_id;

          if (setFollowingUsers && currentUserId && followerId === currentUserId) {
            const username = await fetchUsername(followingId);
            const followKey = toFollowKey(username);

            if (followKey) {
              setFollowingUsers((prev) => {
                const next = new Set(prev);
                if (isFollowing) next.add(followKey);
                else next.delete(followKey);
                return next;
              });
            }
          }

          const profileId = profile?._id || profile?.id || profile?.userId || "";
          if (setProfile && profileId && (followingId === profileId || followerId === profileId)) {
            setProfile((prev) => {
              if (!prev) return prev;

              const previousFollowersCount = Number(prev.followersCount || 0);
              const previousFollowingCount = Number(prev.followingCount || 0);
              const followersCount = Math.max(
                0,
                previousFollowersCount +
                  (followingId === profileId ? (isFollowing ? 1 : -1) : 0),
              );
              const followingCount = Math.max(
                0,
                previousFollowingCount +
                  (followerId === profileId ? (isFollowing ? 1 : -1) : 0),
              );
              const isOwnFollowChange =
                Boolean(currentUserId) && followerId === currentUserId;

              return {
                ...prev,
                ...(isOwnFollowChange
                  ? {
                      isFollowing,
                      following: isFollowing,
                      followedByMe: isFollowing,
                    }
                  : {}),
                followersCount,
                followingCount,
              };
            });
          }
        },
      )
      .subscribe();

    return () => {
      unsubscribeFeedChanges();
      supabase.removeChannel(channel);
    };
  }, [profile, setFeed, setFollowingUsers, setProfile]);
};
