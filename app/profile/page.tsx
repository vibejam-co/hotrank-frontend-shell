import {PromptCard} from "@/components/cards";
import {imgs} from "@/lib/data";
import {LocalTabs, FollowButton} from "@/components/interaction-controls";
import {ProfileActions} from "@/components/profile-actions";

const stats = [["287", "Saved"], ["156", "Following"], ["23", "Submissions"], ["12", "Collections"]];
const follows = ["Rafael Varona", "Jiyun Park", "Noah Caldwell", "Mina West"];

export default function Profile() {
  return <main className="shell">
    <div className="profile-identity">
      <img className="avatar" style={{width: 180, height: 180}} src={imgs.portrait} alt="Lena Marlowe"/>
      <div>
        <h1 className="page-title serif" style={{marginBottom: 8}}>Lena Marlowe</h1>
        <div style={{fontSize: 18}}>@lenamarlowe</div>
        <div className="meta">Member since March 2023</div>
        <div className="stat-row" style={{marginTop: 24}}>{stats.map(x => <div className="stat" key={x[1]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</div>
      </div>
      <ProfileActions/>
    </div>
    <LocalTabs items={["SAVED", "FOLLOWING", "SUBMISSIONS", "ACTIVITY"]} initial="SAVED"/>
    <div className="profile-lower section">
      <div>
        <div className="section-head"><h2 className="serif">Recently Saved</h2><span className="view-all">View all</span></div>
        <div className="work-grid">{[imgs.neon, imgs.mountain, imgs.portrait, imgs.forest, imgs.city, imgs.desert].map((x, i) => <img key={`${x}-${i}`} src={x} alt={`Recently saved creative ${i + 1}`}/>)}</div>
      </div>
      <div>
        <div className="section-head"><h2 className="serif">Collections</h2><span className="view-all">View all</span></div>
        {["Moody Light", "Still / Life", "The Sea, The Land"].map((x, i) => <div className="card collection-card" key={x} style={{marginBottom: 12}}><img src={[imgs.portrait, imgs.forest, imgs.mountain][i]} alt={`${x} collection`}/><div><h3 className="serif">{x}</h3><div className="meta">{41 - i * 13} items</div></div></div>)}
        <div className="view-all pink" style={{marginTop: 16}}>＋ New Collection</div>
      </div>
      <div>
        <div className="section-head"><h2 className="serif">Creators You Follow</h2><span className="view-all">View all</span></div>
        {follows.map((x, i) => <div className="follow-row" key={x}><img src={[imgs.avatar, imgs.portrait, imgs.neon, imgs.forest][i]} alt={`${x} avatar`}/><span>{x}<small className="meta" style={{display: "block"}}>@{x.toLowerCase().replace(" ", "")}</small></span><FollowButton label="Following"/></div>)}
        <div className="discover-link pink">Discover more creators</div>
      </div>
      <div>
        <div className="section-head"><h2 className="serif">Prompt Library</h2><span className="view-all">View all</span></div>
        <PromptCard copy="A lone figure stands at the edge of a cliff, looking out over a vast, foggy sea at dawn."/>
        <PromptCard title="Portrait in soft window light" copy="Portrait of a woman in soft window light, black and white, 35mm film look."/>
      </div>
    </div>
  </main>;
}
