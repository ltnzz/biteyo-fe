import { useEffect, useRef } from "react";
import { getBiteDetail } from "../services/feedApi";
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
    const updatedBite = await getBiteDetail(biteId, { force: true });

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

// Satu perubahan bisa memicu beberapa event postgres_changes beruntun
// (mis. like -> INSERT likes + UPDATE bites). Debounce per bite agar
// tidak fetch detail berulang dalam jendela waktu singkat.
const REFRESH_DEBOUNCE_MS = 300;
const createRefreshScheduler = () => {
  const timers = new Map();

  return (biteId, setFeed) => {
    if (!biteId) return;

    if (timers.has(biteId)) clearTimeout(timers.get(biteId));

    timers.set(
      biteId,
      setTimeout(() => {
        timers.delete(biteId);
        refreshBite(biteId, setFeed);
      }, REFRESH_DEBOUNCE_MS),
    );
  };
};

const insertBite = async (biteId, setFeed, acceptNewBite) => {
  if (!biteId) return;

  try {
    const bite = await getBiteDetail(biteId, { force: true });
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
    const scheduleRefresh = createRefreshScheduler();
    const channel = supabase.channel(`feed-realtime-${crypto.randomUUID()}`);

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
          scheduleRefresh(payload.new?.id, setFeed);
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
          scheduleRefresh(getChangedBiteId(payload), setFeed);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          logRealtimeEvent("comments", payload);
          scheduleRefresh(getChangedBiteId(payload), setFeed);
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
      supabase.removeChannel(channel);
    };
  }, [profile, setFeed, setFollowingUsers, setProfile]);
};
