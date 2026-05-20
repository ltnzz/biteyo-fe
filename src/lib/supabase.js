import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const createDisabledSupabaseClient = () => {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    send: async () => null,
  };

  const query = {
    select: () => query,
    delete: () => query,
    eq: () => query,
    maybeSingle: async () => ({ data: null, error: null }),
  };

  return {
    channel: () => channel,
    from: () => query,
    removeChannel: () => {},
  };
};

export const supabase =
  isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createDisabledSupabaseClient();
