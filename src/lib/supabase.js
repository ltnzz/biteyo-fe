import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createDisabledSupabaseClient = () => {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
  };

  const query = {
    select: () => query,
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
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createDisabledSupabaseClient();
