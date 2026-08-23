export type ModerationDecision = "APPROVED" | "NEEDS_CHANGES" | "REJECTED" | "ESCALATED";

export type ReviewMethod = "deterministic" | "review_agent" | "independent_adjudicator";

export interface SubmissionReviewInput {
  submissionId?: string;
  title: string;
  sourceUrl: string;
  platform: string;
  creatorHandle: string;
  canonicalUrl: string;
  rightsConfirmed: boolean;
  promptVisibility?: "free" | "locked" | "private";
  promptText?: string;
  aiStack?: string[];
  workflowNotes?: string;
}

export interface MechanicalCheck {
  code: string;
  passed: boolean;
  message: string;
}

export interface ModerationAssessment {
  decision: ModerationDecision;
  rulesetVersion: string;
  reviewMethod: ReviewMethod;
  mechanicalChecks: MechanicalCheck[];
  reasonCodes: string[];
  confidence?: number;
  reviewedAt?: string;
}

export interface ModerationReviewAgent {
  review(input: SubmissionReviewInput, checks: MechanicalCheck[]): Promise<ModerationAssessment>;
}

export interface IndependentAdjudicator {
  adjudicate(input: SubmissionReviewInput, prior: ModerationAssessment): Promise<ModerationAssessment>;
}
