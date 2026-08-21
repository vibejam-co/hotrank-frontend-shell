import assert from "node:assert/strict";
import fs from "node:fs";

const signIn = fs.readFileSync("app/auth/sign-in/page.tsx", "utf8");
const callback = fs.readFileSync("app/auth/callback/route.ts", "utf8");
const client = fs.readFileSync("lib/supabase/client.ts", "utf8");
const header = fs.readFileSync("components/account-control.tsx", "utf8");

assert.match(signIn, /Continue with Google/);
assert.match(signIn, /signInWithOAuth\(\{provider: "google"/);
assert.match(signIn, /new URL\("\/auth\/callback", window\.location\.origin\)\.toString\(\)/);
assert.doesNotMatch(signIn, /redirectTo[^\n]*\?next=/);
assert.doesNotMatch(signIn, /hotrank\.xyz|vercel\.app|hot-rank-ai/i);
assert.match(signIn, /Google sign-in is unavailable/);
assert.match(signIn, /type="password"/);
assert.match(callback, /exchangeCodeForSession\(code\)/);
assert.match(callback, /startsWith\("\/"\)/);
assert.match(callback, /!requestedNext\.startsWith\("\/\/"\)/);
assert.match(client, /createBrowserClient/);
assert.doesNotMatch(signIn, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ACCESS_TOKEN|SUPABASE_SECRET_KEY|SUPABASE_DB_PASSWORD|DODO|MANAGEMENT_API/i);
assert.match(header, /\/api\/auth\/session/);
assert.match(header, /\/api\/auth\/sign-out/);

const callbackForOrigin = (origin) => new URL("/auth/callback", origin).toString();
assert.equal(callbackForOrigin("http://localhost:3000"), "http://localhost:3000/auth/callback");
assert.equal(callbackForOrigin("https://hotrank.xyz"), "https://hotrank.xyz/auth/callback");
assert.equal(new URL(callbackForOrigin("http://localhost:3000")).pathname, "/auth/callback");

console.log("HOTRANK Phase 3C Google Auth contract passed");
