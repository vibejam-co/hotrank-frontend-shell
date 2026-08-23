# HOTRANK PostHog Event Specification

Status: specification only. PostHog is not installed or configured by this
mission and does not block deployment.

## Event vocabulary

| Event | Safe properties | Explicit exclusions |
| --- | --- | --- |
| `sign_up_completed` | provider, surface | email, user ID, tokens |
| `sign_in_completed` | provider, surface | email, OAuth code, session data |
| `creator_profile_viewed` | creator slug, surface | private profile fields |
| `clip_viewed` | clip slug, surface | prompt text, unpublished content |
| `ranking_vote_cast` | clip slug, category | private identity, score internals |
| `clip_saved` | clip slug | cookies, tokens |
| `creator_followed` | creator slug | private profile fields |
| `search_performed` | query length, result count | raw sensitive query text |
| `submission_started` | surface | draft contents |
| `submission_completed` | platform, validation outcome | prompt contents, private notes |
| `submission_approved` | platform, ruleset version | moderation reasoning |
| `submission_needs_changes` | reason codes | hidden model reasoning |
| `prompt_viewed` | clip slug, visibility | prompt contents |
| `share_clicked` | content kind, slug | private content |

Never send passwords, OAuth codes, access/refresh tokens, JWTs, cookies, API
keys, private moderation notes, unpublished private content, prompt contents,
or payment credentials. If session replay is enabled later, mask Auth inputs
and exclude payment-sensitive surfaces.
