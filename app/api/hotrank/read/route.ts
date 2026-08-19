import {NextResponse} from "next/server";
import {readServerHotRank} from "@/lib/hotrank/services/server";
import {HotRankConfigurationError, HotRankDataError} from "@/lib/hotrank/runtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource") ?? "home";
  try {
    const data = await readServerHotRank(resource, url.searchParams.get("id") ?? undefined, url.searchParams.get("expanded") === "true");
    return NextResponse.json({data}, {headers: {"Cache-Control": "private, no-store"}});
  } catch (error: unknown) {
    const status = error instanceof HotRankConfigurationError ? 503 : error instanceof HotRankDataError && error.code === "HOTRANK_NOT_FOUND" ? 404 : 502;
    return NextResponse.json({error: "HOTRANK backend unavailable", code: error instanceof HotRankConfigurationError || error instanceof HotRankDataError ? error.code : "HOTRANK_READ_FAILED"}, {status, headers: {"Cache-Control": "no-store"}});
  }
}
