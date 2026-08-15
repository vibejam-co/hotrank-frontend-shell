import {
  canonicalHero,
  clips as clipRows,
  creators as creatorRows,
  demoVideo,
  imgs,
  savedClips as savedClipRows,
} from "../../../data";
import type {HotRankDataAdapter} from "@/lib/hotrank/adapters/types";
import type {
  ActivityData,
  Clip,
  Collection,
  Creator,
  CreatorDirectoryData,
  CreatorProfileData,
  HomeData,
  MediaRatio,
  Movement,
  Prompt,
  RankingEntry,
  RankingsData,
  SavedData,
  SavedPromptsData,
  SearchData,
  SubmissionFlowData,
  UserProfile,
} from "@/lib/hotrank/domain/types";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const movement = (label: string): Movement => ({direction: label.startsWith("↓") ? "down" : label === "—" ? "flat" : "up", label});
const promptText = "Cinematic wide shot of a lone figure in a dramatic landscape, soft atmospheric light, shallow depth of field, realistic texture, filmic color grade.";
const basePrompt = "A lone traveler stands on a rocky cliff overlooking a vast alien landscape at sunset, with a colossal monolith tower in the distance emitting a beam of light into the cloudy sky, cinematic, epic scale, realistic, 4k, ultra detailed.";
const neonPrompt = "Cinematic night scene in a rain-soaked cyberpunk city, moody and atmospheric. A lone woman with wet hair and a dark coat stands in the foreground, looking over her shoulder. The street glistens with reflections from neon signs in magenta, cyan, and amber. Steam rises from vents, and a distant figure walks through the haze. Shallow depth of field, dramatic contrast, film noir mood, ultra-detailed, shot on 35mm.";

const creatorCache = new Map<string, Creator>();
function creator(name: string, avatar: string, followersLabel = "412K Followers"): Creator {
  const existing = creatorCache.get(name);
  if (existing) return existing;
  const value: Creator = {id: `creator-${slugify(name)}`, slug: slugify(name), name, handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`, avatar, followersLabel};
  creatorCache.set(name, value);
  return value;
}

const creatorFixtures = creatorRows.map((row) => creator(row[0], row[1], row[2]));
const creatorByName = (name: string, avatar = imgs.avatar) => creatorCache.get(name) || creator(name, avatar);

const mediaRatio = (value: string): MediaRatio => {
  switch (value) {
    case "9:16": return "9:16";
    case "4:5": return "4:5";
    case "1:1": return "1:1";
    case "16:9": return "16:9";
    case "2:1": return "2:1";
    case "2.39:1": return "2.39:1";
    default: throw new Error(`Unsupported HotRank media ratio: ${value}`);
  }
};

function clipFromRow(row: string[], index: number): Clip {
  const [title, poster, creatorName, heat, movementLabel, ratio] = row;
  const item: Clip = {
    id: `clip-${slugify(title)}`,
    slug: slugify(title),
    title,
    poster,
    ratio: mediaRatio(ratio),
    creator: creatorByName(creatorName, poster),
    heat,
    movement: movement(movementLabel),
    tags: [],
  };
  if (index === 0) item.rankLabel = "#1";
  return item;
}

const clipFixtures = clipRows.map(clipFromRow);
const savedFixtures = savedClipRows.map((row, index) => clipFromRow(row, index));
const clipByTitle = (title: string) => clipFixtures.find((item) => item.title === title) || clipFixtures[0];
const inlineClip = (row: string[], index: number) => clipFromRow(row, index);

const cityOfReflections = inlineClip(["City of Reflections", imgs.city, "Urban Souls", "91.3", "↑ 4", "4:5"], 0);
const builtToFly = inlineClip(["Built to Fly", imgs.desert, "Throttle", "89.6", "↑ 3", "16:9"], 1);
const deepBelow = inlineClip(["The Deep Below", imgs.ocean, "Oceanborn", "88.1", "↑ 5", "16:9"], 2);
const goldenHour = inlineClip(["Golden Hour", imgs.softChaos, "Lunak", "87.0", "↓ 1", "4:5"], 3);

const prompt = (id: string, title: string, copy: string, image?: string, tags = ["cinematic", "landscape"]): Prompt => ({id, title, copy, image, tags, savedAtLabel: "Saved May 16, 2025"});
const beyondValley = prompt("prompt-beyond-the-valley", "Beyond the Valley", "Cinematic wide shot of a lone figure crossing a storm-lit valley, quiet atmosphere, realistic film texture.", imgs.mountain);
const cityDusk = prompt("prompt-city-dusk-reverie", "City Dusk Reverie", "Cinematic wide shot of a woman on a rooftop at dusk, looking over a sprawling city. Moody clouds, soft haze, neon lights beginning to glow. Wind in her hair, introspective and calm.", imgs.city, ["SORA", "LUMA", "RUNWAY", "16:9"]);
const forestLight = prompt("prompt-forest-light", "Forest Light Portrait", promptText, imgs.forest);
const neonRainwalk = prompt("prompt-neon-rainwalk", "Neon Rainwalk", neonPrompt, imgs.neon);
const desertMonolith = prompt("prompt-desert-monolith", "Desert Monolith", basePrompt, imgs.desert);

const collection = (id: string, title: string, image: string, count: number): Collection => ({id, title, image, countLabel: `${count} clips`});
const savedCollections = [collection("collection-cinematic-concepts", "Cinematic Concepts", imgs.neon, 36), collection("collection-visual-storytelling", "Visual Storytelling", imgs.city, 45), collection("collection-moodboard-inspo", "Moodboard Inspo", imgs.mountain, 54)];

const home: HomeData = {
  hero: {...clipFixtures[0], poster: canonicalHero, video: demoVideo, ratio: "2.39:1"},
  liveRankings: clipFixtures.slice(1),
  risingNow: clipFixtures.slice(1),
  editorPicks: [clipFixtures[0], cityOfReflections, builtToFly, deepBelow, goldenHour],
};

const rankingEntry = (id: string, rankPosition: number, title: string, poster: string, creatorName: string, heat: string, movementLabel: string, ratio: string, reason: string, savesLabel: string): RankingEntry => {
  const clip = inlineClip([title, poster, creatorName, heat, movementLabel, ratio], 0);
  return {id, rankPosition, clip, reason, savesLabel, movement: movement(movementLabel)};
};

const rankings: RankingsData = {
  featured: [
    rankingEntry("featured-last-blue", 2, "The Last Blue", "/media/ranking-last-blue.png", "Oceanic Society", "92", "2", "16:9", "Stunning visuals, viral across X", "8.7K"),
    rankingEntry("featured-glass-ceilings", 1, "Glass Ceilings", "/media/ranking-glass.png", "Maya Chen", "98", "1", "4:5", "A raw look at the invisible barriers still shaping ambition.", "12.4K"),
    rankingEntry("featured-late-nights", 3, "Late Nights in the City", "/media/ranking-late.png", "Kael Johnson", "89", "3", "9:16", "Relatable + platform algorithm boost", "7.1K"),
  ],
  rows: [
    rankingEntry("row-glass-ceilings", 1, "Glass Ceilings", "/media/ranking-glass.png", "Maya Chen", "98", "—", "4:5", "Powerful storytelling, strong shares", "12.4K"),
    rankingEntry("row-last-blue", 2, "The Last Blue", "/media/ranking-last-blue.png", "Oceanic Society", "92", "▲ 1", "16:9", "Stunning visuals, viral across X", "8.7K"),
    rankingEntry("row-late-nights", 3, "Late Nights in the City", "/media/ranking-late.png", "Kael Johnson", "89", "▼ 1", "9:16", "Relatable + platform algorithm boost", "7.1K"),
    rankingEntry("row-earth-breathes", 4, "Where Earth Breathes", "/media/mountain-scene.png", "Wildscope", "85", "▲ 2", "16:9", "Beautiful + educational", "6.3K"),
    rankingEntry("row-tokyo-street", 5, "Tokyo Street Bites", "/media/clip-electric.png", "Hana Eats", "82", "▲ 3", "4:5", "Craveable content", "5.8K"),
    rankingEntry("row-run-anyway", 6, "Run Anyway", "/media/clip-long-way.png", "Miles McKnight", "78", "▼ 2", "16:9", "Motivational + highly shared", "4.9K"),
    rankingEntry("row-fading-memories", 7, "Fading Memories", "/media/creator-cole.png", "Claire Elise", "75", "—", "16:9", "Emotional impact", "4.5K"),
    rankingEntry("row-edge-everything", 8, "The Edge of Everything", "/media/clip-after-midnight.png", "NovaLab", "73", "▲ 1", "2.39:1", "Curiosity + saves", "4.2K"),
    rankingEntry("row-good-boy", 9, "Good Boy", "/media/creator-liora.png", "Pawsitive", "71", "▲ 4", "1:1", "Heartwarming + shareable", "3.9K"),
    rankingEntry("row-letters-tomorrow", 10, "Letters to Tomorrow", "/media/creator-ayo.png", "Samira El", "69", "▼ 1", "4:5", "Unique concept, growing audience", "3.6K"),
  ],
};

const risingCreators = ["Tate McRae", "Emmanuel Oyeleke", "Renell Medrano", "Chris Saunders", "Adara Voss"].map((name, index) => ({...creatorByName(name, [imgs.creatorAyo, imgs.creatorJordan, imgs.creatorCole, imgs.creatorChris, imgs.creatorLiora][index]), roleLabel: ["Director", "Photographer", "Filmmaker", "Director", "Director"][index], weeklyMovementLabel: `▲ ${15 - index * 2} this week`}));
const newVoices = ["Samira Kalid", "Yusuf Hassan", "Luka Grünwald", "Devin Lee", "Maya Desai"].map((name, index) => creator(name, [imgs.creatorAyo, imgs.creatorJordan, imgs.creatorChris, imgs.creatorCole, imgs.creatorLiora][index], `${["Visual Artist", "Photographer", "Filmmaker", "Director", "Music Producer"][index]} · ${760 - index * 40} Followers`));
const chartExpanded = [...creatorFixtures, creator("Ayo Edebiri", imgs.creatorAyo, "321K Followers")];
const creatorDirectory: CreatorDirectoryData = {
  categories: ["All", "Film", "Music", "Photo", "Art", "Style"],
  featured: {...creatorByName("Liora Avery", imgs.creatorLiora), bio: "Cinematic storyteller blending intimate documentary with poetic visuals. Her work explores memory, identity, and the quiet moments that shape us.", location: "Los Angeles, CA", rankLabel: "78", movementLabel: "▲ 4"},
  chart: creatorFixtures,
  chartExpanded,
  rising: risingCreators,
  newVoices,
  mostFollowed: creatorFixtures,
};

const workflow = ["IDEA", "CREATE", "EDIT", "ENHANCE", "SOUND"].map((title, index) => ({title, description: ["Concept & references", "AI generation", "Timing & flow", "Upscale & grade", "Score & SFX"][index]}));
const adara = creator("Adara Voss", imgs.portrait, "98.6K Followers");
const creatorProfile: CreatorProfileData = {
  creator: {...adara, bio: "Cinematic world-builder and storyteller exploring the edge of imagination through AI film. Founder of VOSS Visuals.", location: "Reykjavik, Iceland", rankLabel: "275", movementLabel: "▲ 4", clipsLabel: "142", viewsLabel: "37.4M", promptsLabel: "24"},
  featuredWork: clipFixtures.slice(0, 4),
  recentWork: clipFixtures.slice(2, 6),
  prompts: [prompt("prompt-portal", "Top Prompt", "Cinematic shot of a lone figure standing before a massive ancient portal"), prompt("prompt-cathedral", "Top Prompt", "Ethereal woman in a flowing dress walking through a ruined cathedral")],
  tools: ["Midjourney", "Runway", "Kling AI", "Topaz Video AI", "ElevenLabs"],
  workflow,
};

const activity: ActivityData = {
  today: [
    {id: "activity-city-up", title: "Your clip moved up", message: "“City Lines” is now #24 in Skateboarding", thumbnail: clipFixtures[1].poster, timeLabel: "2h ago", movement: movement("↑ 8"), icon: "rank-up"},
    {id: "activity-follow-post", title: "A creator you follow posted", message: "@marisadatura posted a new clip", thumbnail: imgs.portrait, timeLabel: "3h ago", movement: movement("›"), icon: "follow"},
    {id: "activity-saved-rank", title: "Saved clip changed rank", message: "“Morning Glass” moved up to #17 in Surfing", thumbnail: clipFixtures[0].poster, timeLabel: "5h ago", movement: movement("↑ 3"), icon: "save"},
    {id: "activity-approved", title: "Submission approved", message: "“Night Drive” is now live in Music Visuals", thumbnail: imgs.neon, timeLabel: "7h ago", movement: movement("›"), icon: "approved"},
  ],
  earlier: [{id: "activity-summit-down", title: "Your clip moved down", message: "“Summit Push” dropped to #38 in Outdoor", thumbnail: imgs.mountain, timeLabel: "Yesterday", movement: movement("↓ 6"), icon: "message"}],
  pulse: {clipsUp: "27", clipsDown: "14", netMovement: "+13"},
  topMover: "“City Lines”",
  topMoverLabel: "#24 in Skateboarding　↑ 8",
};

const profile: UserProfile = {
  id: "user-lena-marlowe",
  name: "Lena Marlowe",
  handle: "@lenamarlowe",
  avatar: imgs.portrait,
  memberSinceLabel: "Member since March 2023",
  stats: [["Saved", "287"], ["Following", "156"], ["Submissions", "23"], ["Collections", "12"]].map(([label, value]) => ({label, value})),
  recentlySaved: [imgs.neon, imgs.mountain, imgs.portrait, imgs.forest, imgs.city, imgs.desert].map((poster, index) => ({...clipFixtures[index % clipFixtures.length], poster})),
  collections: [collection("profile-moody-light", "Moody Light", imgs.portrait, 41), collection("profile-still-life", "Still / Life", imgs.forest, 28), collection("profile-sea-land", "The Sea, The Land", imgs.mountain, 15)],
  followedCreators: ["Rafael Varona", "Jiyun Park", "Noah Caldwell", "Mina West"].map((name, index) => creator(name, [imgs.avatar, imgs.portrait, imgs.neon, imgs.forest][index])),
  promptLibrary: [prompt("prompt-profile-one", "Prompt Library", "A lone figure stands at the edge of a cliff, looking out over a vast, foggy sea at dawn."), prompt("prompt-profile-two", "Portrait in soft window light", "Portrait of a woman in soft window light, black and white, 35mm film look.")],
};

const saved: SavedData = {
  savedClips: savedFixtures,
  collections: savedCollections,
  prompts: [beyondValley, cityDusk],
  followedCreators: [creatorByName("Cole Bennett", imgs.creatorCole), creatorByName("Liora Avery", imgs.creatorLiora), creatorByName("Chris Saunders", imgs.creatorChris)],
};

const savedPromptCards = [prompt("saved-prompt-beyond", "Beyond the Valley", promptText, imgs.mountain), prompt("saved-prompt-forest", "Forest Light Portrait", promptText, imgs.forest), prompt("saved-prompt-neon", "Neon Rainwalk", promptText, imgs.neon), prompt("saved-prompt-desert", "Desert Monolith", promptText, imgs.desert)];
const savedPrompts: SavedPromptsData = {featured: cityDusk, prompts: savedPromptCards};
const search: SearchData = {clips: clipFixtures, creators: creatorFixtures};
const submission: SubmissionFlowData = {
  platforms: ["YouTube", "TikTok", "Instagram"],
  submission: {id: "submission-demo", sourceUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ", platform: "YouTube", title: "Insane clutch in the final seconds 🔥", description: "Close game, high tension, last play.", category: "Gaming", tags: ["clutch", "final seconds", "highlights"], creatorName: "Avery", attributionUrl: "https://youtube.com/@avery", preview: imgs.submitPreview, validationLabel: "Detected: Portrait", rightsConfirmed: true},
};

const clipDetails = {
  base: {...clipByTitle("Where the Wild Still Lives"), title: "Echoes of Tomorrow", description: "A lone signal. A distant world. The future is listening.", poster: imgs.clipLandscape, ratio: "16:9" as const, creator: creator("Aurora Studios", imgs.avatar, "24.1K followers"), heat: "92", movement: movement("↗ 5"), rankLabel: "# 12", viewsLabel: "128.7K", likesLabel: "9.3K", prompt: prompt("prompt-echoes", "Echoes of Tomorrow", basePrompt, imgs.clipLandscape), tags: ["#scifi", "#cinematic", "#unrealengine", "#ai"], relatedPosters: [imgs.clipLandscape, imgs.portrait, imgs.mountain, imgs.forest, imgs.neon], tools: ["Midjourney v6.1", "Runway Gen-3", "Topaz Video AI", "Color grade", "35mm lens"], workflow: ["Generate", "Animate", "Enhance", "Color Grade"], breakdown: [{label: "Subject", value: "Lone woman in dark coat"}, {label: "Setting", value: "Rainy cyberpunk city"}, {label: "Lighting", value: "Neon signs, reflections"}, {label: "Mood", value: "Moody, noir, cinematic"}, {label: "Camera", value: "35mm lens, shallow DOF"}]},
  expanded: {...clipByTitle("After Midnight"), title: "Neon Rain", description: "A lone figure walks through a rain-soaked city where every reflection hides a memory.", poster: imgs.city, ratio: "16:9" as const, creator: creator("Aurora Studios", imgs.avatar, "24.1K followers"), heat: "92", movement: movement("↗ 5"), rankLabel: "# 12", viewsLabel: "128.7K", likesLabel: "9.3K", prompt: prompt("prompt-neon-rain", "Expanded prompt", neonPrompt, imgs.city, ["#noir", "#rain", "#cinematic", "#neon"]), tags: ["#noir", "#rain", "#cinematic", "#neon"], relatedPosters: [imgs.city, imgs.portrait, imgs.mountain, imgs.forest, imgs.neon], tools: ["Midjourney v6.1", "Runway Gen-3", "Topaz Video AI", "Color grade", "35mm lens"], workflow: ["Generate", "Animate", "Enhance", "Color Grade"], breakdown: [{label: "Subject", value: "Lone woman in dark coat"}, {label: "Setting", value: "Rainy cyberpunk city"}, {label: "Lighting", value: "Neon signs, reflections"}, {label: "Mood", value: "Moody, noir, cinematic"}, {label: "Camera", value: "35mm lens, shallow DOF"}]},
  portrait: {...clipByTitle("The Long Way Down"), title: "Copy Prompt", description: "Posted 2 days ago　·　◉ 312K views　·　9:16　·　15s", poster: imgs.clipPortrait, ratio: "9:16" as const, creator: creator("Orion Vale", imgs.avatar, "128K followers"), heat: "92", movement: movement("↗ +7"), rankLabel: "#4", viewsLabel: "312K", likesLabel: "1.8K", prompt: prompt("prompt-portrait", "Copy Prompt", basePrompt, imgs.clipPortrait), tags: ["Midjourney v6.1", "Runway Gen-3", "Upscale", "16:9 → 9:16", "15s", "24fps"], relatedPosters: [imgs.clipPortrait, imgs.portrait, imgs.mountain, imgs.forest, imgs.neon], workflowLines: ["① Midjourney v6.1 — Scene generation", "② Runway Gen-3 — Cinematic motion", "③ Topaz Video AI — Upscale & clarity", "④ Color grade & final export"]},
};

function getClipDetail(id: string, expanded: boolean): Clip {
  if (id.includes("last-horizon")) return clipDetails.portrait;
  return expanded || id.includes("neon-rain") ? clipDetails.expanded : clipDetails.base;
}

export const fixtureAdapter: HotRankDataAdapter = {
  getHome: () => home,
  getRankings: () => rankings,
  getClipDetail,
  getCreators: () => creatorDirectory,
  getCreator: (slug) => creatorProfile.creator.slug === slug ? creatorProfile : null,
  getActivity: () => activity,
  getProfile: () => profile,
  getSaved: () => saved,
  getSavedPrompts: () => savedPrompts,
  getSearch: () => search,
  getSubmissionFlow: () => submission,
};
