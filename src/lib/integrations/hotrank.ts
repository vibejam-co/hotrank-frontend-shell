import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Clip, Creator, Platform } from '../../types';

export type AuthGateway = { getUser(): Promise<User | null>; signOut(): Promise<void> };
export type RankingsRepository = { list(): Promise<Clip[]> };
export type ClipsRepository = { get(id: string): Promise<Clip | undefined> };
export type CreatorsRepository = { list(): Promise<Creator[]>; get(id: string): Promise<Creator | undefined> };
export type SavedRepository = { list(userId: string): Promise<string[]>; set(userId: string, clipId: string, saved: boolean): Promise<void> };
export type FollowRepository = { set(userId: string, creatorId: string, following: boolean): Promise<void> };
export type IgniteRepository = { set(userId: string, clipId: string, ignited: boolean): Promise<void> };
export type SubmissionRepository = { create(input: Record<string, unknown>): Promise<{ id: string }> };

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const hotrankConfig = { configured: Boolean(url && key), missing: [!url && 'VITE_SUPABASE_URL', !key && 'VITE_SUPABASE_ANON_KEY'].filter(Boolean) as string[] };
export const supabase: SupabaseClient | null = hotrankConfig.configured ? createClient(url!, key!) : null;
function requireClient(): SupabaseClient { if (!supabase) throw new Error(`HOTRANK backend is unavailable. Missing: ${hotrankConfig.missing.join(', ')}`); return supabase; }

const asPlatform = (value: string | null): Platform => (['X', 'YouTube', 'TikTok', 'Instagram'].includes(value || '') ? value as Platform : 'YouTube');
const asCreator = (row: any): Creator => ({ id: row?.id || 'unknown', name: row?.display_name || row?.username || 'Anonymous creator', handle: row?.handle || row?.username || 'anonymous', avatar: row?.avatar_url || 'https://i.pravatar.cc/160?img=11', bio: row?.bio || 'A creator on HOTRANK.', followers: String(row?.followers_count || 0), rank: Number(row?.rank || 0), clips: Number(row?.clips_count || 0) });
const asClip = (row: any, index: number): Clip => ({ id: row.id, title: row.title || 'Untitled submission', creator: asCreator(row.profiles), image: row.preview_thumbnail || '', rank: Number(row.rank || index + 1), heat: Number(row.heat_score || 0), movement: row.movement === 'up' || row.movement === 'down' ? row.movement : 'flat', change: Number(row.rank_change || 0), category: row.category || 'User Submitted', platform: asPlatform(row.platform), duration: row.duration || '00:00', description: row.creator_notes || '', why: row.editorial_insight || 'Ranking data is still being gathered.', tags: Array.isArray(row.tags) ? row.tags : [], saves: String(row.saves_count || 0), shares: String(row.shares_count || 0), views: String(row.views_count || 0) });

export const rankingsRepository: RankingsRepository = { async list() { const { data, error } = await requireClient().from('submissions').select('*, profiles(*)').in('status', ['pending', 'approved']).order('heat_score', { ascending: false }); if (error) throw error; return (data || []).map(asClip); } };
export const clipsRepository: ClipsRepository = { async get(id) { const { data, error } = await requireClient().from('submissions').select('*, profiles(*)').eq('id', id).maybeSingle(); if (error) throw error; return data ? asClip(data, 0) : undefined; } };
export const creatorsRepository: CreatorsRepository = { async list() { const { data, error } = await requireClient().from('profiles').select('*').order('followers_count', { ascending: false }); if (error) throw error; return (data || []).map(asCreator); }, async get(id) { const { data, error } = await requireClient().from('profiles').select('*').eq('id', id).maybeSingle(); if (error) throw error; return data ? asCreator(data) : undefined; } };
export const authGateway: AuthGateway = { async getUser() { const { data, error } = await requireClient().auth.getUser(); return error ? null : data.user; }, async signOut() { const { error } = await requireClient().auth.signOut(); if (error) throw error; } };
export const savedRepository: SavedRepository = { async list(userId) { const { data, error } = await requireClient().from('saves').select('submission_id').eq('user_id', userId); if (error) throw error; return (data || []).map(row => row.submission_id); }, async set(userId, clipId, saved) { const response = saved ? await requireClient().from('saves').upsert({ user_id: userId, submission_id: clipId }) : await requireClient().from('saves').delete().eq('user_id', userId).eq('submission_id', clipId); if (response.error) throw response.error; } };
export const followRepository: FollowRepository = { async set(userId, creatorId, following) { const response = following ? await requireClient().from('follows').upsert({ follower_id: userId, following_id: creatorId }) : await requireClient().from('follows').delete().eq('follower_id', userId).eq('following_id', creatorId); if (response.error) throw response.error; } };
export const igniteRepository: IgniteRepository = { async set(userId, clipId, ignited) { const response = ignited ? await requireClient().from('ignites').upsert({ user_id: userId, submission_id: clipId }) : await requireClient().from('ignites').delete().eq('user_id', userId).eq('submission_id', clipId); if (response.error) throw response.error; } };
export const submissionRepository: SubmissionRepository = { async create(input) { const { data, error } = await requireClient().from('submissions').insert(input).select('id').single(); if (error) throw error; return data; } };
