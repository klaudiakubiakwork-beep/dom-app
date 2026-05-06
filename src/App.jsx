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
const KAT_COL = { Jedzenie: "#FFE797", Dom: "#BAD6DA", Transport: "#DDDD7B", Zdrowie: "#F691A9", Ubrania: "#FFD6E0", Rozrywka: "#E1F2F4", Inne: "#c8c3bb" };
const KAT_EMO = { Jedzenie: "🍽️", Dom: "🏠", Transport: "🚗", Zdrowie: "💊", Ubrania: "👗", Rozrywka: "🎉", Inne: "📦" };
const PIL_COL = { "Teraz": MAY.gum, "Ten tydzień": MAY.matcha, "Kiedyś": MAY.sea };
const OSZCZ_COL = { "Poduszka finansowa": MAY.matcha, "Wakacje": MAY.sun, "Remont": MAY.sea, "Auto": MAY.baby, "Edukacja": MAY.blush, "Inwestycje": MAY.gum, "Inne": "#c8c3bb" };
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const DAYS = ["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];

function uid() { return Math.random().toString(36).slice(2, 9); }
function tod() { return new Date().toISOString().split("T")[0]; }
function curMonth() { const n = new Date(); return MONTHS[n.getMonth()] + " " + n.getFullYear(); }

// ---- UI ----
function Chip({ active, onClick, children, color }) {
  return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${active ? "transparent" : MAY.sea}`, background: active ? (color || MAY.forest) : "white", color: active ? "white" : MAY.forest, fontSize: 12, cursor: "pointer", fontWeight: active ? 600 : 400, transition: ".12s", whiteSpace: "nowrap", fontFamily: "inherit" }}>{children}</button>;
}
function Inp({ label, value, onChange, type = "text", placeholder }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    {label && <label style={{ fontSize: 10, color: MAY.forest, opacity: .55, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${MAY.sea}`, background: MAY.baby, color: MAY.forest, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }} />
  </div>;
}
function Card({ children, style = {} }) { return <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${MAY.sea}`, ...style }}>{children}</div>; }
function Btn({ onClick, children, disabled, ok, style = {} }) {
  return <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: ok ? MAY.sea : disabled ? "#e0ddd5" : MAY.forest, color: ok || disabled ? MAY.forest : "white", fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", transition: ".12s", fontFamily: "inherit", ...style }}>{children}</button>;
}
function SecTitle({ children }) { return <div style={{ fontSize: 13, fontWeight: 600, color: MAY.forest, marginBottom: 10 }}>{children}</div>; }
function Lbl({ children }) { return <div style={{ fontSize: 10, color: MAY.forest, opacity: .55, textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>{children}</div>; }
function Row({ title, sub, right, faded, strike }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${MAY.baby}`, opacity: faded ? .45 : 1 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: MAY.forest, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: strike ? "line-through" : "none" }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color: MAY.forest, opacity: .4, marginTop: 1 }}>{sub}</div>}
    </div>
    <div style={{ flexShrink: 0, marginLeft: 8 }}>{right}</div>
  </div>;
}
function ProgBar({ value, max, color, label, sublabel }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11, color: MAY.forest }}><span>{label}</span><span style={{ fontWeight: 600 }}>{sublabel}</span></div>
    <div style={{ height: 6, background: MAY.baby, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 3, transition: ".4s" }} />
    </div>
  </div>;
}
function StatCard({ emoji, value, label, bg }) {
  return <div style={{ borderRadius: 14, padding: "12px 13px", background: bg }}>
    <div style={{ fontSize: 16, marginBottom: 4 }}>{emoji}</div>
    <div style={{ fontSize: 17, fontWeight: 700, color: MAY.forest, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: MAY.forest, opacity: .5, marginTop: 3 }}>{label}</div>
  </div>;
}

// ---- CHARTS ----
function Donut({ data, size = 130 }) {
  if (!data || !data.length) return <div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 12, padding: 12 }}>Brak danych</div>;
  const total = data.reduce((s, d) => s + d.v, 0);
  if (!total) return null;
  const cx = size / 2, cy = size / 2, r = size * .38, inn = size * .22;
  let cum = -Math.PI / 2;
  const segs = data.map(d => {
    const a = (d.v / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(cum), y1 = cy + r * Math.sin(cum);
    cum += a;
    const x2 = cx + r * Math.cos(cum), y2 = cy + r * Math.sin(cum);
    const xi1 = cx + inn * Math.cos(cum - a), yi1 = cy + inn * Math.sin(cum - a);
    const xi2 = cx + inn * Math.cos(cum), yi2 = cy + inn * Math.sin(cum);
    const lg = a > Math.PI ? 1 : 0;
    return <path key={d.l} d={`M${x1},${y1}A${r},${r}0 ${lg},1 ${x2},${y2}L${xi2},${yi2}A${inn},${inn}0 ${lg},0 ${xi1},${yi1}Z`} fill={d.c} stroke="white" strokeWidth="1.5" />;
  });
  return <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {segs}
      <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 9, fill: MAY.forest, opacity: .5 }}>łącznie</text>
      <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 12, fontWeight: "bold", fill: MAY.forest }}>{Math.round(total)} zł</text>
    </svg>
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
      {data.slice(0, 7).map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.c, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: MAY.forest, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.l}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: MAY.forest, flexShrink: 0 }}>{Math.round((d.v / total) * 100)}%</div>
      </div>)}
    </div>
  </div>;
}
function BarChart({ data, height = 90 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.v), 1);
  return <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, paddingTop: 8 }}>
    {data.map((d, i) => <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
      {d.v > 0 && <div style={{ fontSize: 9, color: MAY.forest, opacity: .5 }}>{Math.round(d.v) > 999 ? Math.round(d.v / 1000) + "k" : Math.round(d.v)}</div>}
      <div style={{ width: "100%", background: d.c || MAY.sea, borderRadius: "4px 4px 0 0", height: `${Math.max((d.v / max) * 80, d.v > 0 ? 4 : 0)}%`, transition: ".3s" }} />
      <div style={{ fontSize: 9, color: MAY.forest, opacity: .5, whiteSpace: "nowrap", overflow: "hidden", maxWidth: 32, textAlign: "center" }}>{d.l}</div>
    </div>)}
  </div>;
}

// ---- DASHBOARD ----
function Dashboard({ data }) {
  const now = new Date();
  const h = now.getHours();
  const greet = h < 6 ? "Dobranoc 🌙" : h < 12 ? "Dzień dobry ☀️" : h < 18 ? "Dzień dobry 🌤️" : "Dobry wieczór 🌙";
  const totalW = data.wydatki.reduce((s, i) => s + (i.kwota || 0), 0);
  const cm = curMonth();
  const totalO = data.oplaty.reduce((s, i) => s + (i.kwota || 0), 0);
  const zapl = data.oplaty.filter(i => i.paid?.[cm]).reduce((s, i) => s + (i.kwota || 0), 0);
  const oszcz = data.oszczednosci.filter(i => i.typ === "Wpłata").reduce((s, i) => s + (i.kwota || 0), 0) - data.oszczednosci.filter(i => i.typ === "Wypłata").reduce((s, i) => s + (i.kwota || 0), 0);
  const byKat = {};
  data.wydatki.forEach(i => { byKat[i.kat] = (byKat[i.kat] || 0) + i.kwota; });
  const katData = Object.entries(byKat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ l: (KAT_EMO[k] || "") + " " + k, v, c: KAT_COL[k] || "#ccc" }));
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ padding: "4px 0 2px" }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: MAY.forest }}>{greet}</div>
      <div style={{ fontSize: 12, color: MAY.forest, opacity: .45, marginTop: 1 }}>{now.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <StatCard emoji="💸" value={Math.round(totalW) + " zł"} label="wydatki w mies." bg={MAY.sun} />
      <StatCard emoji="🏦" value={Math.round(oszcz) + " zł"} label="oszczędności" bg={MAY.matcha} />
      <StatCard emoji="🛒" value={data.zakupy.filter(i => !i.kupione).length + " szt"} label="do kupienia" bg={MAY.baby} />
      <StatCard emoji="✅" value={data.zadania.filter(i => i.status !== "Gotowe").length + " zad."} label="otwarte zadania" bg={MAY.blush} />
    </div>
    <Card>
      <SecTitle>📊 Wydatki wg kategorii</SecTitle>
      <Donut data={katData} size={130} />
    </Card>
    <Card>
      <SecTitle>📋 Opłaty — {cm}</SecTitle>
      <ProgBar value={zapl} max={totalO} color={MAY.sea} label="Zapłacone" sublabel={`${Math.round(zapl)} / ${Math.round(totalO)} zł`} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: MAY.forest, opacity: .5 }}>Pozostało</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: MAY.gum }}>{Math.round(totalO - zapl)} zł</span>
      </div>
    </Card>
  </div>;
}

// ---- ANALIZA ----
function Analiza({ data }) {
  const totalW = data.wydatki.reduce((s, i) => s + (i.kwota || 0), 0);
  const totalO = data.oplaty.reduce((s, i) => s + (i.kwota || 0), 0);
  const lastZ = data.zarobki.slice(-1)[0] || {};
  const totalZ = (lastZ.klaudia || 0) + (lastZ.maciej || 0);
  const bilans = totalZ - totalW - totalO;
  const byKat = {}; data.wydatki.forEach(i => { byKat[i.kat] = (byKat[i.kat] || 0) + i.kwota; });
  const katData = Object.entries(byKat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ l: (KAT_EMO[k] || "") + " " + k, v, c: KAT_COL[k] || "#ccc" }));
  const byKto = {}; data.wydatki.forEach(i => { byKto[i.kto] = (byKto[i.kto] || 0) + i.kwota; });
  const ktoData = Object.entries(byKto).map(([k, v]) => ({ l: k, v: Math.round(v), c: k === "Klaudia" ? MAY.gum : k === "Maciej" ? MAY.sea : MAY.matcha }));
  const byOKat = {}; data.oplaty.forEach(i => { byOKat[i.kat] = (byOKat[i.kat] || 0) + i.kwota; });
  const oKatData = Object.entries(byOKat).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ l: k, v: Math.round(v), c: MAY.baby }));
  const bigKat = Object.entries(byKat).sort((a, b) => b[1] - a[1])[0];
  const wnioski = [];
  if (totalZ > 0) {
    if (bilans < 0) wnioski.push({ ico: "⚠️", txt: "Wydatki przekraczają zarobki o " + Math.abs(Math.round(bilans)) + " zł", bg: MAY.blush });
    else wnioski.push({ ico: "✅", txt: "Nadwyżka " + Math.round(bilans) + " zł — świetnie! Warto odkładać.", bg: MAY.matcha });
    wnioski.push({ ico: "📋", txt: "Stałe opłaty to " + Math.round((totalO / totalZ) * 100) + "% zarobków", bg: MAY.baby });
    if (totalW > 0) wnioski.push({ ico: "💸", txt: "Wydatki bieżące to " + Math.round((totalW / totalZ) * 100) + "% zarobków", bg: MAY.sun });
  }
  if (bigKat) wnioski.push({ ico: "📌", txt: "Największa kategoria: " + bigKat[0] + " (" + Math.round(bigKat[1]) + " zł)", bg: MAY.sun });
  if (!data.wydatki.length) wnioski.push({ ico: "💡", txt: "Dodaj wydatki żeby zobaczyć analizę", bg: MAY.baby });
  const zarBar = data.zarobki.slice(-6).map(z => ({ l: (z.miesiac || "").split(" ")[0].slice(0, 3), v: (z.klaudia || 0) + (z.maciej || 0), c: MAY.matcha }));
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card style={{ background: `linear-gradient(135deg,${MAY.sun},${MAY.matcha})`, border: "none" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["ZAROBKI", totalZ > 0 ? Math.round(totalZ) + " zł" : "—", MAY.forest], ["WYDATKI", Math.round(totalW + totalO) + " zł", MAY.forest], ["BILANS", (bilans >= 0 ? "+" : "") + Math.round(bilans) + " zł", bilans >= 0 ? MAY.forest : MAY.gum]].map(([l, v, c]) =>
          <div key={l}><div style={{ fontSize: 9, color: MAY.forest, opacity: .6, marginBottom: 2 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div></div>
        )}
      </div>
    </Card>
    <Card>
      <SecTitle>💡 Wnioski finansowe</SecTitle>
      {wnioski.map((w, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", borderRadius: 10, background: w.bg, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>{w.ico}</span><span style={{ fontSize: 12, color: MAY.forest, lineHeight: 1.4 }}>{w.txt}</span>
      </div>)}
    </Card>
    <Card>
      <SecTitle>⚖️ Struktura budżetu</SecTitle>
      {totalZ > 0 ? [["Stałe opłaty", totalO, MAY.gum], ["Wydatki bieżące", totalW, MAY.sun], ["Pozostałe", Math.max(bilans, 0), MAY.matcha]].map(([l, v, c]) =>
        <ProgBar key={l} value={v} max={totalZ} color={c} label={l} sublabel={`${Math.round(v)} zł · ${Math.round(totalZ > 0 ? (v / totalZ) * 100 : 0)}%`} />
      ) : <div style={{ color: MAY.forest, opacity: .3, fontSize: 12, textAlign: "center", padding: 12 }}>Dodaj zarobki i wydatki</div>}
    </Card>
    <Card><SecTitle>🍩 Wydatki wg kategorii</SecTitle><Donut data={katData} size={130} /></Card>
    <Card><SecTitle>👥 Kto ile wydał</SecTitle><BarChart data={ktoData} height={80} /></Card>
    {zarBar.length > 0 && <Card><SecTitle>📈 Historia zarobków</SecTitle><BarChart data={zarBar} height={80} /></Card>}
    <Card><SecTitle>📋 Stałe opłaty wg kategorii</SecTitle><BarChart data={oKatData} height={80} />{oKatData.map((d, i) => <ProgBar key={i} value={d.v} max={totalO} color={MAY.sea} label={d.l} sublabel={d.v + " zł"} />)}</Card>
  </div>;
}

// ---- WYDATKI ----
function Wydatki({ data, reload }) {
  const [nazwa, setNazwa] = useState(""); const [kwota, setKwota] = useState("");
  const [kat, setKat] = useState("Jedzenie"); const [kto, setKto] = useState("Klaudia");
  const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  const total = data.wydatki.reduce((s, i) => s + (i.kwota || 0), 0);
  async function dodaj() {
    if (!nazwa || !kwota) return; setSaving(true);
    await db("wydatki", "POST", { id: uid(), nazwa, kwota: parseFloat(kwota), kat, kto, data: tod() });
    setNazwa(""); setKwota(""); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card style={{ background: `linear-gradient(135deg,${MAY.sun},${MAY.matcha})`, border: "none" }}>
      <div style={{ fontSize: 10, color: MAY.forest, opacity: .6, marginBottom: 2 }}>ŁĄCZNIE W TYM MIESIĄCU 💸</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: MAY.forest }}>{Math.round(total)} zł</div>
    </Card>
    <Card>
      <SecTitle>➕ Dodaj wydatek</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <Inp label="Co?" value={nazwa} onChange={setNazwa} placeholder="np. Biedronka" />
          <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0" />
        </div>
        <div><Lbl>Kategoria</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{["Jedzenie","Dom","Transport","Zdrowie","Ubrania","Rozrywka","Inne"].map(k => <Chip key={k} active={kat === k} onClick={() => setKat(k)}>{(KAT_EMO[k] || "")} {k}</Chip>)}</div></div>
        <div><Lbl>Kto płacił</Lbl><div style={{ display: "flex", gap: 4 }}>{["Klaudia","Maciej","Wspólnie"].map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}</div></div>
        <Btn onClick={dodaj} disabled={saving || !nazwa || !kwota} ok={ok}>{ok ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj wydatek"}</Btn>
      </div>
    </Card>
    <Card>
      <SecTitle>🕐 Ostatnie wydatki</SecTitle>
      {data.wydatki.length === 0 ? <div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 12, padding: 12 }}>Brak wydatków</div> :
        [...data.wydatki].reverse().slice(0, 12).map(i => <Row key={i.id} title={(KAT_EMO[i.kat] || "") + " " + i.nazwa} sub={`${i.kat} · ${i.kto} · ${i.data}`} right={<span style={{ fontSize: 13, fontWeight: 700, color: MAY.forest }}>{i.kwota} zł</span>} />)}
    </Card>
  </div>;
}

// ---- ZAKUPY ----
function Zakupy({ data, reload }) {
  const [produkt, setProdukt] = useState(""); const [ilosc, setIlosc] = useState("");
  const [kat, setKat] = useState("Spożywcze"); const [pil, setPil] = useState("Ten tydzień"); const [kto, setKto] = useState("Oboje");
  const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  const pending = data.zakupy.filter(i => !i.kupione);
  async function dodaj() {
    if (!produkt) return; setSaving(true);
    await db("zakupy", "POST", { id: uid(), produkt, ilosc, kat, pil, kto, kupione: false });
    setProdukt(""); setIlosc(""); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  async function kupione(id) { await db("zakupy", "PATCH", { kupione: true }, `?id=eq.${id}`); await reload(); }
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card>
      <SecTitle>🛒 Dodaj do listy</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <Inp label="Co kupić?" value={produkt} onChange={setProdukt} placeholder="np. mleko" />
          <Inp label="Ile?" value={ilosc} onChange={setIlosc} placeholder="2 szt" />
        </div>
        <div><Lbl>Kategoria</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{["Spożywcze","Dom","Chemia","Kosmetyki","Ubrania","Inne"].map(k => <Chip key={k} active={kat === k} onClick={() => setKat(k)}>{k}</Chip>)}</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><Lbl>Pilność</Lbl><div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{["Teraz","Ten tydzień","Kiedyś"].map(p => <Chip key={p} active={pil === p} onClick={() => setPil(p)} color={PIL_COL[p]}>{p}</Chip>)}</div></div>
          <div><Lbl>Kto</Lbl><div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{["Klaudia","Maciej","Oboje","Dom"].map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}</div></div>
        </div>
        <Btn onClick={dodaj} disabled={saving || !produkt} ok={ok}>{ok ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj do listy"}</Btn>
      </div>
    </Card>
    {["Teraz","Ten tydzień","Kiedyś"].map(p => {
      const items = pending.filter(i => i.pil === p);
      return items.length ? <Card key={p}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIL_COL[p] }} />
          <Lbl>{p}</Lbl>
        </div>
        {items.map(i => <Row key={i.id} title={i.produkt} sub={`${i.kat} · ${i.kto}${i.ilosc ? " · " + i.ilosc : ""}`} right={
          <button onClick={() => kupione(i.id)} style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${MAY.sea}`, background: "white", cursor: "pointer", fontSize: 12, color: MAY.forest }}>✓</button>
        } />)}
      </Card> : null;
    })}
    {pending.length === 0 && <Card><div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 13, padding: 16 }}>Lista pusta 🎉</div></Card>}
  </div>;
}

// ---- POSILKI ----
function Posilki({ data, reload }) {
  const [danie, setDanie] = useState(""); const [typ, setTyp] = useState("Obiad"); const [kto, setKto] = useState("Klaudia");
  const [selDate, setSelDate] = useState(tod()); const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  const [aiLoad, setAiLoad] = useState(false); const [sugg, setSugg] = useState([]);
  async function dodaj() {
    if (!danie) return; setSaving(true);
    await db("posilki", "POST", { id: uid(), danie, typ, kto, data: selDate });
    setDanie(""); setSugg([]); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  async function del(id) { await db("posilki", "DELETE", null, `?id=eq.${id}`); await reload(); }
  async function proponuj() {
    setAiLoad(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, messages: [{ role: "user", content: "Zaproponuj 5 szybkich pomysłów na obiad. Tylko nazwy po polsku, każde w nowej linii." }] }) });
      const d = await r.json(); setSugg((d.content?.[0]?.text || "").trim().split("\n").filter(Boolean).slice(0, 5));
    } catch (e) {} setAiLoad(false);
  }
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { ds: d.toISOString().split("T")[0], day: d.getDate(), dn: DAYS[d.getDay()] }; });
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card>
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
        {week.map(w => {
          const meals = data.posilki.filter(p => p.data === w.ds).length;
          const sel = selDate === w.ds, isT = w.ds === tod();
          return <button key={w.ds} onClick={() => setSelDate(w.ds)} style={{ flex: "0 0 auto", width: 44, borderRadius: 12, padding: "7px 3px", textAlign: "center", border: `1.5px solid ${sel ? MAY.forest : isT ? MAY.forest : "transparent"}`, background: sel ? MAY.forest : "white", cursor: "pointer" }}>
            <div style={{ fontSize: 9, color: sel ? MAY.baby : MAY.forest, opacity: sel ? 1 : .5 }}>{w.dn}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: sel ? "white" : MAY.forest, margin: "3px 0" }}>{w.day}</div>
            <div style={{ fontSize: 8, color: sel ? MAY.baby : MAY.sea, minHeight: 9 }}>{meals ? "●".repeat(Math.min(meals, 3)) : "·"}</div>
          </button>;
        })}
      </div>
    </Card>
    <Card>
      <SecTitle>🍽️ Dodaj posiłek</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <Inp label="Danie" value={danie} onChange={setDanie} placeholder="np. spaghetti" />
        {sugg.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{sugg.map(s => <button key={s} onClick={() => setDanie(s)} style={{ padding: "4px 9px", borderRadius: 16, border: `1px solid ${MAY.sea}`, background: MAY.baby, fontSize: 11, color: MAY.forest, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>)}</div>}
        <button onClick={proponuj} disabled={aiLoad} style={{ padding: "8px 12px", borderRadius: 10, border: `1.5px dashed ${MAY.sea}`, background: "transparent", fontSize: 12, color: MAY.forest, opacity: .6, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{aiLoad ? "🤔 Myślę…" : "✨ Zaproponuj pomysły AI"}</button>
        <div><Lbl>Posiłek</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{["Śniadanie","Obiad","Kolacja","Przekąska"].map(k => <Chip key={k} active={typ === k} onClick={() => setTyp(k)}>{k}</Chip>)}</div></div>
        <div><Lbl>Kto gotuje</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{["Klaudia","Maciej","Razem","Zamawiane"].map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}</div></div>
        <Btn onClick={dodaj} disabled={saving || !danie} ok={ok}>{ok ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj do planu"}</Btn>
      </div>
    </Card>
    <Card>
      <SecTitle>📅 Plan na wybrany dzień</SecTitle>
      {data.posilki.filter(p => p.data === selDate).length === 0 ? <div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 12, padding: 12 }}>Brak posiłków 🍽️</div> :
        data.posilki.filter(p => p.data === selDate).map(p => <Row key={p.id} title={p.danie} sub={`${p.typ} · ${p.kto}`} right={<button onClick={() => del(p.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: .3, color: MAY.forest }}>✕</button>} />)}
    </Card>
  </div>;
}

// ---- ZADANIA ----
function Zadania({ data, reload }) {
  const [zadanie, setZadanie] = useState(""); const [kto, setKto] = useState("Oboje");
  const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  async function dodaj() {
    if (!zadanie) return; setSaving(true);
    await db("zadania", "POST", { id: uid(), zadanie, kto, status: "Do zrobienia" });
    setZadanie(""); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  async function zmien(id, st) {
    if (st === "Gotowe") await db("zadania", "DELETE", null, `?id=eq.${id}`);
    else await db("zadania", "PATCH", { status: st }, `?id=eq.${id}`);
    await reload();
  }
  const sCol = { "Do zrobienia": MAY.gum, "W toku": MAY.matcha };
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card>
      <SecTitle>✅ Dodaj zadanie</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <Inp label="Co trzeba zrobić?" value={zadanie} onChange={setZadanie} placeholder="np. zapłacić za prąd" />
        <div><Lbl>Kto?</Lbl><div style={{ display: "flex", gap: 4 }}>{["Klaudia","Maciej","Oboje"].map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}</div></div>
        <Btn onClick={dodaj} disabled={saving || !zadanie} ok={ok}>{ok ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj zadanie"}</Btn>
      </div>
    </Card>
    {["Do zrobienia","W toku"].map(s => {
      const items = data.zadania.filter(i => i.status === s);
      return items.length ? <Card key={s}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: sCol[s] }} /><Lbl>{s}</Lbl></div>
        {items.map(i => <Row key={i.id} title={i.zadanie} sub={i.kto} right={<div style={{ display: "flex", gap: 4 }}>
          {s === "Do zrobienia" && <button onClick={() => zmien(i.id, "W toku")} style={{ fontSize: 10, padding: "4px 7px", borderRadius: 8, border: `1px solid ${MAY.matcha}`, background: "white", color: MAY.forest, cursor: "pointer", fontFamily: "inherit" }}>→</button>}
          <button onClick={() => zmien(i.id, "Gotowe")} style={{ fontSize: 10, padding: "4px 7px", borderRadius: 8, border: `1px solid ${MAY.sea}`, background: "white", color: MAY.forest, cursor: "pointer", fontFamily: "inherit" }}>✓</button>
        </div>} />)}
      </Card> : null;
    })}
    {data.zadania.filter(i => i.status !== "Gotowe").length === 0 && <Card><div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 13, padding: 16 }}>Wszystko gotowe! 🎉</div></Card>}
  </div>;
}

// ---- ZAROBKI ----
function Zarobki({ data, reload }) {
  const [miesiac, setMiesiac] = useState(curMonth());
  const [klaudia, setKlaudia] = useState(""); const [maciej, setMaciej] = useState(""); const [notatka, setNotatka] = useState("");
  const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  const totalAll = data.zarobki.reduce((s, z) => s + (z.klaudia || 0) + (z.maciej || 0), 0);
  async function dodaj() {
    if (!klaudia && !maciej) return; setSaving(true);
    const ex = data.zarobki.find(z => z.miesiac === miesiac);
    if (ex) await db("zarobki", "PATCH", { klaudia: parseFloat(klaudia) || 0, maciej: parseFloat(maciej) || 0, notatka }, `?id=eq.${ex.id}`);
    else await db("zarobki", "POST", { id: uid(), miesiac, klaudia: parseFloat(klaudia) || 0, maciej: parseFloat(maciej) || 0, notatka });
    setKlaudia(""); setMaciej(""); setNotatka(""); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  const barData = data.zarobki.slice(-6).map(z => ({ l: (z.miesiac || "").split(" ")[0].slice(0, 3), v: (z.klaudia || 0) + (z.maciej || 0), c: MAY.matcha }));
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card style={{ background: `linear-gradient(135deg,${MAY.blush},${MAY.sun})`, border: "none" }}>
      <div style={{ fontSize: 10, color: MAY.forest, opacity: .6, marginBottom: 2 }}>ŁĄCZNIE WSZYSTKIE MIESIĄCE 💼</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: MAY.forest }}>{Math.round(totalAll)} zł</div>
    </Card>
    {barData.length > 0 && <Card><SecTitle>📈 Historia zarobków</SecTitle><BarChart data={barData} height={80} /></Card>}
    <Card>
      <SecTitle>➕ Dodaj zarobki</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div><Lbl>Miesiąc</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{MONTHS.map(m => { const full = m + " 2026"; return <Chip key={m} active={miesiac === full} onClick={() => setMiesiac(full)}>{m.slice(0, 3)}</Chip>; })}</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Inp label="Klaudia (zł)" value={klaudia} onChange={setKlaudia} type="number" placeholder="0" />
          <Inp label="Maciej (zł)" value={maciej} onChange={setMaciej} type="number" placeholder="0" />
        </div>
        <Inp label="Notatka" value={notatka} onChange={setNotatka} placeholder="opcjonalnie" />
        <Btn onClick={dodaj} disabled={saving || (!klaudia && !maciej)} ok={ok}>{ok ? "✓ Zapisano!" : saving ? "Zapisuję…" : "Zapisz zarobki"}</Btn>
      </div>
    </Card>
    <Card>
      <SecTitle>📅 Historia</SecTitle>
      {data.zarobki.length === 0 ? <div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 12, padding: 12 }}>Brak danych</div> :
        [...data.zarobki].reverse().map(z => <Row key={z.id} title={z.miesiac} sub={`Klaudia: ${z.klaudia || 0} zł · Maciej: ${z.maciej || 0} zł`} right={<span style={{ fontSize: 13, fontWeight: 700, color: MAY.forest }}>{Math.round((z.klaudia || 0) + (z.maciej || 0))} zł</span>} />)}
    </Card>
  </div>;
}

// ---- OPLATY ----
function Oplaty({ data, reload }) {
  const [nazwa, setNazwa] = useState(""); const [kwota, setKwota] = useState("");
  const [kat, setKat] = useState("Media"); const [term, setTerm] = useState("1-5");
  const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  const cm = curMonth();
  const totalO = data.oplaty.reduce((s, i) => s + (i.kwota || 0), 0);
  const zapl = data.oplaty.filter(i => i.paid?.[cm]).reduce((s, i) => s + (i.kwota || 0), 0);
  async function dodaj() {
    if (!nazwa) return; setSaving(true);
    await db("oplaty", "POST", { id: uid(), nazwa, kwota: parseFloat(kwota) || 0, kat, termin: term, paid: {} });
    setNazwa(""); setKwota(""); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  async function toggle(item) {
    const newPaid = { ...(item.paid || {}), [cm]: !item.paid?.[cm] };
    await db("oplaty", "PATCH", { paid: newPaid }, `?id=eq.${item.id}`);
    await reload();
  }
  const sorted = [...data.oplaty].sort((a, b) => (a.paid?.[cm] ? 1 : 0) - (b.paid?.[cm] ? 1 : 0));
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <StatCard emoji="⏳" value={Math.round(totalO - zapl) + " zł"} label="do zapłaty" bg={MAY.blush} />
      <StatCard emoji="✅" value={Math.round(zapl) + " zł"} label="zapłacone" bg={MAY.matcha} />
    </div>
    <Card><ProgBar value={zapl} max={totalO} color={MAY.sea} label={`Postęp — ${cm}`} sublabel={`${Math.round(totalO > 0 ? (zapl / totalO) * 100 : 0)}%`} /></Card>
    <Card>
      <SecTitle>➕ Dodaj opłatę</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <Inp label="Nazwa" value={nazwa} onChange={setNazwa} placeholder="np. prąd" />
          <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0" />
        </div>
        <div><Lbl>Kategoria</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{["Mieszkanie","Media","Ubezpieczenie","Transport","Subskrypcje","Inne"].map(k => <Chip key={k} active={kat === k} onClick={() => setKat(k)}>{k}</Chip>)}</div></div>
        <div><Lbl>Termin (dzień mies.)</Lbl><div style={{ display: "flex", gap: 4 }}>{["1-5","6-10","11-15","16-20","21-31"].map(t => <Chip key={t} active={term === t} onClick={() => setTerm(t)}>{t}</Chip>)}</div></div>
        <Btn onClick={dodaj} disabled={saving || !nazwa} ok={ok}>{ok ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj opłatę"}</Btn>
      </div>
    </Card>
    <Card>
      <SecTitle>📋 {cm}</SecTitle>
      {sorted.length === 0 ? <div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 12, padding: 12 }}>Brak opłat</div> :
        sorted.map(i => {
          const paid = !!i.paid?.[cm];
          return <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${MAY.baby}`, opacity: paid ? .45 : 1 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: MAY.forest, textDecoration: paid ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.nazwa}</div>
              <div style={{ fontSize: 10, color: MAY.forest, opacity: .4 }}>{i.kat} · {i.termin} dnia</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: MAY.forest }}>{i.kwota} zł</span>
              <button onClick={() => toggle(i)} style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${paid ? MAY.forest : MAY.sea}`, background: paid ? MAY.forest : "white", cursor: "pointer", color: paid ? "white" : MAY.forest, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</button>
            </div>
          </div>;
        })}
    </Card>
  </div>;
}

// ---- OSZCZEDNOSCI ----
function Oszczednosci({ data, reload }) {
  const [nazwa, setNazwa] = useState(""); const [kwota, setKwota] = useState("");
  const [typ, setTyp] = useState("Wpłata"); const [kat, setKat] = useState("Poduszka finansowa");
  const [saving, setSaving] = useState(false); const [ok, setOk] = useState(false);
  const wplaty = data.oszczednosci.filter(i => i.typ === "Wpłata").reduce((s, i) => s + (i.kwota || 0), 0);
  const wyplaty = data.oszczednosci.filter(i => i.typ === "Wypłata").reduce((s, i) => s + (i.kwota || 0), 0);
  const saldo = wplaty - wyplaty;
  const byKat = {}; data.oszczednosci.filter(i => i.typ === "Wpłata").forEach(i => { byKat[i.kat] = (byKat[i.kat] || 0) + i.kwota; });
  const katData = Object.entries(byKat).filter(([, v]) => v > 0).map(([k, v]) => ({ l: k, v, c: OSZCZ_COL[k] || "#ccc" }));
  async function dodaj() {
    if (!kwota) return; setSaving(true);
    await db("oszczednosci", "POST", { id: uid(), nazwa: nazwa || typ, kwota: parseFloat(kwota), typ, kat, data: tod() });
    setNazwa(""); setKwota(""); setOk(true); setTimeout(() => setOk(false), 1500);
    await reload(); setSaving(false);
  }
  const typCol = { "Wpłata": MAY.matcha, "Wypłata": MAY.gum, "Stan konta": MAY.sea };
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card style={{ background: `linear-gradient(135deg,${MAY.matcha},${MAY.sea})`, border: "none" }}>
      <div style={{ fontSize: 10, color: MAY.forest, opacity: .6, marginBottom: 2 }}>ŁĄCZNE OSZCZĘDNOŚCI 🏦</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: MAY.forest }}>{Math.round(saldo)} zł</div>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <div><div style={{ fontSize: 9, color: MAY.forest, opacity: .5 }}>WPŁATY</div><div style={{ fontSize: 13, fontWeight: 600, color: MAY.forest }}>+{Math.round(wplaty)} zł</div></div>
        <div><div style={{ fontSize: 9, color: MAY.forest, opacity: .5 }}>WYPŁATY</div><div style={{ fontSize: 13, fontWeight: 600, color: MAY.forest }}>-{Math.round(wyplaty)} zł</div></div>
      </div>
    </Card>
    {katData.length > 0 && <Card><SecTitle>🎯 Oszczędności wg celu</SecTitle><Donut data={katData} size={120} /></Card>}
    <Card>
      <SecTitle>➕ Dodaj ruch</SecTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div><Lbl>Typ</Lbl><div style={{ display: "flex", gap: 4 }}>{["Wpłata","Wypłata","Stan konta"].map(t => <Chip key={t} active={typ === t} onClick={() => setTyp(t)} color={typCol[t]}>{t === "Wpłata" ? "💚 Wpłata" : t === "Wypłata" ? "🔴 Wypłata" : "🔵 Stan konta"}</Chip>)}</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <Inp label="Opis (opcjonalnie)" value={nazwa} onChange={setNazwa} placeholder="np. miesięczna wpłata" />
          <Inp label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0" />
        </div>
        <div><Lbl>Cel</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{["Poduszka finansowa","Wakacje","Remont","Auto","Edukacja","Inwestycje","Inne"].map(k => <Chip key={k} active={kat === k} onClick={() => setKat(k)}>{k}</Chip>)}</div></div>
        <Btn onClick={dodaj} disabled={saving || !kwota} ok={ok}>{ok ? "✓ Zapisano!" : saving ? "Zapisuję…" : "Zapisz"}</Btn>
      </div>
    </Card>
    <Card>
      <SecTitle>📅 Historia</SecTitle>
      {data.oszczednosci.length === 0 ? <div style={{ textAlign: "center", color: MAY.forest, opacity: .3, fontSize: 12, padding: 12 }}>Brak wpisów 🏦</div> :
        [...data.oszczednosci].reverse().slice(0, 15).map(i => {
          const isW = i.typ === "Wpłata", isWy = i.typ === "Wypłata";
          return <Row key={i.id} title={i.nazwa || i.typ} sub={`${i.typ} · ${i.kat} · ${i.data}`} right={<span style={{ fontSize: 13, fontWeight: 700, color: isW ? MAY.forest : isWy ? MAY.gum : MAY.sea }}>{isW ? "+" : isWy ? "-" : ""}{i.kwota} zł</span>} />;
        })}
    </Card>
  </div>;
}

// ---- MAIN ----
const TABS = [
  { id: "dashboard", ico: "🏠", lbl: "Dom" }, { id: "analiza", ico: "📊", lbl: "Analiza" },
  { id: "wydatki", ico: "💸", lbl: "Wydatki" }, { id: "zakupy", ico: "🛒", lbl: "Zakupy" },
  { id: "posilki", ico: "🍽️", lbl: "Posiłki" }, { id: "zadania", ico: "✅", lbl: "Zadania" },
  { id: "zarobki", ico: "💼", lbl: "Zarobki" }, { id: "oplaty", ico: "📋", lbl: "Opłaty" },
  { id: "oszczednosci", ico: "🏦", lbl: "Oszcz." },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState({ wydatki: [], zakupy: [], posilki: [], zadania: [], zarobki: [], oplaty: [], oszczednosci: [] });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [w, z, p, t, zar, o, os] = await Promise.all([
      db("wydatki", "GET", null, "?order=created_at.desc&limit=50"),
      db("zakupy", "GET", null, "?order=created_at.desc&limit=100"),
      db("posilki", "GET", null, "?order=created_at.asc&limit=100"),
      db("zadania", "GET", null, "?order=created_at.asc&limit=100"),
      db("zarobki", "GET", null, "?order=created_at.asc&limit=24"),
      db("oplaty", "GET", null, "?order=created_at.asc&limit=100"),
      db("oszczednosci", "GET", null, "?order=created_at.desc&limit=50"),
    ]);
    setData({ wydatki: w || [], zakupy: z || [], posilki: p || [], zadania: t || [], zarobki: zar || [], oplaty: o || [], oszczednosci: os || [] });
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const screens = { dashboard: <Dashboard data={data} />, analiza: <Analiza data={data} />, wydatki: <Wydatki data={data} reload={reload} />, zakupy: <Zakupy data={data} reload={reload} />, posilki: <Posilki data={data} reload={reload} />, zadania: <Zadania data={data} reload={reload} />, zarobki: <Zarobki data={data} reload={reload} />, oplaty: <Oplaty data={data} reload={reload} />, oszczednosci: <Oszczednosci data={data} reload={reload} /> };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: MAY.bg }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
      <div style={{ fontSize: 14, color: MAY.forest, opacity: .5 }}>Ładuję dane…</div>
    </div>
  </div>;

  return <>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={{ maxWidth: 480, margin: "0 auto", background: MAY.bg, minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ padding: "16px 16px 0" }}>{screens[tab]}</div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(247,244,238,0.97)", borderTop: `1px solid ${MAY.sea}`, display: "flex", justifyContent: "space-around", padding: "6px 0 12px", overflowX: "auto" }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "3px 6px", flex: "0 0 auto" }}>
          <span style={{ fontSize: 17, opacity: tab === t.id ? 1 : .3 }}>{t.ico}</span>
          <span style={{ fontSize: 9, color: tab === t.id ? MAY.forest : MAY.sea, fontWeight: tab === t.id ? 700 : 400, whiteSpace: "nowrap" }}>{t.lbl}</span>
        </button>)}
      </div>
    </div>
  </>;
}
