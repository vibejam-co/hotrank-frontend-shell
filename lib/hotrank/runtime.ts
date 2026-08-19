import "server-only";

export const HOTRANK_SUPABASE_PROJECT_REF = "csuejshnycgbfvtjbxoq";
export const HOTRANK_SUPABASE_URL = `https://${HOTRANK_SUPABASE_PROJECT_REF}.supabase.co`;

export type HotRankBackendMode = "fixture" | "supabase";

export class HotRankConfigurationError extends Error {
  readonly code = "HOTRANK_CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "HotRankConfigurationError";
  }
}

export class HotRankDataError extends Error {
  readonly code: "HOTRANK_TIMEOUT" | "HOTRANK_READ_FAILED" | "HOTRANK_MUTATION_FAILED" | "HOTRANK_NOT_FOUND";

  constructor(code: HotRankDataError["code"], message: string) {
    super(message);
    this.name = "HotRankDataError";
    this.code = code;
  }
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new HotRankConfigurationError(`${name} is required for Supabase mode`);
  return value;
}

function validateProjectUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HotRankConfigurationError("NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== `${HOTRANK_SUPABASE_PROJECT_REF}.supabase.co`) {
    throw new HotRankConfigurationError(`Supabase URL must target ${HOTRANK_SUPABASE_PROJECT_REF}`);
  }
  return parsed.toString().replace(/\/$/, "");
}

export function getHotRankBackendMode(): HotRankBackendMode {
  const configured = process.env.HOTRANK_BACKEND_MODE?.trim();
  if (!configured || configured === "fixture") return "fixture";
  if (configured === "supabase") return "supabase";
  throw new HotRankConfigurationError("HOTRANK_BACKEND_MODE must be explicitly set to fixture or supabase");
}

export function requireSupabasePublicEnv(): {url: string; publishableKey: string} {
  const url = validateProjectUrl(required("NEXT_PUBLIC_SUPABASE_URL"));
  const publishableKey = required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (publishableKey.startsWith("sb_secret_") || publishableKey.startsWith("service_role")) {
    throw new HotRankConfigurationError("A server secret cannot be used as the public Supabase key");
  }
  return {url, publishableKey};
}

export function requireSupabaseServerEnv(): {url: string; publishableKey: string; serviceRoleKey: string} {
  const {url, publishableKey} = requireSupabasePublicEnv();
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey === publishableKey || serviceRoleKey.startsWith("sb_publishable_")) {
    throw new HotRankConfigurationError("SUPABASE_SERVICE_ROLE_KEY must be a server-only key");
  }
  return {url, publishableKey, serviceRoleKey};
}

export function getHotRankTimeoutMs(): number {
  const raw = process.env.HOTRANK_REMOTE_TIMEOUT_MS?.trim();
  if (!raw) return 7000;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1000 || value > 30000) {
    throw new HotRankConfigurationError("HOTRANK_REMOTE_TIMEOUT_MS must be an integer between 1000 and 30000");
  }
  return value;
}
