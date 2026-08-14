export type MediaRatio = "9:16" | "4:5" | "1:1" | "16:9" | "2:1" | "2.39:1";
export type MovementDirection = "up" | "down" | "flat";

export interface Movement {
  direction: MovementDirection;
  label: string;
}

export interface Creator {
  id: string;
  slug: string;
  name: string;
  handle?: string;
  avatar: string;
  followersLabel?: string;
  bio?: string;
  location?: string;
  roleLabel?: string;
  weeklyMovementLabel?: string;
  rankLabel?: string;
  movementLabel?: string;
  clipsLabel?: string;
  viewsLabel?: string;
  promptsLabel?: string;
}

export interface Prompt {
  id: string;
  title: string;
  copy: string;
  image?: string;
  savedAtLabel?: string;
  tags: string[];
  tools?: string[];
  workflow?: string[];
}

export interface Clip {
  id: string;
  slug: string;
  title: string;
  poster: string;
  ratio: MediaRatio;
  creator: Creator;
  heat: string;
  movement: Movement;
  video?: string;
  description?: string;
  tags?: string[];
  viewsLabel?: string;
  likesLabel?: string;
  savesLabel?: string;
  durationLabel?: string;
  rankLabel?: string;
  createdLabel?: string;
  prompt?: Prompt;
  relatedPosters?: string[];
  tools?: string[];
  workflow?: string[];
  workflowText?: string;
  breakdown?: Array<{label: string; value: string}>;
}

export interface RankingEntry {
  id: string;
  rankPosition: number;
  clip: Clip;
  reason: string;
  savesLabel: string;
  movement: Movement;
}

export interface Collection {
  id: string;
  title: string;
  image: string;
  countLabel: string;
}

export type SavedItemKind = "clip" | "prompt" | "collection";

export interface SavedItem {
  id: string;
  kind: SavedItemKind;
  clip?: Clip;
  prompt?: Prompt;
  collection?: Collection;
  savedAtLabel?: string;
}

export interface Submission {
  id: string;
  sourceUrl: string;
  platform: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  creatorName: string;
  attributionUrl: string;
  preview: string;
  validationLabel: string;
  rightsConfirmed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  memberSinceLabel: string;
  stats: Array<{ label: string; value: string }>;
  recentlySaved: Clip[];
  collections: Collection[];
  followedCreators: Creator[];
  promptLibrary: Prompt[];
}

export interface ActivityItem {
  id: string;
  title: string;
  message: string;
  thumbnail: string;
  timeLabel: string;
  movement: Movement;
  icon: "rank-up" | "follow" | "save" | "approved" | "message";
}

export interface RankingPulse {
  clipsUp: string;
  clipsDown: string;
  netMovement: string;
}

export interface HomeData {
  hero: Clip;
  liveRankings: Clip[];
  risingNow: Clip[];
  editorPicks: Clip[];
}

export interface RankingsData {
  featured: RankingEntry[];
  rows: RankingEntry[];
}

export interface CreatorDirectoryData {
  categories: string[];
  featured: Creator;
  chart: Creator[];
  chartExpanded: Creator[];
  rising: Creator[];
  newVoices: Creator[];
  mostFollowed: Creator[];
}

export interface CreatorProfileData {
  creator: Creator;
  featuredWork: Clip[];
  recentWork: Clip[];
  prompts: Prompt[];
  tools: string[];
  workflow: Array<{ title: string; description: string }>;
}

export interface ActivityData {
  today: ActivityItem[];
  earlier: ActivityItem[];
  pulse: RankingPulse;
  topMover: string;
  topMoverLabel: string;
}

export interface SavedData {
  savedClips: Clip[];
  collections: Collection[];
  prompts: Prompt[];
  followedCreators: Creator[];
}

export interface SavedPromptsData {
  featured: Prompt;
  prompts: Prompt[];
}

export interface SearchData {
  clips: Clip[];
  creators: Creator[];
}

export interface SubmissionFlowData {
  platforms: string[];
  submission: Submission;
}
