import React, { useState, useEffect } from "react";

const MAY = {
  seaSpray: "#BAD6DA", babyBlue: "#E1F2F4", matcha: "#DDDD7B", sunshine: "#FFE797",
  bubbleGum: "#F691A9", blush: "#FFD6E0", forest: "#1A4A3A", bg: "#F7F4EE", white: "#fff"
};

const DB = {
  wydatki: "8b8f83e61ee2484c9507f2ce9a6a88ff",
  zakupy: "4c93160cf578484aa3d901aac17fd972",
  posilki: "06c7e820b9e3490d97abea40eea3b535",
  zadania: "a2a095ea0de4436fa43b4c66adaf5087",
  zarobki: "244692a26ab84da1a7dc4b8ac1b53421",
  oplaty: "54e94c5f6968468286a551e0fcb266ef",
};

const MIESIAC_OPTIONS = ["Styczeń 2026","Luty 2026","Marzec 2026","Kwiecień 2026","Maj 2026","Czerwiec 2026","Lipiec 2026","Sierpień 2026","Wrzesień 2026","Październik 2026","Listopad 2026","Grudzień 2026"];
const WKATS = ["Jedzenie","Dom","Transport","Zdrowie","Ubrania","Rozrywka","Inne"];
const WKTOS = ["Klaudia","Mąż","Wspólnie"];
const ZKATS = ["Spożywcze","Dom","Chemia","Kosmetyki","Ubrania","Inne"];
const ZPILS = ["Teraz","Ten tydzień","Kiedyś"];
const ZKTOS = ["Klaudia","Mąż","Oboje","Dom"];
const PTYPS = ["Śniadanie","Obiad","Kolacja","Przekąska"];
const PKTOS = ["Klaudia","Mąż","Razem","Zamawiane"];
const TKTOS = ["Klaudia","Mąż","Oboje"];
const OPLYKAT = ["Mieszkanie","Media","Ubezpieczenie","Transport","Subskrypcje","Inne"];
const OPLYTERM = ["1-5","6-10","11-15","16-20","21-31"];
const KAT_COLORS = {Jedzenie:"#FFE797",Dom:"#BAD6DA",Transport:"#DDDD7B",Zdrowie:"#F691A9",Ubrania:"#FFD6E0",Rozrywka:"#E1F2F4",Inne:"#d4cfc8"};
const TABS = [
  {id:"dashboard",ico:"⌂",lbl:"Dom"},
  {id:"wydatki",ico:"💰",lbl:"Wydatki"},
  {id:"zakupy",ico:"🛒",lbl:"Zakupy"},
  {id:"posilki",ico:"🍽️",lbl:"Posiłki"},
  {id:"zadania",ico:"✅",lbl:"Zadania"},
  {id:"zarobki",ico:"📈",lbl:"Zarobki"},
  {id:"oplaty",ico:"📋",lbl:"Opłaty"},
];

async function nQuery(dbId, token, filter=null) {
  const body = {database_id:dbId, page_size:50};
  if(filter) body.filter = filter;
  const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`,{method:"POST",headers:{"Authorization":"Bearer "+token,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify(body)});
  return r.json();
}
async function nCreate(dbId, token, props) {
  const r = await fetch("https://api.notion.com/v1/pages",{method:"POST",headers:{"Authorization":"Bearer "+token,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify({parent:{database_id:dbId},properties:props})});
  return r.json();
}
async function nUpdate(pageId, token, props) {
  const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`,{method:"PATCH",headers:{"Authorization":"Bearer "+token,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify({properties:props})});
  return r.json();
}

function gp(page,name) {
  const p=page.properties?.[name];
  if(!p) return "";
  if(p.type==="title") return p.title?.[0]?.plain_text||"";
  if(p.type==="rich_text") return p.rich_text?.[0]?.plain_text||"";
  if(p.type==="select") return p.select?.name||"";
  if(p.type==="number") return p.number??0;
  if(p.type==="date") return p.date?.start||"";
  if(p.type==="checkbox") return p.checkbox;
  if(p.type==="formula") return p.formula?.number??0;
  return "";
}

function uid(){return Math.random().toString(36).slice(2,9);}
function today(){return new Date().toISOString().split("T")[0];}

// Local state
function useLS(key, def) {
  const [v,setV] = useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):def;}catch{return def;}});
  const set = (val) => {const nv=typeof val==="function"?val(v):val;setV(nv);try{localStorage.setItem(key,JSON.stringify(nv));}catch{}};
  return [v,set];
}

function Chip({active,onClick,children,color}) {
  return <button onClick={onClick} style={{padding:"6px 13px",borderRadius:20,border:`1.5px solid ${active?"transparent":MAY.seaSpray}`,background:active?(color||MAY.forest):"white",color:active?"white":MAY.forest,fontSize:12,cursor:"pointer",fontWeight:active?600:400,transition:".12s",whiteSpace:"nowrap"}}>{children}</button>;
}
function Inp({label,value,onChange,type="text",placeholder}) {
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{fontSize:11,color:MAY.forest,opacity:.55,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{padding:"10px 13px",borderRadius:10,border:`1.5px solid ${MAY.seaSpray}`,background:MAY.babyBlue,color:MAY.forest,fontSize:14,outline:"none",width:"100%",boxSizing:"border-box"}}/>
  </div>;
}
function Card({children,style={}}) {
  return <div style={{background:"white",borderRadius:16,padding:18,border:`1px solid ${MAY.seaSpray}`,...style}}>{children}</div>;
}
function Btn({onClick,children,disabled,ok,style={}}) {
  return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:ok?MAY.seaSpray:MAY.forest,color:ok?MAY.forest:"white",fontSize:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,transition:".12s",...style}}>{children}</button>;
}
function SecTitle({children}) {
  return <div style={{fontSize:13,fontWeight:600,color:MAY.forest,marginBottom:12}}>{children}</div>;
}
function LblSm({children}) {
  return <div style={{fontSize:11,color:MAY.forest,opacity:.55,textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>{children}</div>;
}
function ItemRow({title,sub,right}) {
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${MAY.babyBlue}`}}>
    <div><div style={{fontSize:14,fontWeight:500,color:MAY.forest}}>{title}</div>{sub&&<div style={{fontSize:11,color:MAY.forest,opacity:.45,marginTop:2}}>{sub}</div>}</div>
    <div>{right}</div>
  </div>;
}

// DONUT CHART
function DonutChart({data}) {
  if(!data||!data.length) return <div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:16}}>Brak danych</div>;
  const total = data.reduce((s,d)=>s+d.value,0);
  if(!total) return null;
  let cumAngle = -Math.PI/2;
  const cx=80,cy=80,r=55,inner=32;
  const segments = data.map(d=>{
    const angle = (d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(cumAngle), y1=cy+r*Math.sin(cumAngle);
    cumAngle+=angle;
    const x2=cx+r*Math.cos(cumAngle), y2=cy+r*Math.sin(cumAngle);
    const xi1=cx+inner*Math.cos(cumAngle-angle), yi1=cy+inner*Math.sin(cumAngle-angle);
    const xi2=cx+inner*Math.cos(cumAngle), yi2=cy+inner*Math.sin(cumAngle);
    const large=angle>Math.PI?1:0;
    return {...d, path:`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1} Z`};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map((s,i)=><path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2"/>)}
        <text x="80" y="76" textAnchor="middle" style={{fontSize:11,fill:MAY.forest,opacity:.5}}>łącznie</text>
        <text x="80" y="92" textAnchor="middle" style={{fontSize:13,fontWeight:"bold",fill:MAY.forest}}>{Math.round(total)} zł</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6,flex:1}}>
        {data.map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0}}/>
            <div style={{fontSize:11,color:MAY.forest,flex:1}}>{d.label}</div>
            <div style={{fontSize:11,fontWeight:600,color:MAY.forest}}>{Math.round((d.value/total)*100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// DASHBOARD
function Dashboard({token}) {
  const [stats,setStats] = useState({wydatki:0,zakupy:0,zadania:0,posilki:0});
  const [katData,setKatData] = useState([]);
  useEffect(()=>{
    if(!token) return;
    Promise.all([
      nQuery(DB.wydatki,token),
      nQuery(DB.zakupy,token,{property:"Kupione",checkbox:{equals:false}}),
      nQuery(DB.zadania,token,{property:"Status",select:{does_not_equal:"Gotowe"}}),
      nQuery(DB.posilki,token,{property:"Data",date:{on_or_after:today()}}),
    ]).then(([w,z,t,p])=>{
      const items = w.results||[];
      const total = items.reduce((s,pg)=>s+(gp(pg,"Kwota")||0),0);
      setStats({wydatki:total,zakupy:(z.results||[]).length,zadania:(t.results||[]).length,posilki:(p.results||[]).length});
      const byKat={};
      items.forEach(pg=>{const k=gp(pg,"Kategoria")||"Inne";const v=gp(pg,"Kwota")||0;byKat[k]=(byKat[k]||0)+v;});
      const cd=Object.entries(byKat).filter(([,v])=>v>0).map(([k,v])=>({label:k,value:v,color:KAT_COLORS[k]||"#ccc"}));
      setKatData(cd);
    });
  },[token]);
  const tiles=[
    {lbl:"wydatki w mies.",val:Math.round(stats.wydatki)+" zł",bg:MAY.sunshine},
    {lbl:"do kupienia",val:stats.zakupy+" szt",bg:MAY.babyBlue},
    {lbl:"otwarte zadania",val:stats.zadania+" zad.",bg:MAY.blush},
    {lbl:"posiłki w planie",val:stats.posilki+" dań",bg:MAY.matcha},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{padding:"4px 0 8px"}}>
        <div style={{fontSize:20,fontWeight:700,color:MAY.forest}}>Dzień dobry 👋</div>
        <div style={{fontSize:13,color:MAY.forest,opacity:.5,marginTop:2}}>{new Date().toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {tiles.map(t=>(
          <div key={t.lbl} style={{borderRadius:14,padding:14,background:t.bg}}>
            <div style={{fontSize:18,fontWeight:700,color:MAY.forest}}>{t.val}</div>
            <div style={{fontSize:11,color:MAY.forest,opacity:.55,marginTop:2}}>{t.lbl}</div>
          </div>
        ))}
      </div>
      <Card>
        <SecTitle>Wydatki wg kategorii</SecTitle>
        <DonutChart data={katData}/>
      </Card>
      <Card style={{background:MAY.seaSpray,border:"none"}}>
        <a href="https://www.notion.so/358f8cff1ae3813dba98e304eadeb22f" target="_blank" style={{color:MAY.forest,fontSize:14,fontWeight:600,textDecoration:"none"}}>🏠 Otwórz w Notion →</a>
      </Card>
    </div>
  );
}

// WYDATKI
function Wydatki({token}) {
  const [nazwa,setNazwa]=useState(""); const [kwota,setKwota]=useState("");
  const [kat,setKat]=useState("Jedzenie"); const [kto,setKto]=useState("Klaudia");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const [lista,setLista]=useState([]); const [loading,setLoading]=useState(true);
  async function load(){const d=await nQuery(DB.wydatki,token);setLista(d.results||[]);setLoading(false);}
  useEffect(()=>{if(token)load();},[token]);
  const total=lista.reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  async function dodaj(){
    if(!nazwa||!kwota) return;
    setSaving(true);
    await nCreate(DB.wydatki,token,{Nazwa:{title:[{text:{content:nazwa}}]},Kwota:{number:parseFloat(kwota)},Kategoria:{select:{name:kat}},"Kto płacił":{select:{name:kto}},Data:{date:{start:today()}}});
    setOk(true);setNazwa("");setKwota("");
    setTimeout(()=>setOk(false),1500);
    await load(); setSaving(false);
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:`linear-gradient(135deg,${MAY.sunshine},${MAY.matcha})`,border:"none"}}>
        <LblSm>łącznie w tym miesiącu</LblSm>
        <div style={{fontSize:30,fontWeight:700,color:MAY.forest}}>{Math.round(total)} zł</div>
      </Card>
      <Card>
        <SecTitle>Dodaj wydatek</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
            <Inp label="Co?" value={nazwa} onChange={setNazwa} placeholder="np. Biedronka"/>
            <Inp label="Kwota" value={kwota} onChange={setKwota} type="number" placeholder="0"/>
          </div>
          <div><LblSm>Kategoria</LblSm><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{WKATS.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div>
          <div><LblSm>Kto płacił</LblSm><div style={{display:"flex",gap:5}}>{WKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!nazwa||!kwota} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj wydatek"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle>Ostatnie</SecTitle>
        {loading?<div style={{color:MAY.forest,opacity:.3,fontSize:13}}>Ładuję…</div>:lista.slice().reverse().slice(0,8).map(p=>(
          <ItemRow key={p.id} title={gp(p,"Nazwa")} sub={`${gp(p,"Kategoria")} · ${gp(p,"Kto płacił")} · ${gp(p,"Data")}`} right={<span style={{fontSize:15,fontWeight:700,color:MAY.forest}}>{gp(p,"Kwota")} zł</span>}/>
        ))}
      </Card>
    </div>
  );
}

// ZAKUPY
function Zakupy({token}) {
  const [produkt,setProdukt]=useState(""); const [ilosc,setIlosc]=useState("");
  const [kat,setKat]=useState("Spożywcze"); const [pil,setPil]=useState("Ten tydzień"); const [kto,setKto]=useState("Oboje");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const [lista,setLista]=useState([]);
  const pilCol={"Teraz":MAY.bubbleGum,"Ten tydzień":MAY.matcha,"Kiedyś":MAY.seaSpray};
  async function load(){const d=await nQuery(DB.zakupy,token,{property:"Kupione",checkbox:{equals:false}});setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!produkt) return; setSaving(true);
    await nCreate(DB.zakupy,token,{Produkt:{title:[{text:{content:produkt}}]},Ilość:{rich_text:[{text:{content:ilosc}}]},Kategoria:{select:{name:kat}},Pilność:{select:{name:pil}},"Kto potrzebuje":{select:{name:kto}},Kupione:{checkbox:false}});
    setOk(true);setProdukt("");setIlosc("");
    setTimeout(()=>setOk(false),1500);
    await load(); setSaving(false);
  }
  async function kupione(id){await nUpdate(id,token,{Kupione:{checkbox:true}});setLista(p=>p.filter(i=>i.id!==id));}
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <SecTitle>Dodaj do listy</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
            <Inp label="Co kupić?" value={produkt} onChange={setProdukt} placeholder="np. mleko"/>
            <Inp label="Ile?" value={ilosc} onChange={setIlosc} placeholder="2 szt"/>
          </div>
          <div><LblSm>Kategoria</LblSm><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{ZKATS.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><LblSm>Pilność</LblSm><div style={{display:"flex",flexDirection:"column",gap:4}}>{ZPILS.map(p=><Chip key={p} active={pil===p} onClick={()=>setPil(p)} color={pilCol[p]}>{p}</Chip>)}</div></div>
            <div><LblSm>Kto</LblSm><div style={{display:"flex",flexDirection:"column",gap:4}}>{ZKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          </div>
          <Btn onClick={dodaj} disabled={saving||!produkt} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj do listy"}</Btn>
        </div>
      </Card>
      {ZPILS.map(p=>{const items=lista.filter(i=>gp(i,"Pilność")===p);return items.length?(
        <Card key={p}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:pilCol[p]}}/>
            <LblSm style={{margin:0}}>{p}</LblSm>
          </div>
          {items.map(i=><ItemRow key={i.id} title={gp(i,"Produkt")} sub={`${gp(i,"Kategoria")} · ${gp(i,"Kto potrzebuje")}${gp(i,"Ilość")?" · "+gp(i,"Ilość"):""}`} right={<button onClick={()=>kupione(i.id)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${MAY.seaSpray}`,background:"white",cursor:"pointer",fontSize:14,color:MAY.forest}}>✓</button>}/>)}
        </Card>
      ):null})}
      {lista.length===0&&<Card><div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:13,padding:16}}>Lista pusta 🎉</div></Card>}
    </div>
  );
}

// POSILKI
function Posilki({token}) {
  const [danie,setDanie]=useState(""); const [typ,setTyp]=useState("Obiad"); const [kto,setKto]=useState("Klaudia");
  const [selDate,setSelDate]=useState(today());
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const [lista,setLista]=useState([]); const [aiLoading,setAiLoading]=useState(false); const [sugg,setSugg]=useState([]);
  async function load(){const d=await nQuery(DB.posilki,token,{property:"Data",date:{on_or_after:today()}});setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!danie) return; setSaving(true);
    await nCreate(DB.posilki,token,{Danie:{title:[{text:{content:danie}}]},Posiłek:{select:{name:typ}},"Kto gotuje":{select:{name:kto}},Data:{date:{start:selDate}}});
    setOk(true);setDanie("");setSugg([]);
    setTimeout(()=>setOk(false),1500);
    await load(); setSaving(false);
  }
  async function proponuj(){
    setAiLoading(true);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:"Zaproponuj 5 szybkich pomysłów na obiad. Tylko nazwy po polsku, każde w nowej linii, bez numeracji."}]})});
      const d=await r.json();
      setSugg((d.content?.[0]?.text||"").trim().split("\n").filter(Boolean).slice(0,5));
    }catch{}
    setAiLoading(false);
  }
  const DAYS=["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];
  const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return{ds:d.toISOString().split("T")[0],day:d.getDate(),dayN:DAYS[d.getDay()]};});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4}}>
          {week.map(w=>{const meals=lista.filter(p=>gp(p,"Data")===w.ds).length;const sel=selDate===w.ds;const isTod=w.ds===today();return(
            <button key={w.ds} onClick={()=>setSelDate(w.ds)} style={{flex:"0 0 auto",width:46,borderRadius:12,padding:"8px 4px",textAlign:"center",border:`1.5px solid ${sel?MAY.forest:isTod?MAY.forest:"transparent"}`,background:sel?MAY.forest:"white",cursor:"pointer"}}>
              <div style={{fontSize:10,color:sel?MAY.babyBlue:MAY.forest,opacity:sel?1:.5}}>{w.dayN}</div>
              <div style={{fontSize:16,fontWeight:700,color:sel?"white":MAY.forest,margin:"4px 0"}}>{w.day}</div>
              <div style={{fontSize:9,color:sel?MAY.babyBlue:MAY.seaSpray,minHeight:10}}>{meals?"●".repeat(Math.min(meals,3)):"·"}</div>
            </button>
          );})}
        </div>
      </Card>
      <Card>
        <SecTitle>Dodaj posiłek</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Inp label="Danie" value={danie} onChange={setDanie} placeholder="np. spaghetti"/>
          {sugg.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{sugg.map(s=><button key={s} onClick={()=>setDanie(s)} style={{padding:"4px 10px",borderRadius:16,border:`1px solid ${MAY.seaSpray}`,background:MAY.babyBlue,fontSize:11,color:MAY.forest,cursor:"pointer"}}>{s}</button>)}</div>}
          <button onClick={proponuj} disabled={aiLoading} style={{padding:"8px 13px",borderRadius:10,border:`1.5px dashed ${MAY.seaSpray}`,background:"transparent",fontSize:12,color:MAY.forest,opacity:.6,cursor:"pointer",textAlign:"left"}}>{aiLoading?"🤔 Myślę…":"✨ Zaproponuj pomysły (AI)"}</button>
          <div><LblSm>Posiłek</LblSm><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{PTYPS.map(k=><Chip key={k} active={typ===k} onClick={()=>setTyp(k)}>{k}</Chip>)}</div></div>
          <div><LblSm>Kto gotuje</LblSm><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{PKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!danie} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj do planu"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle>Plan</SecTitle>
        {lista.filter(p=>gp(p,"Data")===selDate).length===0?<div style={{color:MAY.forest,opacity:.3,fontSize:13,textAlign:"center",padding:16}}>Brak posiłków</div>:lista.filter(p=>gp(p,"Data")===selDate).map(p=><ItemRow key={p.id} title={gp(p,"Danie")} sub={`${gp(p,"Posiłek")} · ${gp(p,"Kto gotuje")}`}/>)}
      </Card>
    </div>
  );
}

// ZADANIA
function Zadania({token}) {
  const [zadanie,setZadanie]=useState(""); const [kto,setKto]=useState("Oboje");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false); const [lista,setLista]=useState([]);
  async function load(){const d=await nQuery(DB.zadania,token,{property:"Status",select:{does_not_equal:"Gotowe"}});setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!zadanie) return; setSaving(true);
    await nCreate(DB.zadania,token,{Zadanie:{title:[{text:{content:zadanie}}]},Status:{select:{name:"Do zrobienia"}},Odpowiedzialny:{select:{name:kto}}});
    setOk(true);setZadanie("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  async function zmien(id,st){
    if(st==="Gotowe"){await nUpdate(id,token,{Status:{select:{name:"Gotowe"}}});setLista(p=>p.filter(i=>i.id!==id));}
    else{await nUpdate(id,token,{Status:{select:{name:st}}});await load();}
  }
  const sCol={"Do zrobienia":MAY.bubbleGum,"W toku":MAY.matcha};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <SecTitle>Dodaj zadanie</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Inp label="Co trzeba zrobić?" value={zadanie} onChange={setZadanie} placeholder="np. zapłacić za prąd"/>
          <div><LblSm>Kto?</LblSm><div style={{display:"flex",gap:5}}>{TKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!zadanie} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj zadanie"}</Btn>
        </div>
      </Card>
      {["Do zrobienia","W toku"].map(s=>{const items=lista.filter(i=>gp(i,"Status")===s);return items.length?(
        <Card key={s}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:sCol[s]}}/>
            <LblSm>{s}</LblSm>
          </div>
          {items.map(i=><ItemRow key={i.id} title={gp(i,"Zadanie")} sub={gp(i,"Odpowiedzialny")} right={
            <div style={{display:"flex",gap:4}}>
              {s==="Do zrobienia"&&<button onClick={()=>zmien(i.id,"W toku")} style={{fontSize:11,padding:"4px 8px",borderRadius:8,border:`1px solid ${MAY.matcha}`,background:"white",color:MAY.forest,cursor:"pointer"}}>→</button>}
              <button onClick={()=>zmien(i.id,"Gotowe")} style={{fontSize:11,padding:"4px 8px",borderRadius:8,border:`1px solid ${MAY.seaSpray}`,background:"white",color:MAY.forest,cursor:"pointer"}}>✓</button>
            </div>
          }/>)}
        </Card>
      ):null})}
      {lista.length===0&&<Card><div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:13,padding:16}}>Wszystko zrobione! 🎉</div></Card>}
    </div>
  );
}

// ZAROBKI
function Zarobki({token}) {
  const [miesiac,setMiesiac]=useState("Maj 2026");
  const [klaudia,setKlaudia]=useState(""); const [maz,setMaz]=useState(""); const [notatka,setNotatka]=useState("");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false); const [lista,setLista]=useState([]);
  async function load(){const d=await nQuery(DB.zarobki,token);setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!klaudia&&!maz) return; setSaving(true);
    await nCreate(DB.zarobki,token,{"Miesiąc":{title:[{text:{content:miesiac}}]},"Zarobki Klaudia":{number:parseFloat(klaudia)||0},"Zarobki Mąż":{number:parseFloat(maz)||0},Notatka:{rich_text:[{text:{content:notatka}}]}});
    setOk(true);setKlaudia("");setMaz("");setNotatka("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:`linear-gradient(135deg,${MAY.blush},${MAY.sunshine})`,border:"none"}}>
        <LblSm>łącznie zarobki — wszystkie miesiące</LblSm>
        <div style={{fontSize:30,fontWeight:700,color:MAY.forest}}>{Math.round(lista.reduce((s,p)=>{const k=gp(p,"Zarobki Klaudia")||0;const m=gp(p,"Zarobki Mąż")||0;return s+k+m;},0))} zł</div>
      </Card>
      <Card>
        <SecTitle>Dodaj zarobki</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <LblSm>Miesiąc</LblSm>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {MIESIAC_OPTIONS.slice(4).map(m=><Chip key={m} active={miesiac===m} onClick={()=>setMiesiac(m)}>{m.split(" ")[0]}</Chip>)}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp label="Klaudia (zł)" value={klaudia} onChange={setKlaudia} type="number" placeholder="0"/>
            <Inp label="Mąż (zł)" value={maz} onChange={setMaz} type="number" placeholder="0"/>
          </div>
          <Inp label="Notatka" value={notatka} onChange={setNotatka} placeholder="opcjonalnie"/>
          <Btn onClick={dodaj} disabled={saving||(!klaudia&&!maz)} ok={ok}>{ok?"✓ Zapisano!":saving?"Zapisuję…":"Zapisz zarobki"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle>Historia</SecTitle>
        {lista.length===0?<div style={{color:MAY.forest,opacity:.3,fontSize:13,textAlign:"center",padding:16}}>Brak danych</div>:lista.slice().reverse().map(p=>{
          const k=gp(p,"Zarobki Klaudia")||0;const m=gp(p,"Zarobki Mąż")||0;
          return <ItemRow key={p.id} title={gp(p,"Miesiąc")} sub={`Klaudia: ${k} zł · Mąż: ${m} zł`} right={<span style={{fontSize:14,fontWeight:700,color:MAY.forest}}>{Math.round(k+m)} zł</span>}/>;
        })}
      </Card>
    </div>
  );
}

// OPLATY
function Oplaty({token}) {
  const [nazwa,setNazwa]=useState(""); const [kwota,setKwota]=useState("");
  const [kat,setKat]=useState("Media"); const [term,setTerm]=useState("1-5");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false); const [lista,setLista]=useState([]);
  const CURR_MONTH = "Maj 2026";
  async function load(){const d=await nQuery(DB.oplaty,token);setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!nazwa) return; setSaving(true);
    await nCreate(DB.oplaty,token,{Nazwa:{title:[{text:{content:nazwa}}]},Kwota:{number:parseFloat(kwota)||0},Kategoria:{select:{name:kat}},"Termin płatności":{select:{name:term}}});
    setOk(true);setNazwa("");setKwota("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  async function toggleMonth(pageId, currentVal) {
    const prop = {};
    prop[CURR_MONTH] = {checkbox: !currentVal};
    await nUpdate(pageId, token, prop);
    await load();
  }
  const total = lista.reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  const zaplacone = lista.filter(p=>gp(p,CURR_MONTH)===true).reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{borderRadius:14,padding:14,background:MAY.blush}}>
          <div style={{fontSize:11,color:MAY.forest,opacity:.55,marginBottom:4}}>do zapłaty w maju</div>
          <div style={{fontSize:20,fontWeight:700,color:MAY.forest}}>{Math.round(total-zaplacone)} zł</div>
        </div>
        <div style={{borderRadius:14,padding:14,background:MAY.matcha}}>
          <div style={{fontSize:11,color:MAY.forest,opacity:.55,marginBottom:4}}>już zapłacone</div>
          <div style={{fontSize:20,fontWeight:700,color:MAY.forest}}>{Math.round(zaplacone)} zł</div>
        </div>
      </div>
      <Card>
        <SecTitle>Dodaj stałą opłatę</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
            <Inp label="Nazwa" value={nazwa} onChange={setNazwa} placeholder="np. prąd"/>
            <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0"/>
          </div>
          <div><LblSm>Kategoria</LblSm><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{OPLYKAT.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div>
          <div><LblSm>Termin (dzień mies.)</LblSm><div style={{display:"flex",gap:5}}>{OPLYTERM.map(t=><Chip key={t} active={term===t} onClick={()=>setTerm(t)}>{t}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!nazwa} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj opłatę"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle>Maj 2026 — lista opłat</SecTitle>
        {lista.length===0?<div style={{color:MAY.forest,opacity:.3,fontSize:13,textAlign:"center",padding:16}}>Brak opłat</div>:lista.map(p=>{
          const paid = gp(p,CURR_MONTH)===true;
          return (
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${MAY.babyBlue}`,opacity:paid?.5:1}}>
              <div>
                <div style={{fontSize:14,fontWeight:500,color:MAY.forest,textDecoration:paid?"line-through":"none"}}>{gp(p,"Nazwa")}</div>
                <div style={{fontSize:11,color:MAY.forest,opacity:.45,marginTop:2}}>{gp(p,"Kategoria")} · termin: {gp(p,"Termin płatności")}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14,fontWeight:700,color:MAY.forest}}>{gp(p,"Kwota")} zł</span>
                <button onClick={()=>toggleMonth(p.id, paid)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${paid?MAY.forest:MAY.seaSpray}`,background:paid?MAY.forest:"white",cursor:"pointer",color:paid?"white":MAY.forest,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// SETUP
function Setup({onToken}) {
  const [t,setT]=useState("");
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:MAY.bg}}>
      <Card style={{maxWidth:400,width:"100%"}}>
        <div style={{fontSize:28,fontWeight:700,marginBottom:6,color:MAY.forest}}>🏠 Dom</div>
        <div style={{fontSize:14,color:MAY.forest,opacity:.45,marginBottom:24}}>Połącz z Notion żeby zacząć</div>
        <div style={{background:MAY.blush,borderRadius:12,padding:16,marginBottom:20,fontSize:13,color:MAY.forest,lineHeight:1.7}}>
          <strong>Jak uzyskać token?</strong><br/>
          1. Wejdź na <a href="https://www.notion.so/my-integrations" target="_blank" style={{color:MAY.forest}}>notion.so/my-integrations</a><br/>
          2. Kliknij <strong>New integration</strong> → nadaj nazwę<br/>
          3. Skopiuj <strong>Internal Integration Token</strong> (zaczyna się od ntn_)<br/>
          4. W Notion: Ekosystem Domu → ⋯ → <strong>Add connections</strong>
        </div>
        <Inp label="Notion Integration Token" value={t} onChange={setT} placeholder="ntn_..."/>
        <div style={{marginTop:12}}>
          <Btn onClick={()=>onToken(t)} disabled={!(t.startsWith("secret_")||t.startsWith("ntn_"))}>Połącz z Notion</Btn>
        </div>
      </Card>
    </div>
  );
}

// MAIN
export default function App() {
  const [tab,setTab]=useState("dashboard");
  const [token,setToken]=useState(()=>localStorage.getItem("notion_token")||"");
  function handleToken(t){localStorage.setItem("notion_token",t);setToken(t);}
  if(!token) return <Setup onToken={handleToken}/>;
  const screens={dashboard:<Dashboard token={token}/>,wydatki:<Wydatki token={token}/>,zakupy:<Zakupy token={token}/>,posilki:<Posilki token={token}/>,zadania:<Zadania token={token}/>,zarobki:<Zarobki token={token}/>,oplaty:<Oplaty token={token}/>};
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:480,margin:"0 auto",background:MAY.bg,minHeight:"100vh",paddingBottom:80}}>
        <div style={{padding:"20px 20px 0"}}>{screens[tab]}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(247,244,238,0.97)",borderTop:`1px solid ${MAY.seaSpray}`,display:"flex",justifyContent:"space-around",padding:"8px 0 14px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",flex:"0 0 auto"}}>
              <span style={{fontSize:18,opacity:tab===t.id?1:.35}}>{t.ico}</span>
              <span style={{fontSize:10,color:tab===t.id?MAY.forest:MAY.seaSpray,fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.lbl}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
