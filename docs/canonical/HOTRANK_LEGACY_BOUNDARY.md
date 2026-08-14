# HOTRANK Legacy Boundary Policy

Status: Phase 0 quarantine boundary

## Classification

Any legacy HOTRANK implementation is a **BACKEND-CAPABILITY SOURCE ONLY**.

Legacy systems may later contribute:

- schema understanding;
- authentication capability;
- account structures;
- stored creator data;
- stored clip data;
- submission logic;
- saved and follow relationships;
- payment capability;
- deployment configuration; and
- infrastructure configuration.

## Explicitly prohibited visual authority

Legacy systems may not contribute:

- old CSS;
- old React components;
- old layout systems;
- old navigation;
- old logos or wordmarks;
- old cards;
- old page shells;
- old responsive behavior; or
- old visual tokens.

The current HOTRANK frontend remains the only presentation authority. Similar
names, routes, database tables, payloads, or existing component abstractions do
not justify changing its geometry or visual hierarchy.

## Future migration boundary

Future backend work must cross this boundary through adapters and services:

```text
canonical components
        ↓
frontend domain models
        ↓
service interfaces
        ↓
backend adapters
        ↓
Supabase / legacy infrastructure
```

The prohibited shortcut is:

```text
component
        ↓
raw legacy database shape
```

Adapters may normalize legacy naming, nullability, pagination, permissions,
and persistence details into the existing frontend domain contract. They may
not force backend-shaped fields, routes, shells, cards, tokens, or responsive
rules into the presentation layer.

## Review gate

Before a migration PR is accepted, reviewers must be able to answer yes to all
of the following:

1. The PR changes no canonical visual surface without a separately approved
   frontend design change.
2. Data enters through a domain model and service interface.
3. Legacy-specific fields and error shapes stop at the adapter boundary.
4. Canonical route screenshots remain within the approved visual baseline.
5. Responsive and interaction checks are rerun for affected routes.

This phase quarantines legacy implementations; it does not delete, reset,
rewrite, or migrate them.
