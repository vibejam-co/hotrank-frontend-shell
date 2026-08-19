import {NextResponse, type NextRequest} from "next/server";
import {updateSupabaseSession} from "@/lib/supabase/proxy";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth") || request.nextUrl.pathname.startsWith("/auth")) {
    return updateSupabaseSession(request);
  }
  return NextResponse.next({request});
}

export const config = {
  matcher: ["/api/auth/:path*", "/auth/:path*"],
};
