export type Platform = 'X'|'YouTube'|'TikTok'|'Instagram';
export type Movement = 'up'|'down'|'flat';
export interface Creator { id:string; name:string; handle:string; avatar:string; bio:string; followers:string; rank:number; clips:number; verified?:boolean; }
export interface Clip { id:string; title:string; creator:Creator; image:string; rank:number; heat:number; movement:Movement; change:number; category:string; platform:Platform; duration:string; description:string; why:string; tags:string[]; saves:string; shares:string; views:string; }
export interface Rail { id:string; title:string; eyebrow?:string; clips:Clip[]; }
export interface Adapter { getRankedClips():Promise<Clip[]>; getCreators():Promise<Creator[]>; getClip(id:string):Promise<Clip|undefined>; }
