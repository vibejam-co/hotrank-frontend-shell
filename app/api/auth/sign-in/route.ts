import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {HotRankConfigurationError} from "@/lib/hotrank/runtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {email?: unknown; password?: unknown} | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({error: "Email and password are required"}, {status: 400});
  try {
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase.auth.signInWithPassword({email, password});
    if (error || !data.user) return NextResponse.json({error: "Sign-in failed"}, {status: 401});
    return NextResponse.json({user: {id: data.user.id, email: data.user.email ?? null}}, {headers: {"Cache-Control": "private, no-store"}});
  } catch (error: unknown) {
    return NextResponse.json({error: error instanceof HotRankConfigurationError ? "HOTRANK Auth is not configured" : "Auth unavailable"}, {status: 503, headers: {"Cache-Control": "no-store"}});
  }
}
