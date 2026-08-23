import {CreatorDirectoryView} from "@/components/creator-directory-view";
import {readServerHotRank} from "@/lib/hotrank/services/server";
import type {CreatorDirectoryData} from "@/lib/hotrank/domain/types";

export const dynamic = "force-dynamic";

export default async function Creators() {
  const data = await readServerHotRank("creators") as CreatorDirectoryData;
  return <CreatorDirectoryView data={data}/>;
}
