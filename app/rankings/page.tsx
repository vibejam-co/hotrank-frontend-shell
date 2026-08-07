import Link from "next/link";
import {Flame} from "lucide-react";

const featured = [
  ["The Last Blue", "/media/ranking-last-blue.png", "Oceanic Society", "92", "2", "16:9"],
  ["Glass Ceilings", "/media/ranking-glass.png", "Maya Chen", "98", "1", "4:5"],
  ["Late Nights in the City", "/media/ranking-late.png", "Kael Johnson", "89", "3", "9:16"]
];
const rows = [
  ["Glass Ceilings", "/media/ranking-glass.png", "Maya Chen", "Powerful storytelling, strong shares", "98", "12.4K", "—"],
  ["The Last Blue", "/media/ranking-last-blue.png", "Oceanic Society", "Stunning visuals, viral across X", "92", "8.7K", "▲ 1"],
  ["Late Nights in the City", "/media/ranking-late.png", "Kael Johnson", "Relatable + platform algorithm boost", "89", "7.1K", "▼ 1"],
  ["Where Earth Breathes", "/media/mountain-scene.png", "Wildscope", "Beautiful + educational", "85", "6.3K", "▲ 2"],
  ["Tokyo Street Bites", "/media/clip-electric.png", "Hana Eats", "Craveable content", "82", "5.8K", "▲ 3"],
  ["Run Anyway", "/media/clip-long-way.png", "Miles McKnight", "Motivational + highly shared", "78", "4.9K", "▼ 2"],
  ["Fading Memories", "/media/creator-cole.png", "Claire Elise", "Emotional impact", "75", "4.5K", "—"],
  ["The Edge of Everything", "/media/clip-after-midnight.png", "NovaLab", "Curiosity + saves", "73", "4.2K", "▲ 1"],
  ["Good Boy", "/media/creator-liora.png", "Pawsitive", "Heartwarming + shareable", "71", "3.9K", "▲ 4"],
  ["Letters to Tomorrow", "/media/creator-ayo.png", "Samira El", "Unique concept, growing audience", "69", "3.6K", "▼ 1"]
];

export default function Rankings() {
  return <main className="shell">
    <div className="filterbar">
      {[["category","Category","All Categories"],["range","Time range","Last 7 Days"],["format","Format","All Formats"],["length","Length","Any Length"],["heat","Heat threshold","Medium"]].map(([id,label,value])=><label className="filter-field" key={id}><span className="label">{label}</span><select id={id} className="select" defaultValue={value}><option>{value}</option><option>All</option></select></label>)}
      <button className="btn" type="button">Clear</button><button className="btn primary" type="button">Apply Filters</button>
    </div>
    <div className="featured-ranks">{featured.map((x,i)=><Link href={`/clips/${i===1?"glass-ceilings":i===0?"the-last-blue":"late-nights-in-the-city"}`} className={`card featured-rank ${i===1?"featured-rank-main":""}`} key={x[0]}><div className="media"><img src={x[1]} alt={`${x[0]} featured media`}/><span className="tag format-tag">{x[5]}</span></div><div><span className={`rank-badge rank-${x[4]}`}>{x[4]}</span><h2 className="serif">{x[0]}</h2><div>{x[2]} ◆</div><p className="meta">{i===1?"A raw look at the invisible barriers still shaping ambition.":i===0?"Stunning visuals, viral across X":"Relatable + platform algorithm boost"}</p><div className="heat" style={{marginTop:18}}>HEAT {x[3]} <Flame size={14}/></div></div></Link>)}</div>
    <div className="ranking-content"><div className="table"><div className="table-row head"><span>#</span><span>Title</span><span>Creator</span><span>Why trending</span><span>Heat</span><span>Saves</span><span>Movement</span></div>{rows.map((x,i)=><Link href={`/clips/${x[0].toLowerCase().replace(/[^a-z0-9]+/g,"-")}`} className="table-row" key={x[0]}><span className="rank-num">{String(i+1).padStart(2,"0")}</span><span className="table-title"><img className="table-thumb" src={x[1]} alt={`${x[0]} thumbnail`}/>{x[0]}</span><span>{x[2]} ◆</span><span className="muted">{x[3]}</span><span className="heat">{x[4]} <Flame size={12}/></span><span>{x[5]}</span><span className={x[6].startsWith("▼")?"movement down":"movement up"}>{x[6]}</span></Link>)}</div><aside className="side-stack"><div className="side-box"><h3>⌁ FASTEST RISING <span className="view-all">View All</span></h3>{rows.slice(4,9).map((x,i)=><div className="mini-row" key={x[0]}><span>{i+1}</span><img src={x[1]} alt={`${x[0]} thumbnail`}/><span className="serif">{x[0]}</span><strong>▲ {12-i*2}</strong></div>)}</div><div className="side-box"><h3>♡ MOST SAVED <span className="view-all">View All</span></h3>{rows.slice(0,5).map((x,i)=><div className="mini-row" key={x[0]}><span>{i+1}</span><span className="serif">{x[0]}</span><span>{x[5]}</span></div>)}</div></aside></div>
  </main>;
}
