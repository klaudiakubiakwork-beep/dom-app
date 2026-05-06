import React, { useState, useEffect, useRef } from "react";

const MAY = {
  sea:"#BAD6DA", baby:"#E1F2F4", matcha:"#DDDD7B", sun:"#FFE797",
  gum:"#F691A9", blush:"#FFD6E0", forest:"#1A4A3A", bg:"#F7F4EE", white:"#fff"
};
const DB = {
  wydatki:"8b8f83e61ee2484c9507f2ce9a6a88ff",
  zakupy:"4c93160cf578484aa3d901aac17fd972",
  posilki:"06c7e820b9e3490d97abea40eea3b535",
  zadania:"a2a095ea0de4436fa43b4c66adaf5087",
  zarobki:"244692a26ab84da1a7dc4b8ac1b53421",
  oplaty:"54e94c5f6968468286a551e0fcb266ef",
  oszczednosci:"18cd83111b7444eeaef94b409a6ecdda",
};
const WKATS=["Jedzenie","Dom","Transport","Zdrowie","Ubrania","Rozrywka","Inne"];
const WKTOS=["Klaudia","Maciej","Wspólnie"];
const ZKATS=["Spożywcze","Dom","Chemia","Kosmetyki","Ubrania","Inne"];
const ZPILS=["Teraz","Ten tydzień","Kiedyś"];
const ZKTOS=["Klaudia","Maciej","Oboje","Dom"];
const PTYPS=["Śniadanie","Obiad","Kolacja","Przekąska"];
const PKTOS=["Klaudia","Maciej","Razem","Zamawiane"];
const TKTOS=["Klaudia","Maciej","Oboje"];
const OPLYKAT=["Mieszkanie","Media","Ubezpieczenie","Transport","Subskrypcje","Inne"];
const OPLYTERM=["1-5","6-10","11-15","16-20","21-31"];
const OSZCZ_TYP=["Wpłata","Wypłata","Stan konta"];
const OSZCZ_KAT=["Poduszka finansowa","Wakacje","Remont","Auto","Edukacja","Inwestycje","Inne"];
const MONTHS=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const KAT_COLORS={Jedzenie:"#FFE797",Dom:"#BAD6DA",Transport:"#DDDD7B",Zdrowie:"#F691A9",Ubrania:"#FFD6E0",Rozrywka:"#E1F2F4",Inne:"#c8c3bb"};
const KAT_EMO={Jedzenie:"🍽️",Dom:"🏠",Transport:"🚗",Zdrowie:"💊",Ubrania:"👗",Rozrywka:"🎉",Inne:"📦"};
const TABS=[
  {id:"dashboard",ico:"🏠",lbl:"Dom"},
  {id:"analiza",ico:"📊",lbl:"Analiza"},
  {id:"wydatki",ico:"💸",lbl:"Wydatki"},
  {id:"zakupy",ico:"🛒",lbl:"Zakupy"},
  {id:"posilki",ico:"🍽️",lbl:"Posiłki"},
  {id:"zadania",ico:"✅",lbl:"Zadania"},
  {id:"zarobki",ico:"💼",lbl:"Zarobki"},
  {id:"oplaty",ico:"📋",lbl:"Opłaty"},
  {id:"oszczednosci",ico:"🏦",lbl:"Oszczędności"},
];

async function nQ(dbId,token,filter=null){
  const b={database_id:dbId,page_size:100};
  if(filter)b.filter=filter;
  const r=await fetch(`https://api.notion.com/v1/databases/${dbId}/query`,{method:"POST",headers:{"Authorization":"Bearer "+token,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify(b)});
  return r.json();
}
async function nC(dbId,token,props){
  const r=await fetch("https://api.notion.com/v1/pages",{method:"POST",headers:{"Authorization":"Bearer "+token,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify({parent:{database_id:dbId},properties:props})});
  return r.json();
}
async function nU(pageId,token,props){
  const r=await fetch(`https://api.notion.com/v1/pages/${pageId}`,{method:"PATCH",headers:{"Authorization":"Bearer "+token,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify({properties:props})});
  return r.json();
}
function gp(page,name){
  const p=page.properties?.[name];
  if(!p)return"";
  if(p.type==="title")return p.title?.[0]?.plain_text||"";
  if(p.type==="rich_text")return p.rich_text?.[0]?.plain_text||"";
  if(p.type==="select")return p.select?.name||"";
  if(p.type==="number")return p.number??0;
  if(p.type==="date")return p.date?.start||"";
  if(p.type==="checkbox")return p.checkbox;
  return"";
}
function uid(){return Math.random().toString(36).slice(2,9);}
function today(){return new Date().toISOString().split("T")[0];}
function curMonth(){const n=new Date();return`${MONTHS[n.getMonth()]} ${n.getFullYear()}`;}

// ---- UI PRIMITIVES ----
function Chip({active,onClick,children,color}){
  return<button onClick={onClick} style={{padding:"6px 13px",borderRadius:20,border:`1.5px solid ${active?"transparent":MAY.sea}`,background:active?(color||MAY.forest):"white",color:active?"white":MAY.forest,fontSize:12,cursor:"pointer",fontWeight:active?600:400,transition:".12s",whiteSpace:"nowrap"}}>{children}</button>;
}
function Inp({label,value,onChange,type="text",placeholder,small}){
  return<div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:10,color:MAY.forest,opacity:.55,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{padding:small?"8px 11px":"10px 13px",borderRadius:10,border:`1.5px solid ${MAY.sea}`,background:MAY.baby,color:MAY.forest,fontSize:small?13:14,outline:"none",width:"100%",boxSizing:"border-box"}}/>
  </div>;
}
function Card({children,style={}}){return<div style={{background:"white",borderRadius:16,padding:16,border:`1px solid ${MAY.sea}`,...style}}>{children}</div>;}
function Btn({onClick,children,disabled,ok,small,style={}}){
  return<button onClick={onClick} disabled={disabled} style={{width:"100%",padding:small?"9px 14px":"12px",borderRadius:10,border:"none",background:ok?MAY.sea:disabled?"#e0ddd5":MAY.forest,color:ok||disabled?MAY.forest:"white",fontSize:small?12:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",transition:".12s",...style}}>{children}</button>;
}
function SecTitle({children,emoji}){return<div style={{fontSize:13,fontWeight:600,color:MAY.forest,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>{emoji&&<span style={{fontSize:14}}>{emoji}</span>}{children}</div>;}
function Lbl({children}){return<div style={{fontSize:10,color:MAY.forest,opacity:.55,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{children}</div>;}
function ItemRow({title,sub,right,faded}){
  return<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${MAY.baby}`,opacity:faded?.45:1}}>
    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:MAY.forest,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</div>{sub&&<div style={{fontSize:11,color:MAY.forest,opacity:.4,marginTop:1}}>{sub}</div>}</div>
    <div style={{flexShrink:0,marginLeft:8}}>{right}</div>
  </div>;
}
function StatCard({emoji,value,label,bg,big}){
  return<div style={{borderRadius:14,padding:"12px 14px",background:bg||MAY.baby}}>
    <div style={{fontSize:16,marginBottom:4}}>{emoji}</div>
    <div style={{fontSize:big?22:18,fontWeight:700,color:MAY.forest,lineHeight:1}}>{value}</div>
    <div style={{fontSize:10,color:MAY.forest,opacity:.5,marginTop:3}}>{label}</div>
  </div>;
}

// ---- CHARTS ----
function DonutChart({data,size=130,label}){
  if(!data||!data.length)return<div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12}}>Brak danych</div>;
  const total=data.reduce((s,d)=>s+d.value,0);
  if(!total)return null;
  const cx=size/2,cy=size/2,r=size*.38,inner=size*.22;
  let cum=-Math.PI/2;
  const segs=data.map(d=>{
    const a=(d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(cum),y1=cy+r*Math.sin(cum);
    cum+=a;
    const x2=cx+r*Math.cos(cum),y2=cy+r*Math.sin(cum);
    const xi1=cx+inner*Math.cos(cum-a),yi1=cy+inner*Math.sin(cum-a);
    const xi2=cx+inner*Math.cos(cum),yi2=cy+inner*Math.sin(cum);
    const lg=a>Math.PI?1:0;
    return{...d,path:`M${x1},${y1}A${r},${r}0 ${lg},1 ${x2},${y2}L${xi2},${yi2}A${inner},${inner}0 ${lg},0 ${xi1},${yi1}Z`};
  });
  return(
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <svg width={size} height={size} style={{flexShrink:0}}>
        {segs.map((s,i)=><path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1.5"/>)}
        {label&&<><text x={cx} y={cy-5} textAnchor="middle" style={{fontSize:9,fill:MAY.forest,opacity:.5}}>{label.top}</text><text x={cx} y={cy+9} textAnchor="middle" style={{fontSize:12,fontWeight:"bold",fill:MAY.forest}}>{label.val}</text></>}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:5,flex:1,minWidth:0}}>
        {data.slice(0,6).map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:d.color,flexShrink:0}}/>
            <div style={{fontSize:11,color:MAY.forest,flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.label}</div>
            <div style={{fontSize:10,fontWeight:600,color:MAY.forest,flexShrink:0}}>{Math.round((d.value/total)*100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({data,height=100}){
  if(!data||!data.length)return null;
  const max=Math.max(...data.map(d=>d.value),1);
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height,paddingTop:8}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
          <div style={{fontSize:9,color:MAY.forest,opacity:.5,textAlign:"center"}}>{d.value>0?Math.round(d.value):""}</div>
          <div style={{width:"100%",background:d.color||MAY.sea,borderRadius:"4px 4px 0 0",height:`${Math.max((d.value/max)*80,d.value>0?4:0)}%`,transition:".3s",minHeight:d.value>0?3:0}}/>
          <div style={{fontSize:9,color:MAY.forest,opacity:.5,textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",maxWidth:28}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({value,max,color,label,sublabel}){
  const pct=max>0?Math.min((value/max)*100,100):0;
  return(
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:12,color:MAY.forest}}>{label}</span>
        <span style={{fontSize:11,fontWeight:600,color:MAY.forest}}>{sublabel}</span>
      </div>
      <div style={{height:6,background:MAY.baby,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color||MAY.sea,borderRadius:3,transition:".4s"}}/>
      </div>
    </div>
  );
}

// ---- DASHBOARD ----
function Dashboard({token}){
  const [data,setData]=useState({wydatki:0,zakupy:0,zadania:0,posilki:0,oplaty:{total:0,zapl:0},oszcz:0,katData:[]});
  useEffect(()=>{
    if(!token)return;
    const cm=curMonth();
    Promise.all([
      nQ(DB.wydatki,token),
      nQ(DB.zakupy,token,{property:"Kupione",checkbox:{equals:false}}),
      nQ(DB.zadania,token,{property:"Status",select:{does_not_equal:"Gotowe"}}),
      nQ(DB.posilki,token,{property:"Data",date:{on_or_after:today()}}),
      nQ(DB.oplaty,token),
      nQ(DB.oszczednosci,token),
    ]).then(([w,z,t,p,o,os])=>{
      const items=w.results||[];
      const total=items.reduce((s,pg)=>s+(gp(pg,"Kwota")||0),0);
      const byKat={};
      items.forEach(pg=>{const k=gp(pg,"Kategoria")||"Inne";byKat[k]=(byKat[k]||0)+(gp(pg,"Kwota")||0);});
      const katData=Object.entries(byKat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:KAT_EMO[k]+" "+k,value:v,color:KAT_COLORS[k]||"#ccc"}));
      const oplItems=o.results||[];
      const oTotal=oplItems.reduce((s,pg)=>s+(gp(pg,"Kwota")||0),0);
      const oZapl=oplItems.filter(pg=>gp(pg,cm)===true).reduce((s,pg)=>s+(gp(pg,"Kwota")||0),0);
      const osItems=os.results||[];
      const osTotal=osItems.filter(pg=>gp(pg,"Typ")==="Wpłata").reduce((s,pg)=>s+(gp(pg,"Kwota")||0),0)-osItems.filter(pg=>gp(pg,"Typ")==="Wypłata").reduce((s,pg)=>s+(gp(pg,"Kwota")||0),0);
      setData({wydatki:total,zakupy:(z.results||[]).length,zadania:(t.results||[]).length,posilki:(p.results||[]).length,oplaty:{total:oTotal,zapl:oZapl},oszcz:osTotal,katData});
    });
  },[token]);
  const now=new Date();
  const hour=now.getHours();
  const greet=hour<6?"Dobranoc 🌙":hour<12?"Dzień dobry ☀️":hour<18?"Dzień dobry 🌤️":"Dobry wieczór 🌙";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{padding:"4px 0 2px"}}>
        <div style={{fontSize:19,fontWeight:700,color:MAY.forest}}>{greet}</div>
        <div style={{fontSize:12,color:MAY.forest,opacity:.45,marginTop:1}}>{now.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <StatCard emoji="💸" value={Math.round(data.wydatki)+" zł"} label="wydatki w mies." bg={MAY.sun}/>
        <StatCard emoji="🏦" value={Math.round(data.oszcz)+" zł"} label="łącznie oszczędności" bg={MAY.matcha}/>
        <StatCard emoji="🛒" value={data.zakupy+" szt"} label="do kupienia" bg={MAY.baby}/>
        <StatCard emoji="✅" value={data.zadania+" zad."} label="otwarte zadania" bg={MAY.blush}/>
      </div>
      <Card>
        <SecTitle emoji="📊">Wydatki wg kategorii</SecTitle>
        <DonutChart data={data.katData} size={130} label={{top:"łącznie",val:Math.round(data.wydatki)+" zł"}}/>
      </Card>
      <Card>
        <SecTitle emoji="📋">Opłaty stałe — {curMonth()}</SecTitle>
        <ProgressBar value={data.oplaty.zapl} max={data.oplaty.total} color={MAY.sea} label="Zapłacone" sublabel={`${Math.round(data.oplaty.zapl)} / ${Math.round(data.oplaty.total)} zł`}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:11,color:MAY.forest,opacity:.5}}>Pozostało do zapłaty</span>
          <span style={{fontSize:12,fontWeight:700,color:MAY.gum}}>{Math.round(data.oplaty.total-data.oplaty.zapl)} zł</span>
        </div>
      </Card>
      <Card style={{background:MAY.sea,border:"none"}}>
        <a href="https://www.notion.so/358f8cff1ae3813dba98e304eadeb22f" target="_blank" style={{color:MAY.forest,fontSize:13,fontWeight:600,textDecoration:"none"}}>🏠 Otwórz Ekosystem Domu w Notion →</a>
      </Card>
    </div>
  );
}

// ---- ANALIZA ----
function Analiza({token}){
  const [wydatki,setWydatki]=useState([]);
  const [zarobki,setZarobki]=useState([]);
  const [oplaty,setOplaty]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!token)return;
    Promise.all([nQ(DB.wydatki,token),nQ(DB.zarobki,token),nQ(DB.oplaty,token)]).then(([w,z,o])=>{
      setWydatki(w.results||[]);setZarobki(z.results||[]);setOplaty(o.results||[]);setLoading(false);
    });
  },[token]);

  if(loading)return<Card><div style={{textAlign:"center",color:MAY.forest,opacity:.4,padding:24}}>⏳ Ładuję dane…</div></Card>;

  const totalW=wydatki.reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  const totalO=oplaty.reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  const lastZ=zarobki.slice(-1)[0];
  const lastZTotal=(gp(lastZ||{},"Zarobki Klaudia")||0)+(gp(lastZ||{},"Zarobki Maciej")||0);
  const bilans=lastZTotal-totalW-totalO;

  const byKat={};
  wydatki.forEach(p=>{const k=gp(p,"Kategoria")||"Inne";byKat[k]=(byKat[k]||0)+(gp(p,"Kwota")||0);});
  const katData=Object.entries(byKat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:KAT_EMO[k]+" "+k,value:v,color:KAT_COLORS[k]||"#ccc"}));

  const byKto={};
  wydatki.forEach(p=>{const k=gp(p,"Kto płacił")||"?";byKto[k]=(byKto[k]||0)+(gp(p,"Kwota")||0);});
  const ktoData=Object.entries(byKto).map(([k,v])=>({label:k,value:Math.round(v),color:k==="Klaudia"?MAY.gum:k==="Maciej"?MAY.sea:MAY.matcha}));

  const biggestKat=Object.entries(byKat).sort((a,b)=>b[1]-a[1])[0];
  const oplatyByKat={};
  oplaty.forEach(p=>{const k=gp(p,"Kategoria")||"Inne";oplatyByKat[k]=(oplatyByKat[k]||0)+(gp(p,"Kwota")||0);});
  const oplatyData=Object.entries(oplatyByKat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:k,value:Math.round(v),color:MAY.baby}));

  const wnioski=[];
  if(bilans<0)wnioski.push({ico:"⚠️",txt:`Wydatki przekraczają zarobki o ${Math.abs(Math.round(bilans))} zł`,color:MAY.gum});
  else if(bilans>0)wnioski.push({ico:"✅",txt:`Nadwyżka ${Math.round(bilans)} zł — warto odkładać!`,color:MAY.matcha});
  if(biggestKat)wnioski.push({ico:"📌",txt:`Największa kategoria: ${biggestKat[0]} (${Math.round(biggestKat[1])} zł)`,color:MAY.sun});
  if(totalO>0&&lastZTotal>0)wnioski.push({ico:"📋",txt:`Stałe opłaty to ${Math.round((totalO/lastZTotal)*100)}% zarobków`,color:MAY.baby});
  if(totalW>0&&lastZTotal>0&&totalW/lastZTotal>0.5)wnioski.push({ico:"💡",txt:"Wydatki bieżące to ponad 50% zarobków — sprawdź gdzie można ciąć",color:MAY.blush});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:`linear-gradient(135deg,${MAY.sun},${MAY.matcha})`,border:"none"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div><div style={{fontSize:9,color:MAY.forest,opacity:.6,marginBottom:2}}>ZAROBKI</div><div style={{fontSize:15,fontWeight:700,color:MAY.forest}}>{Math.round(lastZTotal)} zł</div></div>
          <div><div style={{fontSize:9,color:MAY.forest,opacity:.6,marginBottom:2}}>WYDATKI</div><div style={{fontSize:15,fontWeight:700,color:MAY.forest}}>{Math.round(totalW+totalO)} zł</div></div>
          <div><div style={{fontSize:9,color:MAY.forest,opacity:.6,marginBottom:2}}>BILANS</div><div style={{fontSize:15,fontWeight:700,color:bilans>=0?MAY.forest:MAY.gum}}>{bilans>=0?"+":""}{Math.round(bilans)} zł</div></div>
        </div>
      </Card>

      {wnioski.length>0&&<Card>
        <SecTitle emoji="💡">Wnioski finansowe</SecTitle>
        {wnioski.map((w,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 10px",borderRadius:10,background:w.color,marginBottom:6}}>
            <span style={{fontSize:14}}>{w.ico}</span>
            <span style={{fontSize:12,color:MAY.forest,lineHeight:1.4}}>{w.txt}</span>
          </div>
        ))}
      </Card>}

      <Card>
        <SecTitle emoji="🍩">Podział wydatków bieżących</SecTitle>
        <DonutChart data={katData} size={130} label={{top:"łącznie",val:Math.round(totalW)+" zł"}}/>
      </Card>

      <Card>
        <SecTitle emoji="👥">Kto ile płacił</SecTitle>
        <BarChart data={ktoData} height={90}/>
      </Card>

      <Card>
        <SecTitle emoji="📋">Stałe opłaty wg kategorii</SecTitle>
        <BarChart data={oplatyData} height={90}/>
        {oplatyData.map((d,i)=><ProgressBar key={i} value={d.value} max={totalO} color={MAY.sea} label={d.label} sublabel={d.value+" zł"}/>)}
      </Card>

      <Card>
        <SecTitle emoji="⚖️">Struktura budżetu</SecTitle>
        {lastZTotal>0&&[
          {label:"Stałe opłaty",value:totalO,color:MAY.gum},
          {label:"Wydatki bieżące",value:totalW,color:MAY.sun},
          {label:"Pozostałe",value:Math.max(lastZTotal-totalW-totalO,0),color:MAY.matcha},
        ].map((item,i)=>(
          <ProgressBar key={i} value={item.value} max={lastZTotal} color={item.color} label={item.label} sublabel={`${Math.round(lastZTotal>0?(item.value/lastZTotal)*100:0)}% · ${Math.round(item.value)} zł`}/>
        ))}
      </Card>
    </div>
  );
}

// ---- WYDATKI ----
function Wydatki({token}){
  const [nazwa,setNazwa]=useState("");const [kwota,setKwota]=useState("");
  const [kat,setKat]=useState("Jedzenie");const [kto,setKto]=useState("Klaudia");
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);
  const [lista,setLista]=useState([]);const [loading,setLoading]=useState(true);
  async function load(){const d=await nQ(DB.wydatki,token);setLista(d.results||[]);setLoading(false);}
  useEffect(()=>{if(token)load();},[token]);
  const total=lista.reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  async function dodaj(){
    if(!nazwa||!kwota)return;setSaving(true);
    await nC(DB.wydatki,token,{Nazwa:{title:[{text:{content:nazwa}}]},Kwota:{number:parseFloat(kwota)},Kategoria:{select:{name:kat}},"Kto płacił":{select:{name:kto}},Data:{date:{start:today()}}});
    setOk(true);setNazwa("");setKwota("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:`linear-gradient(135deg,${MAY.sun},${MAY.matcha})`,border:"none"}}>
        <div style={{fontSize:10,color:MAY.forest,opacity:.6,marginBottom:2}}>ŁĄCZNIE W TYM MIESIĄCU 💸</div>
        <div style={{fontSize:28,fontWeight:700,color:MAY.forest}}>{Math.round(total)} zł</div>
      </Card>
      <Card>
        <SecTitle emoji="➕">Dodaj wydatek</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
            <Inp label="Co?" value={nazwa} onChange={setNazwa} placeholder="np. Biedronka"/>
            <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0"/>
          </div>
          <div><Lbl>Kategoria</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{WKATS.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{KAT_EMO[k]} {k}</Chip>)}</div></div>
          <div><Lbl>Kto płacił</Lbl><div style={{display:"flex",gap:4}}>{WKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!nazwa||!kwota} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj wydatek"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle emoji="🕐">Ostatnie wydatki</SecTitle>
        {loading?<div style={{textAlign:"center",padding:16,color:MAY.forest,opacity:.3,fontSize:12}}>Ładuję…</div>:lista.slice().reverse().slice(0,10).map(p=>(
          <ItemRow key={p.id} title={KAT_EMO[gp(p,"Kategoria")]+" "+gp(p,"Nazwa")} sub={`${gp(p,"Kategoria")} · ${gp(p,"Kto płacił")} · ${gp(p,"Data")}`} right={<span style={{fontSize:13,fontWeight:700,color:MAY.forest}}>{gp(p,"Kwota")} zł</span>}/>
        ))}
      </Card>
    </div>
  );
}

// ---- ZAKUPY ----
function Zakupy({token}){
  const [produkt,setProdukt]=useState("");const [ilosc,setIlosc]=useState("");
  const [kat,setKat]=useState("Spożywcze");const [pil,setPil]=useState("Ten tydzień");const [kto,setKto]=useState("Oboje");
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);const [lista,setLista]=useState([]);
  const pilCol={"Teraz":MAY.gum,"Ten tydzień":MAY.matcha,"Kiedyś":MAY.sea};
  async function load(){const d=await nQ(DB.zakupy,token,{property:"Kupione",checkbox:{equals:false}});setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!produkt)return;setSaving(true);
    await nC(DB.zakupy,token,{Produkt:{title:[{text:{content:produkt}}]},Ilość:{rich_text:[{text:{content:ilosc}}]},Kategoria:{select:{name:kat}},Pilność:{select:{name:pil}},"Kto potrzebuje":{select:{name:kto}},Kupione:{checkbox:false}});
    setOk(true);setProdukt("");setIlosc("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  async function kupione(id){await nU(id,token,{Kupione:{checkbox:true}});setLista(p=>p.filter(i=>i.id!==id));}
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <SecTitle emoji="🛒">Dodaj do listy</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
            <Inp label="Co kupić?" value={produkt} onChange={setProdukt} placeholder="np. mleko"/>
            <Inp label="Ile?" value={ilosc} onChange={setIlosc} placeholder="2 szt"/>
          </div>
          <div><Lbl>Kategoria</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{ZKATS.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><Lbl>Pilność</Lbl><div style={{display:"flex",flexDirection:"column",gap:3}}>{ZPILS.map(p=><Chip key={p} active={pil===p} onClick={()=>setPil(p)} color={pilCol[p]}>{p}</Chip>)}</div></div>
            <div><Lbl>Kto</Lbl><div style={{display:"flex",flexDirection:"column",gap:3}}>{ZKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          </div>
          <Btn onClick={dodaj} disabled={saving||!produkt} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj do listy"}</Btn>
        </div>
      </Card>
      {ZPILS.map(p=>{const items=lista.filter(i=>gp(i,"Pilność")===p);return items.length?(
        <Card key={p}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:pilCol[p]}}/>
            <Lbl>{p}</Lbl>
          </div>
          {items.map(i=><ItemRow key={i.id} title={gp(i,"Produkt")} sub={`${gp(i,"Kategoria")} · ${gp(i,"Kto potrzebuje")}${gp(i,"Ilość")?" · "+gp(i,"Ilość"):""}`} right={<button onClick={()=>kupione(i.id)} style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${MAY.sea}`,background:"white",cursor:"pointer",fontSize:12,color:MAY.forest}}>✓</button>}/>)}
        </Card>
      ):null})}
      {lista.length===0&&<Card><div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:13,padding:16}}>Lista pusta 🎉</div></Card>}
    </div>
  );
}

// ---- POSILKI ----
function Posilki({token}){
  const [danie,setDanie]=useState("");const [typ,setTyp]=useState("Obiad");const [kto,setKto]=useState("Klaudia");
  const [selDate,setSelDate]=useState(today());const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);
  const [lista,setLista]=useState([]);const [aiLoad,setAiLoad]=useState(false);const [sugg,setSugg]=useState([]);
  async function load(){const d=await nQ(DB.posilki,token,{property:"Data",date:{on_or_after:today()}});setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!danie)return;setSaving(true);
    await nC(DB.posilki,token,{Danie:{title:[{text:{content:danie}}]},Posiłek:{select:{name:typ}},"Kto gotuje":{select:{name:kto}},Data:{date:{start:selDate}}});
    setOk(true);setDanie("");setSugg([]);setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  async function proponuj(){
    setAiLoad(true);
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:"Zaproponuj 5 szybkich pomysłów na obiad. Tylko nazwy po polsku, każde w nowej linii, bez numeracji."}]})});const d=await r.json();setSugg((d.content?.[0]?.text||"").trim().split("\n").filter(Boolean).slice(0,5));}catch{}
    setAiLoad(false);
  }
  const DAYS=["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];
  const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return{ds:d.toISOString().split("T")[0],day:d.getDate(),dn:DAYS[d.getDay()]};});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2}}>
          {week.map(w=>{const meals=lista.filter(p=>gp(p,"Data")===w.ds).length;const sel=selDate===w.ds;const isT=w.ds===today();
          return<button key={w.ds} onClick={()=>setSelDate(w.ds)} style={{flex:"0 0 auto",width:44,borderRadius:12,padding:"7px 3px",textAlign:"center",border:`1.5px solid ${sel?MAY.forest:isT?MAY.forest:"transparent"}`,background:sel?MAY.forest:"white",cursor:"pointer"}}>
            <div style={{fontSize:9,color:sel?MAY.baby:MAY.forest,opacity:sel?1:.5}}>{w.dn}</div>
            <div style={{fontSize:14,fontWeight:700,color:sel?"white":MAY.forest,margin:"3px 0"}}>{w.day}</div>
            <div style={{fontSize:8,color:sel?MAY.baby:MAY.sea,minHeight:9}}>{meals?"●".repeat(Math.min(meals,3)):"·"}</div>
          </button>;})}
        </div>
      </Card>
      <Card>
        <SecTitle emoji="🍽️">Dodaj posiłek</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Inp label="Danie" value={danie} onChange={setDanie} placeholder="np. spaghetti"/>
          {sugg.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{sugg.map(s=><button key={s} onClick={()=>setDanie(s)} style={{padding:"4px 9px",borderRadius:16,border:`1px solid ${MAY.sea}`,background:MAY.baby,fontSize:11,color:MAY.forest,cursor:"pointer"}}>{s}</button>)}</div>}
          <button onClick={proponuj} disabled={aiLoad} style={{padding:"8px 12px",borderRadius:10,border:`1.5px dashed ${MAY.sea}`,background:"transparent",fontSize:12,color:MAY.forest,opacity:.6,cursor:"pointer",textAlign:"left"}}>{aiLoad?"🤔 Myślę…":"✨ Zaproponuj pomysły AI"}</button>
          <div><Lbl>Posiłek</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{PTYPS.map(k=><Chip key={k} active={typ===k} onClick={()=>setTyp(k)}>{k}</Chip>)}</div></div>
          <div><Lbl>Kto gotuje</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{PKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!danie} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj do planu"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle emoji="📅">Plan na wybrany dzień</SecTitle>
        {lista.filter(p=>gp(p,"Data")===selDate).length===0?<div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12}}>Brak posiłków 🍽️</div>:lista.filter(p=>gp(p,"Data")===selDate).map(p=><ItemRow key={p.id} title={gp(p,"Danie")} sub={`${gp(p,"Posiłek")} · ${gp(p,"Kto gotuje")}`}/>)}
      </Card>
    </div>
  );
}

// ---- ZADANIA ----
function Zadania({token}){
  const [zadanie,setZadanie]=useState("");const [kto,setKto]=useState("Oboje");
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);const [lista,setLista]=useState([]);
  async function load(){const d=await nQ(DB.zadania,token,{property:"Status",select:{does_not_equal:"Gotowe"}});setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!zadanie)return;setSaving(true);
    await nC(DB.zadania,token,{Zadanie:{title:[{text:{content:zadanie}}]},Status:{select:{name:"Do zrobienia"}},Odpowiedzialny:{select:{name:kto}}});
    setOk(true);setZadanie("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  async function zmien(id,st){
    if(st==="Gotowe"){await nU(id,token,{Status:{select:{name:"Gotowe"}}});setLista(p=>p.filter(i=>i.id!==id));}
    else{await nU(id,token,{Status:{select:{name:st}}});await load();}
  }
  const sCol={"Do zrobienia":MAY.gum,"W toku":MAY.matcha};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <SecTitle emoji="✅">Dodaj zadanie</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Inp label="Co trzeba zrobić?" value={zadanie} onChange={setZadanie} placeholder="np. zapłacić za prąd"/>
          <div><Lbl>Kto?</Lbl><div style={{display:"flex",gap:4}}>{TKTOS.map(k=><Chip key={k} active={kto===k} onClick={()=>setKto(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!zadanie} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj zadanie"}</Btn>
        </div>
      </Card>
      {["Do zrobienia","W toku"].map(s=>{const items=lista.filter(i=>gp(i,"Status")===s);return items.length?(
        <Card key={s}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:sCol[s]}}/><Lbl>{s}</Lbl></div>
          {items.map(i=><ItemRow key={i.id} title={gp(i,"Zadanie")} sub={gp(i,"Odpowiedzialny")} right={
            <div style={{display:"flex",gap:4}}>
              {s==="Do zrobienia"&&<button onClick={()=>zmien(i.id,"W toku")} style={{fontSize:10,padding:"4px 7px",borderRadius:8,border:`1px solid ${MAY.matcha}`,background:"white",color:MAY.forest,cursor:"pointer"}}>→ Toku</button>}
              <button onClick={()=>zmien(i.id,"Gotowe")} style={{fontSize:10,padding:"4px 7px",borderRadius:8,border:`1px solid ${MAY.sea}`,background:"white",color:MAY.forest,cursor:"pointer"}}>✓ Gotowe</button>
            </div>
          }/>)}
        </Card>
      ):null})}
      {lista.length===0&&<Card><div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:13,padding:16}}>Wszystko gotowe! 🎉</div></Card>}
    </div>
  );
}

// ---- ZAROBKI ----
function Zarobki({token}){
  const [miesiac,setMiesiac]=useState(curMonth());
  const [klaudia,setKlaudia]=useState("");const [maciej,setMaciej]=useState("");const [notatka,setNotatka]=useState("");
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);const [lista,setLista]=useState([]);
  async function load(){const d=await nQ(DB.zarobki,token);setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!klaudia&&!maciej)return;setSaving(true);
    await nC(DB.zarobki,token,{"Miesiąc":{title:[{text:{content:miesiac}}]},"Zarobki Klaudia":{number:parseFloat(klaudia)||0},"Zarobki Maciej":{number:parseFloat(maciej)||0},Notatka:{rich_text:[{text:{content:notatka}}]}});
    setOk(true);setKlaudia("");setMaciej("");setNotatka("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  const totalAll=lista.reduce((s,p)=>{const k=gp(p,"Zarobki Klaudia")||0;const m=gp(p,"Zarobki Maciej")||0;return s+k+m;},0);
  const barData=lista.slice(-6).map(p=>{const k=gp(p,"Zarobki Klaudia")||0;const m=gp(p,"Zarobki Maciej")||0;return{label:(gp(p,"Miesiąc")||"").split(" ")[0].slice(0,3),value:k+m,color:MAY.matcha};});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:`linear-gradient(135deg,${MAY.blush},${MAY.sun})`,border:"none"}}>
        <div style={{fontSize:10,color:MAY.forest,opacity:.6,marginBottom:2}}>ŁĄCZNIE WSZYSTKIE MIESIĄCE 💼</div>
        <div style={{fontSize:28,fontWeight:700,color:MAY.forest}}>{Math.round(totalAll)} zł</div>
      </Card>
      {barData.length>0&&<Card><SecTitle emoji="📈">Historia zarobków</SecTitle><BarChart data={barData} height={90}/></Card>}
      <Card>
        <SecTitle emoji="➕">Dodaj zarobki</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div><Lbl>Miesiąc</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{MONTHS.slice(4).map(m=><Chip key={m} active={miesiac===m+" 2026"} onClick={()=>setMiesiac(m+" 2026")}>{m.slice(0,3)}</Chip>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Inp label="Klaudia (zł)" value={klaudia} onChange={setKlaudia} type="number" placeholder="0"/>
            <Inp label="Maciej (zł)" value={maciej} onChange={setMaciej} type="number" placeholder="0"/>
          </div>
          <Inp label="Notatka (opcjonalnie)" value={notatka} onChange={setNotatka} placeholder=""/>
          <Btn onClick={dodaj} disabled={saving||(!klaudia&&!maciej)} ok={ok}>{ok?"✓ Zapisano!":saving?"Zapisuję…":"Zapisz zarobki"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle emoji="📅">Historia</SecTitle>
        {lista.length===0?<div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12}}>Brak danych</div>:lista.slice().reverse().map(p=>{
          const k=gp(p,"Zarobki Klaudia")||0;const m=gp(p,"Zarobki Maciej")||0;
          return<ItemRow key={p.id} title={gp(p,"Miesiąc")} sub={`Klaudia: ${k} zł · Maciej: ${m} zł`} right={<span style={{fontSize:13,fontWeight:700,color:MAY.forest}}>{Math.round(k+m)} zł</span>}/>;
        })}
      </Card>
    </div>
  );
}

// ---- OPLATY ----
function Oplaty({token}){
  const [nazwa,setNazwa]=useState("");const [kwota,setKwota]=useState("");
  const [kat,setKat]=useState("Media");const [term,setTerm]=useState("1-5");
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);const [lista,setLista]=useState([]);
  const CM=curMonth();
  async function load(){const d=await nQ(DB.oplaty,token);setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!nazwa)return;setSaving(true);
    await nC(DB.oplaty,token,{Nazwa:{title:[{text:{content:nazwa}}]},Kwota:{number:parseFloat(kwota)||0},Kategoria:{select:{name:kat}},"Termin płatności":{select:{name:term}}});
    setOk(true);setNazwa("");setKwota("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  async function toggleM(pageId,cur){const p={};p[CM]={checkbox:!cur};await nU(pageId,token,p);await load();}
  const total=lista.reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  const zapl=lista.filter(p=>gp(p,CM)===true).reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <StatCard emoji="⏳" value={Math.round(total-zapl)+" zł"} label="do zapłaty" bg={MAY.blush}/>
        <StatCard emoji="✅" value={Math.round(zapl)+" zł"} label="zapłacone" bg={MAY.matcha}/>
      </div>
      <Card>
        <ProgressBar value={zapl} max={total} color={MAY.sea} label={`Postęp — ${CM}`} sublabel={`${Math.round(total>0?(zapl/total)*100:0)}%`}/>
      </Card>
      <Card>
        <SecTitle emoji="➕">Dodaj opłatę</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
            <Inp label="Nazwa" value={nazwa} onChange={setNazwa} placeholder="np. prąd"/>
            <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0"/>
          </div>
          <div><Lbl>Kategoria</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{OPLYKAT.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div>
          <div><Lbl>Termin płatności (dzień mies.)</Lbl><div style={{display:"flex",gap:4}}>{OPLYTERM.map(t=><Chip key={t} active={term===t} onClick={()=>setTerm(t)}>{t}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!nazwa} ok={ok}>{ok?"✓ Dodano!":saving?"Zapisuję…":"Dodaj opłatę"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle emoji="📋">{CM}</SecTitle>
        {lista.length===0?<div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12}}>Brak opłat</div>:lista.sort((a,b)=>(gp(a,CM)?1:0)-(gp(b,CM)?1:0)).map(p=>{
          const paid=gp(p,CM)===true;
          return<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${MAY.baby}`,opacity:paid?.45:1}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,color:MAY.forest,textDecoration:paid?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{gp(p,"Nazwa")}</div>
              <div style={{fontSize:10,color:MAY.forest,opacity:.4}}>{gp(p,"Kategoria")} · {gp(p,"Termin płatności")} dnia</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8}}>
              <span style={{fontSize:13,fontWeight:700,color:MAY.forest}}>{gp(p,"Kwota")} zł</span>
              <button onClick={()=>toggleM(p.id,paid)} style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${paid?MAY.forest:MAY.sea}`,background:paid?MAY.forest:"white",cursor:"pointer",color:paid?"white":MAY.forest,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button>
            </div>
          </div>;
        })}
      </Card>
    </div>
  );
}

// ---- OSZCZEDNOSCI ----
function Oszczednosci({token}){
  const [nazwa,setNazwa]=useState("");const [kwota,setKwota]=useState("");
  const [typ,setTyp]=useState("Wpłata");const [kat,setKat]=useState("Poduszka finansowa");
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState(false);const [lista,setLista]=useState([]);
  async function load(){const d=await nQ(DB.oszczednosci,token);setLista(d.results||[]);}
  useEffect(()=>{if(token)load();},[token]);
  async function dodaj(){
    if(!kwota)return;setSaving(true);
    const finalNazwa=nazwa||(typ==="Wpłata"?"Wpłata oszczędności":typ==="Wypłata"?"Wypłata":"Stan konta");
    await nC(DB.oszczednosci,token,{Nazwa:{title:[{text:{content:finalNazwa}}]},Kwota:{number:parseFloat(kwota)},Typ:{select:{name:typ}},Kategoria:{select:{name:kat}},Data:{date:{start:today()}}});
    setOk(true);setNazwa("");setKwota("");setTimeout(()=>setOk(false),1500);await load();setSaving(false);
  }
  const wplaty=lista.filter(p=>gp(p,"Typ")==="Wpłata").reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  const wyplaty=lista.filter(p=>gp(p,"Typ")==="Wypłata").reduce((s,p)=>s+(gp(p,"Kwota")||0),0);
  const saldo=wplaty-wyplaty;
  const byKat={};
  lista.filter(p=>gp(p,"Typ")==="Wpłata").forEach(p=>{const k=gp(p,"Kategoria")||"Inne";byKat[k]=(byKat[k]||0)+(gp(p,"Kwota")||0);});
  const katColors={"Poduszka finansowa":MAY.matcha,"Wakacje":MAY.sun,"Remont":MAY.sea,"Auto":MAY.baby,"Edukacja":MAY.blush,"Inwestycje":MAY.gum,"Inne":"#c8c3bb"};
  const katData=Object.entries(byKat).filter(([,v])=>v>0).map(([k,v])=>({label:k,value:v,color:katColors[k]||"#ccc"}));
  const typCol={"Wpłata":MAY.matcha,"Wypłata":MAY.gum,"Stan konta":MAY.sea};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:`linear-gradient(135deg,${MAY.matcha},${MAY.sea})`,border:"none"}}>
        <div style={{fontSize:10,color:MAY.forest,opacity:.6,marginBottom:2}}>ŁĄCZNE OSZCZĘDNOŚCI 🏦</div>
        <div style={{fontSize:28,fontWeight:700,color:MAY.forest}}>{Math.round(saldo)} zł</div>
        <div style={{display:"flex",gap:16,marginTop:8}}>
          <div><div style={{fontSize:9,color:MAY.forest,opacity:.5}}>WPŁATY</div><div style={{fontSize:13,fontWeight:600,color:MAY.forest}}>+{Math.round(wplaty)} zł</div></div>
          <div><div style={{fontSize:9,color:MAY.forest,opacity:.5}}>WYPŁATY</div><div style={{fontSize:13,fontWeight:600,color:MAY.forest}}>-{Math.round(wyplaty)} zł</div></div>
        </div>
      </Card>
      {katData.length>0&&<Card><SecTitle emoji="🎯">Oszczędności wg celu</SecTitle><DonutChart data={katData} size={120}/></Card>}
      <Card>
        <SecTitle emoji="➕">Dodaj ruch</SecTitle>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div><Lbl>Typ operacji</Lbl><div style={{display:"flex",gap:4}}>{OSZCZ_TYP.map(t=><Chip key={t} active={typ===t} onClick={()=>setTyp(t)} color={typCol[t]}>{t==="Wpłata"?"💚 Wpłata":t==="Wypłata"?"🔴 Wypłata":"🔵 Stan konta"}</Chip>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
            <Inp label="Opis (opcjonalnie)" value={nazwa} onChange={setNazwa} placeholder="np. miesięczna wpłata"/>
            <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0"/>
          </div>
          <div><Lbl>Cel oszczędzania</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{OSZCZ_KAT.map(k=><Chip key={k} active={kat===k} onClick={()=>setKat(k)}>{k}</Chip>)}</div></div>
          <Btn onClick={dodaj} disabled={saving||!kwota} ok={ok}>{ok?"✓ Zapisano!":saving?"Zapisuję…":"Zapisz"}</Btn>
        </div>
      </Card>
      <Card>
        <SecTitle emoji="📅">Historia</SecTitle>
        {lista.length===0?<div style={{textAlign:"center",color:MAY.forest,opacity:.3,fontSize:12,padding:12}}>Brak wpisów 🏦</div>:lista.slice().reverse().slice(0,12).map(p=>{
          const t=gp(p,"Typ");const isW=t==="Wpłata";const isWy=t==="Wypłata";
          return<ItemRow key={p.id} title={gp(p,"Nazwa")} sub={`${t} · ${gp(p,"Kategoria")} · ${gp(p,"Data")}`} right={<span style={{fontSize:13,fontWeight:700,color:isW?MAY.forest:isWy?MAY.gum:MAY.sea}}>{isW?"+":isWy?"-":""}{gp(p,"Kwota")} zł</span>}/>;
        })}
      </Card>
    </div>
  );
}

// ---- SETUP ----
function Setup({onToken}){
  const [t,setT]=useState("");
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:MAY.bg}}>
      <Card style={{maxWidth:400,width:"100%"}}>
        <div style={{fontSize:24,fontWeight:700,marginBottom:4,color:MAY.forest}}>🏠 Ekosystem Domu</div>
        <div style={{fontSize:13,color:MAY.forest,opacity:.45,marginBottom:20}}>Połącz z Notion żeby zacząć</div>
        <div style={{background:MAY.blush,borderRadius:12,padding:14,marginBottom:16,fontSize:12,color:MAY.forest,lineHeight:1.7}}>
          <strong>Jak uzyskać token?</strong><br/>
          1. Wejdź na <a href="https://www.notion.so/my-integrations" target="_blank" style={{color:MAY.forest}}>notion.so/my-integrations</a><br/>
          2. <strong>New integration</strong> → nadaj nazwę → skopiuj token<br/>
          3. Ekosystem Domu w Notion → ⋯ → <strong>Add connections</strong>
        </div>
        <Inp label="Notion Integration Token" value={t} onChange={setT} placeholder="ntn_..."/>
        <div style={{marginTop:10}}>
          <Btn onClick={()=>onToken(t)} disabled={!(t.startsWith("secret_")||t.startsWith("ntn_"))}>Połącz z Notion 🔗</Btn>
        </div>
      </Card>
    </div>
  );
}

// ---- MAIN ----
export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [token,setToken]=useState(()=>localStorage.getItem("notion_token")||"");
  function handleToken(t){localStorage.setItem("notion_token",t);setToken(t);}
  if(!token)return<Setup onToken={handleToken}/>;
  const screens={dashboard:<Dashboard token={token}/>,analiza:<Analiza token={token}/>,wydatki:<Wydatki token={token}/>,zakupy:<Zakupy token={token}/>,posilki:<Posilki token={token}/>,zadania:<Zadania token={token}/>,zarobki:<Zarobki token={token}/>,oplaty:<Oplaty token={token}/>,oszczednosci:<Oszczednosci token={token}/>};
  return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:480,margin:"0 auto",background:MAY.bg,minHeight:"100vh",paddingBottom:90}}>
        <div style={{padding:"16px 16px 0"}}>{screens[tab]}</div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(247,244,238,0.97)",borderTop:`1px solid ${MAY.sea}`,display:"flex",justifyContent:"space-around",padding:"6px 0 12px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"3px 6px",flex:"0 0 auto"}}>
              <span style={{fontSize:16,opacity:tab===t.id?1:.3}}>{t.ico}</span>
              <span style={{fontSize:9,color:tab===t.id?MAY.forest:MAY.sea,fontWeight:tab===t.id?700:400,whiteSpace:"nowrap"}}>{t.lbl}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
