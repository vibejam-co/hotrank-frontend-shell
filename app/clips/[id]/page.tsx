import {ClipDetail} from "@/components/clip-detail";

export default async function ClipPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  return <ClipDetail clipId={id} portrait={id.includes("last-horizon")} expandedDefault={id.includes("neon-rain")}/>;
}
