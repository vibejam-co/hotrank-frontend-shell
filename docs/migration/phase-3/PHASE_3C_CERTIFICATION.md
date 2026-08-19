# HOTRANK Phase 3C Certification

## Verdict

**PASS — canonical adapter, secure server boundaries, reversible backend mode,
and fixture/Supabase contract verification complete.**

Remote runtime activation is deliberately configuration-gated: the managed
workspace has no HOTRANK public runtime URL/key, so the default development
mode remains fixture and Supabase mode fails closed until the owner supplies
the exact project environment contract. This is not a fallback to WIZUP or a
different Supabase project.

## Acceptance matrix

| Condition | Result |
|---|---|
| Supabase adapter implemented | PASS |
| Canonical domain mapping complete | PASS |
| Raw rows leak to UI | NONE FOUND |
| Auth/session boundary | PASS; server `getUser`, PKCE callback, refresh middleware |
| Protected mutation boundary | PASS; server-only RPC adapter |
| Client service-role exposure | NONE FOUND |
| Client Management API exposure | NONE FOUND |
| Private prompt exposure | CLOSED; free-only projection mapping |
| Admin escalation | CLOSED; Phase 3B `private.admin_users` authority preserved |
| Fixture adapter | PRESERVED |
| Supabase mode | REVERSIBLE and explicit |
| Dodo | ABSENT from active integration |
| Canonical UI material drift | NONE; no `app/` presentation, `components/`, `styles/`, or media changes |
| Typecheck/tests/security/build | PASS |
| Route smoke | PASS after final rebuild |
| Visual QA | Not run; agent-browser unavailable; final-lock captures preserved |
| WIZUP/Vercel/DNS/payments | UNTOUCHED / NONE |

## Verification notes

The existing Phase 3B remote counts remain the only remote truth used here.
No remote migration or row operation was required. The live Supabase MCP
connector returned permission-denied for read-only project introspection; no
secret or private row dump was attempted. Browser bundle scanning found no
service-role, access-token, secret-key, Management API, or Dodo credential
names in `.next/static`.

The only source-control test-layer change outside new Phase 3C tests is the
boundary scanner's surgical exclusion of server-only `app/api` and `app/auth`
routes from the frozen presentation graph. This keeps server imports out of
the browser boundary while allowing dedicated Phase 3C security scans to
inspect those routes.

The managed environment denied creation of `.git/index.lock`, so no Phase 3C
commit was created. The worktree implementation and verification are complete;
the exact scoped file groups are reported in the handoff.

## Remaining owner gate

Before any production cutover or Invite-30 work, the owner must provide the
HOTRANK public Supabase runtime configuration and perform an authenticated
development-mode smoke against the exact project. Production deployment,
content reset, media migration, and Invite-30 remain out of scope.
