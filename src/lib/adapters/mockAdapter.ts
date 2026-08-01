import { clips, creators } from '../../data/mockData';
import type { Adapter } from '../../types';
export const mockAdapter: Adapter = { getRankedClips: async()=>clips, getCreators: async()=>creators, getClip: async(id)=>clips.find(c=>c.id===id) };
