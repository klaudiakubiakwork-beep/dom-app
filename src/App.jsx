import React, { useState, useEffect, useCallback } from "react";

const SUPA_URL = "https://yyvyrodntbpcvahojrhc.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dnlyb2RudGJwY3ZhaG9qcmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTc4MDMsImV4cCI6MjA5MzYzMzgwM30.PB85twz7Mg5uB8pVGxfLj6Ztbt24aO7wJJSPn97U2bY";
const H = { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json", "Prefer": "return=representation" };

async function db(table, method = "GET", body = null, query = "") {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}${query}`, { method, headers: H, body: body ? JSON.stringify(body) : null });
  if (method === "DELETE" || (method === "PATCH" && r.status === 204)) return [];
  return r.json();
}

const MAY = { sea: "#BAD6DA", baby: "#E1F2F4", matcha: "#DDDD7B", sun: "#FFE797", gum: "#F691A9", blush: "#FFD6E0", forest: "#1A4A3A", bg: "#F7F4EE" };
const KAT_COL = { Jedzenie:"#FFE797", Dom:"#BAD6DA", Transport:"#DDDD7B", Zdrowie:"#F691A9", Ubrania:"#FFD6E0", Rozrywka:"#E1F2F4", Inne:"#c8c3bb" };
const KAT_EMO = { Jedzenie:"🍽️", Dom:"🏠", Transport:"🚗", Zdrowie:"💊", Ubrania:"👗", Rozrywka:"🎉", Inne:"📦" };
const PIL_COL = { "Teraz": MAY.gum, "Ten tydzień": MAY.matcha, "Kiedyś": MAY.sea };
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const DAYS = ["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];

function uid() { return Math.random().toString(36).slice(2,9); }
function tod() { return new Date().toISOString().split("T")[0]; }
function curMonth() { const n=new Date(); return MONTHS[n.getMonth()]+" "+n.getFullYear(); }

function Chip({ active, onClick, children, color }) {
  return <button onClick={onClick} style={{ padding:"6px 12px", borderRadius:20, border:`1.5px solid ${active?"transparent":MAY.sea}`, background:active?(color||MAY.forest):"white", color:active?"white":MAY.forest, fontSize:12, cursor:"pointer", fontWeight:active?600:400, transition:".12s", whiteSpace:"nowrap", fontFamily:"inherit" }}>{children}</button>;
}
function Inp({ label, value, onChange, type="text", placeholder }) {
  return <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
    {label && <label style={{ fontSize:10, color:MAY.forest, opacity:.55, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ padding:"10px 12px", borderRadius:10, border:`1.5px solid ${MAY.sea}`, background:MAY.baby, color:MAY.forest, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" }} />
  </div>;
}
function Card({ children, style={} }) { return <div style={{ background:"white", borderRadius:16, padding:16, border:`1px solid ${MAY.sea}`, ...style }}>{children}</div>; }
function Btn({ onClick, children, disabled, ok, style={} }) {
  return <button onClick={onClick} disabled={disabled} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:ok?MAY.sea:disabled?"#e0ddd5":MAY.forest, color:ok||disabled?MAY.forest:"white", fontSize:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", transition:".12s", fontFamily:"inherit", ...style }}>{children}</button>;
}
function SecTitle({ children }) { return <div style={{ fontSize:13, fontWeight:600, color:MAY.forest, marginBottom:10 }}>{children}</div>; }
function Lbl({ children }) { return <div style={{ fontSize:10, color:MAY.forest, opacity:.55, textTransform:"uppercase", letterSpacing:.5, marginBottom:4 }}>{children}</div>; }
function Row({ title, sub, right, faded }) {
  return <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${MAY.baby}`, opacity:faded?.45:1 }}>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:13, fontWeight:500, color:MAY.forest, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{title}</div>
      {sub && <div style={{ fontSize:10, color:MAY.forest, opacity:.4, marginTop:1 }}>{sub}</div>}
    </div>
    <div style={{ flexShrink:0, marginLeft:8 }}>{right}</div>
  </div>;
}
function ProgBar({ value, max, color, label, sublabel }) {
  const pct = max>0?Math.min((value/max)*100,100):0;
  return <div style={{ marginBottom:8 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:11, color:MAY.forest }}><span>{label}</span><span style={{ fontWeight:600 }}>{sublabel}</span></div>
    <div style={{ height:6, background:MAY.baby, borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", width:pct+"%", background:color, borderRadius:3, transition:".4s" }} />
    </div>
  </div>;
}

function Donut({ data, size=130 }) {
  if (!data||!data.length) return <div style={{ textAlign:"center", color:MAY.forest, opacity:.3, fontSize:12, padding:12 }}>Brak danych</div>;
  const total=data.reduce((s,d)=>s+d.v,0); if (!total) return null;
  const cx=size/2, cy=size/2, r=size*.38, inn=size*.22; let cum=-Math.PI/2;
  const segs=data.map(d=>{
    const a=(d.v/total)*Math.PI*2;
    const x1=cx+r*Math.cos(cum),y1=cy+r*Math.sin(cum); cum+=a;
    const x2=cx+r*Math.cos(cum),y2=cy+r*Math.sin(cum);
    const xi1=cx+inn*Math.cos(cum-a),yi1=cy+inn*Math.sin(cum-a);
    const xi2=cx+inn*Math.cos(cum),yi2=cy+inn*Math.sin(cum);
    const lg=a>Math.PI?1:0;
    return <path key={d.l} d={`M${x1},${y1}A${r},${r}0 ${lg},1 ${x2},${y2}L${xi2},${yi2}A${inn},${inn}0 ${lg},0 ${xi1},${yi1}Z`} fill={d.c} stroke="white" strokeWidth="1.5"/>;
  });
  return <div style={{ display:"flex", alignItems:"center", gap:12 }}>
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      {segs}
      <text x={cx} y={cy-4} textAnchor="middle" style={{ fontSize:9, fill:MAY.forest, opacity:.5 }}>łącznie</text>
      <text x={cx} y={cy+10} textAnchor="middle" style={{ fontSize:12, fontWeight:"bold", fill:MAY.forest }}>{Math.round(total)} zł</text>
    </svg>
    <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, minWidth:0 }}>
      {data.slice(0,7).map((d,i)=><div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:d.c, flexShrink:0 }}/>
        <div style={{ fontSize:11, color:MAY.forest, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.l}</div>
        <div style={{ fontSize:10, fontWeight:600, color:MAY.forest, flexShrink:0 }}>{Math.round((d.v/total)*100)}%</div>
      </div>)}
    </div>
  </div>;
}
function BarChart({ data, height=90 }) {
  if (!data||!data.length) return null;
  const max=Math.max(...data.map(d=>d.v),1);
  return <div style={{ display:"flex", alignItems:"flex-end", gap:4, height, paddingTop:8 }}>
    {data.map((d,i)=><div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, height:"100%", justifyContent:"flex-end" }}>
      {d.v>0&&<div style={{ fontSize:9, color:MAY.forest, opacity:.5 }}>{Math.round(d.v)>999?Math.round(d.v/1000)+"k":Math.round(d.v)}</div>}
      <div style={{ width:"100%", background:d.c||MAY.sea, borderRadius:"4px 4px 0 0", height:`${Math.max((d.v/max)*80,d.v>0?4:0)}%`, transition:".3s" }}/>
      <div style={{ fontSize:9, color:MAY.forest, opacity:.5, whiteSpace:"nowrap", overflow:"hidden", maxWidth:32, textAlign:"center" }}>{d.l}</div>
    </div>)}
  </div>;
}

function Modal({ title, onClose, children }) {
  return <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.45)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
    <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:14, fontWeight:600, color:MAY.forest }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:MAY.forest, opacity:.4 }}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

function Dashboard({ data, setTab }) {
  const now = new Date();
  const h = now.getHours();
  const greet = h<6?"Dobranoc 🌙":h<12?"Dzień dobry ☀️":h<18?"Dzień dobry 🌤️":"Dobry wieczór 🌙";
  const cm = curMonth();
  const totalW = data.wydatki.reduce((s,i)=>s+(i.kwota||0),0);
  const totalO = data.oplaty.reduce((s,i)=>s+(i.kwota||0),0);
  const zapl = data.oplaty.filter(i=>i.paid?.[cm]).reduce((s,i)=>s+(i.kwota||0),0);
  const niezapl = totalO - zapl;
  const lastZ = data.zarobki.slice(-1)[0]||{};
  const totalZ = (lastZ.klaudia||0)+(lastZ.maciej||0);
  const bilans = totalZ - totalW - totalO;
  const totalCele = data.cele?.reduce((s,c)=>s+(c.obecna_kwota||0),0)||0;
  const otwarteTasks = data.zadania.filter(i=>i.status!=="Gotowe").length;
  const byKat={};
  data.wydatki.forEach(i=>{ byKat[i.kat]=(byKat[i.kat]||0)+i.kwota; });
  const katData = Object.entries(byKat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({ l:(KAT_EMO[k]||"")+" "+k, v, c:KAT_COL[k]||"#ccc" }));
  const niezaplOplaty = data.oplaty.filter(i=>!i.paid?.[cm]).slice(0,4);
  const otwZadania = data.zadania.filter(i=>i.status!=="Gotowe").slice(0,3);
  const Section = ({ title, onMore, children }) => <Card style={{ marginBottom:0 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
      <SecTitle>{title}</SecTitle>
      {onMore && <button onClick={onMore} style={{ background:"none", border:"none", fontSize:11, color:MAY.sea, cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>Zobacz wszystkie →</button>}
    </div>
    {children}
  </Card>;
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ padding:"4px 0 2px" }}>
      <div style={{ fontSize:20, fontWeight:700, color:MAY.forest }}>{greet}</div>
      <div style={{ fontSize:12, color:MAY.forest, opacity:.45, marginTop:1 }}>{now.toLocaleDateString("pl-PL",{ weekday:"long", day:"numeric", month:"long" })}</div>
    </div>
    <Card style={{ background:`linear-gradient(135deg,${MAY.sun},${MAY.matcha})`, border:"none", padding:18 }}>
      <div style={{ fontSize:10, color:MAY.forest, opacity:.6, marginBottom:2 }}>BILANS MIESIĘCZNY</div>
      <div style={{ fontSize:32, fontWeight:700, color:MAY.forest, lineHeight:1 }}>{bilans>=0?"+":""}{Math.round(bilans).toLocaleString("pl-PL")} zł</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
        {[["💼 Zarobki",Math.round(totalZ)+" zł"],["💸 Wydatki",Math.round(totalW)+" zł"],["📋 Opłaty",Math.round(totalO)+" zł"]].map(([l,v])=>
          <div key={l} style={{ background:"rgba(255,255,255,0.45)", borderRadius:10, padding:"7px 8px" }}>
            <div style={{ fontSize:9, color:MAY.forest, opacity:.65, marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:13, fontWeight:700, color:MAY.forest }}>{v}</div>
          </div>
        )}
      </div>
    </Card>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      {[
        { emoji:"✅", val:otwarteTasks+" zad.", lbl:"otwarte zadania", bg:MAY.blush, tab:"zadania" },
        { emoji:"🎯", val:Math.round(totalCele).toLocaleString("pl-PL")+" zł", lbl:"zgromadzone w celach", bg:MAY.matcha, tab:"cele" },
      ].map(s=><button key={s.tab} onClick={()=>setTab(s.tab)} style={{ borderRadius:14, padding:"12px 13px", background:s.bg, border:"none", cursor:"pointer", textAlign:"left" }}>
        <div style={{ fontSize:18, marginBottom:4 }}>{s.emoji}</div>
        <div style={{ fontSize:17, fontWeight:700, color:MAY.forest, lineHeight:1 }}>{s.val}</div>
        <div style={{ fontSize:10, color:MAY.forest, opacity:.5, marginTop:3 }}>{s.lbl}</div>
      </button>)}
    </div>
    <Section title={`📋 Opłaty — ${cm}`} onMore={()=>setTab("oplaty")}>
      <ProgBar value={zapl} max={totalO} color={MAY.sea} label="Zapłacone" sublabel={`${Math.round(zapl).toLocaleString("pl-PL")} / ${Math.round(totalO).toLocaleString("pl-PL")} zł`}/>
      {niezapl>0 && <div style={{ fontSize:11, color:MAY.gum, fontWeight:600, marginTop:2 }}>Pozostało: {Math.round(niezapl).toLocaleString("pl-PL")} zł</div>}
      {niezaplOplaty.length>0 && <div style={{ marginTop:8 }}>
        {niezaplOplaty.map(o=><div key={o.id} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${MAY.baby}`, fontSize:12, color:MAY.forest }}>
          <span>{o.nazwa}</span><span style={{ fontWeight:600 }}>{o.kwota} zł</span>
        </div>)}
        {data.oplaty.filter(i=>!i.paid?.[cm]).length>4 && <div style={{ fontSize:11, color:MAY.forest, opacity:.4, marginTop:4 }}>+{data.oplaty.filter(i=>!i.paid?.[cm]).length-4} więcej…</div>}
      </div>}
    </Section>
    <Section title="📊 Wydatki wg kategorii" onMore={()=>setTab("analiza")}><Donut data={katData} size={120}/></Section>
    <Section title="💸 Ostatnie wydatki" onMore={()=>setTab("wydatki")}>
      {data.wydatki.length===0?<div style={{ textAlign:"center", color:MAY.forest, opacity:.3, fontSize:12, padding:8 }}>Brak wydatków</div>:
        [...data.wydatki].reverse().slice(0,4).map(i=><Row key={i.id} title={(KAT_EMO[i.kat]||"")+" "+i.nazwa} sub={i.kto+" · "+i.data} right={<span style={{ fontSize:12, fontWeight:700, color:MAY.forest }}>{i.kwota} zł</span>}/>)}
    </Section>
    <Section title="✅ Zadania do zrobienia" onMore={()=>setTab("zadania")}>
      {otwZadania.length===0?<div style={{ textAlign:"center", color:MAY.forest, opacity:.3, fontSize:12, padding:8 }}>Wszystko gotowe! 🎉</div>:
        otwZadania.map(t=><Row key={t.id} title={t.zadanie} sub={t.kto+" · "+t.status} right={<div style={{ width:7, height:7, borderRadius:"50%", background:t.status==="W toku"?MAY.matcha:MAY.gum }}/>}/>)}
    </Section>
    {data.cele?.length>0 && <Section title="🎯 Cele finansowe" onMore={()=>setTab("cele")}>
      {data.cele.slice(0,3).map(c=>{
        const pct=c.cel_kwota>0?Math.min(((c.obecna_kwota||0)/c.cel_kwota)*100,100):0;
        return <div key={c.id} style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:MAY.forest, marginBottom:3 }}><span>{c.emoji} {c.nazwa}</span><span style={{ fontWeight:600 }}>{Math.round(pct)}%</span></div>
          <div style={{ height:5, background:MAY.baby, borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:pct+"%", background:c.kolor||MAY.sea, borderRadius:3 }}/></div>
        </div>;
      })}
    </Section>}
  </div>;
}

function Analiza({ data }) {
  const totalW=data.wydatki.reduce((s,i)=>s+(i.kwota||0),0);
  const totalO=data.oplaty.reduce((s,i)=>s+(i.kwota||0),0);
  const lastZ=data.zarobki.slice(-1)[0]||{};
  const totalZ=(lastZ.klaudia||0)+(lastZ.maciej||0);
  const bilans=totalZ-totalW-totalO;
  const byKat={};data.wydatki.forEach(i=>{byKat[i.kat]=(byKat[i.kat]||0)+i.kwota;});
  const katData=Object.entries(byKat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({l:(KAT_EMO[k]||"")+" "+k,v,c:KAT_COL[k]||"#ccc"}));
  const byKto={};data.wydatki.forEach(i=>{byKto[i.kto]=(byKto[i.kto]||0)+i.kwota;});
  const ktoData=Object.entries(byKto).map(([k,v])=>({l:k,v:Math.round(v),c:k==="Klaudia"?MAY.gum:k==="Maciej"?MAY.sea:MAY.matcha}));
  const byOKat={};data.oplaty.forEach(i=>{byOKat[i.kat]=(byOKat[i.kat]||0)+i.kwota;});
  const oKatData=Object.entries(byOKat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({l:k,v:Math.round(v),c:MAY.baby}));
  const bigKat=Object.entries(byKat).sort((a,b)=>b[1]-a[1])[0];
  const wnioski=[];
  if(totalZ>0){
    if(bilans<0) wnioski.push({ico:"⚠️",txt:"Wydatki przekraczają zarobki o "+Math.abs(Math.round(bilans)).toLocaleString("pl-PL")+" zł",bg:MAY.blush});
    else wnioski.push({ico:"✅",txt:"Nadwyżka "+Math.round(bilans).toLocaleString("pl-PL")+" zł — warto odkładać na cele!",bg:MAY.matcha});
    wnioski.push({ico:"📋",txt:"Stałe opłaty to "+Math.round((totalO/totalZ)*100)+"% zarobków",bg:MAY.baby});
    if(totalW>0) wnioski.push({ico:"💸",txt:"Wydatki bieżące to "+Math.round((totalW/totalZ)*100)+"% zarobków",bg:MAY.sun});
  }
  if(bigKat) wnioski.push({ico:"📌",txt:"Największa kategoria: "+bigKat[0]+" ("+Math.round(bigKat[1]).toLocaleString("pl-PL")+" zł)",bg:MAY.sun});
  if(!data.wydatki.length) wnioski.push({ico:"💡",txt:"Dodaj wydatki żeby zobaczyć analizę",bg:MAY.baby});
  const zarBar=data.zarobki.slice(-6).map(z=>({l:(z.miesiac||"").split(" ")[0].slice(0,3),v:(z.klaudia||0)+(z.maciej||0),c:MAY.matcha}));
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <Card style={{ background:`linear-gradient(135deg,${MAY.sun},${MAY.matcha})`, border:"none" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[["ZAROBKI",totalZ>0?Math.round(totalZ).toLocaleString("pl-PL")+" zł":"—",MAY.forest],["WYDATKI",Math.round(totalW+totalO).toLocaleString("pl-PL")+" zł",MAY.forest],["BILANS",(bilans>=0?"+":"")+Math.round(bilans).toLocaleString("pl-PL")+" zł",bilans>=0?MAY.forest:MAY.gum]].map(([l,v,c])=>
          <div key={l}><div style={{ fontSize:9,color:MAY.forest,opacity:.6,marginBottom:2 }}>{l}</div><div style={{ fontSize:14,fontWeight:700,color:c }}>{v}</div></div>
        )}
      </div>
    </Card>
    <Card><SecTitle>💡 Wnioski finansowe</SecTitle>{wnioski.map((w,i)=><div key={i} style={{ display:"flex",alignItems:"flex-start",gap:8,padding:"7px 10px",borderRadius:10,background:w.bg,marginBottom:6 }}><span style={{ fontSize:14 }}>{w.ico}</span><span style={{ fontSize:12,color:MAY.forest,lineHeight:1.4 }}>{w.txt}</span></div>)}</Card>
    <Card><SecTitle>⚖️ Struktura budżetu</SecTitle>{totalZ>0?[["Stałe opłaty",totalO,MAY.gum],["Wydatki bieżące",totalW,MAY.sun],["Pozostałe",Math.max(bilans,0),MAY.matcha]].map(([l,v,c])=><ProgBar key={l} value={v} max={totalZ} color={c} label={l} sublabel={`${Math.round(v).toLocaleString("pl-PL")} zł · ${Math.round(totalZ>0?(v/totalZ)*100:0)}%`}/>):<div style={{ color:MAY.forest,opacity:.3,fontSize:12,textAlign:"center",padding:12 }}>Dodaj zarobki i wydatki</div>}</Card>
    <Card><SecTitle>🍩 Wydatki wg kategorii</SecTitle><Donut data={katData} size={130}/></Card>
    <Card><SecTitle>👥 Kto ile wydał</SecTitle><BarChart data={ktoData} height={80}/></Card>
    {zarBar.length>0&&<Card><SecTitle>📈 Historia zarobków</SecTitle><BarChart data={zarBar} height={80}/></Card>}
    <Card><SecTitle>📋 Stałe opłaty wg kategorii</SecTitle><BarChart data={oKatData} height={80}/>{oKatData.map((d,i)=><ProgBar key={i} value={d.v} max={totalO} color={MAY.sea} label={d.l} sublabel={d.v+" zł"}/>)}</Card>
  </div>;
}

function Wydatki({ data, reload }) {
  const [nazwa,setNazwa]=useState(""); const [kwota,setKwota]=useState("");
  const [kat,setKat]=useState("Jedzenie"); const [kto,setKto]=useState("Klaudia");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const [editing,setEditing]=useState(null);
  const total=data.wydatki.reduce((s,i)=>s+(i.kwota||0),0);
  async function dodaj(){ if(!nazwa||!kwota) return; setSaving(true); await db("wydatki","POST",{id:uid(),nazwa,kwota:parseFloat(kwota),kat,kto,data:tod()}); setNazwa("");setKwota("");setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  async function zapisz(){ if(!editing.nazwa||!editing.kwota) return; setSaving(true); await db("wydatki","PATCH",{nazwa:editing.nazwa,kwota:parseFloat(editing.kwota),kat:editing.kat,kto:editing.kto},`?id=eq.${editing.id}`); setEditing(null);setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  async function usun(id){ await db("wydatki","DELETE",null,`?id=eq.${id}`);setEditing(null);await reload(); }
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    {editing&&<Modal title="✏️ Edytuj wydatek" onClose={()=>setEditing(null)}>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8 }}><Inp label="Co?" value={editing.nazwa} onChange={v=>setEditing(e=>({...e,nazwa:v}))} placeholder="np. Biedronka"/><Inp label="Kwota (zł)" value={String(editing.kwota)} onChange={v=>setEditing(e=>({...e,kwota:v}))} type="number" placeholder="0"/></div>
        <div><Lbl>Kategoria</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{["Jedzenie","Dom","Transport","Zdrowie","Ubrania","Rozrywka","Inne"].map(k=><Chip key={k} active={editing.kat===k} onClick={()=>setEditing(e=>({...e,kat:k}))}>{(KAT_EMO[k]||"")} {k}</Chip>)}</div></div>
        <div><Lbl>Kto płacił</Lbl><div style={{ display:"flex", gap:4 }}>{["Klaudia","Maciej","Wspólnie"].map(k=><Chip key={k} active={editing.kto===k} onClick={()=>setEditing(e=>({...e,kto:k}))}>{k}</Chip>)}</div></div>
        <Btn onClick={zapisz} disabled={saving} ok={ok}>{ok?"✓ Zapisano!":saving?"Zapisuję…":"Zapisz zmiany"}</Btn>
        <button onClick={()=>usun(editing.id)} style={{ width:"100%",padding:10,borderRadius:10,border:`1.5px solid ${MAY.gum}`,background:"white",color:MAY.gum,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>🗑️ Usuń wydatek</button>
      </div>
    </Modal>}
    <Card style={{ background:`linear-gradient(135deg,${MAY.sun},${MAY.matcha})`, border:"none" }}><div style={{ fontSize:10,color:MAY.forest,opacity:.6,marginBottom:2 }}>ŁĄCZNIE W TYM MIESIĄCU 💸</div><div style={{ fontSize:28,fontWeight:700,color:MAY.forest }}>{Math.round(total).toLocaleString("pl-PL")} zł</div></Card>
    <Card><SecTitle>➕ Dodaj wydatek</SecTitle><div style={{ display:"flex", flexDirection:"column", gap:9 }}><div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8 }}><Inp label="Co?" value={nazwa} onChange={setNazwa} placeholder="np. Biedronka"/><Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0"/></div><div><Lbl>Kategoria</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{["Jedzenie","Dom","Transport","Zdrowie","Ubrania","Rozrywka","Inne"].map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{(KAT_EMO[k]||"")} {k}</Chip>)}</div></div><div><Lbl>Kto płacił</Lbl><div style={{ display:"flex", gap:4 }}>{["Klaudia","Maciej","Wspólnie"].map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div><Btn onClick={dodaj} disabled={saving||!nazwa||!kwota} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj wydatek"}</Btn></div></Card>
    <Card><SecTitle>🕐 Ostatnie <span style={{ fontSize:10,opacity:.45,fontWeight:400 }}>· kliknij żeby edytować</span></SecTitle>{data.wydatki.length===0?<div style={{ textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12 }}>Brak wydatków</div>:[...data.wydatki].reverse().slice(0,20).map(i=><div key={i.id} onClick={()=>setEditing({...i,kwota:String(i.kwota)})} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${MAY.baby}`,cursor:"pointer" }}><div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:13,fontWeight:500,color:MAY.forest,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{(KAT_EMO[i.kat]||"")} {i.nazwa}</div><div style={{ fontSize:10,color:MAY.forest,opacity:.4,marginTop:1 }}>{i.kat} · {i.kto} · {i.data}</div></div><div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}><span style={{ fontSize:13,fontWeight:700,color:MAY.forest }}>{i.kwota} zł</span><span style={{ fontSize:11,color:MAY.forest,opacity:.25 }}>✏️</span></div></div>)}</Card>
  </div>;
}

function Zadania({ data, reload }) {
  const [zadanie,setZadanie]=useState(""); const [kto,setKto]=useState("Oboje");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  async function dodaj(){ if(!zadanie) return; setSaving(true); await db("zadania","POST",{id:uid(),zadanie,kto,status:"Do zrobienia"}); setZadanie("");setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  async function zmien(id,st){ if(st==="Gotowe") await db("zadania","DELETE",null,`?id=eq.${id}`); else await db("zadania","PATCH",{status:st},`?id=eq.${id}`); await reload(); }
  const sCol={"Do zrobienia":MAY.gum,"W toku":MAY.matcha};
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <Card><SecTitle>✅ Dodaj zadanie</SecTitle><div style={{ display:"flex", flexDirection:"column", gap:9 }}><Inp label="Co trzeba zrobić?" value={zadanie} onChange={setZadanie} placeholder="np. zapłacić za prąd"/><div><Lbl>Kto?</Lbl><div style={{ display:"flex", gap:4 }}>{["Klaudia","Maciej","Oboje"].map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div><Btn onClick={dodaj} disabled={saving||!zadanie} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj zadanie"}</Btn></div></Card>
    {["Do zrobienia","W toku"].map(s=>{ const items=data.zadania.filter(i=>i.status===s); return items.length?<Card key={s}><div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:8 }}><div style={{ width:8,height:8,borderRadius:"50%",background:sCol[s] }}/><Lbl>{s}</Lbl></div>{items.map(i=><Row key={i.id} title={i.zadanie} sub={i.kto} right={<div style={{ display:"flex",gap:4 }}>{s==="Do zrobienia"&&<button onClick={()=>zmien(i.id,"W toku")} style={{ fontSize:10,padding:"4px 7px",borderRadius:8,border:`1px solid ${MAY.matcha}`,background:"white",color:MAY.forest,cursor:"pointer",fontFamily:"inherit" }}>→</button>}<button onClick={()=>zmien(i.id,"Gotowe")} style={{ fontSize:10,padding:"4px 7px",borderRadius:8,border:`1px solid ${MAY.sea}`,background:"white",color:MAY.forest,cursor:"pointer",fontFamily:"inherit" }}>✓</button></div>}/>)}</Card>:null; })}
    {data.zadania.filter(i=>i.status!=="Gotowe").length===0&&<Card><div style={{ textAlign:"center",color:MAY.forest,opacity:.3,fontSize:13,padding:16 }}>Wszystko gotowe! 🎉</div></Card>}
  </div>;
}

function Zarobki({ data, reload }) {
  const [miesiac,setMiesiac]=useState(curMonth());
  const [klaudia,setKlaudia]=useState(""); const [maciej,setMaciej]=useState(""); const [notatka,setNotatka]=useState("");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const totalAll=data.zarobki.reduce((s,z)=>s+(z.klaudia||0)+(z.maciej||0),0);
  async function dodaj(){ if(!klaudia&&!maciej) return; setSaving(true); const ex=data.zarobki.find(z=>z.miesiac===miesiac); if(ex) await db("zarobki","PATCH",{klaudia:parseFloat(klaudia)||0,maciej:parseFloat(maciej)||0,notatka},`?id=eq.${ex.id}`); else await db("zarobki","POST",{id:uid(),miesiac,klaudia:parseFloat(klaudia)||0,maciej:parseFloat(maciej)||0,notatka}); setKlaudia("");setMaciej("");setNotatka("");setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  const barData=data.zarobki.slice(-6).map(z=>({l:(z.miesiac||"").split(" ")[0].slice(0,3),v:(z.klaudia||0)+(z.maciej||0),c:MAY.matcha}));
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <Card style={{ background:`linear-gradient(135deg,${MAY.blush},${MAY.sun})`, border:"none" }}><div style={{ fontSize:10,color:MAY.forest,opacity:.6,marginBottom:2 }}>ŁĄCZNIE WSZYSTKIE MIESIĄCE 💼</div><div style={{ fontSize:28,fontWeight:700,color:MAY.forest }}>{Math.round(totalAll).toLocaleString("pl-PL")} zł</div></Card>
    {barData.length>0&&<Card><SecTitle>📈 Historia zarobków</SecTitle><BarChart data={barData} height={80}/></Card>}
    <Card><SecTitle>➕ Dodaj zarobki</SecTitle><div style={{ display:"flex", flexDirection:"column", gap:9 }}><div><Lbl>Miesiąc</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{MONTHS.map(m=>{ const full=m+" 2026"; return <Chip key={m} active={miesiac===full} onClick={()=>setMiesiac(full)}>{m.slice(0,3)}</Chip>; })}</div></div><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}><Inp label="Klaudia (zł)" value={klaudia} onChange={setKlaudia} type="number" placeholder="0"/><Inp label="Maciej (zł)" value={maciej} onChange={setMaciej} type="number" placeholder="0"/></div><Inp label="Notatka" value={notatka} onChange={setNotatka} placeholder="opcjonalnie"/><Btn onClick={dodaj} disabled={saving||(!klaudia&&!maciej)} ok={ok}>{ok?"✓ Zapisano!":saving?"Zapisuję…":"Zapisz zarobki"}</Btn></div></Card>
    <Card><SecTitle>📅 Historia</SecTitle>{data.zarobki.length===0?<div style={{ textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12 }}>Brak danych</div>:[...data.zarobki].reverse().map(z=><Row key={z.id} title={z.miesiac} sub={`Klaudia: ${z.klaudia||0} zł · Maciej: ${z.maciej||0} zł`} right={<span style={{ fontSize:13,fontWeight:700,color:MAY.forest }}>{Math.round((z.klaudia||0)+(z.maciej||0)).toLocaleString("pl-PL")} zł</span>}/>)}</Card>
  </div>;
}

function Oplaty({ data, reload }) {
  const [nazwa,setNazwa]=useState(""); const [kwota,setKwota]=useState("");
  const [kat,setKat]=useState("Media"); const [term,setTerm]=useState("1-5");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const [editing,setEditing]=useState(null);
  const cm=curMonth();
  const totalO=data.oplaty.reduce((s,i)=>s+(i.kwota||0),0);
  const zapl=data.oplaty.filter(i=>i.paid?.[cm]).reduce((s,i)=>s+(i.kwota||0),0);
  async function dodaj(){ if(!nazwa) return; setSaving(true); await db("oplaty","POST",{id:uid(),nazwa,kwota:parseFloat(kwota)||0,kat,termin:term,paid:{}}); setNazwa("");setKwota("");setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  async function toggle(item){ const newPaid={...(item.paid||{}),[cm]:!item.paid?.[cm]}; await db("oplaty","PATCH",{paid:newPaid},`?id=eq.${item.id}`);await reload(); }
  async function zapisz(){ if(!editing.nazwa) return; setSaving(true); await db("oplaty","PATCH",{nazwa:editing.nazwa,kwota:parseFloat(editing.kwota)||0,kat:editing.kat,termin:editing.termin},`?id=eq.${editing.id}`); setEditing(null);setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  async function usun(id){ await db("oplaty","DELETE",null,`?id=eq.${id}`);setEditing(null);await reload(); }
  const sorted=[...data.oplaty].sort((a,b)=>(a.paid?.[cm]?1:0)-(b.paid?.[cm]?1:0));
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    {editing&&<Modal title="✏️ Edytuj opłatę" onClose={()=>setEditing(null)}>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8 }}><Inp label="Nazwa" value={editing.nazwa} onChange={v=>setEditing(e=>({...e,nazwa:v}))} placeholder="np. prąd"/><Inp label="Kwota (zł)" value={String(editing.kwota)} onChange={v=>setEditing(e=>({...e,kwota:v}))} type="number" placeholder="0"/></div>
        <div><Lbl>Kategoria</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{["Mieszkanie","Media","Ubezpieczenie","Transport","Subskrypcje","Inne"].map(k=><Chip key={k} active={editing.kat===k} onClick={()=>setEditing(e=>({...e,kat:k}))}>{k}</Chip>)}</div></div>
        <div><Lbl>Termin (dzień mies.)</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{["1-5","6-10","11-15","16-20","21-31"].map(t=><Chip key={t} active={editing.termin===t} onClick={()=>setEditing(e=>({...e,termin:t}))}>{t}</Chip>)}</div></div>
        <Btn onClick={zapisz} disabled={saving} ok={ok}>{ok?"✓ Zapisano!":saving?"Zapisuję…":"Zapisz zmiany"}</Btn>
        <button onClick={()=>usun(editing.id)} style={{ width:"100%",padding:10,borderRadius:10,border:`1.5px solid ${MAY.gum}`,background:"white",color:MAY.gum,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>🗑️ Usuń opłatę</button>
      </div>
    </Modal>}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      <div style={{ borderRadius:14,padding:"12px 13px",background:MAY.blush }}><div style={{ fontSize:16,marginBottom:4 }}>⏳</div><div style={{ fontSize:17,fontWeight:700,color:MAY.forest }}>{Math.round(totalO-zapl).toLocaleString("pl-PL")} zł</div><div style={{ fontSize:10,color:MAY.forest,opacity:.5,marginTop:3 }}>do zapłaty</div></div>
      <div style={{ borderRadius:14,padding:"12px 13px",background:MAY.matcha }}><div style={{ fontSize:16,marginBottom:4 }}>✅</div><div style={{ fontSize:17,fontWeight:700,color:MAY.forest }}>{Math.round(zapl).toLocaleString("pl-PL")} zł</div><div style={{ fontSize:10,color:MAY.forest,opacity:.5,marginTop:3 }}>zapłacone</div></div>
    </div>
    <Card><ProgBar value={zapl} max={totalO} color={MAY.sea} label={`Postęp — ${cm}`} sublabel={`${Math.round(totalO>0?(zapl/totalO)*100:0)}%`}/></Card>
    <Card><SecTitle>➕ Dodaj opłatę</SecTitle><div style={{ display:"flex", flexDirection:"column", gap:9 }}><div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8 }}><Inp label="Nazwa" value={nazwa} onChange={setNazwa} placeholder="np. prąd"/><Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0"/></div><div><Lbl>Kategoria</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{["Mieszkanie","Media","Ubezpieczenie","Transport","Subskrypcje","Inne"].map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div><div><Lbl>Termin (dzień mies.)</Lbl><div style={{ display:"flex", gap:4 }}>{["1-5","6-10","11-15","16-20","21-31"].map(t=><Chip key={t} active={term===t} onClick={()=>setTerm(t)}>{t}</Chip>)}</div></div><Btn onClick={dodaj} disabled={saving||!nazwa} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj opłatę"}</Btn></div></Card>
    <Card><SecTitle>📋 {cm} <span style={{ fontSize:10,opacity:.45,fontWeight:400 }}>· kliknij żeby edytować</span></SecTitle>{sorted.length===0?<div style={{ textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12 }}>Brak opłat</div>:sorted.map(i=>{ const paid=!!i.paid?.[cm]; return <div key={i.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${MAY.baby}`,opacity:paid?.45:1 }}><div style={{ flex:1,minWidth:0,cursor:"pointer" }} onClick={()=>setEditing({...i,kwota:String(i.kwota)})}><div style={{ fontSize:13,fontWeight:500,color:MAY.forest,textDecoration:paid?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{i.nazwa} <span style={{ fontSize:10,opacity:.3 }}>✏️</span></div><div style={{ fontSize:10,color:MAY.forest,opacity:.4 }}>{i.kat} · {i.termin} dnia</div></div><div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8 }}><span style={{ fontSize:13,fontWeight:700,color:MAY.forest }}>{i.kwota} zł</span><button onClick={()=>toggle(i)} style={{ width:26,height:26,borderRadius:"50%",border:`2px solid ${paid?MAY.forest:MAY.sea}`,background:paid?MAY.forest:"white",cursor:"pointer",color:paid?"white":MAY.forest,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center" }}>✓</button></div></div>; })}</Card>
  </div>;
}

function Cele({ data, reload }) {
  const [nazwa,setNazwa]=useState(""); const [kwota,setKwota]=useState(""); const [termin,setTermin]=useState(""); const [emoji,setEmoji]=useState("🎯");
  const [saving,setSaving]=useState(false); const [ok,setOk]=useState(false);
  const [wplata,setWplata]=useState({});
  const EMOJIS=["🏖️","🚗","🏠","💍","🎓","✈️","🛡️","💻","🎯","👶","🏋️","🎨"];
  async function dodaj(){ if(!nazwa||!kwota) return; setSaving(true); await db("cele","POST",{id:uid(),nazwa,emoji,cel_kwota:parseFloat(kwota),obecna_kwota:0,kolor:MAY.sun,termin}); setNazwa("");setKwota("");setTermin("");setOk(true);setTimeout(()=>setOk(false),1500);await reload();setSaving(false); }
  async function wplacNa(cel){ const kw=parseFloat(wplata[cel.id]||0); if(!kw) return; await db("cele","PATCH",{obecna_kwota:Math.min((cel.obecna_kwota||0)+kw,cel.cel_kwota)},`?id=eq.${cel.id}`); setWplata(p=>({...p,[cel.id]:""}));await reload(); }
  async function usunCel(id){ await db("cele","DELETE",null,`?id=eq.${id}`);await reload(); }
  return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <Card style={{ background:`linear-gradient(135deg,${MAY.blush},${MAY.sun})`, border:"none" }}><div style={{ fontSize:10,color:MAY.forest,opacity:.6,marginBottom:2 }}>CELE FINANSOWE 🎯</div><div style={{ fontSize:28,fontWeight:700,color:MAY.forest }}>{(data.cele?.reduce((s,c)=>s+(c.obecna_kwota||0),0)||0).toLocaleString("pl-PL")} zł</div><div style={{ fontSize:11,color:MAY.forest,opacity:.5 }}>zgromadzono łącznie</div></Card>
    {data.cele?.map(c=>{ const pct=c.cel_kwota>0?Math.min(((c.obecna_kwota||0)/c.cel_kwota)*100,100):0; const brakuje=Math.max((c.cel_kwota||0)-(c.obecna_kwota||0),0); const dniDo=c.termin?Math.ceil((new Date(c.termin)-new Date())/(1000*60*60*24)):null; const rataMies=dniDo&&dniDo>0?Math.ceil(brakuje/(dniDo/30)):null;
      return <Card key={c.id} style={{ borderLeft:`4px solid ${c.kolor||MAY.sea}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}><div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:22 }}>{c.emoji}</span><div><div style={{ fontSize:13,fontWeight:600,color:MAY.forest }}>{c.nazwa}</div>{c.termin&&<div style={{ fontSize:10,color:MAY.forest,opacity:.4 }}>do {new Date(c.termin).toLocaleDateString("pl-PL",{month:"long",year:"numeric"})}</div>}</div></div><button onClick={()=>usunCel(c.id)} style={{ background:"none",border:"none",fontSize:14,opacity:.25,cursor:"pointer",color:MAY.forest }}>✕</button></div><div style={{ marginBottom:6 }}><div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:MAY.forest,marginBottom:3 }}><span style={{ fontWeight:600 }}>{(c.obecna_kwota||0).toLocaleString("pl-PL")} zł</span><span style={{ opacity:.5 }}>cel: {(c.cel_kwota||0).toLocaleString("pl-PL")} zł</span></div><div style={{ height:8,background:MAY.baby,borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:pct+"%",background:pct===100?MAY.matcha:c.kolor||MAY.sea,borderRadius:4,transition:".4s" }}/></div><div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}><span style={{ fontSize:10,color:MAY.forest,opacity:.5 }}>{Math.round(pct)}% ukończone</span>{rataMies&&<span style={{ fontSize:10,color:MAY.forest,opacity:.5 }}>~{rataMies.toLocaleString("pl-PL")} zł/mies.</span>}</div></div>{pct<100&&<div style={{ display:"flex",gap:6,marginTop:8 }}><input type="number" placeholder="Wpłać kwotę…" value={wplata[c.id]||""} onChange={e=>setWplata(p=>({...p,[c.id]:e.target.value}))} style={{ flex:1,padding:"8px 10px",borderRadius:8,border:`1.5px solid ${MAY.sea}`,background:MAY.baby,color:MAY.forest,fontSize:13,outline:"none",fontFamily:"inherit" }}/><button onClick={()=>wplacNa(c)} style={{ padding:"8px 14px",borderRadius:8,border:"none",background:MAY.forest,color:"white",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Wpłać</button></div>}{pct===100&&<div style={{ textAlign:"center",padding:"6px 0",fontSize:13,color:MAY.forest,fontWeight:600 }}>🎉 Cel osiągnięty!</div>}</Card>;
    })}
    <Card><SecTitle>➕ Nowy cel</SecTitle><div style={{ display:"flex", flexDirection:"column", gap:9 }}><Inp label="Nazwa celu" value={nazwa} onChange={setNazwa} placeholder="np. Wakacje we Włoszech"/><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}><Inp label="Kwota celu (zł)" value={kwota} onChange={setKwota} type="number" placeholder="10000"/><Inp label="Termin (opcja)" value={termin} onChange={setTermin} type="date"/></div><div><Lbl>Emoji</Lbl><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{ width:36,height:36,borderRadius:10,border:`1.5px solid ${emoji===e?MAY.forest:MAY.sea}`,background:emoji===e?MAY.forest:"white",fontSize:16,cursor:"pointer" }}>{e}</button>)}</div></div><Btn onClick={dodaj} disabled={saving||!nazwa||!kwota} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj cel"}</Btn></div></Card>
  </div>;
}

// BAZA PRZEPISÓW
// ══════════════════════════════════════════════════════════════════════════

const PRZEPISY = {
  "Szejk żelazowa moc": {
    kcal:624, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"],
    skladniki:["1 banan (120g)","1,5 łyżki masła orzechowego (30g)","5 łyżek otrębów pszennych (20g)","2 łyżki płatków owsianych (20g)","3/4 szklanki mleka migdałowego (200ml)","1 łyżka nasion chia (10g)","3/4 porcji WPI (30g)"],
    wykonanie:"Wszystkie składniki zblendować na gładką masę. Można przechować w lodówce do 24h.",
  },
  "Szejk zdrowe jelita": {
    kcal:513, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"],
    skladniki:["2 banany lekko zielone (240g)","2 garście borówek (100g)","1,5 garści malin (100g)","0,5 łyżki siemienia lnianego (5g)","1 szklanka mleka migdałowego (230ml)","3/4 porcji WPI (30g)"],
    wykonanie:"Wszystkie składniki zblendować. Banan lekko zielony — najlepszy dla jelit (skrobia oporna).",
  },
  "Szejk proteinowy": {
    kcal:523, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"],
    skladniki:["2,5 garści malin (200g)","5 łyżek płatków owsianych (50g)","1 łyżka siemienia lnianego (10g)","1,5 szklanki mleka migdałowego (300ml)","1,25 porcji WPI (40g)"],
    wykonanie:"Wszystkie składniki zblendować na gładką masę.",
  },
  "Szejk śniadaniowy": {
    kcal:657, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"],
    skladniki:["2 banany (240g)","1,5 łyżki masła orzechowo-czekoladowego (30g)","2,5 łyżki płatków owsianych (25g)","1,5 szklanki mleka migdałowego (300ml)","3/4 porcji WPI (30g)"],
    wykonanie:"Wszystkie składniki zblendować. Masło można zastąpić innym masłem orzechowym.",
  },
  "Kleik ryżowy z owocami": {
    kcal:611, czas:"5 min", porcje:1, tagi:["ciepłe","szybkie","IO","maluch"],
    skladniki:["12,5 łyżki kleiku ryżowego BoboVita (50g)","1,5 garści malin (100g)","1,5 łyżki masła orzechowego (30g)","1,5 porcji WPI (50g)"],
    wykonanie:"Kleik zalać wodą i dokładnie wymieszać z odżywką. Dodać owoce i masło orzechowe. To kluczowy posiłek — bardzo sycący.",
    uwaga:"Maliny możesz wymienić na truskawki, borówki, owoce leśne, jagody lub jeżyny.",
  },
  "Tosty z mozzarellą": {
    kcal:524, czas:"10 min", porcje:1, tagi:["ciepłe","IO","maluch"],
    skladniki:["4 kromki chleba tostowego pszennego (120g)","4 plastry mozzarelli light (80g)","0,5 pomidora (85g)","1 garść szpinaku (25g)"],
    wykonanie:"Na chleb tostowy położyć plastry mozzarelli, pomidora i liście szpinaku. Zapiec w tosterze, na patelni lub w piekarniku.",
  },
  "Tosty z jajkiem i szynką": {
    kcal:448, czas:"10 min", porcje:1, tagi:["ciepłe","IO","maluch"],
    skladniki:["2 kromki chleba żytniego (70g)","1 jajko (50g)","0,5 łyżki oliwy (5ml)","1/6 pomidora (30g)","1 plaster szynki (15g)","2 liście sałaty (10g)"],
    wykonanie:"Pieczywo zrumienić w tosterze. Na wierzch ułożyć sałatę, szynkę i pomidora. Jajko usmażyć na patelni i przełożyć na kanapkę. Przykryć drugą kromką.",
  },
  "Kurczak teriyaki z ryżem": {
    kcal:637, czas:"30 min", porcje:2, tagi:["kurczak","IO","maluch","bulk"],
    skladniki:["400g piersi kurczaka","60g ryżu basmati","115g papryki czerwonej","100g cukinii","3g czosnku","5g świeżego imbiru","0,5 łyżki oleju rzepakowego","30g sosu teriyaki","10g miodu","3ml soku z limonki","sezam do posypania"],
    wykonanie:"1. Kurczaka pokrój w paski.\n2. Wymieszaj czosnek, imbir, sos teriyaki, miód i sok z limonki — zamarynuj kurczaka min. 20 minut.\n3. Ugotuj ryż.\n4. Smaż kurczaka z marynatą, podlej 50ml wody i duś pod przykryciem.\n5. Dodaj paprykę i cukinię w paski, duś 5 minut.\n6. Podawaj z ryżem posypanym sezamem.",
    uwaga:"Gotujesz porcję x2 — starcza na pon–wt–śr (podgrzewasz wt i śr).",
  },
  "Makaron z kurczakiem i brokułem": {
    kcal:526, czas:"25 min", porcje:2, tagi:["kurczak","makaron","IO","maluch","bulk"],
    skladniki:["300g piersi kurczaka","100g makaronu razowego pszennego","100g brokułów","50g cebuli","10g parmezanu","bazylia, oregano","sól, pieprz","10g orzechów arachidowych"],
    wykonanie:"1. Makaron ugotuj w osolonej wodzie. W połowie gotowania dodaj brokuły. Odcedź.\n2. Kurczaka pokrój, dopraw i smaż z cebulą na oliwie.\n3. Dodaj makaron z brokułem, starty parmezan i bazylię.\n4. Dopraw, wymieszaj.\n5. Posyp orzechami.",
    uwaga:"Gotujesz porcję x2 — starcza na czw–pt–sob.",
  },
  "Spaghetti carbonara": {
    kcal:836, czas:"20 min", porcje:1, tagi:["makaron","jajka","IO"],
    skladniki:["100g makaronu pełnoziarnistego","2 jajka","50g parmezanu","1 ząbek czosnku","50g jogurtu naturalnego 2%","30g boczku wędzonego","20g pietruszki","sól, pieprz czarny"],
    wykonanie:"1. Makaron ugotować al dente.\n2. Wbić jajka do miseczki, dodać starty parmezan, połowę pietruszki, sól i pieprz — wymieszać.\n3. Boczek pokroić, smażyć na suchej patelni 2 minuty. Dodać czosnek.\n4. Dorzucić makaron i podgrzewać minutę.\n5. Wlać masę jajeczną — pilnować żeby się nie ścięły.\n6. Zdjąć z ognia, odczekać 2 minuty, dodać jogurt i wymieszać.\n7. Posypać pietruszką.",
  },
  "Burgery z kurczakiem i mozzarellą": {
    kcal:450, czas:"25 min", porcje:1, tagi:["kurczak","IO","maluch"],
    skladniki:["100g piersi kurczaka","1 bułka żytnia (71g)","2 łyżeczki musztardy","0,5 łyżki oliwy","25g mozzarelli w kulce","garść szpinaku","papryka słodka i ostra, rozmaryn, sól"],
    wykonanie:"1. Kurczaka pokroić wzdłuż na pół.\n2. Oliwę wymieszać z przyprawami — natrzeć mięso i odstawić 20 min.\n3. Bułki przekroić i zgrillować wewnętrzem do dołu.\n4. Kurczaka grillować z obu stron kilka minut.\n5. Spody posmarować musztardą, ułożyć kurczaka, szpinak i mozzarellę.\n6. Przykryć górną połówką.",
  },
  "Pieczony łosoś w porach": {
    kcal:568, czas:"35 min", porcje:1, tagi:["ryba","łosoś","IO","maluch"],
    skladniki:["120g łososia świeżego","40g pora","2 szalotki (40g)","2 łyżki jogurtu naturalnego 0%","10ml oliwy","45g ryżu basmati","100g roszponki","świeży koperek","1 łyżka soku z cytryny","oregano, sól, pieprz"],
    wykonanie:"1. Pora i szalotkę pokrój. Podduś na oliwie ~5 min, dodaj koperek.\n2. W naczyniu żaroodpornym ułóż por, na nim łososia, skrop cytryną. Resztę warzyw dookoła.\n3. Piecz 15 min w 200°C.\n4. Ugotuj ryż.\n5. Roszponkę wymieszaj z jogurtem.\n6. Podawaj razem.",
  },
  "Łosoś w panierce z sezamu": {
    kcal:652, czas:"20 min", porcje:1, tagi:["ryba","łosoś","IO"],
    skladniki:["150g łososia świeżego","10g sezamu czarnego + 10g białego","70g awokado","45g ogórka","20g rukoli","0,5 łyżki oleju rzepakowego","0,5 łyżki oliwy","3ml soku z limonki","sól, pieprz"],
    wykonanie:"1. Łososia obtoczyć w sezamie i usmażyć na oleju.\n2. Awokado pokroić w kostkę, ogórek w plasterki.\n3. Oliwę, sok z limonki, sól i pieprz wymieszać — sos.\n4. Warzywa wymieszać z rukolą i polać sosem.\n5. Podawać razem.",
    uwaga:"Dietetyk napisał: Zrób sobie na 2 dni! 😊",
  },
  "Sałatka z ananasem i indykiem": {
    kcal:522, czas:"15 min", porcje:1, tagi:["indyk","sałatka","IO"],
    skladniki:["67g piersi indyka","53g ananasa","80ml bulionu warzywnego","57g kaszy kuskus","33g kukurydzy","20g jogurtu naturalnego","17g majonezu","7ml oliwy","4ml soku z cytryny"],
    wykonanie:"1. Indyka pokroić, doprawić i obsmażyć na oliwie.\n2. Bulion zagotować, zalać kuskus — przykryć 2 minuty.\n3. Kuskus przełożyć do miski.\n4. Ananasa pokroić, dodać z indykiem i kukurydzą.\n5. Majonez + sok z cytryny + jogurt = dressing.\n6. Polać i wymieszać.",
  },
  "Tortilla z serkiem i warzywami": {
    kcal:336, czas:"8 min", porcje:1, tagi:["szybkie","IO","maluch"],
    skladniki:["1 tortilla pełnoziarnista (60g)","7 łyżeczek ricotty (70g)","1/3 ogórka (60g)","3/4 pomidora (130g)","2 garście roszponki (50g)","2 łyżki szczypiorku","zioła prowansalskie"],
    wykonanie:"Tortillę zrumienić na suchej patelni. Rozsmarować ricottę, ułożyć warzywa, posypać ziołami. Zrolować i pokroić.",
  },
  "Jajecznica w tortilli": {
    kcal:445, czas:"10 min", porcje:1, tagi:["jajka","szybkie","IO","maluch"],
    skladniki:["2 jajka (102g)","1 tortilla pełnoziarnista (60g)","45g ogórka","20g rukoli","10g masła","2 plastry suszonych pomidorów (14g)"],
    wykonanie:"Jajka usmażyć na maśle jako jajecznica. Na tortilli ułożyć jajecznicę, suszone pomidory i warzywa. Zwinąć lub złożyć na pół.",
    uwaga:"Dla malucha: zamiast suszonych pomidorów daj świeżego pomidora.",
  },
  "Jajecznica z boczkiem": {
    kcal:343, czas:"10 min", porcje:1, tagi:["jajka","szybkie","IO"],
    skladniki:["3 jajka (150g)","50g boczku wędzonego (5 plastrów)","sól, pieprz czarny"],
    wykonanie:"Jajka wbić do miseczki, roztrzepać, doprawić. Na rozgrzaną patelnię dodać boczek, podsmażyć. Wlać jajka i usmażyć do preferowanej konsystencji.",
    uwaga:"Do tej kolacji dodaj +200g ulubionych warzyw.",
  },
  "Naleśniki z mascarpone i malinami": {
    kcal:554, czas:"20 min", porcje:1, tagi:["naleśniki","IO","maluch"],
    skladniki:["1 jajko (50g)","70g mąki pszennej","50ml mleka 2%","50g mascarpone (2 łyżki)","50g malin"],
    wykonanie:"1. Wymieszać mąkę, jajko, mleko (i odrobinę oleju).\n2. Usmażyć naleśniki.\n3. Nadziewać mascarpone i malinami.",
    uwaga:"Maliny możesz zastąpić truskawkami lub borówkami.",
  },
  "Fit smoothie z szpinakiem": {
    kcal:435, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"],
    skladniki:["1 banan (120g)","1 jabłko (180g)","1 garść szpinaku (25g)","3/4 szklanki mleka migdałowego (200ml)","10ml soku z cytryny","1,5 porcji WPI (50g)"],
    wykonanie:"Banana obrać i pokroić. Jabłko oczyścić i pokroić. Wszystkie składniki zblendować. Przelać do szklanki.",
  },
  "Pieczony dorsz z warzywami i ziemniakami": {
    kcal:693, czas:"45 min", porcje:1, tagi:["ryba","dorsz","IO","maluch"],
    skladniki:["200g filetu z dorsza","4,5 ziemniaków późnych (405g)","120g cukinii","100g papryki czerwonej","100g pomidorków koktajlowych","50g czerwonej cebuli","1 ząbek czosnku","10ml oliwy","6ml soku z cytryny","bazylia, oregano, papryka słodka, sól, pieprz","pietruszka do posypania"],
    wykonanie:"1. Ziemniaki obrać, pokroić i ugotować na półtwardo (~10 min). Odcedzić.\n2. Warzywa pokroić i wymieszać z oliwą, czosnkiem i przyprawami.\n3. W naczyniu żaroodpornym: ziemniaki → warzywa → dorsz skropiony cytryną.\n4. Skropić resztą oliwy. Piec w 190°C ~30 min.\n5. Posypać natką pietruszki.",
  },
  "Bowl z kurczakiem i kuskusem": {
    kcal:692, czas:"25 min", porcje:1, tagi:["kurczak","IO","maluch"],
    skladniki:["150g piersi kurczaka","60g kaszy kuskus","100g ciecierzycy z puszki","100g pomidorków koktajlowych","100g ogórka","30g czerwonej cebuli","10ml oliwy","15ml soku z cytryny","pietruszka, oregano, papryka","sól, pieprz"],
    wykonanie:"1. Kurczaka pokroić, doprawić i ugrillować bez tłuszczu.\n2. Kuskus przygotować wg instrukcji.\n3. Warzywa pokroić.\n4. Oliwa + sok z cytryny + przyprawy = sos.\n5. W misce: kuskus + warzywa + ciecierzyca + kurczak + sos + pietruszka.",
  },
  "Zapiekanka ze szpinakiem i kurczakiem": {
    kcal:695, czas:"35 min", porcje:1, tagi:["kurczak","makaron","IO"],
    skladniki:["150g piersi kurczaka","100g makaronu pełnoziarnistego pióra","75g szpinaku","40g sera feta","56g śmietany 12%","28g suszonych pomidorów w oleju","10ml oliwy","1 ząbek czosnku","papryka chili, słodka, gałka muszkatołowa","sól, pieprz"],
    wykonanie:"1. Makaron ugotować al dente.\n2. Kurczaka obsmażyć na złoto, odłożyć.\n3. Podsmażyć czosnek i suszone pomidory. Dodać szpinak.\n4. Wlać śmietanę, doprawić.\n5. Dorzucić kurczaka, makaron i pokrojoną fetę.\n6. Zapiekać 20 min w 200°C.",
  },
  "Kaszotto gryczane z indykiem": {
    kcal:693, czas:"30 min", porcje:1, tagi:["indyk","kasza","IO","maluch"],
    skladniki:["150g mielonego mięsa z indyka","70g kaszy gryczanej","200g mrożonego kalafiora","75g szpinaku","45g marchewki","50g cebuli","35g pora","250ml bulionu","1 ząbek czosnku","10ml oliwy","kurkuma, kolendra, pieprz, sól"],
    wykonanie:"1. Zeszklić cebulę i por na oliwie.\n2. Dodać czosnek i startą marchewkę, smażyć 2 min.\n3. Dodać mięso — obsmażać ~2 min.\n4. Dodać kaszę i bulion, zagotować.\n5. Doprawić kurkumą i kolendrą.\n6. Dodać kalafior, przykryć — gotować 15 min.\n7. Dodać szpinak, smażyć mieszając ~2 min.",
  },
  "Kurczak caprese z piekarnika": {
    kcal:688, czas:"40 min", porcje:1, tagi:["kurczak","IO","maluch"],
    skladniki:["200g piersi kurczaka (bez skóry)","125g mozzarelli w kulce","1 pomidor (160g)","15ml oliwy z oliwek","5g świeżego tymianku","5g świeżej bazylii","sól, pieprz"],
    wykonanie:"1. Piekarnik rozgrzać do 190°C.\n2. Filety naciąć w 5 miejscach na ~2cm głębokości.\n3. Natrzeć tymiankiem i oliwą, doprawić.\n4. W naczyniu ułożyć plastry pomidora (doprawione), na nich filety.\n5. Mozzarellę pokroić — wsunąć w nacięcia z listkami bazylii.\n6. Piec bez przykrycia ~35 min.\n7. Posypać świeżą bazylią.",
  },
  "Łosoś z fasolką": {
    kcal:711, czas:"25 min", porcje:1, tagi:["ryba","łosoś","IO","maluch"],
    skladniki:["170g łososia świeżego","150g fasolki szparagowej","50g ryżu brązowego","15ml oleju rzepakowego","2g suszonego tymianku","12ml soku z cytryny","sól, pieprz"],
    wykonanie:"1. Rybę natrzeć tymiankiem i olejem.\n2. Upiec w naczyniu żaroodpornym razem z fasolką w 200°C przez 15-20 min (podlewaj wodą).\n3. Ugotować ryż.\n4. Łososia skropić cytryną. Podawać z ryżem.",
  },
  "Klopsiki szpinakowe w sosie pomidorowym": {
    kcal:714, czas:"35 min", porcje:1, tagi:["indyk","IO","maluch"],
    skladniki:["150g mielonego mięsa z indyka","75g szpinaku","1 jajko","2 pomidory (360g)","50g ryżu brązowego","15ml oliwy","1 ząbek czosnku","0,5 cebuli","oregano, majeranek, sól, pieprz"],
    wykonanie:"1. Cebulę i czosnek podsmażyć na połowie oliwy. Dodać pomidory, dusić z ziołami — sos gotowy.\n2. Na drugiej patelni podsmażyć czosnek i szpinak.\n3. Mięso wymieszać z jajkiem, solą, pieprzem i szpinakiem. Uformować pulpety.\n4. Gotować klopsiki w sosie ~15-20 min.\n5. Podawać z ryżem.",
  },
  "Indyk w sosie śmietanowym ze szpinakiem": {
    kcal:714, czas:"25 min", porcje:1, tagi:["indyk","IO","maluch"],
    skladniki:["150g piersi indyka (bez skóry)","100g szpinaku","50g sera feta","70g śmietanki 18%","50g kaszy jaglanej","15ml oliwy","25g cebuli","1 ząbek czosnku","pietruszka, sól, pieprz"],
    wykonanie:"1. Indyka pokroić w paseczki.\n2. Zeszklić cebulę i czosnek na oliwie.\n3. Dodać mięso, podsmażyć.\n4. Dodać szpinak — dusić aż zwiędnie.\n5. Dodać fetę i śmietankę, wymieszać.\n6. Podawać z ugotowaną kaszą jaglaną i pietruszką.",
  },
  "Kurczak z ryżem w zielonym sosie": {
    kcal:685, czas:"30 min", porcje:1, tagi:["kurczak","IO","maluch"],
    skladniki:["150g piersi kurczaka","100g ryżu dzikiego","100ml mleczka kokosowego","0,5 łyżki oleju kokosowego","12g pietruszki","3g kolendry suszonej","10g szczypiorku","1 ząbek czosnku","sól"],
    wykonanie:"1. Mleczko kokosowe zmiksować z ziołami (pietruszka, kolendra, szczypiorek).\n2. Kurczaka usmażyć, podlać wodą i dusić 10 min. Wyjąć.\n3. Na tej samej patelni podsmażyć czosnek 2-3 min.\n4. Wlać zielone mleczko. Gotować 9-10 min do zgęstnienia.\n5. Ugotować ryż dziki.\n6. Ułożyć kurczaka na ryżu, zalać sosem.",
  },
};

// ══════════════════════════════════════════════════════════════════════════
// MODAL Z PRZEPISEM
// ══════════════════════════════════════════════════════════════════════════

function PrzepisModal({ nazwa, onClose }) {
  const p = PRZEPISY[nazwa];
  if (!p) return null;

  const tagColor = (t) => {
    if (t==="maluch") return { bg:"#E8F0FB", c:"#2C5282" };
    if (t==="IO") return { bg:MAY.sun, c:MAY.forest };
    if (t==="bulk") return { bg:"#EBF2EB", c:"#3B6D3A" };
    if (t==="szejk"||t==="szybkie") return { bg:MAY.baby, c:MAY.forest };
    return { bg:MAY.blush, c:MAY.forest };
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.55)", zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:"20px 18px", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ flex:1, paddingRight:12 }}>
            <div style={{ fontSize:17, fontWeight:700, color:MAY.forest, lineHeight:1.3 }}>{nazwa}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:7 }}>
              {(p.tagi||[]).map(t=>{
                const c=tagColor(t);
                return <span key={t} style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:c.bg, color:c.c }}>{t}</span>;
              })}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:MAY.forest, opacity:.35, flexShrink:0 }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:16 }}>
          {[["🔥","Kcal",p.kcal],["⏱️","Czas",p.czas],["🍽️","Porcje",p.porcje===2?"2 (bulk)":"1"]].map(([e,l,v])=>(
            <div key={l} style={{ background:"white", borderRadius:10, padding:"8px 10px", border:`1px solid ${MAY.sea}`, textAlign:"center" }}>
              <div style={{ fontSize:14, marginBottom:2 }}>{e}</div>
              <div style={{ fontSize:13, fontWeight:700, color:MAY.forest }}>{v}</div>
              <div style={{ fontSize:9, color:MAY.forest, opacity:.4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Składniki */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:MAY.forest, marginBottom:8, textTransform:"uppercase", letterSpacing:.5, opacity:.6 }}>Składniki</div>
          <div style={{ background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, overflow:"hidden" }}>
            {(p.skladniki||[]).map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 13px", borderBottom: i<p.skladniki.length-1?`1px solid ${MAY.baby}`:"none" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:MAY.sea, flexShrink:0, marginTop:6 }}/>
                <div style={{ fontSize:13, color:MAY.forest, lineHeight:1.4 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wykonanie */}
        <div style={{ marginBottom: p.uwaga ? 12 : 0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:MAY.forest, marginBottom:8, textTransform:"uppercase", letterSpacing:.5, opacity:.6 }}>Przygotowanie</div>
          <div style={{ background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, padding:"12px 14px" }}>
            {(p.wykonanie||"").split("\n").map((line,i)=>(
              <div key={i} style={{ fontSize:13, color:MAY.forest, lineHeight:1.6, marginBottom: line.startsWith(String(i+1)) ? 4 : 0 }}>{line}</div>
            ))}
          </div>
        </div>

        {/* Uwaga */}
        {p.uwaga && (
          <div style={{ background:MAY.sun, borderRadius:10, padding:"10px 13px", marginTop:12, display:"flex", gap:8 }}>
            <span style={{ fontSize:14 }}>💡</span>
            <div style={{ fontSize:12, color:MAY.forest, lineHeight:1.5 }}>{p.uwaga}</div>
          </div>
        )}

        <div style={{ height:24 }}/>
      </div>
    </div>
  );
}



// ══════════════════════════════════════════════════════════════════════════
// PLANER TYGODNIOWY
// ══════════════════════════════════════════════════════════════════════════

const PLANER_DAYS = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];
const PLANER_MEALS = ['Śniadanie','Obiad','Kolacja'];

const PLANER_DEFAULT = {
  'Poniedziałek': { type:'cook', meals:{
    'Śniadanie':{ name:'Szejk żelazowa moc', sub:'Banan, WPI, mleko migdałowe, masło orzechowe, chia', tag:'baby' },
    'Obiad':    { name:'Kurczak teriyaki z ryżem', sub:'Pierś kurczaka, ryż basmati, papryka, cukinia — gotuj x2', tag:'cook' },
    'Kolacja':  { name:'Tortilla z serkiem i warzywami', sub:'Tortilla pełnoz., ricotta, ogórek, pomidor, roszponka — gotuj x3', tag:'cook' }
  }},
  'Wtorek': { type:'easy', meals:{
    'Śniadanie':{ name:'Szejk zdrowe jelita', sub:'Banan, borówki, maliny, WPI, siemię lniane', tag:'baby' },
    'Obiad':    { name:'Kurczak teriyaki z ryżem', sub:'Podgrzewasz z poniedziałku', tag:'' },
    'Kolacja':  { name:'Tortilla z serkiem', sub:'Z poniedziałkowych zapasów', tag:'' }
  }},
  'Środa': { type:'cook2', meals:{
    'Śniadanie':{ name:'Tosty z mozzarellą', sub:'Chleb tostowy, mozzarella light, szpinak, pomidor', tag:'baby' },
    'Obiad':    { name:'Kurczak teriyaki z ryżem', sub:'Podgrzewasz z poniedziałku', tag:'' },
    'Kolacja':  { name:'Jajecznica w tortilli', sub:'Jajka, tortilla, suszone pomidory, rukola — gotuj x3', tag:'cook' }
  }},
  'Czwartek': { type:'cook2', meals:{
    'Śniadanie':{ name:'Szejk proteinowy', sub:'Maliny, płatki owsiane, siemię lniane, WPI', tag:'baby' },
    'Obiad':    { name:'Makaron z kurczakiem i brokułem', sub:'Makaron razowy, kurczak, brokuł, parmezan — gotuj x2', tag:'cook' },
    'Kolacja':  { name:'Jajecznica w tortilli', sub:'Z środowych zapasów', tag:'' }
  }},
  'Piątek': { type:'easy', meals:{
    'Śniadanie':{ name:'Szejk śniadaniowy', sub:'2 banany, masło orzechowo-czekoladowe, WPI', tag:'baby' },
    'Obiad':    { name:'Makaron z kurczakiem i brokułem', sub:'Podgrzewasz z czwartku', tag:'' },
    'Kolacja':  { name:'Jajecznica w tortilli', sub:'Z środowych zapasów', tag:'' }
  }},
  'Sobota': { type:'easy', meals:{
    'Śniadanie':{ name:'Tosty z jajkiem i szynką', sub:'Chleb żytni, jajko sadzone, szynka, pomidor, sałata', tag:'baby' },
    'Obiad':    { name:'Makaron z kurczakiem i brokułem', sub:'Podgrzewasz z czwartku', tag:'' },
    'Kolacja':  { name:'Fit smoothie z szpinakiem', sub:'Banan, jabłko, szpinak, WPI, mleko migdałowe', tag:'baby' }
  }},
  'Niedziela': { type:'free', meals:{
    'Śniadanie':{ name:'Wolny wybór', sub:'', tag:'' },
    'Obiad':    { name:'Wolny wybór', sub:'', tag:'' },
    'Kolacja':  { name:'Wolny wybór', sub:'', tag:'' }
  }},
};

const PLANER_SHOP_DEFAULT = [
  { cat:'🥩 Białko i mięso', items:[{n:'Pierś kurczaka',a:'600g'},{n:'Jajka',a:'10 szt.'},{n:'Szynka kanapkowa',a:'1 op.'},{n:'WPI (izolat białka)',a:'250g'}]},
  { cat:'🧀 Nabiał', items:[{n:'Mozzarella light',a:'1 op. (80g)'},{n:'Ricotta',a:'70g'},{n:'Jogurt naturalny 0%',a:'1 op.'},{n:'Parmezan',a:'mały kawałek'}]},
  { cat:'🥦 Warzywa', items:[{n:'Szpinak',a:'2 garście'},{n:'Brokuł',a:'1 szt.'},{n:'Papryka czerwona',a:'2 szt.'},{n:'Cukinia',a:'1 szt.'},{n:'Pomidor',a:'4 szt.'},{n:'Ogórek',a:'2 szt.'},{n:'Roszponka',a:'1 op.'},{n:'Rukola',a:'mała op.'},{n:'Sałata',a:'1 op.'}]},
  { cat:'🍓 Owoce', items:[{n:'Banany',a:'8–9 szt.'},{n:'Maliny (mogą być mrożone)',a:'300g'},{n:'Borówki',a:'100g'},{n:'Jabłko',a:'1 szt.'}]},
  { cat:'🌾 Produkty suche i zbożowe', items:[{n:'Płatki owsiane',a:'1 op.'},{n:'Ryż basmati',a:'120g'},{n:'Makaron razowy',a:'100g'},{n:'Tortille pełnoziarniste',a:'3 szt.'},{n:'Chleb tostowy pszenny',a:'4 kromki'},{n:'Chleb żytni',a:'2 kromki'},{n:'Siemię lniane',a:'1 torebka'},{n:'Nasiona chia',a:'10g'},{n:'Suszone pomidory w oleju',a:'1 słoik'}]},
  { cat:'🫙 Masła i tłuszcze', items:[{n:'Masło orzechowe',a:'60g'},{n:'Masło orzechowo-czekoladowe',a:'30g'},{n:'Mleko migdałowe niesłodzone',a:'1l'},{n:'Sos teriyaki',a:'60g'}]},
  { cat:'💊 Suplementy', items:[{n:'EndoBalance',a:'10ml/dzień przy obiedzie'},{n:'BioMarine / omega-3',a:'10ml/dzień przy kolacji'}]},
];

function planerWeekKey(offset) {
  const d = new Date(); const day = d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return 'planer_week_' + mon.toISOString().slice(0,10);
}
function planerShopKey(offset) { return 'planer_shop_' + planerWeekKey(offset).slice(12); }
function planerWeekLabel(offset) {
  if (offset === 0) return 'Ten tydzień';
  if (offset === 1) return 'Następny tydzień';
  if (offset === -1) return 'Poprzedni tydzień';
  return `Tydzień ${offset > 0 ? '+' : ''}${offset}`;
}
function planerWeekDates(offset) {
  const d = new Date(); const day = d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const sat = new Date(mon); sat.setDate(mon.getDate() + 5);
  const fmt = x => x.toLocaleDateString('pl-PL',{day:'numeric',month:'short'});
  return `${fmt(mon)} – ${fmt(sat)}`;
}

// ══════════════════════════════════════════════════════════════════════════
// ZAMIANA PRZEPISU
// ══════════════════════════════════════════════════════════════════════════

function ZamienModal({ day, mealType, currentName, onSelect, onClose }) {
  const [filter, setFilter] = React.useState('wszystkie');
  const [search, setSearch] = React.useState('');

  const kategorie = ['wszystkie', 'szejk', 'szybkie', 'kurczak', 'ryba', 'makaron', 'jajka', 'IO', 'maluch', 'bulk'];

  const filtered = Object.entries(PRZEPISY).filter(([nazwa, p]) => {
    const matchSearch = search === '' || nazwa.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'wszystkie' || (p.tagi||[]).includes(filter);
    return matchSearch && matchFilter;
  });

  const tagColor = (t) => {
    if (t==="maluch") return { bg:"#E8F0FB", c:"#2C5282" };
    if (t==="IO") return { bg:MAY.sun, c:MAY.forest };
    if (t==="bulk") return { bg:"#EBF2EB", c:"#3B6D3A" };
    if (t==="szejk"||t==="szybkie") return { bg:MAY.baby, c:MAY.forest };
    if (t==="kurczak") return { bg:"#FFF3E0", c:"#8B5000" };
    if (t==="ryba") return { bg:"#E3F2FD", c:"#1565C0" };
    return { bg:MAY.blush, c:MAY.forest };
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.55)", zIndex:600, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:"18px 16px 0", width:"100%", maxWidth:480, maxHeight:"90vh", display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:MAY.forest }}>Zamień przepis</div>
            <div style={{ fontSize:11, color:MAY.forest, opacity:.45 }}>{day} · {mealType} · Teraz: {currentName}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:MAY.forest, opacity:.3 }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ marginBottom:10 }}>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Szukaj przepisu..."
            style={{ width:"100%", padding:"9px 13px", borderRadius:10, border:`1.5px solid ${MAY.sea}`, background:"white", fontSize:13, color:MAY.forest, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:8, marginBottom:4 }}>
          {kategorie.map(k=>(
            <button key={k} onClick={()=>setFilter(k)} style={{ flexShrink:0, padding:"4px 11px", borderRadius:16, border:`1.5px solid ${filter===k?"transparent":MAY.sea}`, background:filter===k?MAY.forest:"white", color:filter===k?"white":MAY.forest, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:filter===k?600:400 }}>
              {k}
            </button>
          ))}
        </div>

        {/* Recipe list */}
        <div style={{ overflowY:"auto", flex:1, paddingBottom:24 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", color:MAY.forest, opacity:.3, fontSize:13, padding:24 }}>Brak wyników</div>
          )}
          {filtered.map(([nazwa, p])=>{
            const isCurrent = nazwa === currentName;
            return (
              <div key={nazwa}
                onClick={()=>{ onSelect(nazwa, p); onClose(); }}
                style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 12px", marginBottom:6, background:isCurrent?"#EBF2EB":"white", borderRadius:12, border:`1.5px solid ${isCurrent?"#C5DAC4":MAY.sea}`, cursor:"pointer" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:MAY.forest }}>{nazwa}</div>
                    {isCurrent && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:8, background:"#C5DAC4", color:"#3B6D3A" }}>aktualny</span>}
                  </div>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:4 }}>
                    {(p.tagi||[]).map(t=>{ const c=tagColor(t); return <span key={t} style={{ fontSize:9, padding:"1px 6px", borderRadius:8, background:c.bg, color:c.c }}>{t}</span>; })}
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <span style={{ fontSize:10, color:MAY.forest, opacity:.5 }}>🔥 {p.kcal} kcal</span>
                    <span style={{ fontSize:10, color:MAY.forest, opacity:.5 }}>⏱️ {p.czas}</span>
                    {p.porcje===2 && <span style={{ fontSize:10, color:"#3B6D3A" }}>🍲 bulk x2</span>}
                  </div>
                </div>
                <div style={{ fontSize:18, color:MAY.sea, flexShrink:0, alignSelf:"center" }}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function PlanerTygodniowy() {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [subTab, setSubTab] = React.useState('plan');
  const [planData, setPlanData] = React.useState(() => { const s = localStorage.getItem(planerWeekKey(0)); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(PLANER_DEFAULT)); });
  const [shopData, setShopData] = React.useState(() => { const s = localStorage.getItem(planerShopKey(0)); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(PLANER_SHOP_DEFAULT)); });
  const [openDays, setOpenDays] = React.useState({'Poniedziałek':true,'Wtorek':true,'Środa':true,'Czwartek':true,'Piątek':true,'Sobota':true,'Niedziela':false});
  const [editModal, setEditModal] = React.useState(null);
  const [editForm, setEditForm] = React.useState({name:'',sub:'',tag:''});
  const [newItems, setNewItems] = React.useState({});
  const [przepisModal, setPrzepisModal] = React.useState(null);
  const [zamienModal, setZamienModal] = React.useState(null); // {day, mealType}

  React.useEffect(() => {
    const s = localStorage.getItem(planerWeekKey(weekOffset));
    setPlanData(s ? JSON.parse(s) : JSON.parse(JSON.stringify(PLANER_DEFAULT)));
    const ss = localStorage.getItem(planerShopKey(weekOffset));
    setShopData(ss ? JSON.parse(ss) : JSON.parse(JSON.stringify(PLANER_SHOP_DEFAULT)));
  }, [weekOffset]);

  function savePlan(data) { setPlanData(data); localStorage.setItem(planerWeekKey(weekOffset), JSON.stringify(data)); }
  function saveShop(data) { setShopData(data); localStorage.setItem(planerShopKey(weekOffset), JSON.stringify(data)); }

  function openEdit(day, meal) { const m = planData[day].meals[meal]; setEditForm({name:m.name,sub:m.sub,tag:m.tag||''}); setEditModal({day,meal}); }
  function saveEdit() { const d = JSON.parse(JSON.stringify(planData)); d[editModal.day].meals[editModal.meal] = {...editForm}; savePlan(d); setEditModal(null); }

  function applyZamiana(nazwa, p) {
    if (!zamienModal) return;
    const d = JSON.parse(JSON.stringify(planData));
    const isBuilk = p.porcje === 2;
    d[zamienModal.day].meals[zamienModal.mealType] = {
      name: nazwa,
      sub: (p.skladniki||[]).slice(0,3).join(', ').slice(0,60) + (isBuilk ? ' — gotuj x2' : ''),
      tag: isBuilk ? 'cook' : (p.tagi||[]).includes('maluch') ? 'baby' : ''
    };
    savePlan(d);
    setZamienModal(null);
  }

  function toggleItem(ci,ii) { const d = JSON.parse(JSON.stringify(shopData)); d[ci].items[ii].checked = !d[ci].items[ii].checked; saveShop(d); }
  function addItem(ci) { const v = (newItems[ci]||'').trim(); if (!v) return; const d = JSON.parse(JSON.stringify(shopData)); d[ci].items.push({n:v,a:'',checked:false}); saveShop(d); setNewItems(x=>({...x,[ci]:''})); }
  function uncheckAll() { const d = JSON.parse(JSON.stringify(shopData)); d.forEach(c=>c.items.forEach(i=>i.checked=false)); saveShop(d); }
  function resetShop() { if (!window.confirm('Zresetować listę zakupów do domyślnej?')) return; saveShop(JSON.parse(JSON.stringify(PLANER_SHOP_DEFAULT))); }

  const totalItems = shopData.reduce((s,c)=>s+c.items.length,0);
  const checkedItems = shopData.reduce((s,c)=>s+c.items.filter(i=>i.checked).length,0);
  const pct = totalItems ? Math.round(checkedItems/totalItems*100) : 0;

  const S = {
    wrap:{ padding:'0 0 24px' },
    titleRow:{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' },
    title:{ fontSize:20, fontWeight:700, color:MAY.forest },
    navBtn:{ background:MAY.baby, border:`1px solid ${MAY.sea}`, borderRadius:6, padding:'3px 10px', fontSize:13, cursor:'pointer', color:MAY.forest },
    weekLabel:{ fontSize:13, fontWeight:600, color:MAY.forest, minWidth:130, textAlign:'center' },
    weekDates:{ fontSize:11, color:MAY.forest, opacity:.4, marginBottom:14 },
    subTabs:{ display:'flex', gap:2, background:MAY.baby, borderRadius:8, padding:3, marginBottom:14, width:'fit-content' },
    subTab:(a)=>({ padding:'6px 16px', borderRadius:6, border:'none', background:a?'white':'transparent', color:a?MAY.forest:'#A8A39C', fontWeight:a?600:400, fontSize:12, cursor:'pointer', fontFamily:'inherit' }),
    cookStrip:{ background:'#EBF2EB', border:'1px solid #C5DAC4', borderRadius:10, padding:'9px 13px', marginBottom:12, fontSize:11, color:'#3B6D3A', lineHeight:1.6 },
    dayCard:(cook)=>({ border:`1px solid ${cook?'#C5DAC4':MAY.sea}`, borderRadius:10, overflow:'hidden', background:'white', marginBottom:7 }),
    dayHead:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 13px', cursor:'pointer' },
    dayName:{ fontSize:13, fontWeight:600, color:MAY.forest },
    badge:(type)=>{ const cfg={cook:{bg:'#EBF2EB',c:'#3B6D3A',t:'Dzień gotowania'},cook2:{bg:MAY.sun,c:MAY.forest,t:'Gotowanie wieczór'},easy:{bg:MAY.baby,c:MAY.forest,t:'Składanie'},free:{bg:MAY.blush,c:MAY.forest,t:'Dzień wolny'}}; const x=cfg[type]||cfg.easy; return {fontSize:9,padding:'2px 7px',borderRadius:20,background:x.bg,color:x.c,label:x.t}; },
    mealsGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'10px 13px', borderTop:`1px solid ${MAY.baby}` },
    mealType:{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.07em', color:MAY.forest, opacity:.4, marginBottom:3 },
    mealBox:{ background:MAY.bg, border:`1px solid ${MAY.sea}`, borderRadius:8, padding:'7px 9px', minHeight:54, position:'relative' },
    mealName:{ fontSize:11, fontWeight:600, color:MAY.forest, lineHeight:1.4 },
    mealSub:{ fontSize:10, color:MAY.forest, opacity:.5, lineHeight:1.4, marginTop:2 },
    mealTagCook:{ fontSize:9, padding:'1px 6px', borderRadius:4, background:'#EBF2EB', color:'#3B6D3A', display:'inline-block', marginTop:2 },
    mealTagBaby:{ fontSize:9, padding:'1px 6px', borderRadius:4, background:MAY.baby, color:MAY.forest, display:'inline-block', marginTop:2 },
    editBtn:{ position:'absolute', top:4, right:4, background:'none', border:'none', cursor:'pointer', fontSize:11, color:MAY.forest, opacity:0, padding:'2px 3px', borderRadius:4 },
    freeNote:{ padding:'10px 13px', borderTop:`1px solid ${MAY.baby}`, fontSize:11, color:MAY.forest, opacity:.5, background:MAY.blush },
    shopHeader:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:7 },
    progressWrap:{ background:MAY.baby, borderRadius:4, height:4, marginBottom:3 },
    progressBar:{ background:MAY.forest, height:4, borderRadius:4, transition:'width 0.3s' },
    progressLabel:{ fontSize:10, color:MAY.forest, opacity:.4, marginBottom:12 },
    catTitle:{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.09em', color:MAY.forest, opacity:.4, paddingBottom:6, borderBottom:`1px solid ${MAY.baby}`, marginBottom:7 },
    shopItem:(c)=>({ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:`1px solid ${MAY.baby}`, cursor:'pointer' }),
    shopCheck:(c)=>({ width:16, height:16, borderRadius:4, border:`1.5px solid ${c?MAY.forest:MAY.sea}`, background:c?MAY.forest:'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }),
    shopText:(c)=>({ fontSize:12, color:c?MAY.sea:MAY.forest, textDecoration:c?'line-through':'none', flex:1 }),
    shopAmt:{ fontSize:10, color:MAY.forest, opacity:.35, whiteSpace:'nowrap' },
    addRow:{ display:'flex', gap:5, marginTop:7 },
    addInput:{ flex:1, border:`1px solid ${MAY.sea}`, borderRadius:7, padding:'5px 9px', fontSize:11, background:MAY.baby, color:MAY.forest, outline:'none', fontFamily:'inherit' },
    smBtn:{ padding:'5px 11px', fontSize:11, borderRadius:7, border:`1px solid ${MAY.sea}`, background:'white', color:MAY.forest, cursor:'pointer', fontFamily:'inherit' },
    smBtnDark:{ padding:'5px 11px', fontSize:11, borderRadius:7, border:'none', background:MAY.forest, color:'white', cursor:'pointer', fontFamily:'inherit' },
    catSection:{ marginBottom:18 },
    overlay:{ position:'fixed', inset:0, background:'rgba(26,74,58,0.5)', zIndex:999, display:'flex', alignItems:'flex-end', justifyContent:'center' },
    modal:{ background:MAY.bg, borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480, maxHeight:'85vh', overflowY:'auto' },
    modalTitle:{ fontSize:15, fontWeight:700, marginBottom:14, color:MAY.forest },
    lbl:{ fontSize:10, color:MAY.forest, opacity:.5, textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:3, marginTop:11 },
    inp:{ width:'100%', border:`1.5px solid ${MAY.sea}`, borderRadius:9, padding:'9px 11px', fontSize:13, color:MAY.forest, background:MAY.baby, outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
    tarea:{ width:'100%', border:`1.5px solid ${MAY.sea}`, borderRadius:9, padding:'9px 11px', fontSize:13, color:MAY.forest, background:MAY.baby, outline:'none', resize:'vertical', minHeight:60, boxSizing:'border-box', fontFamily:'inherit' },
    modalActions:{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' },
    btnCancel:{ padding:'8px 16px', borderRadius:9, border:`1px solid ${MAY.sea}`, background:'white', color:MAY.forest, cursor:'pointer', fontSize:13, fontFamily:'inherit' },
    btnSave:{ padding:'8px 16px', borderRadius:9, border:'none', background:MAY.forest, color:'white', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' },
  };

  return (
    <div style={S.wrap}>
      <div style={{ marginBottom:14 }}>
        <div style={S.titleRow}>
          <span style={S.title}>🥗 Planer tygodniowy</span>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <button style={S.navBtn} onClick={()=>setWeekOffset(w=>w-1)}>‹</button>
            <span style={S.weekLabel}>{planerWeekLabel(weekOffset)}</span>
            <button style={S.navBtn} onClick={()=>setWeekOffset(w=>w+1)}>›</button>
          </div>
        </div>
        <div style={S.weekDates}>{planerWeekDates(weekOffset)} · Zakupy w sobotę · Klaudia + Maciej + maluch</div>
      </div>

      <div style={S.subTabs}>
        {['plan','zakupy'].map(t=>(
          <button key={t} style={S.subTab(subTab===t)} onClick={()=>setSubTab(t)}>
            {t==='plan'?'Plan tygodnia':'Lista zakupów'}
          </button>
        ))}
      </div>

      {subTab==='plan' && (
        <div>
          <div style={S.cookStrip}>
            <strong>Gotowanie: poniedziałek</strong> (obiady pon–wt–śr) + <strong>śr wieczór lub czwartek</strong> (obiady czw–pt–sob). Niedziela wolna.
          </div>
          {PLANER_DAYS.map(day=>{
            const dayD = planData[day];
            const isCook = dayD.type==='cook'||dayD.type==='cook2';
            const isFree = dayD.type==='free';
            const isOpen = openDays[day];
            const bdg = S.badge(dayD.type);
            return (
              <div key={day} style={S.dayCard(isCook)}>
                <div style={S.dayHead} onClick={()=>setOpenDays(x=>({...x,[day]:!x[day]}))}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <span style={S.dayName}>{day}</span>
                    <span style={{fontSize:9,padding:'2px 7px',borderRadius:20,background:bdg.bg,color:bdg.c}}>{bdg.label}</span>
                  </div>
                  <span style={{fontSize:14,color:MAY.forest,opacity:.3,transform:isOpen?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</span>
                </div>
                {isOpen && (isFree
                  ? <div style={S.freeNote}>Niedziela jest wolna — jedz co masz ochotę 🌿</div>
                  : <div style={S.mealsGrid}>
                      {PLANER_MEALS.map(mt=>{
                        const m = dayD.meals[mt]||{name:'',sub:'',tag:''};
                        return (
                          <div key={mt}>
                            <div style={S.mealType}>{mt}</div>
                            <div style={{...S.mealBox, cursor:PRZEPISY[m.name]?'pointer':'default'}}
                              onClick={()=>{if(PRZEPISY[m.name]) setPrzepisModal(m.name);}}
                              onMouseEnter={e=>{e.currentTarget.querySelectorAll('.planer-edit-btn').forEach(b=>b.style.opacity='1');}}
                              onMouseLeave={e=>{e.currentTarget.querySelectorAll('.planer-edit-btn').forEach(b=>b.style.opacity='0');}}>
                              <div style={{position:"absolute",top:4,right:4,display:"flex",gap:3}}>
                              <button className="planer-edit-btn" style={{...S.editBtn,position:"static",opacity:"inherit"}} onClick={e=>{e.stopPropagation();setZamienModal({day,mealType:mt,currentName:m.name});}}>⇄</button>
                              <button className="planer-edit-btn" style={{...S.editBtn,position:"static",opacity:"inherit"}} onClick={e=>{e.stopPropagation();openEdit(day,mt);}}>✎</button>
                            </div>
                              <div style={S.mealName}>{m.name||'—'}</div>
                              {m.sub && <div style={S.mealSub}>{m.sub}</div>}
                              {m.tag==='cook' && <span style={S.mealTagCook}>gotuj x2</span>}
                              {m.tag==='baby' && <span style={S.mealTagBaby}>ok dla malucha</span>}
                              {PRZEPISY[m.name] && <span style={{fontSize:9,color:MAY.sea,display:'block',marginTop:3}}>👆 tap po przepis</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subTab==='zakupy' && (
        <div>
          <div style={S.shopHeader}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:MAY.forest,marginBottom:1}}>Lista zakupów na sobotę</div>
              <div style={{fontSize:11,color:MAY.forest,opacity:.4}}>{planerWeekDates(weekOffset)}</div>
            </div>
            <div style={{display:'flex',gap:5}}>
              <button style={S.smBtn} onClick={uncheckAll}>Odznacz</button>
              <button style={S.smBtnDark} onClick={resetShop}>Resetuj</button>
            </div>
          </div>
          <div style={S.progressWrap}><div style={{...S.progressBar,width:pct+'%'}}/></div>
          <div style={S.progressLabel}>{checkedItems} z {totalItems} w koszyku ({pct}%)</div>
          {shopData.map((cat,ci)=>(
            <div key={ci} style={S.catSection}>
              <div style={S.catTitle}>{cat.cat}</div>
              {cat.items.map((item,ii)=>(
                <div key={ii} style={S.shopItem(item.checked)} onClick={()=>toggleItem(ci,ii)}>
                  <div style={S.shopCheck(item.checked)}>{item.checked && <span style={{color:'white',fontSize:9}}>✓</span>}</div>
                  <span style={S.shopText(item.checked)}>{item.n}</span>
                  {item.a && <span style={S.shopAmt}>{item.a}</span>}
                </div>
              ))}
              <div style={S.addRow}>
                <input style={S.addInput} placeholder="Dodaj produkt..." value={newItems[ci]||''} onChange={e=>setNewItems(x=>({...x,[ci]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addItem(ci)}/>
                <button style={S.smBtn} onClick={()=>addItem(ci)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {przepisModal && <PrzepisModal nazwa={przepisModal} onClose={()=>setPrzepisModal(null)}/>}
      {zamienModal && <ZamienModal day={zamienModal.day} mealType={zamienModal.mealType} currentName={zamienModal.currentName} onSelect={applyZamiana} onClose={()=>setZamienModal(null)}/>}

      {editModal && (
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
          <div style={S.modal}>
            <div style={S.modalTitle}>Edytuj posiłek</div>
            <label style={S.lbl}>Nazwa dania</label>
            <input style={S.inp} value={editForm.name} onChange={e=>setEditForm(x=>({...x,name:e.target.value}))} placeholder="np. Kurczak z warzywami"/>
            <label style={S.lbl}>Składniki / notatka</label>
            <textarea style={S.tarea} value={editForm.sub} onChange={e=>setEditForm(x=>({...x,sub:e.target.value}))} placeholder="np. Pierś kurczaka, ryż basmati, papryka"/>
            <label style={S.lbl}>Tag</label>
            <select style={{...S.inp,height:38}} value={editForm.tag} onChange={e=>setEditForm(x=>({...x,tag:e.target.value}))}>
              <option value="">Brak</option>
              <option value="cook">Gotuj x2 (bulk)</option>
              <option value="baby">OK dla malucha</option>
            </select>
            <div style={S.modalActions}>
              <button style={S.btnCancel} onClick={()=>setEditModal(null)}>Anuluj</button>
              <button style={S.btnSave} onClick={saveEdit}>Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:"dashboard", ico:"🏠", lbl:"Dom" },
  { id:"analiza",   ico:"📊", lbl:"Analiza" },
  { id:"wydatki",   ico:"💸", lbl:"Wydatki" },
  { id:"zadania",   ico:"✅", lbl:"Zadania" },
  { id:"zarobki",   ico:"💼", lbl:"Zarobki" },
  { id:"oplaty",    ico:"📋", lbl:"Opłaty" },
  { id:"cele",      ico:"🎯", lbl:"Cele" },
  { id:"planer",    ico:"🥗", lbl:"Planer" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState({ wydatki:[], zakupy:[], posilki:[], zadania:[], zarobki:[], oplaty:[], cele:[], remont_etapy:[], kredyty:[] });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [w,t,zar,o,c] = await Promise.all([
      db("wydatki","GET",null,"?order=created_at.desc&limit=50"),
      db("zadania","GET",null,"?order=created_at.asc&limit=100"),
      db("zarobki","GET",null,"?order=created_at.asc&limit=24"),
      db("oplaty","GET",null,"?order=created_at.asc&limit=100"),
      db("cele","GET",null,"?order=created_at.asc&limit=20"),
    ]);
    setData({ wydatki:w||[], zakupy:[], posilki:[], zadania:t||[], zarobki:zar||[], oplaty:o||[], cele:c||[], remont_etapy:[], kredyty:[] });
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:MAY.bg }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🏠</div>
      <div style={{ fontSize:14, color:MAY.forest, opacity:.5 }}>Ładuję dane…</div>
    </div>
  </div>;

  const screens = {
    dashboard: <Dashboard data={data} setTab={setTab}/>,
    analiza:   <Analiza data={data}/>,
    wydatki:   <Wydatki data={data} reload={reload}/>,
    zadania:   <Zadania data={data} reload={reload}/>,
    zarobki:   <Zarobki data={data} reload={reload}/>,
    oplaty:    <Oplaty data={data} reload={reload}/>,
    cele:      <Cele data={data} reload={reload}/>,
    planer:    <PlanerTygodniowy />,
  };

  return <>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div style={{ maxWidth:480, margin:"0 auto", background:MAY.bg, minHeight:"100vh", paddingBottom:90 }}>
      <div style={{ padding:"16px 16px 0" }}>{screens[tab]}</div>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"rgba(247,244,238,0.97)", borderTop:`1px solid ${MAY.sea}`, display:"flex", justifyContent:"space-around", padding:"6px 0 12px", overflowX:"auto" }}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", padding:"3px 6px", flex:"0 0 auto" }}>
          <span style={{ fontSize:17, opacity:tab===t.id?1:.3 }}>{t.ico}</span>
          <span style={{ fontSize:9, color:tab===t.id?MAY.forest:MAY.sea, fontWeight:tab===t.id?700:400, whiteSpace:"nowrap" }}>{t.lbl}</span>
        </button>)}
      </div>
    </div>
  </>;
}
