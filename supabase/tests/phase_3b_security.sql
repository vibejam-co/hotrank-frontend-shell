-- Run with `supabase db test --linked` when a database URL is available.
-- These aggregate privilege assertions do not select or mutate application rows.

select plan(18);
select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anon cannot read profiles base table');
select ok(not has_table_privilege('anon', 'public.profiles', 'update'), 'anon cannot update profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'update'), 'authenticated cannot update profiles directly');
select ok(not has_table_privilege('authenticated', 'public.submissions', 'insert'), 'authenticated cannot insert submissions directly');
select ok(not has_table_privilege('authenticated', 'public.submissions', 'update'), 'authenticated cannot update submissions directly');
select ok(not has_table_privilege('authenticated', 'public.rankings', 'insert'), 'authenticated cannot write rankings');
select ok(not has_table_privilege('authenticated', 'public.rankings', 'update'), 'authenticated cannot update rankings');
select ok(not has_table_privilege('authenticated', 'public.prompt_unlocks', 'select'), 'authenticated cannot read prompt unlocks');
select ok(not has_table_privilege('authenticated', 'public.saves', 'select'), 'authenticated cannot read raw saves');
select ok(not has_table_privilege('authenticated', 'public.follows', 'select'), 'authenticated cannot read raw follows');
select ok(has_table_privilege('anon', 'public.public_profiles', 'select'), 'anon can read safe profiles projection');
select ok(not has_table_privilege('anon', 'public.public_profiles', 'update'), 'anon cannot update safe profiles projection');
select ok(has_table_privilege('anon', 'public.public_submissions', 'select'), 'anon can read safe submission projection');
select ok(not has_table_privilege('anon', 'public.public_submissions', 'update'), 'anon cannot update safe submission projection');
select ok(not has_function_privilege('anon', 'public.hotrank_update_profile(uuid,uuid,text,text,text,text,text,jsonb)', 'execute'), 'anon cannot execute profile mutation RPC');
select ok(not has_function_privilege('authenticated', 'public.hotrank_moderate_submission(uuid,uuid,text)', 'execute'), 'authenticated cannot execute moderation RPC');
select ok(not has_function_privilege('authenticated', 'public.hotrank_upsert_ranking(uuid,uuid,text,integer,text)', 'execute'), 'authenticated cannot execute ranking RPC');
select ok(not has_schema_privilege('authenticated', 'private', 'usage'), 'authenticated cannot use private authorization schema');
select * from finish();
