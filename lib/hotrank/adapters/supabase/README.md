# Future Supabase adapter

Phase 2 intentionally contains no Supabase client, environment lookup, query,
authentication, write path, or production connection.

Phase 3 may implement an adapter satisfying
`lib/hotrank/adapters/types.ts` only after the Phase 1 P0 findings are closed,
the remote schema is reconciled, and the required RLS/authorization matrix has
passed. Legacy UI, database row types, and direct browser mutations must not
cross into the canonical domain layer.
