# HOTRANK Phase 2 Adapter Contract

The interface lives in `lib/hotrank/adapters/types.ts` as `HotRankDataAdapter`.

## Read operations

```text
getHome()
getRankings()
getClipDetail(id, expanded)
getCreators()
getCreator(slug)
getActivity()
getProfile()
getSaved()
getSavedPrompts()
getSearch()
getSubmissionFlow()
```

Each operation returns a typed domain read model. No method accepts or returns a UI component, JSX value, raw fixture tuple, database row, Supabase type, or `any`.

## Fixture adapter

`lib/hotrank/adapters/fixture/index.ts` implements the contract and maps the current `lib/data.ts` tuples plus existing inline screen fixtures into domain entities. It is the only layer permitted to know the legacy static-data representation during Phase 2. The fixture remains the runtime source, so the visible output and interaction model remain unchanged.

## Future backend replacement

After the documented P0 findings are closed and schema/RLS/auth decisions are approved, a backend adapter may implement the same contract. That work must add explicit loading/error semantics if remote latency is introduced, map backend rows into domain entities, and preserve the presentation dependency rule. Phase 2 does not create that adapter or connect to any service.

## Guardrails

- Services depend on the adapter contract, not on a backend SDK.
- Presentation imports services/domain types, never `lib/data.ts`.
- The fixture adapter has no environment-variable or client initialization path.
- Adapter methods are read-only in this phase.
