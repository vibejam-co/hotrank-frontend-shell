import type { Clip, Creator } from '../types';
const art=[
 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1534791547706-7b5c59a5a39a?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=85'
];
export const creators:Creator[]=[
 {id:'eliot',name:'Eliot Marsh',handle:'eliot.marsh',avatar:'https://i.pravatar.cc/160?img=12',bio:'Cinematic storyteller exploring memory, nature and the edges of impossible worlds.',followers:'128K',rank:1,clips:48,verified:true},
 {id:'maya',name:'Maya Koval',handle:'maya.koval',avatar:'https://i.pravatar.cc/160?img=47',bio:'Quiet worlds, strange weather and images that stay with you.',followers:'86K',rank:2,clips:31,verified:true},
 {id:'leah',name:'Leah Park',handle:'leahpark',avatar:'https://i.pravatar.cc/160?img=32',bio:'Stories about the signal beneath the noise.',followers:'64K',rank:7,clips:22},
 {id:'julian',name:'Julian Bryk',handle:'julian.bryk',avatar:'https://i.pravatar.cc/160?img=68',bio:'Minimal cinema for maximum feeling.',followers:'52K',rank:12,clips:19}
];
const base=[['The Last Bloom',98.4,'up',12,'Story','1:18','A botanical dream about memory, growth and the things we carry forward.','A breathtaking mix of emotional clarity and visual poetry.'],['Synthetic Weather',92.1,'up',8,'Sci-Fi','0:42','A storm rolls over a world that no longer remembers rain.','Its scale is huge, but the small human moment makes it feel close.'],['A House With No Rooms',87.6,'up',5,'Story','0:58','A quiet walk through a home that keeps changing its mind.','Simple framing, perfect pacing, and an ending people want to discuss.'],['After the Signal',82.3,'down',3,'Sci-Fi','1:05','A lonely receiver waits for an answer beneath an unfamiliar sky.','A quiet moment of connection in a vast, unknown world.'],['Night Shift',78,'up',4,'Music','0:36','Neon streets, one last train, and a city that will not sleep.','Fast rhythm, strong atmosphere and an unforgettable final frame.'],['Echoes of Tomorrow',74.2,'down',2,'Animation','0:51','A small figure walks through the memory of a frozen future.','Huge world, small hero. The contrast keeps viewers watching.'],['Overgrown',72.1,'up',23,'Nature','0:47','Nature takes back a place built for people.','A calming visual idea with a world that feels fully lived in.'],['Weightless',71.3,'up',19,'Sci-Fi','1:18','A figure meets an impossible stone floating above a quiet plain.','The image is instantly clear, strange and impossible to forget.']];
export const clips:Clip[]=base.map((x,i)=>({id:`clip-${i+1}`,title:x[0] as string,heat:x[1] as number,movement:x[2] as 'up'|'down',change:x[3] as number,category:x[4] as string,duration:x[5] as string,description:x[6] as string,why:x[7] as string,rank:i+1,image:art[i],creator:creators[i%creators.length],platform:(['YouTube','TikTok','Instagram','X'] as const)[i%4],tags:['cinematic','ai film',i%2?'sci-fi':'story'],saves:`${(18-i*1.7).toFixed(1)}K`,shares:`${(3.1-i*.25).toFixed(1)}K`,views:`${(142-i*9)}K`}));

/** Replaces the fixture catalog in-place so the sealed presentation can consume live adapter data. */
export function replaceCatalog(nextClips: Clip[], nextCreators: Creator[]) {
  creators.splice(0, creators.length, ...nextCreators);
  clips.splice(0, clips.length, ...nextClips.map((clip) => ({ ...clip, creator: nextCreators.find((creator) => creator.id === clip.creator.id) || clip.creator })));
}
