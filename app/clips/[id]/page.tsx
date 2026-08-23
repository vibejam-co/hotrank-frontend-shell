import {ClipDetail} from "@/components/clip-detail";
import {readServerHotRank} from "@/lib/hotrank/services/server";
import type {Clip} from "@/lib/hotrank/domain/types";

export const dynamic = "force-dynamic";

export default async function ClipPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const expandedDefault = id.includes("neon-rain");
  const detail = await readServerHotRank("clip", id, expandedDefault) as Clip;
  const expandedDetail = expandedDefault ? detail : await readServerHotRank("clip", id, true) as Clip;
  return <ClipDetail clipId={id} portrait={id.includes("last-horizon")} expandedDefault={expandedDefault} detail={detail} expandedDetail={expandedDetail}/>;
}
