import type {MechanicalCheck, SubmissionReviewInput} from "@/lib/hotrank/moderation/types";

export const MODERATION_RULESET_VERSION = "hotrank-v1-deterministic-2026-08-23";
export const SUPPORTED_SUBMISSION_PLATFORMS = ["YouTube", "TikTok", "Instagram"] as const;

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function check(code: string, passed: boolean, message: string): MechanicalCheck {
  return {code, passed, message};
}

export function runDeterministicChecks(input: SubmissionReviewInput): MechanicalCheck[] {
  const platform = input.platform.trim();
  const promptVisibility = input.promptVisibility ?? "free";
  return [
    check("TITLE_REQUIRED", input.title.trim().length > 0 && input.title.trim().length <= 140, "Add a title up to 140 characters."),
    check("SOURCE_URL_VALID", validHttpUrl(input.sourceUrl), "Add a valid HTTP(S) source URL."),
    check("PLATFORM_SUPPORTED", SUPPORTED_SUBMISSION_PLATFORMS.includes(platform as typeof SUPPORTED_SUBMISSION_PLATFORMS[number]), "Choose a supported source platform."),
    check("CREATOR_ATTRIBUTION_REQUIRED", input.creatorHandle.trim().length > 0, "Add creator attribution before submitting."),
    check("CANONICAL_URL_VALID", validHttpUrl(input.canonicalUrl), "Add a valid canonical attribution URL."),
    check("RIGHTS_DECLARATION_REQUIRED", input.rightsConfirmed === true, "Confirm that you have the rights to share this work."),
    check("PRIVATE_PROMPT_NOT_PUBLIC", promptVisibility === "free" || promptVisibility === "locked" || promptVisibility === "private", "Choose a valid prompt visibility."),
    check("LOCKED_PROMPT_HAS_CONTENT", promptVisibility === "free" || Boolean(input.promptText?.trim()), "Add prompt content before marking it locked or private."),
  ];
}

export function validateSubmissionForIntake(input: SubmissionReviewInput): {ok: true; checks: MechanicalCheck[]} | {ok: false; checks: MechanicalCheck[]; reasons: string[]} {
  const checks = runDeterministicChecks(input);
  const failed = checks.filter((item) => !item.passed);
  return failed.length ? {ok: false, checks, reasons: failed.map((item) => item.code)} : {ok: true, checks};
}
