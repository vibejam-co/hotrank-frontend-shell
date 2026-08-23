export interface ProfileUpdateInput {
  profileId: string;
  username: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  links: string[];
}

export interface SubmissionCreateInput {
  sourceUrl: string;
  platform: string;
  externalContentId?: string;
  embedUrl?: string;
  previewThumbnail?: string;
  creatorNotes?: string;
  title: string;
  creatorHandle?: string;
  canonicalUrl?: string;
  promptText?: string;
  promptVisibility?: "free" | "locked" | "private";
  promptPrice?: number;
  aiStack?: string[];
  workflowNotes?: string;
  recipeIncluded?: boolean;
  aiStackIncluded?: boolean;
  workflowNotesIncluded?: boolean;
  rightsConfirmed?: boolean;
}

export interface SubmissionUpdateInput extends SubmissionCreateInput {
  submissionId: string;
}

export interface InteractionInput {
  submissionId?: string;
  followingId?: string;
}

export interface ModerationInput {
  submissionId: string;
  status: "pending" | "approved" | "rejected" | "archived";
}

export interface ModerationReviewInput {
  submissionId: string;
  decision: "APPROVED" | "NEEDS_CHANGES" | "REJECTED" | "ESCALATED";
  reviewRulesetVersion: string;
  reviewMethod: "deterministic" | "review_agent" | "independent_adjudicator";
  mechanicalChecks: unknown[];
  agentAssessment?: Record<string, unknown> | null;
  confidence?: number | null;
  reasonCodes: string[];
}

export interface RankingUpsertInput {
  clipId: string;
  category: string;
  rankPosition: number;
  trendDirection: string;
}
