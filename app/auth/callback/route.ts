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
    const requestCookies = cookieStore.getAll();
    const supabaseCookieNames = requestCookies.filter(({name}) => name.startsWith("sb-")).map(({name}) => name);
    const pkceCookiePresent = supabaseCookieNames.some((name) => name.endsWith("-code-verifier") || name.endsWith("-flows-code-verifier"));
    const callbackCanReadPkceCookie = pkceCookiePresent;
    let exchangeCalled = false;
    let cookieMutationCount = 0;
    const supabase = createServerClient(supabaseUrl, publishableKey, {
      cookies: {
        getAll() { return requestCookies; },
        setAll(cookiesToSet) {
          cookieMutationCount += cookiesToSet.length;
          for (const {name, value, options} of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    exchangeCalled = true;
    const {error: exchangeError} = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.warn("[HOTRANK auth callback] exchange failed", {
        code_present: true,
        pkce_cookie_present: pkceCookiePresent,
        callback_can_read_pkce_cookie: callbackCanReadPkceCookie,
        exchange_called: exchangeCalled,
        exchange_success: false,
        cookie_mutation_count: cookieMutationCount,
        error: {
          name: exchangeError.name ?? "unknown",
          status: exchangeError.status ?? null,
          code: exchangeError.code ?? null,
          message: typeof exchangeError.message === "string" ? exchangeError.message.replace(/https?:\/\/\S+/g, "[url]").replace(/[A-Za-z0-9_-]{20,}/g, "[redacted]") : "unknown",
        },
      });
      return NextResponse.json({error: "HOTRANK Auth callback failed"}, {status: 400, headers: {"Cache-Control": "no-store"}});
    }
  } catch {
    return NextResponse.json({error: "HOTRANK Auth is not configured"}, {status: 503, headers: {"Cache-Control": "no-store"}});
  }
  return response;
}
