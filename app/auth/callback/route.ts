import "server-only";

import {createServerClient} from "@supabase/ssr";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {requireSupabasePublicEnv} from "@/lib/hotrank/runtime";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  const response = NextResponse.redirect(new URL(next, url.origin));
  if (!code) return response;

  try {
    const {url: supabaseUrl, publishableKey} = requireSupabasePublicEnv();
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, publishableKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          for (const {name, value, options} of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    const {error: exchangeError} = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return NextResponse.json({error: "HOTRANK Auth callback failed"}, {status: 400, headers: {"Cache-Control": "no-store"}});
  } catch {
    return NextResponse.json({error: "HOTRANK Auth is not configured"}, {status: 503, headers: {"Cache-Control": "no-store"}});
  }
  return response;
}
