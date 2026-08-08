"use client";

import {useMemo, useState} from "react";
import {CreatorCard} from "@/components/cards";
import {creators,imgs} from "@/lib/data";
import {FollowButton} from "@/components/interaction-controls";

const categories = ["All", "Film", "Music", "Photo", "Art", "Style"];
const risingCreators = [["Tate McRae", imgs.creatorAyo, "Director"], ["Emmanuel Oyeleke", imgs.creatorJordan, "Photographer"], ["Renell Medrano", imgs.creatorCole, "Filmmaker"], ["Chris Saunders", imgs.creatorChris, "Director"], ["Adara Voss", imgs.creatorLiora, "Director"]];

export default function Creators() {
  const [category, setCategory] = useState("All");
  const [chartExpanded, setChartExpanded] = useState(false);
  const chartRows = useMemo(() => chartExpanded ? [...creators, ["Ayo Edebiri", imgs.creatorAyo, "321K Followers"]] : creators, [chartExpanded]);
  return <main className="shell">
    <div className="creator-top">
      <section className="card feature-creator">
        <div className="eyebrow pink">Featured creator</div>
        <h1 className="serif">Liora Avery</h1>
        <p style={{maxWidth:340,fontSize:16}}>Cinematic storyteller blending intimate documentary with poetic visuals. Her work explores memory, identity, and the quiet moments that shape us.</p>
        <div className="meta">◎　Los Angeles, CA</div>
        <div className="stat-row" style={{marginTop:26}}><div className="stat"><strong>78</strong><span>Creator rank　<span className="pink">▲ 4</span></span></div><div className="stat"><strong>412K</strong><span>Followers</span></div></div>
        <FollowButton/>
      </section>
      <section className="card chart">
        <div className="section-head"><span className="label">Creator chart</span><button className="view-all" type="button" onClick={()=>setChartExpanded(value=>!value)}>View {chartExpanded ? "less" : "all"}</button></div>
        <div className="creator-list">{chartRows.map((x,i)=><div className="mini-row" key={x[0]}><span>{i+1}</span><img src={x[1]} alt={`${x[0]} portrait`}/><span className="serif">{x[0]}</span><span className="pink">{i===0 ? "—" : `▲ ${i+3}`}</span><span>{x[2].split(" ")[0]}</span></div>)}</div>
        <div className="chips" style={{marginTop:16}}>{categories.map(item=><button type="button" className={`tag ${category===item ? "active pink" : ""}`} key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      </section>
      <section className="card rising"><div className="section-head"><span className="label">Rising creators</span><button className="view-all" type="button" onClick={()=>setChartExpanded(true)}>View all</button></div>{risingCreators.map((x,i)=><div className="mini-row" key={x[0]}><img src={x[1]} alt={`${x[0]} portrait`}/><span className="serif">{x[0]}<small className="meta" style={{display:'block'}}>{x[2]} · ▲ {15-i*2} this week</small></span><span className="pink">{58+i*5}</span></div>)}</section>
    </div>
    <div className="creator-rails section"><section className="card" style={{padding:16}}><div className="section-head"><h2 className="serif">Most followed</h2><span className="view-all">View all　›</span></div><div className="creator-cards">{creators.slice(0,5).map(x=><CreatorCard key={x[0]} name={x[0]} image={x[1]} followers={x[2]}/>)}</div></section><section className="card" style={{padding:16}}><div className="section-head"><h2 className="serif">New voices</h2><span className="view-all">View all　›</span></div><div className="creator-cards">{creators.slice().reverse().map(x=><CreatorCard key={x[0]} name={x[0]} image={x[1]} followers={x[2]}/>)}</div></section></div>
  </main>;
}
