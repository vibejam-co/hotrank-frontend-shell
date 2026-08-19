import "server-only";

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {requireSupabaseServerEnv, getHotRankTimeoutMs} from "@/lib/hotrank/runtime";

export function createSupabaseServiceClient(): SupabaseClient {
  const {url, serviceRoleKey} = requireSupabaseServerEnv();
  const timeout = getHotRankTimeoutMs();
  return createClient(url, serviceRoleKey, {
    auth: {autoRefreshToken: false, persistSession: false, detectSessionInUrl: false},
    global: {
      fetch: (input, init) => fetch(input, {...init, signal: AbortSignal.timeout(timeout)}),
    },
  });
}
