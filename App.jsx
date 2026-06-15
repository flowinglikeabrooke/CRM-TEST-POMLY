import { useState, useEffect } from "react";
import {
  Calendar as CalIcon, ListChecks, Activity, AlertTriangle,
  Film, Sparkles, ChevronLeft, ChevronRight, X, Circle, Clock, User,
  CheckCircle2, Search, ChevronDown, Plus, Instagram, Facebook, Home,
} from "lucide-react";

/* ===========================================================
   POMLY — Client Delivery CRM (working prototype)
   Matches the real Pomly hub + posting calendar; adds the
   delivery-health layer from the spec on top.
=========================================================== */
const TODAY = new Date(2026, 5, 15); // Jun 15 2026

const T = {
  bg0:"#120c2b", bg1:"#1a1140", nav:"#0e0a22",
  surface:"rgba(40,26,82,.42)", surface2:"rgba(48,32,96,.6)",
  cell:"#171232", cellBorder:"rgba(150,130,210,.14)",
  line:"rgba(167,139,250,.16)", line2:"rgba(167,139,250,.3)",
  violet:"#8b5cf6", violetBright:"#a78bfa", deep:"#7c3aed",
  text:"#f3efff", muted:"#b3a6d8", faint:"#8073ad",
  green:"#34d399", teal:"#2dd4bf", yellow:"#fbbf24", red:"#fb7185", slate:"#94a3b8",
  ig:"#e1306c", fb:"#1877f2",
};

const STAGES=["Not Started","Planning","In Production","Internal Review","Client Review","Approved","Scheduled","Complete"];
const REEL_STATUSES=["Direction Needed","Footage Needed","Script Needed","Ready to Build","In Build","Review","Scheduled","Complete"];
const DEP_REASONS=["Waiting on client assets","Waiting on shoot footage","Waiting on compliance approval","Waiting on internal review","Waiting on client approval","Waiting on Ben sync","Waiting on Molly direction"];

const d=(y,m,day)=>new Date(y,m-1,day);
const fmt=(dt)=>dt?`${dt.getMonth()+1}/${dt.getDate()}`:"—";
const fmtLong=(dt)=>dt?dt.toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—";
const daysBetween=(a,b)=>Math.round((b-a)/86400000);
const iso=(dt)=>dt?`${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`:null;

/* ---- clients: relationship layer (Pomly) + delivery layer (spec) ---- */
const C = (o)=>({ relationship:"Customer", sentiment:"", ...o });
const CLIENTS=[
  C({id:"kitc",name:"Kid in the Corner",short:"KITC",color:"#f472b6",owner:"Brooke",handle:"@kidinthecorner",sentiment:"Positive",
     pkg:"Social content",deliverables:"3 posts/week + reels + LinkedIn captions",assetsThrough:d(2026,9,1),captionsThrough:d(2026,9,1),scheduledThrough:d(2026,7,15),lastTouch:d(2026,6,10),nextTouch:d(2026,6,20),nextAction:"Send July/August assets + build Zach Packs recap reel",risk:"Reels need a repeatable format"}),
  C({id:"aurenza",name:"AURENZA",short:"AURENZA",color:"#f59e0b",owner:"Brooke",handle:"@aurenzabuilders",sentiment:"Positive",
     pkg:"Luxury home builder",deliverables:"Reels + statics + captions",assetsThrough:d(2026,8,1),captionsThrough:d(2026,9,2),scheduledThrough:d(2026,6,29),lastTouch:d(2026,6,9),nextTouch:d(2026,6,19),nextAction:"Build 6/29 reel + complete August assets by 6/19",risk:"Reel workflow"}),
  C({id:"dom",name:"Dominique Del Prete",short:"DOM",color:"#38bdf8",owner:"Brooke",handle:"@domdelprete",sentiment:"At Risk",
     pkg:"Real estate agent",deliverables:"3x/week posts + reels",assetsThrough:d(2026,8,3),captionsThrough:d(2026,7,31),scheduledThrough:d(2026,6,26),lastTouch:d(2026,6,11),nextTouch:d(2026,6,17),nextAction:"Finish August captions + build 6/26 reel",risk:"Reels open for 6/26, 7/24, 7/31"}),
  C({id:"zenith",name:"Zenith Coaching Academy",short:"ZENITH",color:"#34d399",owner:"Brooke",handle:"@zenithcoachingaca",sentiment:"Very Positive",
     pkg:"Coaching",deliverables:"Posts + captions + reels",assetsThrough:d(2026,8,1),captionsThrough:d(2026,7,31),scheduledThrough:d(2026,6,28),lastTouch:d(2026,6,8),nextTouch:d(2026,6,21),nextAction:"Sync with Ben on shoot footage",risk:"August captions + reels blocked"}),
  C({id:"omniux",name:"OMNIUX",short:"OMNIUX",color:"#8b5cf6",owner:"Brooke",handle:"@omniux",relationship:"Partner",
     pkg:"Agency social",deliverables:"Weekly posts + captions",assetsThrough:d(2026,7,10),captionsThrough:d(2026,7,31),scheduledThrough:d(2026,6,30),lastTouch:d(2026,6,12),nextTouch:d(2026,6,18),nextAction:"Build July assets chronologically",risk:"Largest active runway gap"}),
  C({id:"croque",name:"Croque Famous Sandwiches",short:"CROQUE",color:"#fbbf24",owner:"Ben",handle:"@croqueandwich",sentiment:"Very Positive",
     pkg:"Social",deliverables:"Posts + reels",assetsThrough:d(2026,8,10),captionsThrough:d(2026,8,1),scheduledThrough:d(2026,6,30),lastTouch:d(2026,6,10),nextTouch:d(2026,6,24),nextAction:"Continue weekly food reels",risk:""}),
  C({id:"bnelly",name:"BNelly Photography",short:"BNELLY",color:"#c084fc",owner:"Ben",handle:"@bnellyphotography",sentiment:"Positive",
     pkg:"Social",deliverables:"Weekly posts",assetsThrough:d(2026,8,5),captionsThrough:d(2026,8,5),scheduledThrough:d(2026,6,29),lastTouch:d(2026,6,7),nextTouch:d(2026,6,22),nextAction:"Captions up to date",risk:""}),
  C({id:"mike",name:"Mike Del Prete Personal",short:"MD",color:"#60a5fa",owner:"Ben",handle:"@mdhealthinsurance",
     pkg:"Insurance",deliverables:"Awareness posts",assetsThrough:null,captionsThrough:null,scheduledThrough:null,lastTouch:d(2026,6,3),nextTouch:d(2026,6,27),nextAction:"Plan July awareness set",risk:""}),
  C({id:"namaste",name:"Namaste Yoga",short:"NAMASTE",color:"#a78bfa",owner:"Brooke",sentiment:"Positive",
     pkg:"Email + workshops",deliverables:"Monthly workshop email",assetsThrough:null,captionsThrough:null,scheduledThrough:null,lastTouch:d(2026,6,2),nextTouch:d(2026,6,25),nextAction:"May workshop email shipped — plan June send",risk:""}),
  C({id:"christiane",name:"Christiane Lemieux",short:"CHRISTIANE",color:"#fb7185",owner:"Brooke",sentiment:"Positive",
     pkg:"Reels",deliverables:"Monthly reel package",assetsThrough:null,captionsThrough:null,scheduledThrough:null,lastTouch:d(2026,6,5),nextTouch:d(2026,6,26),nextAction:"NYC reels delivered — queue next batch",risk:""}),
  C({id:"besthome",name:"Best Home Appliances",short:"BEST HOME",color:"#2dd4bf",owner:"Brooke",relationship:"Partner",
     pkg:"Social",deliverables:"Monthly reel + posts",assetsThrough:null,captionsThrough:null,scheduledThrough:null,lastTouch:d(2026,6,4),nextTouch:d(2026,6,24),nextAction:"May reel done — plan June content",risk:""}),
  C({id:"aegis",name:"Aegis Bone Health Clinic",short:"AEGIS",color:"#94a3b8",owner:"Brooke",hold:true,
     pkg:"Social",deliverables:"On hold",assetsThrough:d(2026,8,14),captionsThrough:null,scheduledThrough:null,lastTouch:d(2026,5,20),nextTouch:null,nextAction:"On hold — 60 days of assets banked",risk:""}),
  // roster-only (relationship layer; no active delivery)
  C({id:"smarttext",name:"Smart Text Insurance",short:"SMART",color:"#818cf8",sentiment:"Positive"}),
  C({id:"basepizza",name:"Base Pizzeria",short:"BASE",color:"#fb923c",sentiment:"Very Positive"}),
  C({id:"zplumberz",name:"Z Plumberz",short:"Z PLUMB",color:"#38bdf8",sentiment:"Positive"}),
  C({id:"benson",name:"Benson Homes Arizona",short:"BENSON",color:"#f59e0b",sentiment:"Positive"}),
  C({id:"arresurf",name:"AR Resurfacing",short:"AR",color:"#2dd4bf",sentiment:"Positive"}),
  C({id:"kamun",name:"Ka Mun Studios",short:"KA MUN",color:"#c084fc",sentiment:"Very Positive"}),
  C({id:"brew",name:"Brew Avenue Coffee",short:"BREW",color:"#a16207",sentiment:"Very Positive"}),
  C({id:"silverpath",name:"Silverpath / Innovative",short:"SILVER",color:"#94a3b8",sentiment:"Positive"}),
  C({id:"jarman",name:"Jarman Insurance",short:"JARMAN",color:"#60a5fa",sentiment:"Positive"}),
  C({id:"goodhoney",name:"Good Honey",short:"HONEY",color:"#fbbf24"}),
  C({id:"epsilon",name:"Epsilon Theory",short:"EPSILON",color:"#818cf8"}),
  C({id:"evolve",name:"Evolve PR & Marketing",short:"EVOLVE",color:"#f472b6"}),
  C({id:"brent",name:"Brent Votroubek",short:"BRENT",color:"#38bdf8",handle:"@brentvotroubek_re"}),
  C({id:"certivo",name:"Certivo",short:"CERTIVO",color:"#2dd4bf"}),
  C({id:"christy",name:"Christy Wright Mortgage",short:"CHRISTY",color:"#a78bfa"}),
  C({id:"lemiuex",name:"Lemiuex et Cie",short:"LEMIUEX",color:"#fb7185"}),
];
const CMAP=Object.fromEntries(CLIENTS.map(c=>[c.id,c]));

/* ---- deliverables (production work) ---- */
let _u=1; const uid=()=>`d${_u++}`;
const DELIVS=[
  {id:uid(),client:"aurenza",name:"AURENZA – AUG content",type:"Static assets",due:d(2026,6,19),stage:"In Production",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"omniux",name:"OMNIUX – JULY content",type:"Monthly content package",due:d(2026,6,17),stage:"In Production",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"kitc",name:"KITC – AUG content",type:"Monthly content package",due:d(2026,6,19),stage:"In Production",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"zenith",name:"Zenith – AUG content",type:"Monthly content package",due:d(2026,6,19),stage:"Planning",owner:"Brooke",dep:"Waiting on Ben sync",review:"—"},
  {id:uid(),client:"dom",name:"DOM – AUG content",type:"Static assets",due:d(2026,6,19),stage:"In Production",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"kitc",name:"KITC Captions – SEPTEMBER",type:"Captions",due:d(2026,7,6),stage:"Planning",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"dom",name:"DOM – Captions AUGUST",type:"Captions",due:d(2026,6,17),stage:"In Production",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"omniux",name:"OMNIUX Captions – JULY",type:"Captions",due:d(2026,6,28),stage:"Planning",owner:"Ben",dep:"",review:"—"},
  {id:uid(),client:"aurenza",name:"AURENZA – Captions SEPT",type:"Captions",due:d(2026,7,2),stage:"Not Started",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"zenith",name:"Zenith – Captions JULY",type:"Captions",due:d(2026,6,30),stage:"Internal Review",owner:"Brooke",dep:"",review:"Needs review"},
  {id:uid(),client:"namaste",name:"Namaste Yoga – Email Template JUNE",type:"Emails",due:d(2026,6,30),stage:"Planning",owner:"Brooke",dep:"",review:"—"},
  {id:uid(),client:"dom",name:"DOM – 6/26 Reel",type:"Reels",due:d(2026,6,26),stage:"In Production",owner:"Brooke",dep:"",review:"—",reel:{concept:"Listing walkthrough",footage:true,script:false,status:"Ready to Build"}},
  {id:uid(),client:"aurenza",name:"AURENZA – 6/29 Reel",type:"Reels",due:d(2026,6,29),stage:"Planning",owner:"Brooke",dep:"",review:"—",reel:{concept:"TBD — lock direction",footage:false,script:true,status:"Direction Needed"}},
  {id:uid(),client:"kitc",name:"KITC – Zach Packs Recap Reel",type:"Reels",due:d(2026,6,22),stage:"In Production",owner:"Brooke",dep:"",review:"—",reel:{concept:"Footage/photo recap",footage:true,script:false,status:"Ready to Build"}},
  {id:uid(),client:"dom",name:"DOM – 7/24 Reel",type:"Reels",due:d(2026,7,24),stage:"Not Started",owner:"Brooke",dep:"",review:"—",reel:{concept:"TBD",footage:false,script:true,status:"Direction Needed"}},
  {id:uid(),client:"dom",name:"DOM – 7/31 Reel",type:"Reels",due:d(2026,7,31),stage:"Not Started",owner:"Brooke",dep:"",review:"—",reel:{concept:"TBD",footage:false,script:true,status:"Direction Needed"}},
  {id:uid(),client:"zenith",name:"Zenith – August Reels",type:"Reels",due:d(2026,8,5),stage:"Not Started",owner:"Brooke",dep:"Waiting on Ben sync",review:"—",reel:{concept:"From shoot footage",footage:false,script:false,status:"Footage Needed"}},
];

/* ---- posts (the posting calendar — matches image 2) ---- */
const P=(client,title,mo,day,time,platform,type,status)=>({id:`p${client}${mo}${day}${title}`.replace(/\s/g,""),client,title,date:d(2026,mo,day),time,platform,type,status});
const POSTS=[
  P("brent","Synced from Instagram",6,1,"8:22 AM","ig","Post","Published"),
  P("zenith","Synced from Instagram",6,1,"9:00 AM","ig","Post","Published"),
  P("zenith","Synced from Facebook",6,1,"9:00 AM","fb","Post","Published"),
  P("aurenza","Orange Dress",6,1,"9:00 AM","ig","Post","Published"),
  P("aurenza","True Luxury · Pool",6,1,"9:00 AM","ig","Post","Published"),
  P("mike","Saved $9000",6,3,"9:00 AM","ig","Post","Published"),
  P("zenith","Your Health is an Investment",6,3,"2:43 PM","ig","Post","Published"),
  P("bnelly","Social Media Post",6,3,"10:00 AM","fb","Feed","Published"),
  P("croque","The Chicken Philly",6,3,"10:00 AM","ig","Post","Published"),
  P("aurenza","Synced from Instagram",6,4,"9:00 AM","ig","Post","Published"),
  P("mike","Synced from Instagram",6,4,"9:00 AM","ig","Post","Published"),
  P("brent","Synced from Instagram",6,5,"10:38 AM","ig","Post","Published"),
  P("brent","Synced from Instagram",6,5,"10:38 AM","ig","Post","Published"),
  P("bnelly","Teams",6,5,"10:00 AM","fb","Feed","Published"),
  P("mike","Travelling for work",6,5,"9:00 AM","ig","Post","Published"),
  P("zenith","Eat for Weight Loss",6,5,"10:00 AM","ig","Post","Published"),
  P("brent","Synced from Instagram",6,8,"1:22 AM","ig","Post","Published"),
  P("brent","Synced from Instagram",6,8,"8:43 AM","ig","Post","Published"),
  P("bnelly","Synced from Instagram",6,8,"9:21 AM","ig","Post","Published"),
  P("bnelly","Synced from Facebook",6,8,"9:21 AM","fb","Post","Published"),
  P("aurenza","Biggest Barrier",6,8,"9:00 AM","ig","Post","Published"),
  P("zenith","Willpower",6,8,"9:00 AM","ig","Post","Published"),
  P("brent","Synced from Instagram",6,10,"3:10 PM","ig","Post","Published"),
  P("brent","Synced from Instagram",6,10,"2:13 PM","ig","Post","Published"),
  P("croque","The Hawaii",6,10,"10:00 AM","ig","Post","Published"),
  P("croque","The Almond Chicken Salad",6,17,"10:00 AM","ig","Post","Ready"),
  // forward-looking scheduled (this/next week)
  P("kitc","Zach Packs Recap",6,22,"9:00 AM","ig","Reel","Scheduled"),
  P("dom","Listing Walkthrough",6,26,"11:00 AM","ig","Reel","Scheduled"),
  P("aurenza","Modern Estate Tour",6,29,"9:00 AM","ig","Reel","Ready"),
];

const SEED_LOG=[
  {id:"l1",date:d(2026,6,15),client:"dom",text:"DOM July static/carousel assets moved to Complete. Account now in a stronger runway position — remaining risk narrowed to reels for 6/26, 7/24, 7/31.",kind:"forward"},
  {id:"l2",date:d(2026,6,15),client:"omniux",text:"OMNIUX flagged Red — assets only cover through 7/10. Largest active runway gap.",kind:"risk"},
  {id:"l3",date:d(2026,6,15),client:"zenith",text:"Zenith August reels waiting on a Ben sync about shoot footage. Status: Waiting on Dependency.",kind:"blocker"},
  {id:"l4",date:d(2026,6,15),client:"zenith",text:"Zenith July captions moved to Internal Review — needs sign-off.",kind:"review"},
];

/* ---- health logic ---- */
function runwayDays(c){ const ds=[c.assetsThrough,c.captionsThrough].filter(Boolean); if(!ds.length) return null;
  return daysBetween(TODAY,new Date(Math.min(...ds.map(x=>+x)))); }
function healthFor(c,delivs){
  if(c.hold) return {key:"hold",label:"On Hold",color:T.slate,runway:null};
  const blocked=delivs.some(x=>x.client===c.id&&x.dep);
  const rw=runwayDays(c); let base= rw==null?"green":rw>=60?"green":rw>=30?"yellow":"red";
  if(blocked&&base==="green") base="yellow";
  const m={green:{label:"On Track",color:T.green},yellow:{label:blocked?"Waiting on Dependency":"Needs Attention",color:T.yellow},red:{label:"At Risk",color:T.red}};
  return {key:base,...m[base],runway:rw,blocked};
}

/* ==================================================================== */
export default function PomlyCRM(){
  const [view,setView]=useState("hub");
  const [delivs,setDelivs]=useState(DELIVS);
  const [log,setLog]=useState(SEED_LOG);
  const [sel,setSel]=useState(null);
  const [calMonth,setCalMonth]=useState(new Date(2026,5,1));
  const [calFilter,setCalFilter]=useState("all");
  const [q,setQ]=useState("");
  const [toast,setToast]=useState(null);

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("pomly_v2");
    if(r&&r.value){const s=JSON.parse(r.value); if(s.delivs)setDelivs(s.delivs.map(reviveDeliv)); if(s.log)setLog(s.log.map(l=>({...l,date:new Date(l.date)})));}}catch(e){}})();},[]);
  useEffect(()=>{(async()=>{try{await window.storage.set("pomly_v2",JSON.stringify({delivs:delivs.map(serialDeliv),log:log.map(l=>({...l,date:+l.date}))}));}catch(e){}})();},[delivs,log]);

  const selDeliv=delivs.find(x=>x.id===sel);
  function updateDeliv(id,patch,note){ setDelivs(p=>p.map(x=>x.id===id?{...x,...patch}:x));
    if(note){const dv=delivs.find(x=>x.id===id); setLog(p=>[{id:"u"+Date.now(),date:TODAY,client:dv.client,text:note,kind:patch.dep?"blocker":(patch.stage==="Complete"?"forward":"review")},...p]);} }
  function flash(msg){ setToast(msg); setTimeout(()=>setToast(null),2600); }

  const NAV=[["hub","Home",Home],["calendar","Content Calendar",CalIcon],["deliverables","Deliverables",ListChecks],["runway","Runway",Activity],["reels","Reels / Video",Film],["blockers","Blockers",AlertTriangle],["changed","What changed",Sparkles]];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:`radial-gradient(1100px 560px at 12% -8%, ${T.bg1}, ${T.bg0})`,color:T.text,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <StyleTag/>
      <aside className="pom-side">
        <div className="pom-brand"><Mascot size={30}/><span className="pom-word">Pomly</span></div>
        <div className="pom-wsbadge"><span style={{background:T.violet}} className="pom-wsdot">M</span>Marketing<ChevronDown size={14} color={T.faint}/></div>
        <div className="pom-navlabel">Platform</div>
        <nav className="pom-nav">
          {NAV.map(([k,label,Icon])=>(
            <button key={k} onClick={()=>setView(k)} className={"pom-navitem"+(view===k?" on":"")}><Icon size={17}/><span>{label}</span></button>
          ))}
        </nav>
        <div className="pom-side-foot"><div className="pom-avatar">BB</div>
          <div style={{lineHeight:1.2}}><div style={{fontSize:13,fontWeight:600}}>Brooke Bein</div><div style={{fontSize:11,color:T.faint}}>brooke@omniux.io</div></div>
        </div>
      </aside>

      <main className="pom-main">
        <TopBar view={view} q={q} setQ={setQ} calMonth={calMonth} setCalMonth={setCalMonth} calFilter={calFilter} setCalFilter={setCalFilter}/>
        <div className="pom-content">
          {view==="hub"          && <Hub delivs={delivs} q={q} onAsk={()=>setView("changed")} onNew={()=>flash("New client — connect a form here")}/>}
          {view==="calendar"     && <CalendarView month={calMonth} filter={calFilter}/>}
          {view==="deliverables" && <Board delivs={delivs} onPick={setSel} q={q}/>}
          {view==="runway"       && <Runway delivs={delivs}/>}
          {view==="reels"        && <Reels delivs={delivs} onPick={setSel}/>}
          {view==="blockers"     && <Blockers delivs={delivs} onPick={setSel}/>}
          {view==="changed"      && <Changed log={log}/>}
        </div>
      </main>

      {selDeliv && <Drawer dv={selDeliv} onClose={()=>setSel(null)} onUpdate={updateDeliv}/>}
      {toast && <div className="pom-toast">{toast}</div>}
    </div>
  );
}

/* ---------- brand ---------- */
function Mascot({size=30}){
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs><linearGradient id="mg" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
      <path d="M18 3c7 0 12 4.6 12 12 0 4-1.2 6.4-1.2 9.4 0 3 1.6 4.2 1.6 6 0 1.6-1.6 2.6-4 2.6-2.2 0-3.4-1.2-5-1.2s-2.4 1.4-5.6 1.4S12 39.4 12 36.8c0-1.8 1.4-3 1.4-6 0-3-1.4-5.4-1.4-9.4C12 7.6 11 3 18 3Z" fill="url(#mg)"/>
      <circle cx="14.5" cy="15.5" r="1.7" fill="#fff"/><circle cx="21.5" cy="15.5" r="1.7" fill="#fff"/>
      <path d="M14.5 20c1 1.4 5 1.4 7 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function HealthPill({h,small}){ return (<span className="pom-pill" style={{color:h.color,background:`${h.color}1f`,border:`1px solid ${h.color}40`,fontSize:small?11:12}}><span style={{width:7,height:7,borderRadius:99,background:h.color,display:"inline-block"}}/>{h.label}</span>); }
function RelTag({label,kind}){ const c=kind==="Partner"?T.violetBright:kind==="At Risk"?T.red:kind==="Very Positive"?T.teal:kind==="Positive"?T.green:T.faint;
  return <span className="pom-reltag" style={{color:c,background:`${c}18`,border:`1px solid ${c}33`}}>{label}</span>; }

/* ---------- top bar ---------- */
function TopBar({view,q,setQ,calMonth,setCalMonth,calFilter,setCalFilter}){
  const titles={hub:"Client Hub",calendar:"Content Calendar",deliverables:"Deliverables Board",runway:"Runway",reels:"Reels / Video",blockers:"Blockers & Dependencies",changed:"What changed today"};
  const monthLabel=calMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  return (
    <header className="pom-top">
      <h1 className="pom-h1">{titles[view]}</h1><div style={{flex:1}}/>
      {view==="calendar" ? (
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <select value={calFilter} onChange={e=>setCalFilter(e.target.value)} className="pom-select">
            <option value="all">All clients</option>
            {CLIENTS.filter(c=>POSTS.some(p=>p.client===c.id)).map(c=><option key={c.id} value={c.id}>{c.short}</option>)}
          </select>
          <div className="pom-monthnav">
            <button onClick={()=>setCalMonth(new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1))}><ChevronLeft size={16}/></button>
            <button className="pom-todaybtn" onClick={()=>setCalMonth(new Date(2026,5,1))}>Today</button>
            <span>{monthLabel}</span>
            <button onClick={()=>setCalMonth(new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1))}><ChevronRight size={16}/></button>
          </div>
        </div>
      ) : (view==="hub"||view==="deliverables") ? (
        <div className="pom-searchbox"><Search size={14} color={T.faint}/><input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/></div>
      ) : null}
    </header>
  );
}

/* ---------- HUB (matches image 1) ---------- */
function Hub({delivs,q,onAsk,onNew}){
  const atRisk=CLIENTS.filter(c=>c.sentiment==="At Risk").length;
  const list=CLIENTS.filter(c=>!q||c.name.toLowerCase().includes(q.toLowerCase()));
  const active=list.filter(c=>c.assetsThrough!==undefined&&(c.assetsThrough||c.hold));
  const order={red:0,yellow:1,green:2,hold:3};
  const activeSorted=[...active].sort((a,b)=>order[healthFor(a,delivs).key]-order[healthFor(b,delivs).key]);
  const roster=list.filter(c=>!active.includes(c));
  return (
    <div>
      {/* hero */}
      <div className="pom-hero">
        <div className="pom-hero-l">
          <h2 className="pom-hero-h">Welcome to your Client hub</h2>
          <p className="pom-hero-sub">Welcome, Brooke! Here's a quick snapshot of your clients.</p>
          <p className="pom-hero-attn"><b>Needs attention: {atRisk} at-risk</b> <span>(relationship status)</span></p>
          <p className="pom-hero-count">{CLIENTS.length} clients in your workspace. Pomly weekly summaries cover the full picture.</p>
          <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
            <button className="pom-btn primary" onClick={onNew}><Plus size={16}/> New client</button>
            <button className="pom-btn ghost" onClick={onAsk}><Sparkles size={15}/> Ask Pomly for a breakdown</button>
          </div>
        </div>
        <div className="pom-hero-art"><Mascot size={120}/></div>
      </div>

      {/* active delivery accounts (spec layer) */}
      <div className="pom-sechd">Active delivery accounts <span>{activeSorted.length}</span></div>
      <div className="pom-grid">
        {activeSorted.map(c=>{ const h=healthFor(c,delivs); const owed=delivs.filter(x=>x.client===c.id&&x.stage!=="Complete");
          return (
            <div key={c.id} className="pom-card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}><span style={{width:9,height:9,borderRadius:99,background:c.color,flexShrink:0}}/><div className="pom-cardtitle">{c.name}</div></div>
                <HealthPill h={h} small/>
              </div>
              <div style={{display:"flex",gap:6,margin:"8px 0 4px",flexWrap:"wrap"}}><RelTag label={c.relationship} kind={c.relationship}/>{c.sentiment&&<RelTag label={c.sentiment} kind={c.sentiment}/>}</div>
              <div className="pom-deliv">{c.deliverables}</div>
              {h.runway!=null&&!c.hold&&<RunwayBar days={h.runway}/>}
              <div className="pom-kv"><span>Owed this month</span><b>{owed.length} items</b></div>
              <div className="pom-kv"><span>Next touch</span><b style={{color:c.nextTouch&&daysBetween(TODAY,c.nextTouch)<=3?T.yellow:T.text}}>{fmtLong(c.nextTouch)}</b></div>
              {c.risk&&<div className="pom-risk"><AlertTriangle size={12}/> {c.risk}</div>}
              <div className="pom-next"><span>Next action</span>{c.nextAction}</div>
            </div>
          );
        })}
      </div>

      {/* full roster (relationship layer) */}
      <div className="pom-sechd" style={{marginTop:26}}>All clients <span>{roster.length}</span></div>
      <div className="pom-rostergrid">
        {roster.map(c=>(
          <div key={c.id} className="pom-rostercard">
            <div className="pom-rosterico" style={{background:`${c.color}22`,color:c.color}}>{c.short.slice(0,2)}</div>
            <div style={{minWidth:0,flex:1}}>
              <div className="pom-rostername">{c.name}</div>
              <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}><RelTag label={c.relationship} kind={c.relationship}/>{c.sentiment&&<RelTag label={c.sentiment} kind={c.sentiment}/>}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function RunwayBar({days}){ const cap=90,pct=Math.max(4,Math.min(100,(days/cap)*100)),col=days>=60?T.green:days>=30?T.yellow:T.red;
  return (<div style={{margin:"10px 0 12px"}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,marginBottom:5}}><span>Runway</span><b style={{color:col}}>{days} days</b></div>
    <div className="pom-track"><div style={{position:"absolute",left:`${(30/cap)*100}%`,top:0,bottom:0,width:1,background:"rgba(255,255,255,.18)"}}/><div style={{position:"absolute",left:`${(60/cap)*100}%`,top:0,bottom:0,width:1,background:"rgba(255,255,255,.18)"}}/><div className="pom-fill" style={{width:`${pct}%`,background:`linear-gradient(90deg,${col}aa,${col})`}}/></div>
  </div>); }

/* ---------- CONTENT CALENDAR (matches image 2) ---------- */
function PlatformIcon({p}){ return p==="fb"?<span className="pom-plat" style={{background:T.fb}}><Facebook size={9} color="#fff" fill="#fff"/></span>:<span className="pom-plat" style={{background:`linear-gradient(45deg,#f59e0b,${T.ig},#7c3aed)`}}><Instagram size={9} color="#fff"/></span>; }
function PostCard({p}){
  const c=CMAP[p.client]||{}; const stc=p.status==="Published"?T.green:p.status==="Ready"?T.yellow:T.violetBright;
  return (
    <div className="pom-post">
      <div className="pom-post-top"><span className="pom-post-title">{p.title}</span><PlatformIcon p={p.platform}/></div>
      <div className="pom-post-tags"><span className="pom-tag" style={{color:stc,background:`${stc}1c`}}>{p.status}</span><span className="pom-tag" style={{color:T.muted,background:"rgba(255,255,255,.06)"}}>{p.type}</span></div>
      <div className="pom-post-meta"><Clock size={10}/>{p.time}</div>
      <div className="pom-post-meta"><span className="pom-handleico" style={{background:c.color}}/>{c.handle||("@"+(c.short||"").toLowerCase())}</div>
    </div>
  );
}
function CalendarView({month,filter}){
  const y=month.getFullYear(),m=month.getMonth();
  const first=new Date(y,m,1).getDay(),ndays=new Date(y,m+1,0).getDate();
  const cells=[]; for(let i=0;i<first;i++)cells.push(null);
  for(let dd=1;dd<=ndays;dd++)cells.push(new Date(y,m,dd)); while(cells.length%7)cells.push(null);
  const byDay={}; POSTS.forEach(p=>{ if(filter!=="all"&&p.client!==filter)return; const k=iso(p.date); (byDay[k]=byDay[k]||[]).push(p); });
  const wd=["Su","Mo","Tu","We","Th","Fr","Sa"];
  return (
    <div className="pom-calwrap">
      <div className="pom-calgrid pom-calhead">{wd.map(w=><div key={w} className="pom-wd">{w}</div>)}</div>
      <div className="pom-calgrid">
        {cells.map((c,i)=>{ if(!c)return <div key={i} className="pom-cell empty"/>;
          const items=byDay[iso(c)]||[]; const isToday=iso(c)===iso(TODAY);
          return (<div key={i} className={"pom-cell"+(isToday?" today":"")}>
            <div className="pom-daynum">{isToday?<span className="pom-todaybubble">{c.getDate()}</span>:c.getDate()}</div>
            <div className="pom-cellitems">{items.map(p=><PostCard key={p.id} p={p}/>)}</div>
          </div>);
        })}
      </div>
    </div>
  );
}

/* ---------- board ---------- */
const STAGE_COL={"Not Started":T.faint,"Planning":"#a78bfa","In Production":"#60a5fa","Internal Review":"#fbbf24","Client Review":"#f59e0b","Approved":"#34d399","Scheduled":"#2dd4bf","Complete":T.green};
function Board({delivs,onPick,q}){
  const types=[...new Set(delivs.map(x=>x.type))];
  return (<div style={{display:"flex",flexDirection:"column",gap:18}}>
    {types.map(tp=>{ const rows=delivs.filter(x=>x.type===tp&&(!q||x.name.toLowerCase().includes(q.toLowerCase()))); if(!rows.length)return null;
      return (<div key={tp}><div className="pom-grouphd">{tp}<span>{rows.length}</span></div>
        <div className="pom-table">{rows.map(x=>{ const c=CMAP[x.client];
          return (<button key={x.id} className="pom-row" onClick={()=>onPick(x.id)}>
            <span style={{width:8,height:8,borderRadius:99,background:c?.color,flexShrink:0}}/>
            <span className="pom-rowname">{x.name}</span>
            <span className="pom-stage" style={{color:STAGE_COL[x.stage],background:`${STAGE_COL[x.stage]}1c`}}>{x.stage}</span>
            {x.dep&&<span className="pom-dep"><AlertTriangle size={11}/>{x.dep}</span>}
            <span className="pom-due" style={{color:daysBetween(TODAY,x.due)<0?T.red:T.muted}}>{fmt(x.due)}</span>
            <span className="pom-owner">{x.owner}</span>
          </button>);
        })}</div></div>);
    })}
  </div>);
}

/* ---------- runway ---------- */
function Runway({delivs}){ const rows=CLIENTS.filter(c=>c.assetsThrough&&!c.hold);
  return (<div className="pom-rwtable">
    <div className="pom-rwhead"><div>Client</div><div>Assets through</div><div>Captions through</div><div>Scheduled</div><div>Health</div><div>Next gap</div></div>
    {rows.map(c=>{const h=healthFor(c,delivs); return (<div key={c.id} className="pom-rwrow">
      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:99,background:c.color}}/>{c.short}</div>
      <div>{fmt(c.assetsThrough)}</div><div>{fmt(c.captionsThrough)}</div><div>{fmt(c.scheduledThrough)}</div>
      <div><HealthPill h={h} small/></div><div style={{color:T.muted}}>{c.risk||"—"}</div>
    </div>);})}
  </div>);
}

/* ---------- reels ---------- */
function Reels({delivs,onPick}){ const reels=delivs.filter(x=>x.type==="Reels").sort((a,b)=>a.due-b.due);
  return (<div className="pom-table">
    <div className="pom-reelhd"><div>Client</div><div>Reel date</div><div>Concept</div><div>Footage</div><div>Script</div><div>Status</div><div>Flag</div></div>
    {reels.map(x=>{const c=CMAP[x.client];const dl=daysBetween(TODAY,x.due);const flag=dl<=12&&["Direction Needed","Footage Needed","Script Needed"].includes(x.reel?.status);
      return (<button key={x.id} className="pom-reelrow" onClick={()=>onPick(x.id)}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:99,background:c?.color}}/>{c?.short}</div>
        <div>{fmt(x.due)}</div><div style={{color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.reel?.concept}</div>
        <div>{x.reel?.footage?<CheckCircle2 size={15} color={T.green}/>:<Circle size={15} color={T.faint}/>}</div>
        <div>{x.reel?.script?<AlertTriangle size={14} color={T.yellow}/>:<span style={{color:T.faint}}>—</span>}</div>
        <div><span className="pom-stage" style={{color:STAGE_COL[x.reel?.status]||T.violetBright,background:"rgba(167,139,250,.12)"}}>{x.reel?.status}</span></div>
        <div>{flag&&<span className="pom-flag"><Clock size={11}/>{dl}d — lock now</span>}</div>
      </button>);})}
  </div>);
}

/* ---------- blockers ---------- */
function Blockers({delivs,onPick}){ const blocked=delivs.filter(x=>x.dep);
  if(!blocked.length)return <Empty icon={CheckCircle2} title="Nothing blocked" sub="Every deliverable can move forward right now."/>;
  return (<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <p style={{color:T.muted,fontSize:13,margin:"0 0 4px"}}>Work that can't move until someone delivers something. A reason is required — this is not a backlog.</p>
    {blocked.map(x=>{const c=CMAP[x.client];return (<button key={x.id} className="pom-blockcard" onClick={()=>onPick(x.id)}>
      <span style={{width:9,height:9,borderRadius:99,background:c?.color,marginTop:5}}/>
      <div style={{flex:1,textAlign:"left"}}><div style={{fontWeight:600,fontSize:14}}>{x.name}</div><div style={{fontSize:12.5,color:T.muted,marginTop:2}}>{c?.name} · due {fmt(x.due)}</div></div>
      <span className="pom-pill" style={{color:T.yellow,background:`${T.yellow}1f`,border:`1px solid ${T.yellow}40`}}>{x.dep}</span>
    </button>);})}
  </div>);
}

/* ---------- what changed ---------- */
const KIND={forward:{c:T.green,l:"Moved forward"},risk:{c:T.red,l:"At risk"},blocker:{c:T.yellow,l:"New blocker"},review:{c:T.violetBright,l:"Needs review"}};
function Changed({log}){
  return (<div style={{maxWidth:760}}>
    <div className="pom-eodhd"><Sparkles size={16} color={T.violetBright}/><div><div style={{fontWeight:600}}>Daily summary · {TODAY.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div><div style={{fontSize:12,color:T.muted}}>Auto-generated from today's account movement</div></div></div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {log.map(l=>{const k=KIND[l.kind]||KIND.review;const c=CMAP[l.client];return (<div key={l.id} className="pom-logrow">
        <span style={{width:9,height:9,borderRadius:99,background:k.c,marginTop:6,flexShrink:0}}/>
        <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}><span style={{fontSize:11,fontWeight:700,color:k.c,textTransform:"uppercase",letterSpacing:.3}}>{k.l}</span>{c&&<span style={{fontSize:11,color:T.faint}}>{c.short}</span>}</div><div style={{fontSize:13.5,lineHeight:1.5}}>{l.text}</div></div>
      </div>);})}
    </div>
  </div>);
}

/* ---------- drawer ---------- */
function Drawer({dv,onClose,onUpdate}){ const c=CMAP[dv.client];
  return (<><div className="pom-scrim" onClick={onClose}/><div className="pom-drawer">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{width:10,height:10,borderRadius:99,background:c?.color}}/><div><div style={{fontSize:11,color:T.faint}}>{c?.name}</div><div style={{fontWeight:700,fontSize:15}}>{dv.name}</div></div></div>
      <button onClick={onClose} className="pom-x"><X size={18}/></button>
    </div>
    <Field label="Type"><span className="pom-stage" style={{color:T.violetBright,background:"rgba(167,139,250,.12)"}}>{dv.type}</span></Field>
    <Field label="Due"><b>{fmtLong(dv.due)}</b> <span style={{color:daysBetween(TODAY,dv.due)<0?T.red:T.muted,fontSize:12}}>({daysBetween(TODAY,dv.due)<0?`${-daysBetween(TODAY,dv.due)}d overdue`:`in ${daysBetween(TODAY,dv.due)}d`})</span></Field>
    <Field label="Owner"><span style={{display:"flex",alignItems:"center",gap:6}}><User size={13} color={T.faint}/>{dv.owner}</span></Field>
    {dv.type==="Reels" ? (
      <Field label="Reel status"><select className="pom-select wide" value={dv.reel?.status} onChange={e=>onUpdate(dv.id,{reel:{...dv.reel,status:e.target.value}},`${c?.short} ${fmt(dv.due)} reel → ${e.target.value}`)}>{REEL_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
    ):(
      <Field label="Stage"><select className="pom-select wide" value={dv.stage} onChange={e=>onUpdate(dv.id,{stage:e.target.value},`${c?.short} ${dv.name.split("–").pop().trim()} → ${e.target.value}`)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></Field>
    )}
    <Field label="Dependency (blocks delivery)">
      <select className="pom-select wide" value={dv.dep||""} onChange={e=>onUpdate(dv.id,{dep:e.target.value},e.target.value?`${c?.short} blocked — ${e.target.value}`:`${c?.short} unblocked — work can move again`)}>
        <option value="">— none —</option>{DEP_REASONS.map(s=><option key={s}>{s}</option>)}
      </select>
      {dv.dep&&<div style={{fontSize:11.5,color:T.yellow,marginTop:6,display:"flex",gap:5,alignItems:"center"}}><AlertTriangle size={12}/>Sets {c?.short}'s health to Waiting on Dependency.</div>}
    </Field>
    <button className="pom-complete" onClick={()=>{onUpdate(dv.id,{stage:"Complete",dep:""},`${c?.short} ${dv.name.split("–").pop().trim()} moved to Complete.`);onClose();}}><CheckCircle2 size={15}/> Mark complete</button>
    <p style={{fontSize:11.5,color:T.faint,marginTop:12,lineHeight:1.5}}>Changing stage or dependency updates the account's health and writes a line to <b style={{color:T.muted}}>What changed</b>. Try it, then open Home.</p>
  </div></>);
}
function Field({label,children}){return (<div className="pom-field"><div className="pom-fieldlbl">{label}</div><div>{children}</div></div>);}
function Empty({icon:Icon,title,sub}){return (<div className="pom-empty"><Icon size={26} color={T.green}/><div style={{fontWeight:600,marginTop:8}}>{title}</div><div style={{color:T.muted,fontSize:13}}>{sub}</div></div>);}

function serialDeliv(x){return {...x,due:x.due?+x.due:null};}
function reviveDeliv(x){return {...x,due:x.due?new Date(x.due):null};}

/* ---------- styles ---------- */
function StyleTag(){return <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box}
.pom-side{width:228px;flex-shrink:0;background:rgba(10,7,22,.6);border-right:1px solid ${T.line};backdrop-filter:blur(8px);display:flex;flex-direction:column;padding:18px 14px;position:sticky;top:0;height:100vh}
.pom-brand{display:flex;align-items:center;gap:10px;padding:2px 6px 16px}
.pom-word{font-size:21px;font-weight:800;letter-spacing:-.5px;background:linear-gradient(90deg,#fff,#c4b5fd);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.pom-wsbadge{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:${T.muted};background:rgba(167,139,250,.08);border:1px solid ${T.line};border-radius:10px;padding:8px 10px;margin-bottom:14px}
.pom-wsdot{width:20px;height:20px;border-radius:6px;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
.pom-navlabel{font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:${T.faint};padding:0 8px 6px}
.pom-nav{display:flex;flex-direction:column;gap:3px;flex:1}
.pom-navitem{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;border:none;cursor:pointer;background:transparent;color:${T.muted};font-size:13.5px;font-weight:500;font-family:inherit;text-align:left;transition:.12s}
.pom-navitem:hover{background:rgba(167,139,250,.1);color:${T.text}}
.pom-navitem.on{background:linear-gradient(90deg,rgba(139,92,246,.34),rgba(139,92,246,.12));color:#fff;box-shadow:inset 0 0 0 1px ${T.line2}}
.pom-side-foot{display:flex;align-items:center;gap:9px;padding:10px 6px 2px;border-top:1px solid ${T.line};margin-top:8px}
.pom-avatar{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#a78bfa,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff}
.pom-main{flex:1;min-width:0;display:flex;flex-direction:column}
.pom-top{display:flex;align-items:center;gap:14px;padding:18px 28px;border-bottom:1px solid ${T.line};position:sticky;top:0;background:rgba(18,12,43,.72);backdrop-filter:blur(10px);z-index:5}
.pom-h1{font-size:19px;font-weight:700;margin:0;letter-spacing:-.3px}
.pom-content{padding:22px 28px 70px;flex:1}
.pom-searchbox{display:flex;align-items:center;gap:8px;background:rgba(167,139,250,.08);border:1px solid ${T.line};border-radius:10px;padding:8px 12px;width:230px}
.pom-searchbox input{background:none;border:none;outline:none;color:${T.text};font-size:13px;font-family:inherit;width:100%}
.pom-select{background:rgba(36,22,82,.92);border:1px solid ${T.line2};color:${T.text};border-radius:9px;padding:7px 10px;font-size:13px;font-family:inherit;cursor:pointer;outline:none}
.pom-select.wide{width:100%}
.pom-monthnav{display:flex;align-items:center;gap:4px;background:rgba(167,139,250,.08);border:1px solid ${T.line};border-radius:10px;padding:4px}
.pom-monthnav span{font-size:13px;font-weight:600;min-width:118px;text-align:center}
.pom-monthnav button{background:none;border:none;color:${T.muted};cursor:pointer;padding:5px;border-radius:7px;display:flex;font-family:inherit}
.pom-monthnav button:hover{background:rgba(167,139,250,.15);color:#fff}
.pom-todaybtn{font-size:12px;font-weight:600;padding:5px 10px!important}
/* hero */
.pom-hero{position:relative;overflow:hidden;border-radius:20px;padding:30px 32px;margin-bottom:26px;display:flex;align-items:center;gap:20px;background:linear-gradient(110deg,#3b1d6e 0%,#5b2a8c 38%,#2a1550 100%);border:1px solid rgba(167,139,250,.25);box-shadow:0 24px 60px -28px rgba(124,58,237,.7)}
.pom-hero-l{flex:1;min-width:0;z-index:1}
.pom-hero-h{font-size:30px;font-weight:800;letter-spacing:-.6px;margin:0 0 8px}
.pom-hero-sub{font-size:15px;color:#e8e0ff;margin:0 0 14px}
.pom-hero-attn{font-size:14px;margin:0 0 4px;color:#fff}.pom-hero-attn span{color:#c9bdf0}
.pom-hero-count{font-size:13px;color:#bcaee6;margin:0}
.pom-hero-art{flex-shrink:0;opacity:.96;filter:drop-shadow(0 10px 24px rgba(0,0,0,.4))}
@media(max-width:680px){.pom-hero-art{display:none}}
.pom-btn{display:inline-flex;align-items:center;gap:8px;border-radius:11px;padding:11px 17px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;border:none}
.pom-btn.primary{background:#fff;color:#4c1d95}.pom-btn.primary:hover{filter:brightness(.95)}
.pom-btn.ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25)}.pom-btn.ghost:hover{background:rgba(255,255,255,.18)}
/* sections */
.pom-sechd{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:700;letter-spacing:-.2px;margin:0 0 14px}
.pom-sechd span{background:rgba(167,139,250,.16);color:${T.violetBright};border-radius:99px;font-size:11px;padding:1px 9px;font-weight:600}
.pom-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:15px}
.pom-card{background:linear-gradient(180deg,rgba(44,28,99,.5),rgba(36,22,82,.32));border:1px solid ${T.line};border-radius:16px;padding:15px 15px 13px;transition:.15s}
.pom-card:hover{border-color:${T.line2};transform:translateY(-2px)}
.pom-cardtitle{font-weight:700;font-size:15px;letter-spacing:-.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pom-deliv{font-size:12.5px;color:${T.muted};margin-bottom:2px}
.pom-track{position:relative;height:7px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden}
.pom-fill{position:absolute;left:0;top:0;bottom:0;border-radius:99px}
.pom-kv{display:flex;justify-content:space-between;font-size:12.5px;color:${T.muted};padding:3px 0}.pom-kv b{color:${T.text};font-weight:600}
.pom-risk{display:flex;align-items:center;gap:6px;font-size:12px;color:${T.yellow};margin:8px 0 2px}
.pom-next{margin-top:9px;padding-top:10px;border-top:1px solid ${T.line};font-size:13px;line-height:1.4}
.pom-next span{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;color:${T.faint};margin-bottom:3px}
.pom-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:99px;font-weight:600;white-space:nowrap}
.pom-reltag{font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:99px;white-space:nowrap}
/* roster */
.pom-rostergrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:11px}
.pom-rostercard{display:flex;align-items:center;gap:11px;background:rgba(36,22,82,.3);border:1px solid ${T.line};border-radius:13px;padding:12px;transition:.13s}
.pom-rostercard:hover{border-color:${T.line2}}
.pom-rosterico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0}
.pom-rostername{font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* calendar */
.pom-calwrap{background:${T.cell};border:1px solid ${T.cellBorder};border-radius:14px;padding:10px}
.pom-calgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.pom-calhead{margin-bottom:6px}
.pom-wd{font-size:11px;font-weight:600;color:${T.faint};text-transform:uppercase;letter-spacing:.5px;padding-left:4px}
.pom-cell{min-height:120px;background:rgba(255,255,255,.018);border:1px solid ${T.cellBorder};border-radius:9px;padding:5px;display:flex;flex-direction:column;gap:4px}
.pom-cell.empty{background:transparent;border-color:transparent}
.pom-cell.today{border-color:${T.violet};box-shadow:0 0 0 1px ${T.violet}}
.pom-daynum{font-size:12px;font-weight:600;color:${T.muted};padding:1px 3px 2px}
.pom-todaybubble{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:99px;background:${T.violet};color:#fff;font-size:11px;font-weight:700}
.pom-cellitems{display:flex;flex-direction:column;gap:5px}
.pom-post{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:6px 7px}
.pom-post-top{display:flex;justify-content:space-between;align-items:flex-start;gap:5px}
.pom-post-title{font-size:11px;font-weight:600;line-height:1.25;color:#fff}
.pom-plat{width:15px;height:15px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pom-post-tags{display:flex;gap:4px;margin:5px 0 4px;flex-wrap:wrap}
.pom-tag{font-size:9px;font-weight:600;padding:1px 6px;border-radius:5px}
.pom-post-meta{display:flex;align-items:center;gap:4px;font-size:9.5px;color:${T.faint};margin-top:1px}
.pom-handleico{width:11px;height:11px;border-radius:99px;display:inline-block;flex-shrink:0}
/* board */
.pom-grouphd{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:${T.violetBright};margin-bottom:8px}
.pom-grouphd span{background:rgba(167,139,250,.16);color:${T.violetBright};border-radius:99px;font-size:11px;padding:1px 8px;letter-spacing:0}
.pom-table{background:rgba(36,22,82,.3);border:1px solid ${T.line};border-radius:13px;overflow:hidden}
.pom-row{display:flex;align-items:center;gap:11px;padding:11px 14px;width:100%;background:none;border:none;border-bottom:1px solid ${T.line};cursor:pointer;font-family:inherit;color:${T.text};text-align:left;transition:.1s}
.pom-row:last-child{border-bottom:none}.pom-row:hover{background:rgba(167,139,250,.07)}
.pom-rowname{flex:1;font-size:13.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pom-stage{font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:99px;white-space:nowrap}
.pom-dep{display:flex;align-items:center;gap:4px;font-size:11px;color:${T.yellow};background:${T.yellow}1a;padding:3px 8px;border-radius:99px;white-space:nowrap}
.pom-due{font-size:12.5px;width:46px;text-align:right}
.pom-owner{font-size:12px;color:${T.faint};width:54px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pom-rwtable{border:1px solid ${T.line};border-radius:13px;overflow:hidden}
.pom-rwhead,.pom-rwrow{display:grid;grid-template-columns:1.4fr 1fr 1.2fr 1fr 1.4fr 1.8fr;gap:10px;padding:12px 16px;align-items:center;font-size:13px}
.pom-rwhead{background:rgba(10,7,22,.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.faint}}
.pom-rwrow{border-top:1px solid ${T.line}}.pom-rwrow:hover{background:rgba(167,139,250,.05)}
.pom-reelhd,.pom-reelrow{display:grid;grid-template-columns:1fr .7fr 1.7fr .7fr .7fr 1.3fr 1.3fr;gap:10px;align-items:center;padding:11px 14px;font-size:13px}
.pom-reelhd{background:rgba(10,7,22,.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${T.faint}}
.pom-reelrow{border-bottom:1px solid ${T.line};width:100%;background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;color:${T.text};text-align:left}
.pom-reelrow:hover{background:rgba(167,139,250,.07)}
.pom-flag{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:${T.red};background:${T.red}1c;border:1px solid ${T.red}40;padding:3px 8px;border-radius:99px;white-space:nowrap}
.pom-blockcard{display:flex;gap:11px;align-items:flex-start;width:100%;background:rgba(251,191,36,.06);border:1px solid ${T.yellow}33;border-radius:12px;padding:13px 15px;cursor:pointer;font-family:inherit;color:${T.text}}
.pom-blockcard:hover{background:rgba(251,191,36,.1)}
.pom-eodhd{display:flex;align-items:center;gap:11px;background:linear-gradient(90deg,rgba(139,92,246,.18),transparent);border:1px solid ${T.line};border-radius:13px;padding:14px 16px;margin-bottom:16px}
.pom-logrow{display:flex;gap:11px;background:rgba(36,22,82,.3);border:1px solid ${T.line};border-radius:12px;padding:13px 15px}
.pom-scrim{position:fixed;inset:0;background:rgba(8,4,18,.5);backdrop-filter:blur(2px);z-index:20}
.pom-drawer{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:92vw;background:linear-gradient(180deg,${T.bg1},${T.bg0});border-left:1px solid ${T.line2};z-index:21;padding:22px;overflow-y:auto;box-shadow:-30px 0 60px -20px rgba(0,0,0,.6)}
.pom-x{background:rgba(167,139,250,.1);border:1px solid ${T.line};border-radius:9px;color:${T.muted};cursor:pointer;padding:6px;display:flex}.pom-x:hover{color:#fff}
.pom-field{margin-top:18px}.pom-fieldlbl{font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;color:${T.faint};margin-bottom:7px}
.pom-complete{margin-top:24px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(90deg,#7c3aed,#a78bfa);border:none;border-radius:11px;color:#fff;font-weight:700;font-size:14px;padding:12px;cursor:pointer;font-family:inherit}.pom-complete:hover{filter:brightness(1.1)}
.pom-empty{text-align:center;padding:60px 20px;color:${T.muted}}
.pom-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${T.surface2};border:1px solid ${T.line2};color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;z-index:40;box-shadow:0 12px 40px -10px rgba(0,0,0,.6)}
select option{background:${T.bg1};color:${T.text}}
@media(max-width:720px){.pom-side{display:none}}
`}</style>;}
