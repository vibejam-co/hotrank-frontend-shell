export type JsonObject = {[key: string]: unknown};

export interface PublicProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  display_name: string | null;
  handle: string | null;
  bio: string | null;
  links: unknown;
}

export interface PublicCreatorRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  badge_status: string | null;
  created_at: string | null;
}

export interface PublicClipRow {
  id: string;
  creator_id: string | null;
  title: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  ai_score: number | null;
  created_at: string | null;
  category: string | null;
  retention_rate: number | null;
  engagement_score: number | null;
  velocity_multiplier: number | null;
  view_count: number | null;
}

export interface PublicRankingRow {
  id: string;
  clip_id: string | null;
  category: string | null;
  rank_position: number | null;
  trend_direction: string | null;
  created_at: string | null;
}

export interface PublicSubmissionRow {
  id: string;
  source_url: string | null;
  platform: string | null;
  external_content_id: string | null;
  embed_url: string | null;
  preview_thumbnail: string | null;
  title: string | null;
  creator_handle: string | null;
  canonical_url: string | null;
  prompt_text: string | null;
  prompt_visibility: "free" | "locked" | null;
  created_at: string | null;
}

export interface PublicFollowCountRow {
  following_id: string;
  follower_count: number | string | null;
}

export interface PublicInteractionCountRow {
  submission_id: string;
  ignite_count?: number | string | null;
  save_count?: number | string | null;
}

export type PublicViewName =
  | "public_profiles"
  | "public_creators"
  | "public_clips"
  | "public_rankings"
  | "public_submissions"
  | "public_follow_counts"
  | "public_ignite_counts"
  | "public_save_counts";

export function asRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}
