import { supabase } from "../lib/supabase";

const listeners = new Set();
let channel;

const ensureChannel = () => {
  if (channel) return channel;

  channel = supabase
    .channel("feed-client-events")
    .on("broadcast", { event: "bite_changed" }, ({ payload }) => {
      listeners.forEach((listener) => listener(payload));
    })
    .subscribe();

  return channel;
};

export const subscribeToFeedChanges = (listener) => {
  if (typeof listener !== "function") return () => {};

  ensureChannel();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const broadcastFeedChange = async (payload) => {
  if (!payload?.type) return;

  const realtimeChannel = ensureChannel();

  try {
    await realtimeChannel.send({
      type: "broadcast",
      event: "bite_changed",
      payload,
    });
  } catch {
    // Supabase postgres_changes remains the primary source.
  }
};

