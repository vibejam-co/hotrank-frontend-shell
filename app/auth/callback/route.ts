import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      return NextResponse.json({error: "HOTRANK Auth is not configured"}, {status: 503, headers: {"Cache-Control": "no-store"}});
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
