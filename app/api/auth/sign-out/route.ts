import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ok: true}, {headers: {"Cache-Control": "private, no-store"}});
  } catch {
    return NextResponse.json({error: "HOTRANK Auth is not configured"}, {status: 503, headers: {"Cache-Control": "no-store"}});
  }
}
