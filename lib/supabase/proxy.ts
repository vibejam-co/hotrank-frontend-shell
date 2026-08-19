import "server-only";

import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";
import {HOTRANK_SUPABASE_URL} from "@/lib/hotrank/runtime";

export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) return NextResponse.next({request});

  let response = NextResponse.next({request});
  const supabase = createServerClient(HOTRANK_SUPABASE_URL, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const {name, value, options} of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({request});
        for (const {name, value, options} of cookiesToSet) response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      },
    },
  });

  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
