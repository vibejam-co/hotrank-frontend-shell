# HOTRANK Moderation System V1

Status: production foundation prepared; provider activation remains a gated
owner operation.

## Boundary

Moderation answers whether a submission is eligible to enter HOTRANK. It does
not decide whether creative work is fashionable, beautiful, or likely to rank.
Ranking remains a separate publication/heat system.

## Decision pipeline

1. Deterministic intake checks validate required title, source URL, supported
   platform, creator attribution, canonical attribution URL, rights
   declaration, and private-prompt rules.
2. A narrow review-agent interface may inspect permitted media and metadata for
   safety, impersonation, spam, duplicate, attribution, rights, and AI-metadata
   concerns. It must return concise decision facts, not hidden reasoning.
3. Borderline or low-confidence assessments can be sent to an independent
   adjudicator interface.

Final decisions are `APPROVED`, `NEEDS_CHANGES`, `REJECTED`, and `ESCALATED`.
`ESCALATED` fails closed: it is not public and does not enter rankings.

## Audit record

The prepared additive migration records submission ID, decision, ruleset
version, review method, mechanical checks, concise agent assessment, optional
confidence, reason codes, and review timestamp in a private audit table. Raw
chain-of-thought is never stored.

## Authority

All review writes use a server-only RPC and protected administrator authority.
Browser input cannot choose moderation status, grant admin, change ranking
score, alter payouts, or bypass protected RPC boundaries. Creator submission
intake always uses the authenticated server actor and starts pending.

## Provider gate

No approved model/provider credential is present in this repository. Until a
review provider and adjudicator are activated, the review contract returns
`ESCALATED` rather than auto-approving content. Founding Creator rollout and
broad public submission opening remain closed until that gate is satisfied.
