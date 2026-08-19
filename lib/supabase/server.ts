import "server-only";

import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
import {requireSupabasePublicEnv} from "@/lib/hotrank/runtime";

export async function createSupabaseServerClient() {
  const {url, publishableKey} = requireSupabasePublicEnv();
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          for (const {name, value, options} of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. The middleware/route handler
          // owns refresh persistence; reads remain request-scoped here.
        }
      },
    },
  });
}
