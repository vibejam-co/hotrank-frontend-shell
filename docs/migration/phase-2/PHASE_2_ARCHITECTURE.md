# HOTRANK Phase 2 Architecture

## Scope

Phase 2 adds an insulation layer around the frozen canonical frontend. The runtime source remains the existing fixture/static dataset. No Supabase client, environment variable, payment integration, authentication flow, deployment change, or production write was added.

Baseline: branch `main`, starting commit `6cc14e229f5783fe8cb1f8162be3e1932772bc2b`, canonical lock tag `hotrank-frontend-v1-lock` resolving to `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa`.

## Dependency shape

```text
App routes and interactive components
        |
        v
HOTRANK domain services (lib/hotrank/services)
        |
        v
Typed HotRankDataAdapter contract (lib/hotrank/adapters/types.ts)
        |
        v
Fixture adapter (lib/hotrank/adapters/fixture)
        |
        v
Existing static fixture data (lib/data.ts)
```

Presentation code consumes domain data only. The fixture adapter is the sole intentional bridge to the existing static data module. A future backend adapter replaces that bridge without changing route JSX or CSS.

## Decisions

- Domain types contain presentation-neutral HOTRANK entities and view-model collections.
- Adapter methods are synchronous because the current UI has no loading or error state and must remain visually identical. A future remote adapter may become async as part of a separately approved migration.
- Services centralize the adapter selection and expose named read operations to routes/components.
- Local interaction state (filters, tabs, expanded charts, form steps, copy/save toggles) remains local UI state; it is not persistence.
- `lib/hotrank/adapters/supabase/README.md` is a scaffold boundary only. It contains no client, query, schema, auth, or write implementation.

## Phase 2 file map

- `lib/hotrank/domain/types.ts`: domain entities and screen data shapes.
- `lib/hotrank/adapters/types.ts`: typed adapter contract.
- `lib/hotrank/adapters/fixture/index.ts`: current static-data mapping.
- `lib/hotrank/services/index.ts`: presentation-facing domain operations.
- `lib/hotrank/index.ts`: public HOTRANK boundary exports.
- `tests/hotrank-boundary.mjs`: import and contract guardrails.
- `docs/migration/phase-2/*`: architecture, contracts, flow, and QA record.

## Explicit non-goals

No legacy UI/CSS/component reuse, backend connection, schema migration, auth, payments, DNS, Vercel change, data write, visual redesign, asset replacement, copy rewrite, route change, or async loading state belongs in Phase 2.
