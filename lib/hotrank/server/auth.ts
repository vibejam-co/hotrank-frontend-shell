import "server-only";

import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function getCurrentHotRankUser() {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {id: data.user.id, email: data.user.email ?? null};
}

export async function requireCurrentHotRankUser() {
  const user = await getCurrentHotRankUser();
  if (!user) throw new Error("Authentication required");
  return user;
}
