import {Tabs, PromptCard} from "@/components/cards";
import {CopyPrompt} from "@/components/copy-prompt";
import {readServerHotRank} from "@/lib/hotrank/services/server";
import type {SavedPromptsData} from "@/lib/hotrank/domain/types";

export const dynamic = "force-dynamic";

export default async function SavedPrompts() {
  const {featured, prompts} = await readServerHotRank("saved-prompts") as SavedPromptsData;
  return <main className="shell"><h1 className="page-title serif">Saved prompts</h1><Tabs active="PROMPTS"/><div className="card prompt-feature"><img src={featured.image || ""} alt="City dusk prompt reference"/><div><div className="label pink">▮ {featured.savedAtLabel || "Saved prompt"}</div><h2 className="serif">{featured.title}</h2><p className="prompt-copy">{featured.copy}</p><div className="chips">{featured.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div><CopyPrompt prompt={featured.copy} className="btn primary"/></div><div className="prompt-list section">{prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt}/>)}</div></main>;
}
