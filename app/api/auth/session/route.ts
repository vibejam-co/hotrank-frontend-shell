import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {HotRankConfigurationError} from "@/lib/hotrank/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase.auth.getUser();
    if (error || !data.user) return NextResponse.json({user: null}, {headers: {"Cache-Control": "private, no-store"}});
    return NextResponse.json({user: {id: data.user.id, email: data.user.email ?? null}}, {headers: {"Cache-Control": "private, no-store"}});
  } catch (error: unknown) {
    if (error instanceof HotRankConfigurationError) return NextResponse.json({error: "HOTRANK Auth is not configured"}, {status: 503, headers: {"Cache-Control": "no-store"}});
    return NextResponse.json({error: "Auth unavailable"}, {status: 503, headers: {"Cache-Control": "no-store"}});
  }
}
