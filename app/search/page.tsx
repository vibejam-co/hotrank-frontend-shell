import {SearchSurface} from "@/components/search-surface";
import {readServerHotRank} from "@/lib/hotrank/services/server";
import type {SearchData} from "@/lib/hotrank/domain/types";

export const dynamic = "force-dynamic";

export default async function SearchPage(){
  const data = await readServerHotRank("search") as SearchData;
  return <SearchSurface data={data}/>;
}
