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
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];

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


// ══════════════════════════════════════════════════════════════════════════
// ZDROWIE — BAZA PRZEPISÓW IO (oba ebooki: tydzień 1 + tydzień 2)
// ══════════════════════════════════════════════════════════════════════════

const IO_PRZEPISY = {
  "Kanapki z pastą jajeczną i awokado": { kcal:593, slot:"Śniadanie", tydz:[1], dzien:[1], ingredients:["2 jajka (112g)","140g awokado","10g serka kremowego","5g szczypiorku","2 kromki chleba żytniego razowego","1 pomidor (140g)"], steps:"Jajka ugotuj na twardo ~10 min. Rozgnieć z awokado i serkiem kremowym, dopraw solą i pieprzem. Dodaj posiekany szczypiorek. Nałóż na chleb, podaj z pomidorem.", tip:"Awokado możesz zamienić na 1,5 jajka.", bulk:false },
  "Koktajl czekoladowy z bananem": { kcal:411, slot:"Drugie śniadanie", tydz:[1], dzien:[1], ingredients:["60g banana","200g serka wiejskiego","100ml mleka 2%","10g kakao 16%","5g erytrolu","10g masła orzechowego"], steps:"Wszystko wrzuć do blendera, miksuj na gładką masę.", tip:"Dodaj lód dla chłodniejszej wersji.", bulk:false },
  "Kurczak teriyaki z ryżem i boczniakami": { kcal:562, slot:"Obiad", tydz:[1], dzien:[1,2], ingredients:["400g piersi kurczaka","100g ryżu brązowego","300g boczniaków","135g marchewki","30ml sosu sojowego","9ml octu jabłkowego","15g erytrolu","10g czosnku","20g sezamu","10ml oliwy"], steps:"Sos: soja + oliwa + ocet + erytrol + czosnek. Kurczaka pokrój i marynuj 1h. Smaż na patelni, dodaj boczniaki i marchewkę, duś 5 min. Podaj z ryżem i sezamem.", tip:"Boczniaki możesz zamienić na pieczarki lub cukinię. GOTUJ x2 porcje.", bulk:true },
  "Bananowe serniczki z borówkami": { kcal:330, slot:"Kolacja", tydz:[1], dzien:[1,2], ingredients:["60g banana","100g serka wiejskiego","75g skyru waniliowego","45g mąki orkiszowej","1 jajko","150g borówek","3g proszku do pieczenia"], steps:"Serek + skyr w misce. Banana rozgnieć. Wymieszaj z mąką, jajkiem i proszkiem. Smaż łyżkami na oliwie pod przykryciem. Porcja na 2 dni.", tip:"Borówki możesz zamienić na maliny, jagody lub truskawki. GOTUJ x2.", bulk:true },
  "Tortilla z awokado i szynką": { kcal:490, slot:"Śniadanie", tydz:[1], dzien:[2], ingredients:["1 tortilla pełnoziarnista (61g)","140g awokado","30g szynki z kurczaka","20g rukoli","70g papryki czerwonej"], steps:"Tortillę posmaruj awokado, ułóż szynkę, rukolę i paski papryki. Zawiń i podpiecz na patelni.", tip:"", bulk:false },
  "Gofry z tuńczykiem i serkiem": { kcal:372, slot:"Kolacja", tydz:[1], dzien:[2,3], ingredients:["1 jajko","30g mąki orkiszowej","40g mozzarelli tartej","170g tuńczyka","30g serka kremowego","40g rukoli","140g pomidora","90g rzodkiewki","15ml oliwy"], steps:"Jajko + mąka + mozzarella + tuńczyk — wymieszaj. Smaż w gofrownicy. Podaj z sałatką i serkiem kremowym.", tip:"Tuńczyka możesz zamienić na szynkę. GOTUJ x2.", bulk:true },
  "Nocna owsianka orzechowo-malinowa": { kcal:489, slot:"Śniadanie", tydz:[1], dzien:[3], ingredients:["100g sera twarogowego chudego","75g skyru waniliowego","50g płatków owsianych górskich","15g masła orzechowego","120g malin"], steps:"Twaróg + skyr + płatki + masło orzechowe zblenduj. Do słoika, do lodówki na noc. Rano dodaj maliny.", tip:"Przygotuj wieczór wcześniej! Płatki górskie, nie błyskawiczne.", bulk:false },
  "Serek wiejski tzatziki": { kcal:436, slot:"Kolacja", tydz:[1], dzien:[3], ingredients:["200g serka wiejskiego","80g ogórka","8g kopru","czosnek, sól, pieprz","10ml oliwy","2 kromki chleba żytniego razowego"], steps:"Ogórek zetrzyj na tarce, posiekaj koper. Serek + warzywa + oliwa + przyprawy. Podaj z chlebem.", tip:"", bulk:false },
  "Makaron z pieczoną fetą i pomidorkami": { kcal:542, slot:"Obiad", tydz:[1], dzien:[3,4], ingredients:["140g makaronu penne pełnoziarnistego","300g pomidorków koktajlowych","150g fety","3 ząbki czosnku","15ml oliwy","bazylia"], steps:"Feta + pomidorki + czosnek + oliwa — piecz 30 min w 180°C. Ugotuj makaron al dente. Wymieszaj, rozgnieć na sos, dodaj bazylię.", tip:"Fetę możesz zamienić na mozzarellę. GOTUJ x2.", bulk:true },
  "Muffin z jajkiem rukolą i szynką": { kcal:540, slot:"Śniadanie", tydz:[1], dzien:[4], ingredients:["2 jajka","1 bułka pełnoziarnista","40g rukoli","45g szynki z kurczaka","50g sera twarogowego","30ml śmietany 12%","60g rzodkiewki","5ml oliwy"], steps:"Usmaż jajka sadzone, podsmaż szynkę. Ztostuj bułkę. Twaróg + śmietana = pasta. Złóż wszystko na bułce.", tip:"", bulk:false },
  "Ciasteczkowy deser wysokobiałkowy": { kcal:273, slot:"Drugie śniadanie", tydz:[1], dzien:[4], ingredients:["2 herbatniki (10g)","100g sera twarogowego","10ml śmietany 12%","10g serka kremowego","50ml mleka","100g borówek","5g erytrolu"], steps:"Herbatniki na dnie słoika. Twaróg + śmietana + serek kremowy + mleko — zmiksuj. Dodaj borówki. Na herbatniki wyłóż masę.", tip:"", bulk:false },
  "Krem z pieczonej papryki i pomidorów": { kcal:372, slot:"Kolacja", tydz:[1], dzien:[4,5], ingredients:["150g papryki czerwonej","280g pomidorów","3 ząbki czosnku","500ml bulionu","200g serka wiejskiego","40ml śmietany 12%","2 kromki chleba","20g słonecznika","10ml oliwy"], steps:"Piecz paprykę, pomidory i czosnek 20 min w 200°C. Dodaj do bulionu, blend z serkiem i śmietaną. Podaj z grzankami i słonecznikiem.", tip:"GOTUJ x2 — starcza na czwartek i piątek.", bulk:true },
  "Sernikowa owsianka z nektarynką": { kcal:548, slot:"Śniadanie", tydz:[1], dzien:[5], ingredients:["200g serka wiejskiego","75g skyru waniliowego","15g serka kremowego","50g płatków owsianych","1 nektarynka (100g)"], steps:"Serek + skyr + serek kremowy zblenduj. Dodaj płatki, odstaw chwilę. Nektarynkę pokrój i dodaj.", tip:"", bulk:false },
  "Łosoś w sosie szpinakowym z kaszą bulgur": { kcal:597, slot:"Obiad", tydz:[1], dzien:[5], ingredients:["120g łososia świeżego","40g kaszy bulgur","100g szpinaku","60ml śmietany 12%","100g cebuli","100g pomidorków","2 ząbki czosnku","5ml oliwy"], steps:"Ugotuj kaszę. Podsmaż cebulę ze szpinakiem. Dodaj łososia, duś pod przykryciem. Rozdrobnij, dodaj śmietanę. Dopraw.", tip:"Łososia możesz zamienić na kurczaka lub dorsza.", bulk:false },
  "Brokułowa sałatka z fetą i słonecznikiem": { kcal:336, slot:"Kolacja", tydz:[1], dzien:[5,6], ingredients:["300g brokułów","120g fety","60ml śmietany 12%","30g słonecznika","1 ząbek czosnku"], steps:"Brokuł gotuj 3-4 min, zahartuj zimną wodą. Feta w kostkę. Śmietana + czosnek = dressing. Wymieszaj, posyp słonecznikiem.", tip:"GOTUJ x2 — starcza na piątek i sobotę.", bulk:true },
  "Jajo chlebki z warzywami": { kcal:447, slot:"Śniadanie", tydz:[1], dzien:[6], ingredients:["1 jajko","45g szynki z kurczaka","30g mozzarelli tartej","80g papryki","50g cebuli","75g rzodkiewki","2 kromki chleba żytniego razowego","5ml oliwy"], steps:"Szynkę, paprykę, cebulę pokrój. Wbij jajko, dodaj warzywa, szynkę i ser. Wylej na patelnię. Na środek połóż chleb, złóż jak kanapkę. Smaż z obu stron.", tip:"", bulk:false },
  "Pełnoziarnisty jabłecznik z budyniem": { kcal:425, slot:"Drugie śniadanie", tydz:[1], dzien:[6,7], ingredients:["100g mąki orkiszowej","40g serka kremowego","1 jajko","300g jabłek","25g budyniu bez cukru","150ml mleka","30g erytrolu","10g cynamonu","3g proszku do pieczenia"], steps:"Serek + mąka + jajko + proszek + erytrol = ciasto. Jedna część na blachę, jabłka z cynamonem, budyń z mleka. Zetrzyj drugą część ciasta na górę. Piecz 35-40 min w 170°C.", tip:"GOTUJ x2 — starcza na sobotę i niedzielę.", bulk:true },
  "Kotlety z cukinią i serowymi ziemniakami": { kcal:501, slot:"Obiad", tydz:[1], dzien:[6,7], ingredients:["300g mielonego mięsa z kurczaka","300g cukinii","135g marchewki","350g ziemniaków","20g parmezanu","13ml oliwy"], steps:"Ziemniaki i część cukinii w paski — obtocz w parmezanie i piecz 30 min w 200°C. Reszta cukinii + marchewka + mięso = kotlety. Smaż z obu stron.", tip:"GOTUJ x2 — starcza na sobotę i niedzielę.", bulk:true },
  "Tosty z serka wiejskiego": { kcal:503, slot:"Śniadanie", tydz:[1], dzien:[7], ingredients:["100g serka wiejskiego","2 jajka","40g mozzarelli tartej","30g szynki z kurczaka","25g serka kremowego","100g pomidorków koktajlowych"], steps:"Serek + szynka + mozzarella + jajka + przyprawy. Usmaż w tosterze lub jako placuszki. Posmaruj serkiem, zjedz z pomidorkami.", tip:"", bulk:false },
  "Kanapki z pastą z tuńczyka i cebulką": { kcal:401, slot:"Kolacja", tydz:[1], dzien:[7], ingredients:["170g tuńczyka w sosie własnym","20g serka kremowego","50g cebuli","2 kromki chleba żytniego","120g ogórka"], steps:"Tuńczyk + serek kremowy + drobno posiekana cebulka + sól i pieprz. Nałóż na chleb, zjedz z ogórkiem.", tip:"", bulk:false },
  "Marchewkowa owsianka z masłem orzechowym": { kcal:437, slot:"Śniadanie", tydz:[2], dzien:[1], ingredients:["45g marchewki","150g jabłka","40g płatków owsianych górskich","100g jogurtu greckiego","10g masła orzechowego","50ml mleka","cynamon, erytrol"], steps:"Zetrzyj marchewkę i jabłko. Płatki gotuj na mleku 2 min. Dodaj warzywa, poddusz. Do miski z jogurtem, masłem orzechowym i resztą jabłka.", tip:"Wybieraj płatki górskie.", bulk:false },
  "Pełnoziarnista bułka z serem i ogórkiem kiszonym": { kcal:374, slot:"Drugie śniadanie", tydz:[2], dzien:[1], ingredients:["1 bułka pełnoziarnista","30g sera żółtego","20g serka kremowego","150g ogórków kiszonych"], steps:"Bułkę posmaruj serkiem, ułóż ser żółty. Podaj z ogórkami kiszonymi.", tip:"Ogórki kiszone możesz zastąpić surowymi lub papryką.", bulk:false },
  "Makaron z pesto kurczakiem i warzywami": { kcal:613, slot:"Obiad", tydz:[2], dzien:[1,2], ingredients:["120g makaronu penne pełnoziarnistego","400g piersi kurczaka","225g papryki czerwonej","300g cukinii","30g pesto z bazylii","20g słonecznika","10ml oliwy"], steps:"Ugotuj makaron al dente. Kurczaka i warzywa podsmaż z przyprawami. Dodaj makaron i pesto. Posyp słonecznikiem.", tip:"GOTUJ x2. Makaron możesz zamienić na kaszę gryczaną.", bulk:true },
  "Placki z kalafiora z sosem czosnkowym": { kcal:375, slot:"Kolacja", tydz:[2], dzien:[1,2], ingredients:["300g kalafiora","2 jajka","20g mąki orkiszowej","50g suszonych pomidorów","150g jogurtu greckiego","1 ząbek czosnku","20ml oliwy"], steps:"Kalafior rozdrobnij. Wymieszaj z jajkami, mąką i przyprawami. Smaż łyżkami na oliwie. Sos: jogurt + czosnek + sól.", tip:"GOTUJ x2. Kalafior możesz zamienić na brokuła.", bulk:true },
  "Razowe tosty z serem i szynką": { kcal:378, slot:"Śniadanie", tydz:[2], dzien:[2], ingredients:["2 kromki chleba żytniego razowego","30g sera żółtego","50g szynki z kurczaka","150g papryki czerwonej","2ml oliwy"], steps:"Podpraż chleb na oliwie. Ułóż szynkę i ser, zapiecz pod przykryciem. Podaj z papryką.", tip:"", bulk:false },
  "Cukiniowe brownie": { kcal:400, slot:"Kolacja", tydz:[2], dzien:[2,3], ingredients:["300g cukinii","2 jajka","20g kakao 16%","50g mąki orkiszowej","40g czekolady gorzkiej","20g erytrolu","10ml oliwy","3g proszku do pieczenia"], steps:"Cukinię zetrzyj i odsącz. Czekoladę posiekaj. Wymieszaj wszystko. Piecz 30 min w 180°C.", tip:"GOTUJ x2 — starcza na wtorek i środę.", bulk:true },
  "Bajgiel z serkiem sałatą i łososiem": { kcal:466, slot:"Śniadanie", tydz:[2], dzien:[3], ingredients:["1 bajgiel pełnoziarnisty","20g serka kremowego","100g łososia wędzonego","100g ogórka","35g sałaty rzymskiej"], steps:"Bajgla posmaruj serkiem. Ułóż łososia, sałatę i ogórka.", tip:"", bulk:false },
  "Sałatka z tuńczykiem i awokado": { kcal:465, slot:"Kolacja", tydz:[2], dzien:[3,4], ingredients:["340g tuńczyka w sosie własnym","140g awokado","50g cebuli","100g ogórka","50g sałaty","20ml oliwy","10g musztardy","2 kromki chleba żytniego"], steps:"Pokrój cebulę, ogórek, awokado. Dressing: oliwa + musztarda + sól. Wymieszaj z tuńczykiem.", tip:"GOTUJ x2 — starcza na środę i czwartek.", bulk:true },
  "Dorsz słodko kwaśny z kaszą gryczaną": { kcal:423, slot:"Obiad", tydz:[2], dzien:[3], ingredients:["200g dorsza świeżego","40g kaszy gryczanej","150g fasolki szparagowej","20g keczupu","18ml soku z cytryny","5ml oliwy","czosnek"], steps:"Kaszę ugotuj z fasolką. Sos: keczup + cytryna + przyprawy. Dorsza natrzyj sosem, piecz 20 min w 200°C.", tip:"Dorsza możesz zamienić na kurczaka lub mintaja.", bulk:false },
  "Ziołowy serek z grzanką": { kcal:453, slot:"Śniadanie", tydz:[2], dzien:[4], ingredients:["200g serka wiejskiego","20g serka kremowego","koper ogrodowy, pietruszka, szczypiorek","2 kromki chleba żytniego","100g ogórka","100g pomidorków","czosnek, sól, pieprz"], steps:"Serek + serek kremowy + zioła zmiksuj. Chleb podpiecz na suchej patelni. Podaj z grzankami i warzywami.", tip:"", bulk:false },
  "Zielona zapiekanka z piekarnika": { kcal:462, slot:"Obiad", tydz:[2], dzien:[4,5], ingredients:["400g brokułów","90g marchewki","2 jajka","60g mozzarelli","200g serka wiejskiego","30g sera żółtego","10ml oliwy","50g jogurtu greckiego"], steps:"Warzywa zetrzyj na tarce. Serek wiejski zblenduj. Wszystko wymieszaj z jajkami i przyprawami. Piecz 30-35 min w 200°C. Na koniec ser żółty.", tip:"GOTUJ x2 — starcza na czwartek i piątek.", bulk:true },
  "Gryczanka z czekoladą i truskawkami": { kcal:398, slot:"Kolacja", tydz:[2], dzien:[4], ingredients:["50g kaszy gryczanej","100ml mleka","75g skyru waniliowego","10g czekolady gorzkiej","5g kakao","100g truskawek","10g erytrolu"], steps:"Kaszę ugotuj na mleku z wodą. Do przestudzonej dodaj kakao, erytrol, czekoladę i skyr. Podaj z truskawkami.", tip:"Kaszę możesz zamienić na płatki owsiane.", bulk:false },
  "Kanapki z koperkową pastą z łososia": { kcal:407, slot:"Śniadanie", tydz:[2], dzien:[5], ingredients:["100g łososia wędzonego","20g serka kremowego","koper ogrodowy","75g papryki","50g rzodkiewki","12ml soku z cytryny","2 kromki chleba żytniego"], steps:"Serek + łosoś + koper + cytryna — wymieszaj. Rozsmaruj na pieczywie, zjedz z papryką i rzodkiewką.", tip:"", bulk:false },
  "Pudding chia z kokosem i malinami": { kcal:385, slot:"Drugie śniadanie", tydz:[2], dzien:[5], ingredients:["30g nasion chia","10g wiórków kokosowych","75g skyru waniliowego","200g malin","50ml mleka","5g erytrolu"], steps:"Połowę malin zmiksuj z mlekiem i erytrolem. Wymieszaj z chia, wiórkami i skyrem. Na górę resztę malin. Do lodówki min. 1h.", tip:"", bulk:false },
  "Proteinowa pizza": { kcal:526, slot:"Kolacja", tydz:[2], dzien:[5,6], ingredients:["250g sera twarogowego chudego","2 jajka","70g mąki orkiszowej","200g pomidorów z puszki","100g szynki z kurczaka","20g szpinaku","30g sera żółtego","10ml oliwy"], steps:"Twaróg + jajka + mąka + przyprawy = ciasto. Uformuj placek, piecz 20 min w 200°C. Obróć, dodaj sos i składniki, piecz do rozpuszczenia sera.", tip:"GOTUJ x2 — starcza na piątek i sobotę.", bulk:true },
  "Bowl z mozzarellą kaszą i warzywami": { kcal:385, slot:"Śniadanie", tydz:[2], dzien:[6], ingredients:["30g kaszy gryczanej","65g mozzarelli","100g pomidorków","100g ogórka","50g cebuli","oliwa, musztarda, sok z cytryny"], steps:"Ugotuj kaszę. Pokrój warzywa i mozzarellę. Dressing: oliwa + musztarda + cytryna. Kasza do miski, warzywa na górę.", tip:"", bulk:false },
  "Serowy kurczak w sosie curry z ziemniakami": { kcal:511, slot:"Obiad", tydz:[2], dzien:[6,7], ingredients:["400g piersi kurczaka","300g ziemniaków","30g sera żółtego","100g jogurtu greckiego","100g cebuli","curry, erytrol","50g szpinaku","400g pomidorków"], steps:"Ugotuj ziemniaki. Kurczaka z serem obsmaż z cebulką. Jogurt + curry + erytrol = sos. Duś do zgęstnienia. Podaj z ziemniakami i sałatką szpinakową.", tip:"GOTUJ x2 — starcza na sobotę i niedzielę.", bulk:true },
  "Owsiany deser orzechowy z borówkami": { kcal:424, slot:"Kolacja", tydz:[2], dzien:[6,7], ingredients:["100g płatków owsianych górskich","40g masła orzechowego","150g skyru waniliowego","150g borówek","5g kakao"], steps:"Płatki upraż z masłem orzechowym na patelni. Do naczyń, do lodówki. Skyr + kakao = masa kakaowa. Na płatki, na górę borówki.", tip:"GOTUJ x2 — starcza na sobotę i niedzielę.", bulk:true },
  "Czekoladowy omlet z truskawkami": { kcal:450, slot:"Śniadanie", tydz:[2], dzien:[7], ingredients:["2 jajka","10g kakao","6g czekolady gorzkiej","30g mąki orkiszowej","10g erytrolu","100g truskawek","50ml mleka","5ml oliwy"], steps:"Ubij pianę z białek. Żółtka + erytrol + kakao + mleko + mąka = masa. Dodaj czekoladę i połowę truskawek, połącz z pianą. Smaż na oliwie z obu stron.", tip:"", bulk:false },
  "Razowa zapieksa z pieczarkami i serem": { kcal:453, slot:"Kolacja", tydz:[2], dzien:[7], ingredients:["1 bułka pełnoziarnista","100g pieczarek","45g sera żółtego","5ml oliwy","20g keczupu","100g pomidorków"], steps:"Pokrój i podsmaż pieczarki. Na bułce ułóż grzyby i ser. Zapiecz do rozpuszczenia. Polej keczupem.", tip:"", bulk:false },
};

const IO_CHECKLISTA = {
  rano: [
    { id:"r1", text:"Wstań o tej samej godzinie", sub:"Rytm dobowy stabilizuje kortyzol i insulinę" },
    { id:"r2", text:"Szklanka wody zaraz po wstaniu", sub:"Nawodnienie przed kawą — nerki i glukoza" },
    { id:"r3", text:"10 min ekspozycji na światło dzienne", sub:"Reset zegara biologicznego (Huberman) — HRV rośnie" },
    { id:"r4", text:"Rytuał poranny — 5-10 min ciszy", sub:"Dispenza: nowe emocje budują nową biologię. Przed telefonem." },
    { id:"r5", text:"Śniadanie z min. 20g białka", sub:"Stabilizuje insulinę na cały poranek — najważniejszy posiłek" },
    { id:"r6", text:"Sprawdź plan posiłków na dziś", sub:"Decyzja z góry = zero impulsywnych wyborów żywieniowych" },
    { id:"r7", text:"Weź suplementy (wit. D, magnez)", sub:"Z posiłkiem — konsultuj z Bartoszem dawki" },
  ],
  popoludnie: [
    { id:"p1", text:"Spacer 15-20 minut (cel dzienny)", sub:"Po posiłku — glukoza do mięśni zamiast do tłuszczu" },
    { id:"p2", text:"Obiad: warzywa → białko → węglowodany", sub:"Kolejność jedzenia obniża szczyt glukozy o ~30% (Inchauspé)" },
    { id:"p3", text:"Kawa czarna bez cukru i mleka", sub:"Tylko czarna między posiłkami — nie wywołuje wyrzutu insuliny" },
    { id:"p4", text:"2 litry wody łącznie przez cały dzień", sub:"Nawodnienie wspomaga metabolizm i pracę nerek" },
    { id:"p5", text:"Trening siłowy (2x w tygodniu)", sub:"Mięśnie to zbiornik glukozy — klucz do redukcji IO" },
    { id:"p6", text:"Ocet jabłkowy przed węglowodanami", sub:"1 łyżka w wodzie 15 min przed — spowalnia wchłanianie glukozy" },
  ],
  wieczor: [
    { id:"w1", text:"Kolacja min. 2-3h przed snem", sub:"Walker: jedzenie tuż przed snem obniża HRV i jakość snu" },
    { id:"w2", text:"Przygotuj jutrzejsze śniadanie/owsiankę", sub:"Decyzja wieczorem = zero stresu rano" },
    { id:"w3", text:"Wycisz ekrany 30 min przed snem", sub:"Melatonina vs. niebieskie światło — HRV i regeneracja" },
    { id:"w4", text:"Temperatura w sypialni ~18-19°C", sub:"Walker: kluczowa dla głębokiego snu i wzrostu HRV" },
    { id:"w5", text:"Odczyt Oura Ring — zanotuj", sub:"Trend ważniejszy niż jedna noc. Wpisz dane w zakładkę Metryki." },
    { id:"w6", text:"Jeden moment wdzięczności", sub:"Dispenza: nowa biochemia przez nowe emocje — nie opcjonalne" },
  ],
};


// ══════════════════════════════════════════════════════════════════════════
// ZDROWIE — GŁÓWNY KOMPONENT
// ══════════════════════════════════════════════════════════════════════════

function Zdrowie() {
  const [subTab, setSubTab] = useState("dzisiaj");
  const [loading, setLoading] = useState(true);

  // Data state
  const [checklista, setChecklista] = useState([]);
  const [metryki, setMetryki] = useState([]);
  const [planPosilkow, setPlanPosilkow] = useState([]);
  const [selectedDate, setSelectedDate] = useState(tod());
  const [selectedPrzepisName, setSelectedPrzepisName] = useState(null);
  const [swapModal, setSwapModal] = useState(null); // {date, slot}
  const [swapFilter, setSwapFilter] = useState("wszystkie");

  // Form state — metryki
  const [fHrv, setFHrv] = useState("");
  const [fSleep, setFSleep] = useState("");
  const [fRhr, setFRhr] = useState("");
  const [fSenH, setFSenH] = useState("");
  const [fGlukoza, setFGlukoza] = useState("");
  const [fInsulinaPo, setFInsulinaPo] = useState("");
  const [fNotatka, setFNotatka] = useState("");
  const [mSaving, setMSaving] = useState(false);
  const [mOk, setMOk] = useState(false);

  const reloadAll = useCallback(async () => {
    setLoading(true);
    const [ch, me, pp] = await Promise.all([
      db("zdrowie_checklista","GET",null,`?data=eq.${selectedDate}&order=pora.asc`),
      db("zdrowie_metryki","GET",null,"?order=data.desc&limit=30"),
      db("zdrowie_plan_posilkow","GET",null,`?data=gte.${getWeekStart(selectedDate)}&data=lte.${getWeekEnd(selectedDate)}&order=data.asc`),
    ]);
    setChecklista(Array.isArray(ch)?ch:[]);
    setMetryki(Array.isArray(me)?me:[]);
    setPlanPosilkow(Array.isArray(pp)?pp:[]);
    // Pre-fill metryki form if entry exists for selectedDate
    const todayEntry = (Array.isArray(me)?me:[]).find(m=>m.data===selectedDate);
    if(todayEntry){
      setFHrv(todayEntry.hrv?String(todayEntry.hrv):"");
      setFSleep(todayEntry.sleep_score?String(todayEntry.sleep_score):"");
      setFRhr(todayEntry.rhr?String(todayEntry.rhr):"");
      setFSenH(todayEntry.sen_h?String(todayEntry.sen_h):"");
      setFGlukoza(todayEntry.glukoza_rano?String(todayEntry.glukoza_rano):"");
      setFInsulinaPo(todayEntry.insulina_rano?String(todayEntry.insulina_rano):"");
      setFNotatka(todayEntry.notatka||"");
    } else {
      setFHrv(""); setFSleep(""); setFRhr(""); setFSenH(""); setFGlukoza(""); setFInsulinaPo(""); setFNotatka("");
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { reloadAll(); }, [reloadAll]);

  function getWeekStart(dateStr) {
    const d = new Date(dateStr); const day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (day===0?6:day-1));
    return mon.toISOString().split("T")[0];
  }
  function getWeekEnd(dateStr) {
    const ws = getWeekStart(dateStr); const d = new Date(ws);
    d.setDate(d.getDate()+6); return d.toISOString().split("T")[0];
  }

  // Get or init a checklist item for today
  async function toggleCheck(item) {
    const exists = checklista.find(c=>c.pozycja===item.id && c.data===selectedDate);
    if(exists){
      await db("zdrowie_checklista","PATCH",{zaznaczona:!exists.zaznaczona},`?id=eq.${exists.id}`);
    } else {
      await db("zdrowie_checklista","POST",{id:uid(),data:selectedDate,pozycja:item.id,pora:"rano",zaznaczona:true});
    }
    await reloadAll();
  }

  async function toggleCheckPora(item, pora) {
    const exists = checklista.find(c=>c.pozycja===item.id && c.data===selectedDate);
    if(exists){
      await db("zdrowie_checklista","PATCH",{zaznaczona:!exists.zaznaczona},`?id=eq.${exists.id}`);
    } else {
      await db("zdrowie_checklista","POST",{id:uid(),data:selectedDate,pozycja:item.id,pora,zaznaczona:true});
    }
    await reloadAll();
  }

  function isChecked(itemId) {
    const found = checklista.find(c=>c.pozycja===itemId && c.data===selectedDate);
    return found ? found.zaznaczona : false;
  }

  async function saveMetryki() {
    if(!fHrv && !fSleep && !fRhr && !fSenH && !fGlukoza && !fInsulinaPo) return;
    setMSaving(true);
    const payload = {
      hrv: fHrv?parseInt(fHrv):null,
      sleep_score: fSleep?parseInt(fSleep):null,
      rhr: fRhr?parseInt(fRhr):null,
      sen_h: fSenH?parseFloat(fSenH):null,
      glukoza_rano: fGlukoza?parseFloat(fGlukoza):null,
      insulina_rano: fInsulinaPo?parseFloat(fInsulinaPo):null,
      notatka: fNotatka||null,
    };
    const exists = metryki.find(m=>m.data===selectedDate);
    if(exists){ await db("zdrowie_metryki","PATCH",payload,`?id=eq.${exists.id}`); }
    else { await db("zdrowie_metryki","POST",{id:uid(),data:selectedDate,...payload}); }
    setMOk(true); setTimeout(()=>setMOk(false),1500);
    await reloadAll(); setMSaving(false);
  }

  async function applySwap(newName) {
    if(!swapModal) return;
    const { date, slot } = swapModal;
    const exists = planPosilkow.find(p=>p.data===date && p.slot===slot);
    if(exists){ await db("zdrowie_plan_posilkow","PATCH",{nazwa:newName},`?id=eq.${exists.id}`); }
    else { await db("zdrowie_plan_posilkow","POST",{id:uid(),data:date,slot,nazwa:newName}); }
    setSwapModal(null);
    await reloadAll();
  }

  // Get meal for a specific date+slot (from DB or fallback to schedule)
  function getMealForDateSlot(dateStr, slot) {
    const fromDB = planPosilkow.find(p=>p.data===dateStr && p.slot===slot);
    if(fromDB) return fromDB.nazwa;
    // Fallback: calculate week number and day number from date
    const d = new Date(dateStr); const dayOfWeek = d.getDay();
    const dayNum = dayOfWeek===0?7:dayOfWeek; // 1=Mon..7=Sun
    // Get week of year (simplified: use week parity)
    const startOf2026 = new Date("2026-01-05"); // First Monday of 2026
    const diff = Math.floor((d - startOf2026) / (7*24*60*60*1000));
    const weekNum = ((diff % 2) + 2) % 2 + 1; // alternates 1,2,1,2...
    const SLOTS = ["Śniadanie","Drugie śniadanie","Obiad","Kolacja"];
    const slotIdx = SLOTS.indexOf(slot);
    if(slotIdx === -1) return null;
    // Find matching recipe
    const matches = Object.entries(IO_PRZEPISY).filter(([,p])=>{
      return p.tydz.includes(weekNum) && p.dzien.includes(dayNum) && p.slot === slot;
    });
    if(matches.length > 0) return matches[0][0];
    return null;
  }

  // Generate 7 days of current week
  function getWeekDays(dateStr) {
    const ws = getWeekStart(dateStr);
    return Array.from({length:7},(_,i)=>{
      const d = new Date(ws); d.setDate(d.getDate()+i);
      return d.toISOString().split("T")[0];
    });
  }

  const todayCheckTotal = Object.values(IO_CHECKLISTA).flat().length;
  const todayCheckDone = Object.values(IO_CHECKLISTA).flat().filter(i=>isChecked(i.id)).length;
  const todayPct = todayCheckTotal > 0 ? Math.round((todayCheckDone/todayCheckTotal)*100) : 0;
  const latestMetryki = metryki[0];
  const weekDays = getWeekDays(selectedDate);
  const dayNames = ["Pon","Wt","Śr","Czw","Pt","Sob","Nd"];
  const SLOTS_LIST = ["Śniadanie","Drugie śniadanie","Obiad","Kolacja"];
  const SLOTS_EMO = {"Śniadanie":"🌅","Drugie śniadanie":"🥤","Obiad":"🍽️","Kolacja":"🌙"};

  const hrv7 = metryki.slice(0,7).reverse().map(m=>({l:m.data.slice(5),v:m.hrv||0,c:m.hrv>=40?"#5a8a78":m.hrv>=25?"#DDDD7B":"#F691A9"}));
  const sleep7 = metryki.slice(0,7).reverse().map(m=>({l:m.data.slice(5),v:m.sleep_score||0,c:m.sleep_score>=80?"#5a8a78":m.sleep_score>=65?"#DDDD7B":"#F691A9"}));

  const statusColor = (val, type) => {
    if(!val) return MAY.forest;
    if(type==="hrv") return val>=40?"#5a8a78":val>=25?"#BA7517":"#c4714a";
    if(type==="sleep") return val>=80?"#5a8a78":val>=65?"#BA7517":"#c4714a";
    if(type==="rhr") return val<=60?"#5a8a78":val<=70?"#BA7517":"#c4714a";
    return MAY.forest;
  };

  const SWAP_SLOTS = Object.entries(IO_PRZEPISY).filter(([,p])=>{
    if(swapFilter==="wszystkie") return true;
    if(swapFilter==="Śniadanie") return p.slot==="Śniadanie";
    if(swapFilter==="Drugie śniadanie") return p.slot==="Drugie śniadanie";
    if(swapFilter==="Obiad") return p.slot==="Obiad";
    if(swapFilter==="Kolacja") return p.slot==="Kolacja";
    return true;
  });

  const S = {
    subNav:{ display:"flex", gap:2, background:MAY.baby, borderRadius:10, padding:3, marginBottom:14 },
    sBtn:(a)=>({ flex:1, padding:"7px 4px", borderRadius:8, border:"none", background:a?"white":"transparent", color:a?MAY.forest:"#A8A39C", fontWeight:a?600:400, fontSize:11, cursor:"pointer", fontFamily:"inherit" }),
    dateNav:{ display:"flex", alignItems:"center", gap:8, marginBottom:12 },
    dateBtn:{ background:MAY.baby, border:`1px solid ${MAY.sea}`, borderRadius:7, padding:"4px 10px", fontSize:13, cursor:"pointer", color:MAY.forest, fontFamily:"inherit" },
    heroCard:{ background:`linear-gradient(135deg,#E1F5EE,#BAD6DA)`, borderRadius:16, padding:16, marginBottom:12, border:"none" },
    statGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 },
    statBox:{ background:"white", borderRadius:12, padding:"10px 12px", border:`1px solid ${MAY.sea}`, textAlign:"center" },
    statVal:(c)=>({ fontSize:18, fontWeight:700, color:c||MAY.forest }),
    statLbl:{ fontSize:10, color:MAY.forest, opacity:.5, marginTop:2 },
    checkSection:{ marginBottom:16 },
    poraTxt:{ fontSize:12, fontWeight:600, color:MAY.forest, marginBottom:8, display:"flex", alignItems:"center", gap:6 },
    checkItem:(done)=>({ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:`1px solid ${MAY.baby}`, cursor:"pointer", opacity:done?0.7:1 }),
    checkBox:(done)=>({ width:20, height:20, borderRadius:6, border:`2px solid ${done?MAY.forest:MAY.sea}`, background:done?MAY.forest:"white", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }),
    checkTxt:{ fontSize:13, color:MAY.forest, lineHeight:1.3 },
    checkSub:{ fontSize:11, color:MAY.forest, opacity:.45, marginTop:2 },
    dayPill:(isToday, isPast)=>({ padding:"4px 8px", borderRadius:8, background:isToday?MAY.forest:isPast?MAY.baby:"white", border:`1px solid ${isToday?MAY.forest:MAY.sea}`, color:isToday?"white":MAY.forest, fontSize:10, fontWeight:isToday?700:400, cursor:"pointer", textAlign:"center" }),
    mealRow:{ padding:"8px 0", borderBottom:`1px solid ${MAY.baby}` },
    mealSlot:{ fontSize:10, color:MAY.forest, opacity:.45 },
    mealName:{ fontSize:13, fontWeight:500, color:MAY.forest, marginTop:2 },
    swapBtn:{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:MAY.sea, padding:"2px 4px" },
    alertBox:{ background:"#FFF3CD", border:"1px solid #FFD700", borderRadius:10, padding:"10px 12px", fontSize:12, color:"#7A5F00", lineHeight:1.5 },
    tipBox:{ background:"#E8F4F0", border:"1px solid #BAD6DA", borderRadius:10, padding:"10px 12px", fontSize:12, color:"#1A4A3A", lineHeight:1.5, marginBottom:8 },
  };

  if(loading) return <div style={{ textAlign:"center", padding:40, color:MAY.forest, opacity:.5, fontSize:13 }}>Ładuję dane zdrowotne…</div>;

  return (
    <div style={{ paddingBottom:24 }}>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:20, fontWeight:700, color:MAY.forest, marginBottom:2 }}>💚 Zdrowie</div>
        <div style={{ fontSize:12, color:MAY.forest, opacity:.45 }}>Insulinooporność · Oura · Protokół IO</div>
      </div>

      <div style={S.subNav}>
        {[["dzisiaj","Dziś"],["plan","Jadłospis"],["metryki","Metryki"],["poradnik","Poradnik"]].map(([id,lbl])=>(
          <button key={id} style={S.sBtn(subTab===id)} onClick={()=>setSubTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* ── DZIŚ ── */}
      {subTab==="dzisiaj" && (
        <div>
          {/* Date nav */}
          <div style={S.dateNav}>
            <button style={S.dateBtn} onClick={()=>{ const d=new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().split("T")[0]); }}>‹</button>
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:600, color:MAY.forest }}>{new Date(selectedDate).toLocaleDateString("pl-PL",{weekday:"long", day:"numeric", month:"long"})}</div>
              {selectedDate!==tod()&&<button onClick={()=>setSelectedDate(tod())} style={{ fontSize:10, color:MAY.sea, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>→ Wróć do dziś</button>}
            </div>
            <button style={S.dateBtn} onClick={()=>{ const d=new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().split("T")[0]); }}>›</button>
          </div>

          {/* Progress */}
          <div style={{...S.heroCard}}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8 }}>
              <div>
                <div style={{ fontSize:11, color:"#0F6E56", opacity:.7, marginBottom:2 }}>PROTOKÓŁ DNIA</div>
                <div style={{ fontSize:26, fontWeight:700, color:"#0F6E56" }}>{todayCheckDone}/{todayCheckTotal}</div>
                <div style={{ fontSize:11, color:"#0F6E56", opacity:.6 }}>zadań ukończonych</div>
              </div>
              <div style={{ fontSize:32 }}>{todayPct===100?"🎉":todayPct>=60?"💪":todayPct>=30?"🌱":"⏳"}</div>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,0.5)", borderRadius:3 }}>
              <div style={{ height:"100%", width:todayPct+"%", background:"#0F6E56", borderRadius:3, transition:".4s" }}/>
            </div>
          </div>

          {/* Latest Oura metrics */}
          {latestMetryki && (
            <div style={S.statGrid}>
              {[
                {lbl:"HRV",val:latestMetryki.hrv,unit:"ms",type:"hrv"},
                {lbl:"Sleep Score",val:latestMetryki.sleep_score,unit:"",type:"sleep"},
                {lbl:"RHR",val:latestMetryki.rhr,unit:"bpm",type:"rhr"},
              ].map(s=>(
                <div key={s.lbl} style={S.statBox}>
                  <div style={S.statVal(statusColor(s.val,s.type))}>{s.val||"—"}{s.val&&s.unit}</div>
                  <div style={S.statLbl}>{s.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {/* Checklista */}
          {[
            {pora:"rano", label:"🌅 Rano", items:IO_CHECKLISTA.rano},
            {pora:"popoludnie", label:"☀️ Popołudnie", items:IO_CHECKLISTA.popoludnie},
            {pora:"wieczor", label:"🌙 Wieczór", items:IO_CHECKLISTA.wieczor},
          ].map(({pora,label,items})=>(
            <Card key={pora} style={{ marginBottom:10 }}>
              <div style={S.poraTxt}>
                {label}
                <span style={{ marginLeft:"auto", fontSize:10, color:MAY.forest, opacity:.4 }}>
                  {items.filter(i=>isChecked(i.id)).length}/{items.length}
                </span>
              </div>
              {items.map(item=>{
                const done = isChecked(item.id);
                return (
                  <div key={item.id} style={S.checkItem(done)} onClick={()=>toggleCheckPora(item,pora)}>
                    <div style={S.checkBox(done)}>{done&&<span style={{fontSize:11,color:"white",fontWeight:700}}>✓</span>}</div>
                    <div>
                      <div style={{...S.checkTxt, textDecoration:done?"line-through":"none"}}>{item.text}</div>
                      <div style={S.checkSub}>{item.sub}</div>
                    </div>
                  </div>
                );
              })}
            </Card>
          ))}
        </div>
      )}

      {/* ── JADŁOSPIS ── */}
      {subTab==="plan" && (
        <div>
          {/* Week strip */}
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:8, marginBottom:12 }}>
            {weekDays.map((d,i)=>{
              const isToday = d===tod();
              const isSel = d===selectedDate;
              return (
                <button key={d} onClick={()=>setSelectedDate(d)} style={{ flexShrink:0, minWidth:42, padding:"6px 4px", borderRadius:10, border:`1.5px solid ${isSel?MAY.forest:MAY.sea}`, background:isSel?MAY.forest:isToday?MAY.baby:"white", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:9, color:isSel?"white":MAY.forest, opacity:isSel?1:.55 }}>{dayNames[i]}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:isSel?"white":MAY.forest }}>{new Date(d).getDate()}</div>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize:14, fontWeight:600, color:MAY.forest, marginBottom:10 }}>
            {new Date(selectedDate).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}
          </div>

          {SLOTS_LIST.map(slot=>{
            const mealName = getMealForDateSlot(selectedDate, slot);
            const przepis = mealName ? IO_PRZEPISY[mealName] : null;
            return (
              <Card key={slot} style={{ marginBottom:8, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }} onClick={()=>mealName&&setSelectedPrzepisName(mealName)}>
                    <div style={{ fontSize:10, color:MAY.forest, opacity:.45, marginBottom:3 }}>{SLOTS_EMO[slot]} {slot}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:MAY.forest }}>{mealName||<span style={{opacity:.3}}>Brak przepisu</span>}</div>
                    {przepis&&<div style={{ fontSize:10, color:MAY.forest, opacity:.45, marginTop:3 }}>🔥 {przepis.kcal} kcal{przepis.bulk?" · gotuj x2":""} · tap po przepis</div>}
                  </div>
                  <button onClick={()=>setSwapModal({date:selectedDate,slot})} style={{ background:MAY.baby, border:`1px solid ${MAY.sea}`, borderRadius:7, padding:"4px 9px", fontSize:11, cursor:"pointer", color:MAY.forest, fontFamily:"inherit", flexShrink:0, marginLeft:8 }}>⇄ Zmień</button>
                </div>
              </Card>
            );
          })}

          {/* IO tip */}
          <div style={{ background:"#FFF9E6", borderRadius:12, padding:"10px 13px", marginTop:8, border:`1px solid ${MAY.matcha}` }}>
            <div style={{ fontSize:11, fontWeight:600, color:MAY.forest, marginBottom:4 }}>💡 Zasada IO na dziś</div>
            <div style={{ fontSize:12, color:MAY.forest, opacity:.8, lineHeight:1.5 }}>Pamiętaj o kolejności: <strong>warzywa → białko → węglowodany</strong>. Obniża to szczyt glukozy o ~30%. Po obiedzie — krótki spacer.</div>
          </div>
        </div>
      )}

      {/* ── METRYKI ── */}
      {subTab==="metryki" && (
        <div>
          {/* Date nav */}
          <div style={S.dateNav}>
            <button style={S.dateBtn} onClick={()=>{ const d=new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().split("T")[0]); }}>‹</button>
            <div style={{ flex:1, textAlign:"center", fontSize:13, fontWeight:600, color:MAY.forest }}>
              {new Date(selectedDate).toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"})}
            </div>
            <button style={S.dateBtn} onClick={()=>{ const d=new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().split("T")[0]); }}>›</button>
          </div>

          {/* Wyniki insuliny */}
          <div style={{ background:"#FEF0EC", borderRadius:14, padding:14, marginBottom:12, border:"1px solid #F0997B" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#993C1D", marginBottom:8 }}>📊 Twoje wyniki insuliny (krzywa cukrowa)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
              {[["9.6","Na czczo","✅ ok (do 15)"],["82.8","Po 1h","⚠️ wysoka (norma <60)"],["52.7","Po 2h","⚡ spada"]].map(([val,lbl,status])=>(
                <div key={lbl} style={{ background:"white", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:"#993C1D" }}>{val}</div>
                  <div style={{ fontSize:9, color:"#993C1D", opacity:.6 }}>{lbl}</div>
                  <div style={{ fontSize:9, color:"#993C1D", marginTop:2 }}>{status}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:"#993C1D", lineHeight:1.5 }}>Wysoki wyrzut (82.8) tłumaczy szybki głód i spadki energii. Dieta IO i ruch bezpośrednio obniżają te wartości.</div>
          </div>

          {/* Form */}
          <Card style={{ marginBottom:12 }}>
            <SecTitle>📱 Dane z Oura Ring — {new Date(selectedDate).toLocaleDateString("pl-PL",{day:"numeric",month:"short"})}</SecTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <Inp label="HRV (ms)" value={fHrv} onChange={setFHrv} type="number" placeholder="np. 28"/>
              <Inp label="Sleep Score" value={fSleep} onChange={setFSleep} type="number" placeholder="np. 72"/>
              <Inp label="RHR (bpm)" value={fRhr} onChange={setFRhr} type="number" placeholder="np. 64"/>
              <Inp label="Sen (godz.)" value={fSenH} onChange={setFSenH} type="number" placeholder="np. 7.5"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <Inp label="Glukoza rano (mmol/L)" value={fGlukoza} onChange={setFGlukoza} type="number" placeholder="np. 5.2"/>
              <Inp label="Insulina (mIU/L)" value={fInsulinaPo} onChange={setFInsulinaPo} type="number" placeholder="opcjonalnie"/>
            </div>
            <div style={{ marginBottom:10 }}>
              <Lbl>Notatka</Lbl>
              <textarea value={fNotatka} onChange={e=>setFNotatka(e.target.value)} placeholder="Jak się czujesz? Co wpłynęło na sen?" style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1.5px solid ${MAY.sea}`, background:MAY.baby, color:MAY.forest, fontSize:13, outline:"none", resize:"vertical", minHeight:60, boxSizing:"border-box", fontFamily:"inherit" }}/>
            </div>
            <Btn onClick={saveMetryki} disabled={mSaving} ok={mOk}>{mOk?"✓ Zapisano!":mSaving?"Zapisuję…":"Zapisz dane"}</Btn>
          </Card>

          {/* Charts */}
          {hrv7.length>1 && <Card style={{ marginBottom:10 }}>
            <SecTitle>📈 HRV (7 dni) <span style={{ fontSize:10, fontWeight:400, opacity:.5 }}>— cel: powyżej 40ms</span></SecTitle>
            <BarChart data={hrv7} height={90}/>
            <div style={{ display:"flex", gap:8, marginTop:6, fontSize:10, color:MAY.forest, opacity:.5 }}>
              <span style={{ color:"#5a8a78" }}>● dobry (≥40)</span>
              <span style={{ color:"#BA7517" }}>● ok (25-39)</span>
              <span style={{ color:"#F691A9" }}>● niski (&lt;25)</span>
            </div>
          </Card>}
          {sleep7.length>1 && <Card style={{ marginBottom:10 }}>
            <SecTitle>🌙 Sleep Score (7 dni) <span style={{ fontSize:10, fontWeight:400, opacity:.5 }}>— cel: powyżej 80</span></SecTitle>
            <BarChart data={sleep7} height={90}/>
          </Card>}

          {/* History table */}
          {metryki.length>0 && <Card>
            <SecTitle>📋 Historia</SecTitle>
            {metryki.slice(0,14).map(m=>(
              <div key={m.id} onClick={()=>setSelectedDate(m.data)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${MAY.baby}`, cursor:"pointer" }}>
                <div style={{ fontSize:12, color:MAY.forest, fontWeight:500 }}>{new Date(m.data).toLocaleDateString("pl-PL",{day:"numeric",month:"short"})}</div>
                <div style={{ display:"flex", gap:10, fontSize:11 }}>
                  {m.hrv&&<span style={{ color:statusColor(m.hrv,"hrv"), fontWeight:600 }}>HRV {m.hrv}</span>}
                  {m.sleep_score&&<span style={{ color:statusColor(m.sleep_score,"sleep"), fontWeight:600 }}>Sen {m.sleep_score}</span>}
                  {m.rhr&&<span style={{ color:MAY.forest, opacity:.6 }}>RHR {m.rhr}</span>}
                </div>
              </div>
            ))}
          </Card>}
        </div>
      )}

      {/* ── PORADNIK IO ── */}
      {subTab==="poradnik" && (
        <div>
          <div style={{ background:`linear-gradient(135deg,#E1F5EE,#BAD6DA)`, borderRadius:16, padding:16, marginBottom:12 }}>
            <div style={{ fontSize:16, fontWeight:700, color:MAY.forest, marginBottom:4 }}>Twój Protokół IO</div>
            <div style={{ fontSize:12, color:MAY.forest, opacity:.7, lineHeight:1.6 }}>Insulinooporność jest odwracalna. Każdy punkt poniżej bezpośrednio obniża HOMA-IR i przyszłe wyrzuty insuliny.</div>
          </div>

          {[
            { title:"🍽️ Kolejność jedzenia na talerzu", color:"#FFF9E6", border:MAY.matcha,
              items:["Najpierw warzywa — błonnik spowalnia wchłanianie glukozy","Potem białko — sytość i stabilna insulina","Węglowodany na końcu — szczyt glukozy obniżony o ~30%","Metoda potwierdzona przez Jessie Inchauspé (Glucose Goddess)"] },
            { title:"⏰ Timing posiłków", color:"#F0F8FF", border:MAY.sea,
              items:["4 posiłki dziennie — trzustka ma czas na odpoczynek","Co 3-4h między posiłkami — nie podjadaj","Pierwsze białko w ciągu 30 min po wstaniu","Ostatni posiłek min. 2-3h przed snem (Walker — HRV)"] },
            { title:"🚶 Ruch po posiłku", color:"#EBF2EB", border:"#C5DAC4",
              items:["10-15 min spaceru po obiedzie = glukoza do mięśni","Trening siłowy 2x/tydz. = więcej zbiorników glukozy","Mięśnie to naturalny pochłaniacz cukru — kluczowe w IO","Nawet krótki spacer z dzieckiem po obiedzie liczy się!"] },
            { title:"⚠️ Hipoglikemia reaktywna — co robić", color:"#FEF0EC", border:"#F0997B",
              items:["Objawy: drżenie, potliwość, kołatanie, mgła ok. 2-3h po jedzeniu","NIE sięgaj po cukier — to tylko pogłębi błędne koło","Jedz: orzechy + plaster szynki / serek z warzywami","Usiądź, oddech, spokój — to reakcja biochemiczna, nie słabość","Zapisuj kiedy się pojawia — daj wzorzec Bartoszowi"] },
            { title:"💊 Suplementacja (omów z Bartoszem)", color:MAY.baby, border:MAY.sea,
              items:["Witamina D — 2000-4000 IU przez cały rok (z posiłkiem)","Magnez — 300mg wieczorem (HRV i sen)","Omega-3 — 2g DHA+EPA (stan zapalny, wrażliwość na insulinę)","Berberyna — sprawdź z dietetykiem (jak metformina naturalnie)","Probiotyki — jelita wpływają na metabolizm glukozy"] },
            { title:"🔬 Wskaźniki do śledzenia", color:"#F5F0FF", border:"#AFA9EC",
              items:["HOMA-IR = (insulina na czczo × glukoza) / 22.5 — cel: <2","HRV Oura — trend wzrostowy = lepsza wrażliwość na insulinę","Waga: liczy się obwód talii bardziej niż BMI","Badaj HOMA-IR co 3 miesiące — mierz postęp realnie"] },
          ].map(section=>(
            <Card key={section.title} style={{ marginBottom:10, background:section.color, border:`1px solid ${section.border}` }}>
              <div style={{ fontSize:13, fontWeight:600, color:MAY.forest, marginBottom:8 }}>{section.title}</div>
              {section.items.map((item,i)=>(
                <div key={i} style={{ display:"flex", gap:8, padding:"4px 0", fontSize:12, color:MAY.forest, lineHeight:1.5 }}>
                  <span style={{ color:MAY.sea, flexShrink:0, marginTop:2 }}>·</span>
                  <span>{item}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {/* Przepis modal */}
      {selectedPrzepisName && IO_PRZEPISY[selectedPrzepisName] && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.55)", zIndex:400, display:"flex", alignItems:"flex-end" }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelectedPrzepisName(null); }}>
          <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:MAY.forest }}>{selectedPrzepisName}</div>
                <div style={{ fontSize:12, color:MAY.forest, opacity:.5, marginTop:3 }}>
                  🔥 {IO_PRZEPISY[selectedPrzepisName].kcal} kcal · {IO_PRZEPISY[selectedPrzepisName].slot}
                  {IO_PRZEPISY[selectedPrzepisName].bulk && " · gotuj x2"}
                </div>
              </div>
              <button onClick={()=>setSelectedPrzepisName(null)} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",color:MAY.forest,opacity:.3 }}>✕</button>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:600, color:MAY.forest, opacity:.5, textTransform:"uppercase", letterSpacing:.5, marginBottom:7 }}>Składniki</div>
              <div style={{ background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, overflow:"hidden" }}>
                {IO_PRZEPISY[selectedPrzepisName].ingredients.map((s,i,arr)=>(
                  <div key={i} style={{ display:"flex", gap:10, padding:"8px 13px", borderBottom:i<arr.length-1?`1px solid ${MAY.baby}`:"none", fontSize:13, color:MAY.forest }}>
                    <span style={{ color:MAY.sea, flexShrink:0 }}>·</span>{s}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: IO_PRZEPISY[selectedPrzepisName].tip ? 12 : 0 }}>
              <div style={{ fontSize:11, fontWeight:600, color:MAY.forest, opacity:.5, textTransform:"uppercase", letterSpacing:.5, marginBottom:7 }}>Przygotowanie</div>
              <div style={{ background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, padding:"12px 14px", fontSize:13, color:MAY.forest, lineHeight:1.7 }}>
                {IO_PRZEPISY[selectedPrzepisName].steps}
              </div>
            </div>
            {IO_PRZEPISY[selectedPrzepisName].tip && (
              <div style={{ background:MAY.sun, borderRadius:10, padding:"10px 13px", display:"flex", gap:8 }}>
                <span>💡</span>
                <div style={{ fontSize:12, color:MAY.forest, lineHeight:1.5 }}>{IO_PRZEPISY[selectedPrzepisName].tip}</div>
              </div>
            )}
            <div style={{ height:20 }}/>
          </div>
        </div>
      )}

      {/* Swap modal */}
      {swapModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.55)", zIndex:500, display:"flex", alignItems:"flex-end" }}
          onClick={e=>{ if(e.target===e.currentTarget) setSwapModal(null); }}>
          <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:18, width:"100%", maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:15, fontWeight:700, color:MAY.forest }}>Zamień posiłek — {swapModal.slot}</div>
              <button onClick={()=>setSwapModal(null)} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",color:MAY.forest,opacity:.3 }}>✕</button>
            </div>
            <div style={{ display:"flex", gap:5, marginBottom:10, overflowX:"auto" }}>
              {["wszystkie","Śniadanie","Drugie śniadanie","Obiad","Kolacja"].map(f=>(
                <button key={f} onClick={()=>setSwapFilter(f)} style={{ flexShrink:0, padding:"4px 10px", borderRadius:16, border:`1.5px solid ${swapFilter===f?"transparent":MAY.sea}`, background:swapFilter===f?MAY.forest:"white", color:swapFilter===f?"white":MAY.forest, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{f}</button>
              ))}
            </div>
            <div style={{ overflowY:"auto", flex:1, paddingBottom:20 }}>
              {SWAP_SLOTS.map(([name,p])=>(
                <div key={name} onClick={()=>applySwap(name)} style={{ padding:"10px 12px", background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, marginBottom:6, cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:MAY.forest, marginBottom:2 }}>{name}</div>
                      <div style={{ fontSize:11, color:MAY.forest, opacity:.5 }}>🔥 {p.kcal} kcal · {p.slot}{p.bulk?" · bulk x2":""}</div>
                    </div>
                    <span style={{ fontSize:16, color:MAY.sea }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// BAZA PRZEPISÓW (istniejąca — Bartosz)
// ══════════════════════════════════════════════════════════════════════════

const PRZEPISY = {
  "Szejk żelazowa moc": { kcal:624, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"], skladniki:["1 banan (120g)","1,5 łyżki masła orzechowego (30g)","5 łyżek otrębów pszennych (20g)","2 łyżki płatków owsianych (20g)","3/4 szklanki mleka migdałowego (200ml)","1 łyżka nasion chia (10g)","3/4 porcji WPI (30g)"], wykonanie:"Wszystkie składniki zblendować na gładką masę. Można przechować w lodówce do 24h." },
  "Szejk zdrowe jelita": { kcal:513, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"], skladniki:["2 banany lekko zielone (240g)","2 garście borówek (100g)","1,5 garści malin (100g)","0,5 łyżki siemienia lnianego (5g)","1 szklanka mleka migdałowego (230ml)","3/4 porcji WPI (30g)"], wykonanie:"Wszystkie składniki zblendować. Banan lekko zielony — najlepszy dla jelit (skrobia oporna)." },
  "Szejk proteinowy": { kcal:523, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"], skladniki:["2,5 garści malin (200g)","5 łyżek płatków owsianych (50g)","1 łyżka siemienia lnianego (10g)","1,5 szklanki mleka migdałowego (300ml)","1,25 porcji WPI (40g)"], wykonanie:"Wszystkie składniki zblendować na gładką masę." },
  "Szejk śniadaniowy": { kcal:657, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"], skladniki:["2 banany (240g)","1,5 łyżki masła orzechowo-czekoladowego (30g)","2,5 łyżki płatków owsianych (25g)","1,5 szklanki mleka migdałowego (300ml)","3/4 porcji WPI (30g)"], wykonanie:"Wszystkie składniki zblendować. Masło można zastąpić innym masłem orzechowym." },
  "Kleik ryżowy z owocami": { kcal:611, czas:"5 min", porcje:1, tagi:["ciepłe","szybkie","IO","maluch"], skladniki:["12,5 łyżki kleiku ryżowego BoboVita (50g)","1,5 garści malin (100g)","1,5 łyżki masła orzechowego (30g)","1,5 porcji WPI (50g)"], wykonanie:"Kleik zalać wodą i wymieszać z odżywką. Dodać owoce i masło orzechowe.", uwaga:"Maliny możesz wymienić na truskawki, borówki lub jagody." },
  "Tosty z mozzarellą": { kcal:524, czas:"10 min", porcje:1, tagi:["ciepłe","IO","maluch"], skladniki:["4 kromki chleba tostowego pszennego (120g)","4 plastry mozzarelli light (80g)","0,5 pomidora (85g)","1 garść szpinaku (25g)"], wykonanie:"Na chleb tostowy położyć mozzarellę, pomidora i szpinak. Zapiec." },
  "Tosty z jajkiem i szynką": { kcal:448, czas:"10 min", porcje:1, tagi:["ciepłe","IO","maluch"], skladniki:["2 kromki chleba żytniego (70g)","1 jajko (50g)","0,5 łyżki oliwy (5ml)","1/6 pomidora (30g)","1 plaster szynki (15g)","2 liście sałaty (10g)"], wykonanie:"Chleb zrumień. Na wierzch ułóż sałatę, szynkę, pomidora. Jajko usmaż i przełóż na kanapkę." },
  "Kurczak teriyaki z ryżem": { kcal:637, czas:"30 min", porcje:2, tagi:["kurczak","IO","maluch","bulk"], skladniki:["400g piersi kurczaka","60g ryżu basmati","115g papryki czerwonej","100g cukinii","30g sosu teriyaki","10g miodu","3ml soku z limonki","sezam"], wykonanie:"Kurczaka zamarynuj w teriyaki. Smaż z warzywami. Podaj z ryżem i sezamem. GOTUJ x2.", uwaga:"Gotuj x2 — starcza na pon–wt–śr." },
  "Makaron z kurczakiem i brokułem": { kcal:526, czas:"25 min", porcje:2, tagi:["kurczak","makaron","IO","maluch","bulk"], skladniki:["300g piersi kurczaka","100g makaronu razowego","100g brokułów","50g cebuli","10g parmezanu","10g orzechów arachidowych"], wykonanie:"Makaron ugotuj z brokułem. Kurczaka podsmaż z cebulą. Wymieszaj z parmezanem. GOTUJ x2.", uwaga:"Gotuj x2 — starcza na czw–pt–sob." },
  "Pieczony łosoś w porach": { kcal:568, czas:"35 min", porcje:1, tagi:["ryba","łosoś","IO","maluch"], skladniki:["120g łososia","40g pora","2 szalotki","45g ryżu basmati","100g roszponki","koper","1 łyżka soku z cytryny"], wykonanie:"Łososia piecz na porze 15 min w 200°C. Podaj z ryżem i roszponką z jogurtem." },
  "Burgery z kurczakiem i mozzarellą": { kcal:450, czas:"25 min", porcje:1, tagi:["kurczak","IO","maluch"], skladniki:["100g piersi kurczaka","1 bułka żytnia","25g mozzarelli","garść szpinaku","2 łyżeczki musztardy","oliwa, przyprawy"], wykonanie:"Kurczaka marinuj i grilluj. Złóż burgera z szpinakiem, mozzarellą i musztardą." },
  "Spaghetti carbonara": { kcal:836, czas:"20 min", porcje:1, tagi:["makaron","jajka","IO"], skladniki:["100g makaronu pełnoziarnistego","2 jajka","50g parmezanu","50g boczku wędzonego","50g jogurtu naturalnego 2%","1 ząbek czosnku"], wykonanie:"Makaron al dente. Boczek + czosnek obsmaż. Jajka + parmezan = sos (bez gotowania). Wymieszaj z makaronem." },
  "Pieczony dorsz z warzywami": { kcal:693, czas:"45 min", porcje:1, tagi:["ryba","IO","maluch"], skladniki:["200g dorsza","4,5 ziemniaków (405g)","120g cukinii","100g papryki","10ml oliwy","przyprawy"], wykonanie:"Ziemniaki ugotuj na półtwardo. Wszystko ułóż w naczyniu żaroodpornym, piecz 30 min w 190°C." },
  "Bowl z kurczakiem i kuskusem": { kcal:692, czas:"25 min", porcje:1, tagi:["kurczak","IO","maluch"], skladniki:["150g kurczaka","60g kuskusu","100g ciecierzycy","pomidorki, ogórek, cebula","oliwa, cytryna, pietruszka"], wykonanie:"Kuskus zrób wg instrukcji. Kurczaka ugrilluj. Złóż bowl z dressingiem oliwa+cytryna." },
  "Łosoś z fasolką": { kcal:711, czas:"25 min", porcje:1, tagi:["ryba","łosoś","IO","maluch"], skladniki:["170g łososia","150g fasolki szparagowej","50g ryżu brązowego","15ml oleju rzepakowego","tymianek, cytryna"], wykonanie:"Łososia z fasolką piecz w 200°C 15-20 min. Podaj z ryżem, skrop cytryną." },
  "Fit smoothie z szpinakiem": { kcal:435, czas:"3 min", porcje:1, tagi:["szejk","szybkie","IO","maluch"], skladniki:["1 banan","1 jabłko","1 garść szpinaku","3/4 szklanki mleka migdałowego","10ml soku z cytryny","1,5 porcji WPI (50g)"], wykonanie:"Wszystko zblendować. Przelać do szklanki." },
  "Kaszotto gryczane z indykiem": { kcal:693, czas:"30 min", porcje:1, tagi:["indyk","kasza","IO","maluch"], skladniki:["150g mielonego mięsa z indyka","70g kaszy gryczanej","200g kalafiora","75g szpinaku","45g marchewki","250ml bulionu","kurkuma, kolendra"], wykonanie:"Zeszklij cebulę, dodaj mięso, kaszę i bulion. Gotuj 15 min. Dodaj warzywa." },
  "Kurczak caprese z piekarnika": { kcal:688, czas:"40 min", porcje:1, tagi:["kurczak","IO","maluch"], skladniki:["200g piersi kurczaka","125g mozzarelli","1 pomidor","oliwa, tymianek, bazylia"], wykonanie:"Kurczaka naciąć, wsunąć mozzarellę z bazylią. Na pomidorach, piec 35 min w 190°C." },
  "Klopsiki szpinakowe w sosie pomidorowym": { kcal:714, czas:"35 min", porcje:1, tagi:["indyk","IO","maluch"], skladniki:["150g mielonego indyka","75g szpinaku","2 pomidory","50g ryżu brązowego","oliwa, czosnek, zioła"], wykonanie:"Mięso + szpinak + jajko = klopsiki. Sos: cebula + czosnek + pomidory. Duś klopsiki w sosie 15-20 min." },

  // ── OGARNIJ INSULINOOPORNOŚĆ — 30 przepisów ───────────────────────────
  "Jajka po turecku": { kcal:480, czas:"15 min", porcje:1, tagi:["jajka","szybkie","IO","maluch"], skladniki:["150g jogurtu greckiego","2 jajka","150g fasolki szparagowej lub cukinii","100g pomidorków koktajlowych","10g masła","50g chleba żytniego","1 ząbek czosnku","zioła"], wykonanie:"Jajka gotuj 6 min od wrzenia (na półmiękko). Ugotuj fasolkę 10-15 min. Na patelni rozgrzej masło, podsmaż pomidorki z ziołami. Jogurt grecki wymieszaj z przeciśniętym czosnkiem. Podaj jajka z fasolką, pomidorkami i sosem jogurtowym.", uwaga:"" },
  "Gnieciony croissant z twarożkiem i malinami": { kcal:420, czas:"10 min", porcje:1, tagi:["szybkie","IO"], skladniki:["50g croissanta maślanego","3ml oliwy","50g jogurtu greckiego","100g twarogu chudego","20g pistacji","120g malin","10g erytrolu"], wykonanie:"Croissanta rozgnieć wałkiem na płaski placek. Rozgrzej oliwę i podsmaż do zarumienienia. Twaróg wymieszaj z jogurtem i erytrolem. Wyłóż twarożek na ciepłego croissanta, dodaj maliny i posiekane pistacje.", uwaga:"" },
  "Tuńczykowe placuszki": { kcal:390, czas:"10 min", porcje:1, tagi:["ryba","szybkie","IO"], skladniki:["120g tuńczyka w sosie własnym","1 jajko","20g mąki orkiszowej","150g papryki czerwonej","60g ogórków kiszonych","10ml oliwy","10g musztardy"], wykonanie:"Tuńczyka odsącz. Posiekaj paprykę i ogórka kiszonego. Wymieszaj tuńczyka z jajkiem, mąką, warzywami, musztardą i przyprawami. Na rozgrzanej oliwie smaż placuszki z obu stron.", uwaga:"" },
  "Snickers bowl": { kcal:400, czas:"5 min", porcje:1, tagi:["szybkie","IO"], skladniki:["150g skyru waniliowego","100g banana","15g masła orzechowego","10g orzeszków ziemnych","12g czekolady gorzkiej","10g kakao","10ml mleka"], wykonanie:"Banana zamroź dzień wcześniej. Banana, skyr, mleko i kakao zblenduj na gładką masę. Czekoladę rozpuść lub posiekaj. Przełóż do miski, na wierzchu ułóż czekoladę, masło orzechowe i orzeszki.", uwaga:"" },
  "Pasta jajeczna z fetą": { kcal:429, czas:"10 min", porcje:1, tagi:["jajka","szybkie","IO"], skladniki:["2 jajka","50g fety","50g chleba żytniego (2 kromki)","szczypiorek","pomidor","sól, pieprz"], wykonanie:"Jajka ugotuj na twardo. Obierz, umieść w misce. Dodaj fetę, sól i pieprz, rozgnieć na pastę. Pastę nałóż na kanapki, podaj z pokrojonym pomidorem i szczypiorkiem.", uwaga:"" },
  "Biszkoptowa owsianka pieczona": { kcal:400, czas:"35 min", porcje:1, tagi:["IO","maluch"], skladniki:["100g serka wiejskiego","50g płatków owsianych","5g nasion chia","2 jajka","50g borówek","50g malin","łyżeczka proszku do pieczenia","łyżka erytrolu"], wykonanie:"Rozgrzej piekarnik do 180°C. Wszystko oprócz owoców zblenduj. Wlej do naczynia, ułóż owoce na wierzchu. Piecz ok. 30 min w trybie góra-dół.", uwaga:"" },
  "Makowe naleśniki z twarożkiem": { kcal:430, czas:"20 min", porcje:1, tagi:["IO"], skladniki:["50g ciecierzycy odsączonej","1 jajko","80ml mleka 2%","40g mąki orkiszowej","12ml soku z cytryny","mak","serek do nadzienia z erytrolem"], wykonanie:"Ciecierzykę, mleko, mąkę, jajko i sok z cytryny zblenduj. Dodaj mak, odstaw kilka min. Usmaż naleśniki. Serek wymieszaj z erytrolem i sokiem z cytryny — nadziewaj naleśniki.", uwaga:"" },
  "Poke bowl z łososiem i kaszą": { kcal:520, czas:"15 min", porcje:1, tagi:["ryba","łosoś","IO"], skladniki:["60g łososia wędzonego na gorąco","30g kaszy pęczak","150g fasolki szparagowej","70g awokado","50g przecieru z mango","25g jogurtu greckiego","5g erytrolu","10g musztardy"], wykonanie:"Kaszę ugotuj. W połowie gotowania dodaj fasolkę. Sos: mango + jogurt + erytrol + musztarda + sok z cytryny. W misce ułóż kaszę z fasolką, łososia, awokado i polej sosem.", uwaga:"" },
  "Placki twarogowe z borówkami": { kcal:390, czas:"15 min", porcje:1, tagi:["jajka","IO","maluch"], skladniki:["80g twarogu półtłustego","1 jajko","20g mąki orkiszowej","150g borówek","10g erytrolu","5ml oliwy","3g proszku do pieczenia"], wykonanie:"Twaróg rozgnieć, dodaj jajko, mąkę, erytrol i proszek. Wymieszaj z częścią borówek. Smaż łyżką na oliwie z obu stron. Podaj z resztą borówek.", uwaga:"" },
  "Sałatka z fetą cieciorką i miętą": { kcal:420, czas:"20 min", porcje:1, tagi:["wegetariańskie","IO"], skladniki:["100g ciecierzycy","50g fety","100g ogórka","70g awokado","140g pomidora","30g sałaty","20g kaszy pęczak","oliwa, musztarda, cytryna, mięta"], wykonanie:"Kaszę ugotuj. Ciecierzycę obtocz w oliwie i przyprawach. Warzywa pokrój. Oliwa + musztarda + cytryna = dressing. W misce: sałata, warzywa, ciecierzyca, kasza, feta. Polej dressingiem.", uwaga:"" },
  "Pieczony indyk z pęczakiem i brokułem": { kcal:580, czas:"25 min", porcje:1, tagi:["indyk","IO","maluch"], skladniki:["150g piersi z indyka","50g kaszy pęczak","300g brokułu","15g masła orzechowego","30ml wody","oliwa, przyprawy"], wykonanie:"Nagrzej piekarnik do 200°C. Kaszę ugotuj z brokułami. Indyka natrzyj oliwą i przyprawami, piecz ok. 20 min. Masło orzechowe + woda = sos. Podaj z kaszą, brokułem i sosem.", uwaga:"" },
  "Ryż po azjatycku z tofu i orzechami": { kcal:410, czas:"15 min", porcje:1, tagi:["wegetariańskie","IO"], skladniki:["90g tofu naturalnego","40g ryżu brązowego","100g marchewki","150g cukinii","1 ząbek czosnku","10g masła orzechowego","6ml soku z cytryny","10g keczupu","oliwa"], wykonanie:"Ugotuj ryż. Tofu pokrój w paski, podsmaż z czosnkiem. Dodaj marchew i cukinię, smaż kilka min. Dopraw keczupem, cytryną i masłem orzechowym. Podaj z ryżem i szczypiorkiem.", uwaga:"" },
  "Papryka faszerowana kaszą i mozzarellą": { kcal:430, czas:"30 min", porcje:1, tagi:["wegetariańskie","IO"], skladniki:["250g papryki czerwonej","50g kaszy pęczak","20g suszonych pomidorów","20g oliwek zielonych","100g cukinii","60g mozzarelli","oliwa"], wykonanie:"Nagrzej piekarnik do 180°C. Paprykę przekrój i wydrąż. Piecz 15 min. Ugotuj kaszę. Cukinię, oliwki i pomidory posiekaj, wymieszaj z kaszą. Nadzień paprykę, posyp mozzarellą, piecz 10 min.", uwaga:"" },
  "Paprykowe leczo z kurczakiem": { kcal:450, czas:"25 min", porcje:1, tagi:["kurczak","IO","maluch"], skladniki:["150g piersi kurczaka","200g papryki czerwonej","100g cukinii","45g marchewki","50g koncentratu pomidorowego","16g bulionu drobiowego","30g chleba żytniego razowego","5ml oliwy"], wykonanie:"Kurczaka pokrój, podsmaż na oliwie. Dodaj marchew, paprykę i cukinię w kostkę. Wlej bulion z koncentratem, duś 15 min. Dopraw i podaj z chlebem.", uwaga:"" },
  "Makaron z kurczakiem i mleczkiem kokosowym": { kcal:550, czas:"20 min", porcje:1, tagi:["kurczak","makaron","IO"], skladniki:["150g piersi kurczaka","50g makaronu","150g cebuli","2 ząbki czosnku","10ml sosu sojowego","10g erytrolu","60ml mleczka kokosowego","5g szczypiorku","oliwa, masło"], wykonanie:"Kurczaka pokrój, podsmaż na oliwie. Dopraw i odłóż. Cebulę w pióra podsmaż z czosnkiem. Dodaj sos sojowy, erytrol i mleczko kokosowe. Ugotuj makaron, wymieszaj z sosem i kurczakiem.", uwaga:"" },
  "Kotleciki zapiekane z ziemniakami": { kcal:580, czas:"45 min", porcje:2, tagi:["kurczak","IO","maluch","bulk"], skladniki:["150g mielonego mięsa drobiowego","1 jajko","30g panierki panko","20g szpinaku","100g cebuli","30g mozzarelli tartej","410g ugotowanych ziemniaków","300g kiszonej kapusty","oliwa"], wykonanie:"Ziemniaki ugotuj i rozgnieć. Cebulę i szpinak podsmaż. Mięso + jajko + panierka + szpinak + mozzarella = kotleciki. Nagrzej do 200°C, piecz 15-20 min. Podaj z ziemniakami i kapustą.", uwaga:"" },
  "Kokosowe curry z ciecierzycą": { kcal:500, czas:"15 min", porcje:2, tagi:["wegetariańskie","IO","bulk"], skladniki:["250g ciecierzycy z puszki","300ml passaty pomidorowej","150ml mleczka kokosowego","100g kaszy bulgur","100g cebuli","2 ząbki czosnku","10g imbiru","20g masła orzechowego","curry, sos sojowy","10g natki pietruszki"], wykonanie:"Ugotuj kaszę. Cebulę i czosnek posiekaj. Podsmaż z curry i papryką. Dodaj passatę i mleczko kokosowe, gotuj 5 min. Dodaj ciecierzycę, masło orzechowe i sos sojowy. Podaj z kaszą i pietruszką.", uwaga:"" },
  "Pieczone gnocchi z fetą i szpinakiem": { kcal:430, czas:"30 min", porcje:1, tagi:["wegetariańskie","IO"], skladniki:["100g gnocchi","100g cebuli","50g szpinaku","30g fety","90g tofu","40g mozzarelli","100g pomidorków koktajlowych","śmietana 12%, czosnek, oliwa"], wykonanie:"Cebulę pokrój w piórka, pomidorki posiekaj. W naczyniu żaroodpornym: gnocchi, tofu, cebula, pomidorki, feta, szpinak, oliwa, czosnek — zalej śmietaną. Piecz 20-25 min w 180°C. Dodaj mozzarellę i jeszcze chwilę piecz.", uwaga:"" },
  "Zapiekane rożki z tofu i warzywami": { kcal:400, czas:"15 min", porcje:1, tagi:["wegetariańskie","IO"], skladniki:["90g tortilli pełnoziarnistej","100g tofu wędzonego","40g fasoli czerwonej","70g papryki","10g sera żółtego","oliwa, czosnek, papryka, pieprz"], wykonanie:"Tofu i paprykę pokrój, podsmaż z fasolą i przyprawami. Tortillę przekrój na pół. Na rogu jednej połówki umieść farsz i ser, zawiń w rożek. Zapiecz 10 min w 200°C.", uwaga:"" },
  "Twarogówki z owocami sezonowymi": { kcal:350, czas:"40 min", porcje:4, tagi:["IO","maluch"], skladniki:["250g twarogu","2 jajka","80g mąki pszennej","35g budyniu","30g erytrolu","200g owoców sezonowych (truskawki/śliwki/jabłko)","5ml oliwy"], wykonanie:"Rozgrzej piekarnik do 180°C. Twaróg + mąka + jajka + budyń + erytrol — wymieszaj. Na papierze wyłóż owalne porcje ciasta mokrą łyżeczką. Na wierzch ułóż owoce. Piecz 15-20 min. Gotowe 4 sztuki.", uwaga:"" },
  "Chia sernik z owocami": { kcal:380, czas:"15 min", porcje:6, tagi:["IO","maluch"], skladniki:["30g biszkoptów","150g skyru waniliowego","100ml mleczka kokosowego","30ml mleka","25g nasion chia","30g orzechów nerkowca","15g masła orzechowego","100g truskawek","50g borówek"], wykonanie:"Biszkopty zblenduj z masłem orzechowym, wyłóż na dno. Skyr wymieszaj z mlekiem i mleczkiem. Dodaj nerkowce i chia. Wyłóż na spód, do lodówki na 1-2 godz. Na wierzch owoce.", uwaga:"Na 6 porcji." },
  "Brownie proteinowe": { kcal:420, czas:"40 min", porcje:6, tagi:["IO"], skladniki:["200g serka wiejskiego","25g czekolady gorzkiej","80ml mleka","70g mąki pszennej","1 jajko","50g erytrolu","40g kakao","20g masła","3g proszku do pieczenia","ekstrakt waniliowy"], wykonanie:"Nagrzej piekarnik do 180°C. Czekoladę roztop. Wymieszaj jajko, wanilię, masło, mleko, serek, połowę czekolady — zblenduj. Dodaj mąkę, kakao, proszek. Wylej do naczynia, polej resztą czekolady. Piecz 20-25 min.", uwaga:"Na 6 porcji." },
  "Sernik pistacjowy": { kcal:380, czas:"40 min", porcje:4, tagi:["IO"], skladniki:["150g twarogu","100g jogurtu greckiego","50g pistacji obranych","2 jajka","10g skrobi ziemniaczanej","30g erytrolu"], wykonanie:"Obierz pistacje. Twaróg + jogurt + jajka + skrobia + 40g pistacji + erytrol — zblenduj. Wyłóż do formy. Posyp resztą pistacji. Piecz 30-35 min w 170°C.", uwaga:"Na 4 porcje." },
  "Pucharek śmietankowy z brzoskwinią": { kcal:350, czas:"15 min", porcje:1, tagi:["szybkie","IO"], skladniki:["150g skyru waniliowego","30g mascarpone","20ml śmietanki 30%","85g brzoskwini","15g orzechów włoskich","cynamon"], wykonanie:"Skyr + mascarpone + śmietankę zmiksuj. Brzoskwinię pokrój i poddusz z cynamonem. Orzechy posiekaj i upraż. W pucharku: krem, brzoskwinia, orzechy.", uwaga:"" },
  "Proteinowy deser czekoladowy z komosą": { kcal:375, czas:"15 min", porcje:1, tagi:["szybkie","IO"], skladniki:["25g komosy ryżowej","200g serka wiejskiego","10g kakao","100g malin","10g erytrolu"], wykonanie:"Komosę ugotuj. Zmiksuj z serkiem wiejskim, kakao i erytrolem. Na górę ułóż maliny, schłodź chwilę w lodówce.", uwaga:"Maliny możesz zamienić na truskawki, jagody czy borówki." },
  "Kokosowy pudding chia z jeżynami": { kcal:472, czas:"10 min", porcje:1, tagi:["szybkie","IO","maluch"], skladniki:["30g nasion chia","10g wiórków kokosowych","10g erytrolu","150g jeżyn","200g jogurtu greckiego"], wykonanie:"Chia + wiórki + erytrol + jogurt + odrobina wody — wymieszaj. Wyłóż do naczynia, na górę jeżyny. Do lodówki na ok. 1h.", uwaga:"Jeżyny możesz zamienić na maliny, truskawki czy borówki." },
  "Pieczone gruszki z ricottą i orzechami": { kcal:350, czas:"25 min", porcje:1, tagi:["IO","maluch"], skladniki:["200g gruszki","100g ricotty","20g orzechów włoskich","sól, erytrol, pieprz"], wykonanie:"Nagrzej piekarnik do 200°C. Gruszkę pokrój w łódeczki, wydrąż nasiona. Na górę ułóż ricottę i orzechy, posyp solą i erytrolem. Zapiecz ok. 20 min.", uwaga:"" },
  "Rolada truskawkowa fit": { kcal:380, czas:"20 min", porcje:1, tagi:["IO"], skladniki:["1 jajko","60g serka kremowego","100g twarogu chudego","100g truskawek","3g proszku do pieczenia","15g erytrolu","2g oliwy"], wykonanie:"Nagrzej piekarnik do 200°C. 40g serka + jajko + proszek + połowa erytrolu — zmiksuj. Na papierze wylej masę na prostokąt. Piecz ok. 10 min. Twaróg + reszta serka + erytrol = krem. Truskawki pokrój. Na ciepłe ciasto rozłóż krem i truskawki, zwiń.", uwaga:"" },
  "Pucharek leśnych owoców z serkiem": { kcal:340, czas:"5 min", porcje:1, tagi:["szybkie","IO","maluch"], skladniki:["200g serka wiejskiego","100g truskawek","50g borówek","100g malin","10g erytrolu","6g gorzkiej czekolady"], wykonanie:"Serek wiejski zblenduj na gładką masę z erytrolem. Owoce pokrój, umieść w naczyniu. Na górę ułóż zblendowany serek. Zetrzyj czekoladę na wierzch.", uwaga:"" },

  // ── NISKI INDEKS GLIKEMICZNY — NISKA WAGA (FoodPatka) ─────────────────
  // Śniadania słodkie
  "Owsianka proteinowa z borówkami i masłem orzechowym": { kcal:513, czas:"10 min", porcje:1, tagi:["szybkie","IG"], skladniki:["50g płatków owsianych górskich","200ml mleka 0.5% lub roślinnego","30g odżywki białkowej","80g borówek","15g masła orzechowego 100%","cynamon, erytrytol opcjonalnie"], wykonanie:"W rondelku zagotuj mleko, wsyp płatki i gotuj 5-7 min. Zdejmij z ognia, lekko przestudź i wmieszaj odżywkę białkową. Dodaj borówki i masło orzechowe na wierzch. Posyp cynamonem.", uwaga:"" },
  "Placuszki twarogowe z sosem malinowym": { kcal:374, czas:"15 min", porcje:1, tagi:["jajka","IG","maluch"], skladniki:["50g twarogu chudego","1 jajko","30g mąki orkiszowej pełnoziarnistej","5g budyniu waniliowego","5ml oliwy","100g malin","1-2 łyżeczki erytrytolu"], wykonanie:"Twaróg rozgnieć, dodaj jajko, mąkę i budyń. Smaż placuszki 2-3 min z każdej strony. Maliny podgrzej z erytrolem do lekkiego zgęstnienia. Podaj polane sosem.", uwaga:"" },
  "Chia pudding waniliowy z musem malinowym": { kcal:357, czas:"5 min", porcje:1, tagi:["szybkie","IG","maluch"], skladniki:["30g nasion chia","200ml mleka migdałowego niesłodzonego","25g odżywki białkowej waniliowej","100g malin","łyżeczka erytrytolu"], wykonanie:"Mleko + odżywka + chia — wymieszaj. Do lodówki min. 3h lub na noc. Maliny podgrzej z erytrolem, zblenduj na mus. Podaj pudding z musem na wierzchu.", uwaga:"" },
  "Tosty pełnoziarniste z ricottą i gruszką": { kcal:397, czas:"5 min", porcje:1, tagi:["szybkie","IG","maluch"], skladniki:["2 kromki chleba pełnoziarnistego (80g)","100g ricotty","1 mała gruszka (120g)","10g orzechów włoskich","cynamon"], wykonanie:"Chleb podpiecz. Posmaruj ricottą, ułóż cienkie plasterki gruszki. Posyp cynamonem i posiekanymi orzechami.", uwaga:"" },
  "Smoothie bowl malinowo-migdałowe": { kcal:345, czas:"5 min", porcje:1, tagi:["szybkie","IG"], skladniki:["200g jogurtu naturalnego high-protein","25g odżywki białkowej waniliowej","100g malin","10g płatków migdałowych","kilka kostek lodu"], wykonanie:"Jogurt + odżywkę + maliny + lód zblenduj. Przelej do miski, posyp płatkami migdałowymi.", uwaga:"" },
  "Jaglanka z jabłkiem cynamonem i pekanami": { kcal:445, czas:"20 min", porcje:1, tagi:["ciepłe","IG","maluch"], skladniki:["50g kaszy jaglanej","200ml mleka 0.5%","25g odżywki białkowej waniliowej","1 małe jabłko (120g)","10g orzechów pekan","cynamon"], wykonanie:"Kaszę ugotuj w mleku ~15 min. Dodaj odżywkę i wymieszaj. Jabłko pokrój, duś chwilę z cynamonem. Podaj kaszę z jabłkiem i orzechami.", uwaga:"" },
  "Serniczki z patelni z borówkami": { kcal:328, czas:"15 min", porcje:1, tagi:["jajka","szybkie","IG","maluch"], skladniki:["150g twarogu chudego","1 jajko","25g mąki kokosowej lub orkiszowej","łyżeczka erytrytolu","50g borówek","5ml oleju"], wykonanie:"Twaróg + jajko + mąka + słodzik — zmiksuj. Smaż małe placuszki 2-3 min z każdej strony. Podaj z borówkami.", uwaga:"" },
  "Naleśniki pełnoziarniste z twarożkiem i truskawkami": { kcal:422, czas:"20 min", porcje:1, tagi:["IG","maluch"], skladniki:["60g mąki orkiszowej pełnoziarnistej","1 jajko + 50ml białek","120ml mleka","150g twarogu chudego","łyżeczka erytrytolu + wanilia","150g truskawek"], wykonanie:"Mąka + jajka + mleko — usmaż 2-3 naleśniki. Twaróg wymieszaj z erytrolem i wanilią. Posmaruj naleśniki i dodaj truskawki.", uwaga:"" },
  "Granola domowa z jogurtem i borówkami": { kcal:422, czas:"20 min", porcje:1, tagi:["IG"], skladniki:["40g płatków owsianych","15g orzechów włoskich","10g pestek dyni","łyżeczka oleju kokosowego","łyżka erytrytolu","200g jogurtu naturalnego high-protein","80g borówek"], wykonanie:"Płatki + orzechy + pestki + olej + erytrol — piecz 15 min w 170°C, mieszając. Podaj z jogurtem i borówkami.", uwaga:"" },
  "Pieczona owsianka z borówkami i skyrem": { kcal:489, czas:"30 min", porcje:1, tagi:["IG","maluch"], skladniki:["60g płatków owsianych","1 jajko","150ml mleka","100g borówek","150g skyru naturalnego","łyżeczka erytrytolu, wanilia"], wykonanie:"Płatki + mleko + jajko + słodzik + połowa borówek — wymieszaj. Do małej formy, piecz 25 min w 180°C. Podaj z resztą borówek i skyrem.", uwaga:"" },
  "Sernik śniadaniowy z piekarnika": { kcal:501, czas:"45 min", porcje:1, tagi:["IG","maluch"], skladniki:["250g twarogu półtłustego","2 jajka","20g mąki kokosowej lub migdałowej","150g malin","łyżeczka erytrytolu","0.5 łyżeczki proszku do pieczenia","wanilia"], wykonanie:"Wszystko oprócz malin zblenduj. Do małej formy, maliny ułóż na wierzchu. Piecz 35-40 min w 170°C.", uwaga:"" },
  "Zapiekana owsianka sernikowa z malinami": { kcal:454, czas:"35 min", porcje:1, tagi:["IG","maluch"], skladniki:["50g płatków owsianych górskich","150g twarogu chudego","1 jajko","120ml mleka 1.5%","100g malin","łyżeczka erytrytolu","ekstrakt waniliowy"], wykonanie:"Płatki + mleko + jajko + twaróg + wanilia + słodzik — wymieszaj. Do foremki, maliny na wierzchu. Piecz 30-35 min w 180°C.", uwaga:"" },
  // Śniadania słone
  "Jajecznica z awokado i twarogiem": { kcal:442, czas:"5 min", porcje:1, tagi:["jajka","szybkie","IG"], skladniki:["2 jajka","100g twarogu półtłustego","60g awokado","5ml oliwy","sól, pieprz"], wykonanie:"Jajka usmaż na oliwie na miękko. Na talerzu podaj z pokrojonym awokado i twarogiem. Dopraw.", uwaga:"" },
  "Omlet z szynką i warzywami": { kcal:356, czas:"10 min", porcje:1, tagi:["jajka","szybkie","IG","maluch"], skladniki:["3 jajka","40g chudej szynki drobiowej","50g papryki","50g cukinii","5ml oliwy","sól, pieprz"], wykonanie:"Paprykę i cukinię podsmaż na oliwie. Dodaj szynkę, wlej roztrzepane jajka. Smaż na wolnym ogniu pod przykryciem.", uwaga:"" },
  "Szakszuka z fetą i ciecierzycą": { kcal:368, czas:"15 min", porcje:1, tagi:["jajka","IG","maluch"], skladniki:["2 jajka","150g pomidorów krojonych z puszki","50g ciecierzycy","40g fety light","50g papryki","5ml oliwy","czosnek, kumin, papryka słodka"], wykonanie:"Na oliwie podsmaż paprykę z czosnkiem. Dodaj pomidory i ciecierzycę, gotuj 5 min. Zrób dwa wgłębienia, wbij jajka, przykryj do ścięcia białek. Posyp fetą i pietruszką.", uwaga:"" },
  "Gofry wytrawne z twarogiem i łososiem": { kcal:455, czas:"15 min", porcje:1, tagi:["ryba","IG"], skladniki:["100g twarogu półtłustego","1 jajko","40g mąki pełnoziarnistej","50ml mleka","50g wędzonego łososia","10g rukoli","koperek, sól, pieprz"], wykonanie:"Twaróg + jajko + mąka + mleko + przyprawy — wymieszaj. Wypiecz gofry. Podaj z łososiem i rukolą.", uwaga:"" },
  "Frittata z brokułem i serem": { kcal:402, czas:"25 min", porcje:1, tagi:["jajka","IG"], skladniki:["3 jajka","150g ugotowanego brokułu","50g fety light","10ml oliwy","czosnek, pieprz"], wykonanie:"Brokuł podziel na różyczki. W naczyniu do pieczenia rozłóż warzywa, zalej jajkami z przyprawami. Posyp serem, piecz 20 min w 180°C.", uwaga:"" },
  "Zapiekanka śniadaniowa z batatem i indykiem": { kcal:448, czas:"30 min", porcje:1, tagi:["indyk","IG"], skladniki:["150g batata","100g piersi z indyka","2 jajka","30g mozzarelli light","5ml oliwy","czosnek, papryka wędzona, sól, pieprz"], wykonanie:"Batata pokrój, upiecz 15 min w 200°C z oliwą. Dodaj podsmażonego indyka i jajka. Posyp mozzarellą i zapiecz 10 min.", uwaga:"" },
  "Bowl z pieczonym łososiem i warzywami": { kcal:463, czas:"20 min", porcje:1, tagi:["ryba","łosoś","IG"], skladniki:["120g łososia","150g warzyw pieczonych (cukinia/papryka/bakłażan)","50g jogurtu naturalnego","5ml oliwy","cytryna, koperek"], wykonanie:"Łososia dopraw i upiecz 15 min w 200°C. Warzywa upiecz razem. Podaj z jogurtem i koperkiem.", uwaga:"" },
  "Burrito śniadaniowe z indykiem i fasolą": { kcal:489, czas:"15 min", porcje:1, tagi:["indyk","IG"], skladniki:["1 tortilla pełnoziarnista","100g mielonego indyka","50g czerwonej fasoli","30g mozzarelli light","5ml oliwy","kumin, czosnek, papryka słodka"], wykonanie:"Indyka podsmaż z przyprawami i fasolą. Zawiń w tortillę z serem. Podsmaż na suchej patelni do chrupkości.", uwaga:"" },
  // Obiady
  "Łosoś w marynacie miodowo-musztardowej": { kcal:520, czas:"25 min", porcje:1, tagi:["ryba","łosoś","IG","maluch"], skladniki:["150g łososia","150g brokułu","100g marchewki","100g cukinii","10ml oliwy","10g musztardy","5g miodu","5ml soku z cytryny"], wykonanie:"Łososia natrzyj marynatą: musztarda + miód + cytryna + sól. Warzywa skrop oliwą. Piecz wszystko razem 18-20 min w 200°C. Posyp koperkiem.", uwaga:"" },
  "Kurczak w sosie szpinakowym z makaronem": { kcal:540, czas:"20 min", porcje:1, tagi:["kurczak","makaron","IG"], skladniki:["150g piersi kurczaka","60g makaronu pełnoziarnistego","100g szpinaku","80g jogurtu greckiego 2%","5g czosnku","10g parmezanu","5ml oliwy"], wykonanie:"Makaron ugotuj al dente. Kurczaka pokrój, podsmaż z czosnkiem. Dodaj szpinak, duś 2-3 min. Zdejmij z ognia, dodaj jogurt i przyprawy. Wymieszaj z makaronem i parmezanem.", uwaga:"" },
  "Indyk w sosie pomidorowym z mozzarellą": { kcal:285, czas:"20 min", porcje:1, tagi:["indyk","IG","maluch"], skladniki:["150g piersi z indyka","200g pomidorów krojonych z puszki","50g mozzarelli light","50g cebuli","5g czosnku","5ml oliwy","bazylia, sól, pieprz"], wykonanie:"Indyka pokrój, podsmaż. Dodaj cebulę i czosnek. Wlej pomidory, duś 10 min. Mozzarellę połóż na wierzchu, przykryj do rozpuszczenia. Posyp bazylią. Podaj z kaszą bulgur.", uwaga:"" },
  "Fit curry z indykiem i mlekiem kokosowym": { kcal:600, czas:"20 min", porcje:1, tagi:["indyk","IG"], skladniki:["150g piersi z indyka","100g cukinii","50g cebuli","150ml mleka kokosowego light","15g pasty curry","60g ryżu basmati","100g papryki czerwonej","kolendra"], wykonanie:"Ugotuj ryż. Indyka podsmaż, dodaj cebulę i pastę curry. Dorzuć paprykę i cukinię, smaż 3 min. Wlej mleko kokosowe, gotuj 10 min. Podaj z ryżem i kolendrą.", uwaga:"" },
  "Makaron pełnoziarnisty z tuńczykiem i pomidorami": { kcal:450, czas:"15 min", porcje:1, tagi:["ryba","makaron","IG"], skladniki:["60g makaronu pełnoziarnistego spaghetti","120g tuńczyka w sosie własnym","200g pomidorów krojonych z puszki","30g oliwek czarnych","10g kaparów","5g czosnku","5ml oliwy","chili, oregano"], wykonanie:"Makaron ugotuj. Na oliwie podsmaż czosnek i chili, dodaj pomidory. Duś 8 min, dodaj tuńczyka, oliwki i kapary. Wymieszaj z makaronem.", uwaga:"" },
  "Frittata z cukinią pomidorami i fetą": { kcal:510, czas:"25 min", porcje:1, tagi:["jajka","IG"], skladniki:["4 jajka","150g cukinii","100g pomidorów","50g fety","5ml oliwy","czosnek, pieprz, bazylia"], wykonanie:"Warzywa podsmaż na oliwie z czosnkiem. Wlej jajka z przyprawami. Smaż chwilę, potem dopiecz 10 min w 180°C. Posyp fetą i bazylią.", uwaga:"" },
  "Łosoś teriyaki z brokułem i ryżem": { kcal:660, czas:"25 min", porcje:1, tagi:["ryba","łosoś","IG"], skladniki:["150g łososia","20ml sosu sojowego","5g miodu","5g czosnku","5g imbiru","60g ryżu jaśminowego","150g brokułu","5g sezamu","5ml oliwy"], wykonanie:"Łososia marynuj 20 min w soi, miodzie, czosnku, imbirze. Ugotuj ryż i brokuł na parze. Łososia piecz 15 min w 200°C. Posyp sezamem.", uwaga:"" },
  "Kurczak pieczony z parmezanem i pomidorkami": { kcal:340, czas:"30 min", porcje:1, tagi:["kurczak","IG","maluch"], skladniki:["160g piersi kurczaka","20g parmezanu","50g jogurtu naturalnego","150g pomidorków koktajlowych","5ml oliwy","czosnek, bazylia"], wykonanie:"Kurczaka posmaruj jogurtem z czosnkiem, posyp parmezanem. Na blaszce rozłóż pomidorki, skrop oliwą. Piecz 20-25 min w 200°C.", uwaga:"" },
  "Sałatka śródziemnomorska z kurczakiem": { kcal:440, czas:"20 min", porcje:1, tagi:["kurczak","IG"], skladniki:["150g piersi kurczaka","80g miksu sałat","50g fety","100g pomidora","80g ogórka","30g oliwek","10ml oliwy","cytryna, oregano"], wykonanie:"Kurczaka zamarynuj w oliwie, cytrynie i oregano, grilluj 6-7 min z każdej strony. Warzywa pokrój, wymieszaj z oliwkami i fetą. Na wierzchu połóż pokrojonego kurczaka.", uwaga:"" },
  "Pulpeciki z dorsza w sosie koperkowym": { kcal:480, czas:"30 min", porcje:1, tagi:["ryba","IG"], skladniki:["200g dorsza","1 jajko","20g bułki tartej pełnoziarnistej","100g jogurtu naturalnego","cytryna, koperek","300g kalafiora","5g masła klarowanego"], wykonanie:"Dorsza posiekaj, wymieszaj z jajkiem i bułką, uformuj pulpeciki. Ugotuj kalafiora na puree z masłem. Pulpeciki gotuj na parze. Jogurt + cytryna + koperek = sos.", uwaga:"" },
  "Kasza bulgur z indykiem i warzywami": { kcal:470, czas:"25 min", porcje:1, tagi:["indyk","IG","maluch"], skladniki:["60g kaszy bulgur","150g piersi z indyka","100g cukinii","100g papryki","10ml oliwy","czosnek, zioła prowansalskie"], wykonanie:"Kaszę ugotuj. Indyka zamarynuj w oliwie i przyprawach, grilluj 4-5 min z każdej strony. Warzywa podsmaż na oliwie z czosnkiem. Wymieszaj kaszę z warzywami.", uwaga:"" },
  "Spaghetti z indykiem i sosem z pieczonej papryki": { kcal:480, czas:"30 min", porcje:1, tagi:["indyk","makaron","IG"], skladniki:["60g makaronu pełnoziarnistego spaghetti","150g mielonego indyka","200g papryki czerwonej","50g cebuli","5g czosnku","5ml oliwy","10g parmezanu","bazylia"], wykonanie:"Paprykę upiecz 20 min, obierz i zblenduj z czosnkiem. Indyka podsmaż z cebulą, dodaj sos. Wymieszaj z makaronem i parmezanem.", uwaga:"" },
  "Lasagne z cukinii i indyka": { kcal:435, czas:"35 min", porcje:1, tagi:["indyk","IG"], skladniki:["300g cukinii","200g mielonego indyka","200g pomidorów krojonych z puszki","60g mozzarelli light","100g jogurtu naturalnego","czosnek, bazylia"], wykonanie:"Cukinię pokrój wzdłuż w plastry. Mięso podsmaż z czosnkiem i pomidorami. W naczyniu układaj: cukinia – mięso – jogurt – ser. Piecz 25-30 min w 190°C.", uwaga:"" },
  "Dorsz z pesto i sałatką ziemniaczaną": { kcal:370, czas:"20 min", porcje:1, tagi:["ryba","IG"], skladniki:["180g dorsza","20g pesto bazyliowego","200g ziemniaków","80g jogurtu naturalnego","10g szczypiorku","5ml oliwy","cytryna"], wykonanie:"Dorsza posmaruj pesto, piecz 15 min w 200°C. Ziemniaki ugotuj, wymieszaj z jogurtem, oliwą, szczypiorkiem i cytryną.", uwaga:"" },
  "Szarpany kurczak BBQ z coleslaw FIT": { kcal:445, czas:"30 min", porcje:1, tagi:["kurczak","IG"], skladniki:["180g piersi kurczaka","150g passaty pomidorowej","10ml sosu sojowego","5g miodu","150g kapusty białej","80g marchewki","80g jogurtu greckiego","10g musztardy","5ml octu jabłkowego"], wykonanie:"Kurczaka ugotuj i rozszarp. Podduś w passacie z sosem sojowym i miodem. Kapustę i marchew poszatkuj, wymieszaj z jogurtem, musztardą i octem — coleslaw. Podaj razem.", uwaga:"" },
  "Risotto z pieczarkami i kurczakiem": { kcal:490, czas:"30 min", porcje:1, tagi:["kurczak","IG"], skladniki:["120g piersi kurczaka","60g ryżu basmati","150g pieczarek","40g cebuli","5g czosnku","300ml bulionu","15g parmezanu","5ml oliwy"], wykonanie:"Kurczaka podsmaż, odłóż. Na oliwie podsmaż cebulę, czosnek i pieczarki. Dodaj ryż, stopniowo dolewaj bulion mieszając. Pod koniec dodaj kurczaka i parmezan.", uwaga:"" },
  "Zapiekanka z cukinii ricotty i indyka": { kcal:600, czas:"35 min", porcje:1, tagi:["indyk","IG"], skladniki:["300g cukinii","150g indyka","100g ricotty","50g mozzarelli light","2 jajka","5ml oliwy","czosnek, bazylia"], wykonanie:"Cukinię zetrzyj, odsącz. Indyka podsmaż. Cukinia + ricotta + jajka + przyprawy + mięso — wymieszaj. Do formy, posyp mozzarellą, piecz 30 min w 180°C.", uwaga:"" },
  "Gulasz wołowy z puree z selera": { kcal:400, czas:"70 min", porcje:1, tagi:["IG"], skladniki:["180g chudej wołowiny","100g marchewki","80g pietruszki korzeniowej","150g selera","50g cebuli","200ml bulionu","10g musztardy","oliwa, liść laurowy, majeranek"], wykonanie:"Wołowinę obsmaż, dodaj cebulę i musztardę. Wlej bulion z ziołami, gotuj 50-60 min. Seler ugotuj osobno, zblenduj na puree. Podaj z sosem.", uwaga:"" },
  "Sałatka z pieczonym batatem i halloumi": { kcal:620, czas:"30 min", porcje:1, tagi:["IG"], skladniki:["200g batata","100g ciecierzycy","80g sera halloumi light","50g miksu sałat","10ml oliwy","10ml soku z cytryny","papryka wędzona, czosnek"], wykonanie:"Batata pokrój w kostkę, piecz 25 min w 200°C z oliwą. Ciecierzycę podpraż 5 min. Halloumi podsmaż na suchej patelni. Wszystko ułóż na sałacie, skrop dressingiem.", uwaga:"" },
  // Kolacje słodkie
  "Omlet biszkoptowy z twarożkiem i owocami": { kcal:600, czas:"20 min", porcje:1, tagi:["jajka","IG"], skladniki:["2 jajka + 100g białek","30g mąki orkiszowej","150g twarogu półtłustego","50g jogurtu greckiego","100g owoców jagodowych","słodzik"], wykonanie:"Z białek ubij pianę, dodaj żółtka i mąkę. Upiecz omlet 15 min w 180°C. Twaróg zmiksuj z jogurtem i słodzikiem. Nałóż krem i owoce.", uwaga:"" },
  "Pancakes z twarogiem i borówkami": { kcal:600, czas:"15 min", porcje:1, tagi:["jajka","IG","maluch"], skladniki:["50g mąki orkiszowej","1 jajko + 80g białek","150g twarogu półtłustego","30g jogurtu naturalnego","100g borówek","5g proszku do pieczenia","słodzik"], wykonanie:"Jajka + mąka + białka + proszek + słodzik — smaż placuszki na suchej patelni. Twaróg z jogurtem = krem. Podaj z borówkami.", uwaga:"" },
  "Wrap kakaowy z serkiem i owocami leśnymi": { kcal:400, czas:"5 min", porcje:1, tagi:["szybkie","IG","maluch"], skladniki:["1 tortilla pełnoziarnista","120g twarogu chudego","40g jogurtu naturalnego","5g kakao","100g owoców leśnych","słodzik"], wykonanie:"Twaróg + jogurt + kakao + słodzik — zmiksuj. Posmaruj tortillę, dodaj owoce, zwiń i podpiecz chwilę.", uwaga:"" },
  "Zapiekany twaróg kakaowy z malinami": { kcal:480, czas:"30 min", porcje:1, tagi:["IG"], skladniki:["200g twarogu półtłustego","1 jajko","10g kakao","50g jogurtu naturalnego","erytrytol","100g malin"], wykonanie:"Twaróg + jajko + jogurt + kakao + słodzik — wymieszaj. Wlej do naczynia, piecz 25 min w 180°C. Podaj z malinami.", uwaga:"" },
  "Naleśniki proteinowe z masłem orzechowym": { kcal:500, czas:"15 min", porcje:1, tagi:["IG"], skladniki:["50g mąki orkiszowej","1 jajko + 80g białek","100ml mleka","20g masła orzechowego","100g malin"], wykonanie:"Mąka + jajka + białka + mleko — usmaż cienkie naleśniki. Posmaruj masłem orzechowym i dodaj maliny.", uwaga:"" },
  "Pudding jaglany z kokosem i owocami": { kcal:475, czas:"20 min", porcje:1, tagi:["ciepłe","IG","maluch"], skladniki:["70g kaszy jaglanej","200ml mleka 1.5%","10g wiórków kokosowych","50g jogurtu naturalnego","100g borówek","5g syropu klonowego"], wykonanie:"Kaszę ugotuj w mleku, zblenduj z jogurtem i wiórkami. Podaj z owocami i syropem.", uwaga:"" },
  // Kolacje słone
  "Sałatka Cobb FIT z kurczakiem": { kcal:435, czas:"15 min", porcje:1, tagi:["kurczak","IG"], skladniki:["120g piersi kurczaka","2 jajka","60g miksu sałat","100g pomidora","80g ogórka","50g awokado","30g fety","sos: jogurt+musztarda+cytryna"], wykonanie:"Kurczaka podsmaż lub ugrilluj, pokrój. Jajka ugotuj na twardo. Na talerzu ułóż sałatę, warzywa, kurczaka, jajka i fetę. Polej sosem jogurtowym.", uwaga:"" },
  "Kanapki z pastą z makreli i jogurtu": { kcal:400, czas:"5 min", porcje:1, tagi:["ryba","szybkie","IG"], skladniki:["2 kromki chleba żytniego (70g)","80g makreli wędzonej","40g jogurtu naturalnego","50g ogórka kiszonego","10g szczypiorku","cytryna"], wykonanie:"Makrelę oczyść, wymieszaj z jogurtem i cytryną. Posmaruj chleb, dodaj ogórka i szczypiorek.", uwaga:"" },
  "Wrap z hummusem i kurczakiem": { kcal:400, czas:"10 min", porcje:1, tagi:["kurczak","IG","maluch"], skladniki:["1 tortilla pełnoziarnista","120g piersi kurczaka","40g hummusu","60g papryki","50g ogórka","20g rukoli"], wykonanie:"Kurczaka podsmaż z przyprawami. Tortillę posmaruj hummusem, dodaj warzywa i kurczaka. Zwiń.", uwaga:"" },
  "Sałatka z tuńczykiem i jajkiem": { kcal:355, czas:"5 min", porcje:1, tagi:["ryba","szybkie","IG"], skladniki:["120g tuńczyka w sosie własnym","1 jajko","50g miksu sałat","80g pomidora","50g kukurydzy","10ml oliwy","cytryna"], wykonanie:"Jajko ugotuj i pokrój. Wymieszaj sałatę, pomidora, kukurydzę, tuńczyka i jajko. Polej oliwą i cytryną.", uwaga:"" },
  "Sałatka z pieczonym łososiem i komosą": { kcal:575, czas:"20 min", porcje:1, tagi:["ryba","łosoś","IG"], skladniki:["120g łososia","60g komosy ryżowej","40g szpinaku baby","80g pomidorków koktajlowych","10ml oliwy","cytryna"], wykonanie:"Łososia upiecz 15-20 min w 180°C. Komosę ugotuj, wymieszaj ze szpinakiem i pomidorkami. Dodaj łososia, skrop oliwą i cytryną.", uwaga:"" },
};

function PrzepisModal({ nazwa, onClose }) {
  const p = PRZEPISY[nazwa];
  if (!p) return null;
  const tagColor = (t) => {
    if (t==="maluch") return { bg:"#E8F0FB", c:"#2C5282" };
    if (t==="IO") return { bg:MAY.sun, c:MAY.forest };
    if (t==="bulk") return { bg:"#EBF2EB", c:"#3B6D3A" };
    return { bg:MAY.baby, c:MAY.forest };
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.55)", zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:"20px 18px", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ flex:1, paddingRight:12 }}>
            <div style={{ fontSize:17, fontWeight:700, color:MAY.forest, lineHeight:1.3 }}>{nazwa}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:7 }}>
              {(p.tagi||[]).map(t=>{ const c=tagColor(t); return <span key={t} style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:c.bg, color:c.c }}>{t}</span>; })}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:MAY.forest, opacity:.35, flexShrink:0 }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:16 }}>
          {[["🔥","Kcal",p.kcal],["⏱️","Czas",p.czas],["🍽️","Porcje",p.porcje===2?"2 (bulk)":"1"]].map(([e,l,v])=>(
            <div key={l} style={{ background:"white", borderRadius:10, padding:"8px 10px", border:`1px solid ${MAY.sea}`, textAlign:"center" }}>
              <div style={{ fontSize:14, marginBottom:2 }}>{e}</div>
              <div style={{ fontSize:13, fontWeight:700, color:MAY.forest }}>{v}</div>
              <div style={{ fontSize:9, color:MAY.forest, opacity:.4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:MAY.forest, marginBottom:8, textTransform:"uppercase", letterSpacing:.5, opacity:.6 }}>Składniki</div>
          <div style={{ background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, overflow:"hidden" }}>
            {(p.skladniki||[]).map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 13px", borderBottom:i<p.skladniki.length-1?`1px solid ${MAY.baby}`:"none" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:MAY.sea, flexShrink:0, marginTop:6 }}/>
                <div style={{ fontSize:13, color:MAY.forest, lineHeight:1.4 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:MAY.forest, marginBottom:8, textTransform:"uppercase", letterSpacing:.5, opacity:.6 }}>Przygotowanie</div>
          <div style={{ background:"white", borderRadius:12, border:`1px solid ${MAY.sea}`, padding:"12px 14px" }}>
            {(p.wykonanie||"").split("\n").map((line,i)=>(
              <div key={i} style={{ fontSize:13, color:MAY.forest, lineHeight:1.6, marginBottom:2 }}>{line}</div>
            ))}
          </div>
        </div>
        {p.uwaga && <div style={{ background:MAY.sun, borderRadius:10, padding:"10px 13px", marginTop:12, display:"flex", gap:8 }}><span>💡</span><div style={{ fontSize:12, color:MAY.forest, lineHeight:1.5 }}>{p.uwaga}</div></div>}
        <div style={{ height:24 }}/>
      </div>
    </div>
  );
}

function ZamienModal({ day, mealType, currentName, onSelect, onClose }) {
  const [filter, setFilter] = React.useState(mealType==="2. Śniadanie"?"szejk":"wszystkie");
  const [search, setSearch] = React.useState("");
  const kategorie = ["wszystkie","szejk","szybkie","kurczak","ryba","makaron","jajka","IO","maluch","bulk"];
  const filtered = Object.entries(PRZEPISY).filter(([nazwa, p]) => {
    const matchSearch = search===""||nazwa.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="wszystkie"||(p.tagi||[]).includes(filter);
    return matchSearch && matchFilter;
  });
  const tagColor = (t) => {
    if(t==="maluch") return { bg:"#E8F0FB", c:"#2C5282" };
    if(t==="IO") return { bg:MAY.sun, c:MAY.forest };
    if(t==="bulk") return { bg:"#EBF2EB", c:"#3B6D3A" };
    if(t==="kurczak") return { bg:"#FFF3E0", c:"#8B5000" };
    if(t==="ryba") return { bg:"#E3F2FD", c:"#1565C0" };
    return { bg:MAY.blush, c:MAY.forest };
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,74,58,0.55)", zIndex:600, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:MAY.bg, borderRadius:"20px 20px 0 0", padding:"18px 16px 0", width:"100%", maxWidth:480, maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:MAY.forest }}>Zamień przepis</div>
            <div style={{ fontSize:11, color:MAY.forest, opacity:.45 }}>{day} · {mealType}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:MAY.forest, opacity:.3 }}>✕</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Szukaj przepisu..." style={{ width:"100%", padding:"9px 13px", borderRadius:10, border:`1.5px solid ${MAY.sea}`, background:"white", fontSize:13, color:MAY.forest, outline:"none", boxSizing:"border-box", fontFamily:"inherit", marginBottom:10 }}/>
        <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:8, marginBottom:4 }}>
          {kategorie.map(k=>(
            <button key={k} onClick={()=>setFilter(k)} style={{ flexShrink:0, padding:"4px 11px", borderRadius:16, border:`1.5px solid ${filter===k?"transparent":MAY.sea}`, background:filter===k?MAY.forest:"white", color:filter===k?"white":MAY.forest, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:filter===k?600:400 }}>{k}</button>
          ))}
        </div>
        <div style={{ overflowY:"auto", flex:1, paddingBottom:24 }}>
          {filtered.length===0&&<div style={{ textAlign:"center", color:MAY.forest, opacity:.3, fontSize:13, padding:24 }}>Brak wyników</div>}
          {filtered.map(([nazwa, p])=>{
            const isCurrent = nazwa===currentName;
            return (
              <div key={nazwa} onClick={()=>{ onSelect(nazwa, p); onClose(); }} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 12px", marginBottom:6, background:isCurrent?"#EBF2EB":"white", borderRadius:12, border:`1.5px solid ${isCurrent?"#C5DAC4":MAY.sea}`, cursor:"pointer" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:MAY.forest, marginBottom:4 }}>{nazwa}{isCurrent&&<span style={{ fontSize:9, padding:"1px 6px", borderRadius:8, background:"#C5DAC4", color:"#3B6D3A", marginLeft:6 }}>aktualny</span>}</div>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:4 }}>
                    {(p.tagi||[]).map(t=>{ const c=tagColor(t); return <span key={t} style={{ fontSize:9, padding:"1px 6px", borderRadius:8, background:c.bg, color:c.c }}>{t}</span>; })}
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <span style={{ fontSize:10, color:MAY.forest, opacity:.5 }}>🔥 {p.kcal} kcal</span>
                    <span style={{ fontSize:10, color:MAY.forest, opacity:.5 }}>⏱️ {p.czas}</span>
                    {p.porcje===2&&<span style={{ fontSize:10, color:"#3B6D3A" }}>🍲 bulk x2</span>}
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


const PLANER_DAYS = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];
const PLANER_MEALS = ['Śniadanie','2. Śniadanie','Obiad','Kolacja'];

const PLANER_DEFAULT = {
  'Poniedziałek': { type:'cook', meals:{ 'Śniadanie':{ name:'Szejk żelazowa moc', sub:'Banan, WPI, mleko migdałowe, masło orzechowe', tag:'baby' }, '2. Śniadanie': { name:'Szejk żelazowa moc', sub:'Banan, WPI, mleko migdałowe', tag:'baby' }, 'Obiad':{ name:'Kurczak teriyaki z ryżem', sub:'Pierś kurczaka, ryż basmati, papryka, cukinia — gotuj x2', tag:'cook' }, 'Kolacja':{ name:'Tosty z mozzarellą', sub:'Chleb tostowy, mozzarella light, szpinak, pomidor', tag:'baby' } }},
  'Wtorek': { type:'easy', meals:{ 'Śniadanie':{ name:'Szejk zdrowe jelita', sub:'Banan, borówki, maliny, WPI', tag:'baby' }, '2. Śniadanie': { name:'Szejk zdrowe jelita', sub:'Banan, borówki, maliny, WPI', tag:'baby' }, 'Obiad':{ name:'Kurczak teriyaki z ryżem', sub:'Podgrzewasz z poniedziałku', tag:'' }, 'Kolacja':{ name:'Tosty z jajkiem i szynką', sub:'Z środy lub nowe', tag:'' } }},
  'Środa': { type:'cook2', meals:{ 'Śniadanie':{ name:'Tosty z mozzarellą', sub:'Chleb tostowy, mozzarella, szpinak', tag:'baby' }, '2. Śniadanie': { name:'Szejk proteinowy', sub:'Maliny, płatki owsiane, siemię lniane, WPI', tag:'baby' }, 'Obiad':{ name:'Kurczak teriyaki z ryżem', sub:'Podgrzewasz z poniedziałku', tag:'' }, 'Kolacja':{ name:'Fit smoothie z szpinakiem', sub:'Banan, jabłko, szpinak, WPI', tag:'baby' } }},
  'Czwartek': { type:'cook2', meals:{ 'Śniadanie':{ name:'Szejk proteinowy', sub:'Maliny, płatki owsiane, WPI', tag:'baby' }, '2. Śniadanie': { name:'Szejk śniadaniowy', sub:'2 banany, masło orzechowo-czekoladowe, WPI', tag:'baby' }, 'Obiad':{ name:'Makaron z kurczakiem i brokułem', sub:'Makaron razowy, kurczak, brokuł — gotuj x2', tag:'cook' }, 'Kolacja':{ name:'Tosty z jajkiem i szynką', sub:'Chleb żytni, jajko sadzone, szynka', tag:'baby' } }},
  'Piątek': { type:'easy', meals:{ 'Śniadanie':{ name:'Szejk śniadaniowy', sub:'2 banany, masło orzechowo-czekoladowe, WPI', tag:'baby' }, '2. Śniadanie': { name:'Szejk żelazowa moc', sub:'Banan, WPI, mleko migdałowe', tag:'baby' }, 'Obiad':{ name:'Makaron z kurczakiem i brokułem', sub:'Podgrzewasz z czwartku', tag:'' }, 'Kolacja':{ name:'Fit smoothie z szpinakiem', sub:'Banan, jabłko, szpinak, WPI', tag:'baby' } }},
  'Sobota': { type:'easy', meals:{ 'Śniadanie':{ name:'Tosty z jajkiem i szynką', sub:'Chleb żytni, jajko sadzone, szynka, pomidor', tag:'baby' }, '2. Śniadanie': { name:'Szejk zdrowe jelita', sub:'Banan, borówki, maliny, WPI', tag:'baby' }, 'Obiad':{ name:'Makaron z kurczakiem i brokułem', sub:'Podgrzewasz z czwartku', tag:'' }, 'Kolacja':{ name:'Kleik ryżowy z owocami', sub:'Kleik, maliny, masło orzechowe, WPI', tag:'baby' } }},
  'Niedziela': { type:'free', meals:{ 'Śniadanie':{ name:'Wolny wybór', sub:'', tag:'' }, '2. Śniadanie': { name:'Shake wg uznania', sub:'Dowolny shake z bazy', tag:'baby' }, 'Obiad':{ name:'Wolny wybór', sub:'', tag:'' }, 'Kolacja':{ name:'Wolny wybór', sub:'', tag:'' } }},
};

const PLANER_SHOP_DEFAULT = [
  { cat:'🥩 Białko i mięso', items:[{n:'Pierś kurczaka',a:'600g'},{n:'Jajka',a:'10 szt.'},{n:'Szynka kanapkowa',a:'1 op.'},{n:'WPI (izolat białka)',a:'400g'}]},
  { cat:'🧀 Nabiał', items:[{n:'Mozzarella light',a:'80g'},{n:'Serek kremowy',a:'100g'},{n:'Jogurt naturalny 0%',a:'1 op.'},{n:'Parmezan',a:'mały kawałek'}]},
  { cat:'🥦 Warzywa', items:[{n:'Szpinak',a:'2 garście'},{n:'Brokuł',a:'1 szt.'},{n:'Papryka czerwona',a:'2 szt.'},{n:'Cukinia',a:'1 szt.'},{n:'Pomidor',a:'4 szt.'},{n:'Ogórek',a:'2 szt.'},{n:'Roszponka/rukola',a:'1 op.'}]},
  { cat:'🍓 Owoce', items:[{n:'Banany',a:'8-9 szt.'},{n:'Maliny (mogą być mrożone)',a:'300g'},{n:'Borówki',a:'100g'},{n:'Jabłko',a:'1 szt.'}]},
  { cat:'🌾 Produkty suche', items:[{n:'Płatki owsiane',a:'1 op.'},{n:'Ryż basmati',a:'120g'},{n:'Makaron razowy',a:'100g'},{n:'Chleb tostowy pszenny',a:'4 kromki'},{n:'Chleb żytni',a:'4 kromki'},{n:'Siemię lniane',a:'1 torebka'},{n:'Nasiona chia',a:'10g'}]},
  { cat:'🫙 Masła i tłuszcze', items:[{n:'Masło orzechowe',a:'60g'},{n:'Masło orzechowo-czekoladowe',a:'30g'},{n:'Mleko migdałowe niesłodzone',a:'1l'},{n:'Sos teriyaki',a:'60g'}]},
  { cat:'💊 Suplementy', items:[{n:'Witamina D3',a:'2000-4000 IU/dzień'},{n:'Magnez',a:'300mg wieczorem'},{n:'Omega-3',a:'2g DHA+EPA'}]},
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
  const [zamienModal, setZamienModal] = React.useState(null);

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
    d[zamienModal.day].meals[zamienModal.mealType] = {
      name: nazwa,
      sub: (p.skladniki||[]).slice(0,3).join(', ').slice(0,60),
      tag: p.porcje===2?'cook':(p.tagi||[]).includes('maluch')?'baby':''
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
    subTabs:{ display:'flex', gap:2, background:MAY.baby, borderRadius:8, padding:3, marginBottom:14, width:'fit-content' },
    subTab:(a)=>({ padding:'6px 16px', borderRadius:6, border:'none', background:a?'white':'transparent', color:a?MAY.forest:'#A8A39C', fontWeight:a?600:400, fontSize:12, cursor:'pointer', fontFamily:'inherit' }),
    navBtn:{ background:MAY.baby, border:`1px solid ${MAY.sea}`, borderRadius:6, padding:'3px 10px', fontSize:13, cursor:'pointer', color:MAY.forest },
    weekLabel:{ fontSize:13, fontWeight:600, color:MAY.forest, minWidth:130, textAlign:'center' },
    cookStrip:{ background:'#EBF2EB', border:'1px solid #C5DAC4', borderRadius:10, padding:'9px 13px', marginBottom:12, fontSize:11, color:'#3B6D3A', lineHeight:1.6 },
    dayCard:(cook)=>({ border:`1px solid ${cook?'#C5DAC4':MAY.sea}`, borderRadius:10, overflow:'hidden', background:'white', marginBottom:7 }),
    dayHead:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 13px', cursor:'pointer' },
    badge:(type)=>{ const cfg={cook:{bg:'#EBF2EB',c:'#3B6D3A',t:'Dzień gotowania'},cook2:{bg:MAY.sun,c:MAY.forest,t:'Gotowanie wieczór'},easy:{bg:MAY.baby,c:MAY.forest,t:'Składanie'},free:{bg:MAY.blush,c:MAY.forest,t:'Dzień wolny'}}; const x=cfg[type]||cfg.easy; return {fontSize:9,padding:'2px 7px',borderRadius:20,background:x.bg,color:x.c,label:x.t}; },
    mealsGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'10px 13px', borderTop:`1px solid ${MAY.baby}` },
    mealBox:{ background:MAY.bg, border:`1px solid ${MAY.sea}`, borderRadius:8, padding:'7px 9px', minHeight:54, position:'relative' },
  };

  return (
    <div style={S.wrap}>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
          <span style={{ fontSize:20, fontWeight:700, color:MAY.forest }}>🥗 Planer tygodniowy</span>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <button style={S.navBtn} onClick={()=>setWeekOffset(w=>w-1)}>‹</button>
            <span style={S.weekLabel}>{planerWeekLabel(weekOffset)}</span>
            <button style={S.navBtn} onClick={()=>setWeekOffset(w=>w+1)}>›</button>
          </div>
        </div>
        <div style={{ fontSize:11, color:MAY.forest, opacity:.4, marginBottom:14 }}>{planerWeekDates(weekOffset)} · Zakupy w sobotę</div>
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
          <div style={S.cookStrip}><strong>Gotowanie: poniedziałek</strong> (obiady pon–wt–śr) + <strong>śr wieczór lub czwartek</strong> (obiady czw–pt–sob). Niedziela wolna.</div>
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
                    <span style={{fontSize:13,fontWeight:600,color:MAY.forest}}>{day}</span>
                    <span style={{fontSize:9,padding:'2px 7px',borderRadius:20,background:bdg.bg,color:bdg.c}}>{bdg.label}</span>
                  </div>
                  <span style={{fontSize:14,color:MAY.forest,opacity:.3,transform:isOpen?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</span>
                </div>
                {isOpen && (isFree
                  ? <div style={{padding:'10px 13px',borderTop:`1px solid ${MAY.baby}`,fontSize:11,color:MAY.forest,opacity:.5,background:MAY.blush}}>Niedziela jest wolna — jedz co masz ochotę 🌿</div>
                  : <div style={S.mealsGrid}>
                      {PLANER_MEALS.map(mt=>{
                        const m = dayD.meals[mt]||{name:'',sub:'',tag:''};
                        return (
                          <div key={mt}>
                            <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'0.07em',color:MAY.forest,opacity:.4,marginBottom:3}}>{mt}</div>
                            <div style={{...S.mealBox,cursor:PRZEPISY[m.name]?'pointer':'default'}}
                              onClick={()=>{if(PRZEPISY[m.name]) setPrzepisModal(m.name);}}>
                              <div style={{position:"absolute",top:4,right:4,display:"flex",gap:2}}>
                                <button style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:MAY.forest,opacity:.4,padding:'1px 3px'}} onClick={e=>{e.stopPropagation();setZamienModal({day,mealType:mt,currentName:m.name});}}>⇄</button>
                                <button style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:MAY.forest,opacity:.4,padding:'1px 3px'}} onClick={e=>{e.stopPropagation();openEdit(day,mt);}}>✎</button>
                              </div>
                              <div style={{fontSize:11,fontWeight:600,color:MAY.forest,lineHeight:1.4}}>{m.name||'—'}</div>
                              {m.sub&&<div style={{fontSize:10,color:MAY.forest,opacity:.5,lineHeight:1.4,marginTop:2}}>{m.sub}</div>}
                              {m.tag==='cook'&&<span style={{fontSize:9,padding:'1px 6px',borderRadius:4,background:'#EBF2EB',color:'#3B6D3A',display:'inline-block',marginTop:2}}>gotuj x2</span>}
                              {m.tag==='baby'&&<span style={{fontSize:9,padding:'1px 6px',borderRadius:4,background:MAY.baby,color:MAY.forest,display:'inline-block',marginTop:2}}>ok dla malucha</span>}
                              {PRZEPISY[m.name]&&<span style={{fontSize:9,color:MAY.sea,display:'block',marginTop:3}}>👆 tap po przepis</span>}
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
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:7}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:MAY.forest,marginBottom:1}}>Lista zakupów na sobotę</div>
              <div style={{fontSize:11,color:MAY.forest,opacity:.4}}>{planerWeekDates(weekOffset)}</div>
            </div>
            <div style={{display:'flex',gap:5}}>
              <button style={{padding:'5px 11px',fontSize:11,borderRadius:7,border:`1px solid ${MAY.sea}`,background:'white',color:MAY.forest,cursor:'pointer',fontFamily:'inherit'}} onClick={uncheckAll}>Odznacz</button>
              <button style={{padding:'5px 11px',fontSize:11,borderRadius:7,border:'none',background:MAY.forest,color:'white',cursor:'pointer',fontFamily:'inherit'}} onClick={resetShop}>Resetuj</button>
            </div>
          </div>
          <div style={{background:MAY.baby,borderRadius:4,height:4,marginBottom:3}}><div style={{background:MAY.forest,height:4,borderRadius:4,width:pct+'%',transition:'width .3s'}}/></div>
          <div style={{fontSize:10,color:MAY.forest,opacity:.4,marginBottom:12}}>{checkedItems} z {totalItems} w koszyku ({pct}%)</div>
          {shopData.map((cat,ci)=>(
            <div key={ci} style={{marginBottom:18}}>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'0.09em',color:MAY.forest,opacity:.4,paddingBottom:6,borderBottom:`1px solid ${MAY.baby}`,marginBottom:7}}>{cat.cat}</div>
              {cat.items.map((item,ii)=>(
                <div key={ii} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:`1px solid ${MAY.baby}`,cursor:'pointer'}} onClick={()=>toggleItem(ci,ii)}>
                  <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${item.checked?MAY.forest:MAY.sea}`,background:item.checked?MAY.forest:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {item.checked&&<span style={{color:'white',fontSize:9}}>✓</span>}
                  </div>
                  <span style={{fontSize:12,color:item.checked?MAY.sea:MAY.forest,textDecoration:item.checked?'line-through':'none',flex:1}}>{item.n}</span>
                  {item.a&&<span style={{fontSize:10,color:MAY.forest,opacity:.35,whiteSpace:'nowrap'}}>{item.a}</span>}
                </div>
              ))}
              <div style={{display:'flex',gap:5,marginTop:7}}>
                <input style={{flex:1,border:`1px solid ${MAY.sea}`,borderRadius:7,padding:'5px 9px',fontSize:11,background:MAY.baby,color:MAY.forest,outline:'none',fontFamily:'inherit'}} placeholder="Dodaj produkt..." value={newItems[ci]||''} onChange={e=>setNewItems(x=>({...x,[ci]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addItem(ci)}/>
                <button style={{padding:'5px 11px',fontSize:11,borderRadius:7,border:`1px solid ${MAY.sea}`,background:'white',color:MAY.forest,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>addItem(ci)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {przepisModal && <PrzepisModal nazwa={przepisModal} onClose={()=>setPrzepisModal(null)}/>}
      {zamienModal && <ZamienModal day={zamienModal.day} mealType={zamienModal.mealType} currentName={zamienModal.currentName} onSelect={applyZamiana} onClose={()=>setZamienModal(null)}/>}

      {editModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(26,74,58,0.5)',zIndex:999,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
          <div style={{background:MAY.bg,borderRadius:'20px 20px 0 0',padding:20,width:'100%',maxWidth:480,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:14,color:MAY.forest}}>Edytuj posiłek</div>
            <label style={{fontSize:10,color:MAY.forest,opacity:.5,textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:3}}>Nazwa dania</label>
            <input style={{width:'100%',border:`1.5px solid ${MAY.sea}`,borderRadius:9,padding:'9px 11px',fontSize:13,color:MAY.forest,background:MAY.baby,outline:'none',boxSizing:'border-box',fontFamily:'inherit',marginBottom:11}} value={editForm.name} onChange={e=>setEditForm(x=>({...x,name:e.target.value}))}/>
            <label style={{fontSize:10,color:MAY.forest,opacity:.5,textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:3}}>Składniki / notatka</label>
            <textarea style={{width:'100%',border:`1.5px solid ${MAY.sea}`,borderRadius:9,padding:'9px 11px',fontSize:13,color:MAY.forest,background:MAY.baby,outline:'none',resize:'vertical',minHeight:60,boxSizing:'border-box',fontFamily:'inherit',marginBottom:11}} value={editForm.sub} onChange={e=>setEditForm(x=>({...x,sub:e.target.value}))}/>
            <select style={{width:'100%',border:`1.5px solid ${MAY.sea}`,borderRadius:9,padding:'9px 11px',fontSize:13,color:MAY.forest,background:MAY.baby,outline:'none',height:38,boxSizing:'border-box',marginBottom:14}} value={editForm.tag} onChange={e=>setEditForm(x=>({...x,tag:e.target.value}))}>
              <option value="">Brak</option><option value="cook">Gotuj x2 (bulk)</option><option value="baby">OK dla malucha</option>
            </select>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={{padding:'8px 16px',borderRadius:9,border:`1px solid ${MAY.sea}`,background:'white',color:MAY.forest,cursor:'pointer',fontSize:13,fontFamily:'inherit'}} onClick={()=>setEditModal(null)}>Anuluj</button>
              <button style={{padding:'8px 16px',borderRadius:9,border:'none',background:MAY.forest,color:'white',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}} onClick={saveEdit}>Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APP
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
  { id:"zdrowie",   ico:"💚", lbl:"Zdrowie" },
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
    zdrowie:   <Zdrowie />,
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
