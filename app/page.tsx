import {LiveHome} from "@/components/live-home";
import {readServerHotRank} from "@/lib/hotrank/services/server";
import type {HomeData} from "@/lib/hotrank/domain/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const home = await readServerHotRank("home") as HomeData;
  return <LiveHome home={home}/>;
}
