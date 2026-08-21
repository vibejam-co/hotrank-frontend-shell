import assert from "node:assert/strict";
import fs from "node:fs";

const header = fs.readFileSync("components/header.tsx", "utf8");
const account = fs.readFileSync("components/account-control.tsx", "utf8");
const signIn = fs.readFileSync("app/auth/sign-in/page.tsx", "utf8");

assert.match(header, /<AccountControl\/>/);
assert.doesNotMatch(header, /creator-liora|<img[^>]+avatar/);
assert.match(account, /\/api\/auth\/session/);
assert.match(account, /\/api\/auth\/sign-out/);
assert.match(account, /setUser\(null\)/);
assert.match(account, /role="menu"/);
assert.match(account, /key === "Escape"/);
assert.match(signIn, /\/api\/auth\/sign-in/);
assert.doesNotMatch(account, /service_role|SUPABASE_ACCESS_TOKEN|SUPABASE_SECRET_KEY/);

console.log("HOTRANK Phase 3C Auth UX contract passed");
