import React, { useState, useEffect, useCallback } from "react";

const NOTION_PROXY = "https://api.anthropic.com/v1/messages";

// Notion DB IDs from previously created databases
const DB = {
  wydatki: "8b8f83e61ee2484c9507f2ce9a6a88ff",
  budzet: "d293cbd2ff254db18e8ed06b17260ae0",
  zakupy: "4c93160cf578484aa3d901aac17fd972",
  posilki: "06c7e820b9e3490d97abea40eea3b535",
  zadania: "a2a095ea0de4436fa43b4c66adaf5087",
};

const KATEGORIE_WYDATKI = ["Jedzenie","Dom","Transport","Zdrowie","Ubrania","Rozrywka","Inne"];
const KATEGORIE_ZAKUPY = ["Spożywcze","Dom","Chemia","Kosmetyki","Ubrania","Inne"];
const PILNOSC = ["Teraz","Ten tydzień","Kiedyś"];
const POSILEK_TYPE = ["Śniadanie","Obiad","Kolacja","Przekąska"];
const KTO = ["Klaudia","Mąż","Oboje"];
const STATUS = ["Do zrobienia","W toku","Gotowe"];
const KTO_PLATIL = ["Klaudia","Mąż","Wspólnie"];
const KTO_GOTUJE = ["Klaudia","Mąż","Razem","Zamawiane"];
const KTO_POTRZEBUJE = ["Klaudia","Mąż","Oboje","Dom"];

async function notionQuery(dbId, filter = null) {
  const body = { database_id: dbId, page_size: 50 };
  if (filter) body.filter = filter;
  const res = await fetch("https://api.notion.com/v1/databases/" + dbId + "/query", {
    method: "POST",
    headers: { "Authorization": "Bearer " + window._notionToken, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function notionCreate(dbId, props) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: { "Authorization": "Bearer " + window._notionToken, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ parent: { database_id: dbId }, properties: props }),
  });
  return res.json();
}

async function notionUpdate(pageId, props) {
  const res = await fetch("https://api.notion.com/v1/pages/" + pageId, {
    method: "PATCH",
    headers: { "Authorization": "Bearer " + window._notionToken, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ properties: props }),
  });
  return res.json();
}

// Helpers
function titleProp(t) { return { title: [{ text: { content: t } }] }; }
function selectProp(v) { return { select: { name: v } }; }
function numberProp(v) { return { number: parseFloat(v) || 0 }; }
function dateProp(d) { return { date: { start: d || new Date().toISOString().split("T")[0] } }; }
function checkboxProp(v) { return { checkbox: v }; }
function richProp(t) { return { rich_text: [{ text: { content: t } }] }; }

function getProp(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return p.title?.[0]?.plain_text || "";
  if (p.type === "rich_text") return p.rich_text?.[0]?.plain_text || "";
  if (p.type === "select") return p.select?.name || "";
  if (p.type === "number") return p.number ?? "";
  if (p.type === "date") return p.date?.start || "";
  if (p.type === "checkbox") return p.checkbox;
  return "";
}

// ---- AI helper (via Claude API in artifact) ----
async function aiSuggest(prompt) {
  const res = await fetch(NOTION_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ---- TABS ----
const TABS = [
  { id: "dashboard", icon: "⌂", label: "Dom" },
  { id: "wydatki", icon: "₿", label: "Wydatki" },
  { id: "zakupy", icon: "☐", label: "Zakupy" },
  { id: "posilki", icon: "◎", label: "Posiłki" },
  { id: "zadania", icon: "✓", label: "Zadania" },
];

// MAY PALETTE
const MAY = {
  seaSpray: "#BAD6DA",
  babyBlue: "#E1F2F4",
  matcha: "#DDDD7B",
  sunshine: "#FFE797",
  bubbleGum: "#F691A9",
  blush: "#FFD6E0",
  forest: "#1A4A3A", // dark text from palette
  bg: "#F7F4EE",
};

// ---- CHIP component ----
function Chip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        border: active ? "none" : `1.5px solid ${MAY.seaSpray}`,
        background: active ? (color || MAY.forest) : "white",
        color: active ? "white" : MAY.forest,
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >{children}</button>
  );
}

// ---- INPUT ----
function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, color: MAY.forest, opacity: 0.6, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: `1.5px solid ${MAY.seaSpray}`,
          fontSize: 15,
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          background: MAY.babyBlue,
          color: MAY.forest,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ---- CARD ----
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: "20px",
      boxShadow: "0 1px 4px rgba(26,74,58,0.07), 0 0 0 1px rgba(186,214,218,0.3)",
      ...style,
    }}>{children}</div>
  );
}

// ---- BTN ----
function Btn({ onClick, children, variant = "primary", disabled, style = {} }) {
  const base = {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: MAY.forest, color: "white" }}>{children}</button>;
  if (variant === "ghost") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: MAY.forest, opacity: 0.5, padding: "10px 14px" }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: MAY.babyBlue, color: MAY.forest }}>{children}</button>;
}

// ======== WYDATKI TAB ========
function WydatkiTab({ token }) {
  const [kwota, setKwota] = useState("");
  const [nazwa, setNazwa] = useState("");
  const [kat, setKat] = useState("Jedzenie");
  const [kto, setKto] = useState("Klaudia");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    window._notionToken = token;
    notionQuery(DB.wydatki).then(d => {
      setLista(d.results || []);
      setLoading(false);
    });
  }, [token]);

  async function dodaj() {
    if (!kwota || !nazwa) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await notionCreate(DB.wydatki, {
      Nazwa: titleProp(nazwa),
      Kwota: numberProp(kwota),
      Kategoria: selectProp(kat),
      "Kto płacił": selectProp(kto),
      Data: dateProp(today),
    });
    setSuccess(true);
    setKwota(""); setNazwa("");
    setTimeout(() => setSuccess(false), 2000);
    const d = await notionQuery(DB.wydatki);
    setLista(d.results || []);
    setSaving(false);
  }

  const totalMiesiac = lista.reduce((s, p) => s + (getProp(p, "Kwota") || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, ${MAY.sunshine}, ${MAY.matcha})` }}>
        <div style={{ fontSize: 12, color: MAY.forest, opacity: 0.7, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>ŁĄCZNIE W TYM MIESIĄCU</div>
        <div style={{ fontSize: 32, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: MAY.forest }}>{totalMiesiac.toFixed(2)} <span style={{ fontSize: 16, opacity: 0.6 }}>zł</span></div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 14, color: MAY.forest }}>Dodaj wydatek</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 2 }}><Input label="Co?" value={nazwa} onChange={setNazwa} placeholder="np. Biedronka" /></div>
            <div style={{ flex: 1 }}><Input label="Kwota (zł)" value={kwota} onChange={setKwota} type="number" placeholder="0.00" /></div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kategoria</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KATEGORIE_WYDATKI.map(k => <Chip key={k} active={kat === k} onClick={() => setKat(k)}>{k}</Chip>)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kto płacił</div>
            <div style={{ display: "flex", gap: 6 }}>
              {KTO_PLATIL.map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}
            </div>
          </div>

          <Btn onClick={dodaj} disabled={saving || !kwota || !nazwa}>
            {success ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj wydatek"}
          </Btn>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 12, color: MAY.forest }}>Ostatnie wydatki</div>
        {loading ? <div style={{ color: MAY.forest, opacity: 0.35, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Ładuję…</div> :
          lista.slice(0, 8).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + MAY.babyBlue }}>
              <div>
                <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: MAY.forest }}>{getProp(p, "Nazwa")}</div>
                <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>{getProp(p, "Kategoria")} · {getProp(p, "Kto płacił")} · {getProp(p, "Data")}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: MAY.forest }}>{getProp(p, "Kwota")} zł</div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

// ======== ZAKUPY TAB ========
function ZakupyTab({ token }) {
  const [produkt, setProdukt] = useState("");
  const [ilosc, setIlosc] = useState("");
  const [kat, setKat] = useState("Spożywcze");
  const [kto, setKto] = useState("Oboje");
  const [pilnosc, setPilnosc] = useState("Ten tydzień");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lista, setLista] = useState([]);

  async function load() {
    if (!token) return;
    window._notionToken = token;
    const d = await notionQuery(DB.zakupy, { property: "Kupione", checkbox: { equals: false } });
    setLista(d.results || []);
  }

  useEffect(() => { load(); }, [token]);

  async function dodaj() {
    if (!produkt) return;
    setSaving(true);
    await notionCreate(DB.zakupy, {
      Produkt: titleProp(produkt),
      Ilość: richProp(ilosc),
      Kategoria: selectProp(kat),
      "Kto potrzebuje": selectProp(kto),
      Pilność: selectProp(pilnosc),
      Kupione: checkboxProp(false),
    });
    setSuccess(true);
    setProdukt(""); setIlosc("");
    setTimeout(() => setSuccess(false), 2000);
    await load();
    setSaving(false);
  }

  async function kupione(pageId) {
    window._notionToken = token;
    await notionUpdate(pageId, { Kupione: checkboxProp(true) });
    setLista(prev => prev.filter(p => p.id !== pageId));
  }

  const grouped = PILNOSC.reduce((acc, p) => {
    acc[p] = lista.filter(i => getProp(i, "Pilność") === p);
    return acc;
  }, {});

  const pilColor = { "Teraz": MAY.bubbleGum, "Ten tydzień": MAY.matcha, "Kiedyś": MAY.seaSpray };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 14, color: MAY.forest }}>Dodaj do listy</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 2 }}><Input label="Co kupić?" value={produkt} onChange={setProdukt} placeholder="np. mleko" /></div>
            <div style={{ flex: 1 }}><Input label="Ile?" value={ilosc} onChange={setIlosc} placeholder="2 szt" /></div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kategoria</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KATEGORIE_ZAKUPY.map(k => <Chip key={k} active={kat === k} onClick={() => setKat(k)}>{k}</Chip>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Pilność</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {PILNOSC.map(p => <Chip key={p} active={pilnosc === p} onClick={() => setPilnosc(p)} color={pilColor[p]}>{p}</Chip>)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kto potrzebuje</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {KTO_POTRZEBUJE.map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}
              </div>
            </div>
          </div>
          <Btn onClick={dodaj} disabled={saving || !produkt}>
            {success ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj do listy"}
          </Btn>
        </div>
      </Card>

      {PILNOSC.map(p => grouped[p]?.length > 0 && (
        <Card key={p}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: pilColor[p] }} />
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: MAY.forest, opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>{p}</div>
          </div>
          {grouped[p].map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + MAY.babyBlue }}>
              <div>
                <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: MAY.forest }}>{getProp(item, "Produkt")}</div>
                <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>{getProp(item, "Kategoria")} · {getProp(item, "Kto potrzebuje")} {getProp(item, "Ilość") ? `· ${getProp(item, "Ilość")}` : ""}</div>
              </div>
              <button
                onClick={() => kupione(item.id)}
                style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${MAY.seaSpray}`, background: "white", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
              >✓</button>
            </div>
          ))}
        </Card>
      ))}

      {lista.length === 0 && <Card><div style={{ textAlign: "center", color: MAY.forest, opacity: 0.35, fontSize: 14, fontFamily: "'DM Sans', sans-serif", padding: 16 }}>Lista pusta 🎉</div></Card>}
    </div>
  );
}

// ======== POSILKI TAB ========
function PosilkiTab({ token }) {
  const [danie, setDanie] = useState("");
  const [typ, setTyp] = useState("Obiad");
  const [kto, setKto] = useState("Klaudia");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lista, setLista] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  async function load() {
    if (!token) return;
    window._notionToken = token;
    const today = new Date().toISOString().split("T")[0];
    const d = await notionQuery(DB.posilki, { property: "Data", date: { on_or_after: today } });
    setLista(d.results || []);
  }

  useEffect(() => { load(); }, [token]);

  async function dodaj() {
    if (!danie) return;
    setSaving(true);
    await notionCreate(DB.posilki, {
      Danie: titleProp(danie),
      Posiłek: selectProp(typ),
      "Kto gotuje": selectProp(kto),
      Data: dateProp(data),
    });
    setSuccess(true); setDanie("");
    setTimeout(() => setSuccess(false), 2000);
    await load(); setSaving(false);
  }

  async function proponujAI() {
    setAiLoading(true);
    const tekst = await aiSuggest("Zaproponuj 5 szybkich pomysłów na obiad na dziś. Krótko, tylko nazwy dań po polsku, każde w nowej linii, bez numeracji.");
    setAiSuggestions(tekst.trim().split("\n").filter(Boolean).slice(0, 5));
    setAiLoading(false);
  }

  const DAYS = ["Niedz","Pon","Wt","Śr","Czw","Pt","Sob"];
  const week = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { date: d.toISOString().split("T")[0], label: DAYS[d.getDay()], day: d.getDate() };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {week.map(w => {
            const meals = lista.filter(p => getProp(p, "Data") === w.date);
            const isToday = w.date === new Date().toISOString().split("T")[0];
            return (
              <div key={w.date} onClick={() => setData(w.date)} style={{
                flex: "0 0 auto", width: 52, borderRadius: 12, padding: "10px 6px", textAlign: "center",
                background: data === w.date ? MAY.forest : isToday ? MAY.blush : "white",
                cursor: "pointer", border: isToday && data !== w.date ? `1.5px solid ${MAY.forest}` : "1.5px solid transparent",
              }}>
                <div style={{ fontSize: 10, color: data === w.date ? MAY.babyBlue : MAY.seaSpray, fontFamily: "'DM Sans', sans-serif" }}>{w.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: data === w.date ? "white" : MAY.forest, margin: "4px 0" }}>{w.day}</div>
                <div style={{ fontSize: 9, color: data === w.date ? MAY.babyBlue : MAY.seaSpray }}>{meals.length > 0 ? "●".repeat(Math.min(meals.length,3)) : "·"}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 14, color: MAY.forest }}>Dodaj posiłek</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Co jecie?" value={danie} onChange={setDanie} placeholder="np. spaghetti" />

          {aiSuggestions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {aiSuggestions.map(s => (
                <button key={s} onClick={() => setDanie(s)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1.5px solid " + MAY.seaSpray,
                  background: MAY.bg, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", color: MAY.forest
                }}>{s}</button>
              ))}
            </div>
          )}

          <button onClick={proponujAI} disabled={aiLoading} style={{
            padding: "8px 14px", borderRadius: 10, border: "1.5px dashed #ccc",
            background: "transparent", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer", color: MAY.forest, opacity: 0.45, textAlign: "left",
          }}>
            {aiLoading ? "🤔 Myślę…" : "✨ Zaproponuj pomysły na dziś (AI)"}
          </button>

          <div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Posiłek</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {POSILEK_TYPE.map(k => <Chip key={k} active={typ === k} onClick={() => setTyp(k)}>{k}</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kto gotuje</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KTO_GOTUJE.map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}
            </div>
          </div>
          <Btn onClick={dodaj} disabled={saving || !danie}>
            {success ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj do planu"}
          </Btn>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 12, color: MAY.forest }}>Plan na dziś i najbliższe dni</div>
        {lista.length === 0 ? <div style={{ color: MAY.forest, opacity: 0.35, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Brak zaplanowanych posiłków</div> :
          lista.slice(0,6).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + MAY.babyBlue }}>
              <div>
                <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: MAY.forest }}>{getProp(p, "Danie")}</div>
                <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>{getProp(p, "Posiłek")} · {getProp(p, "Kto gotuje")} · {getProp(p, "Data")}</div>
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

// ======== ZADANIA TAB ========
function ZadaniaTab({ token }) {
  const [zadanie, setZadanie] = useState("");
  const [status, setStatus] = useState("Do zrobienia");
  const [kto, setKto] = useState("Oboje");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lista, setLista] = useState([]);

  async function load() {
    if (!token) return;
    window._notionToken = token;
    const d = await notionQuery(DB.zadania, { property: "Status", select: { does_not_equal: "Gotowe" } });
    setLista(d.results || []);
  }

  useEffect(() => { load(); }, [token]);

  async function dodaj() {
    if (!zadanie) return;
    setSaving(true);
    await notionCreate(DB.zadania, {
      Zadanie: titleProp(zadanie),
      Status: selectProp(status),
      Odpowiedzialny: selectProp(kto),
    });
    setSuccess(true); setZadanie("");
    setTimeout(() => setSuccess(false), 2000);
    await load(); setSaving(false);
  }

  async function zmienStatus(pageId, newStatus) {
    window._notionToken = token;
    await notionUpdate(pageId, { Status: selectProp(newStatus) });
    await load();
  }

  const statusColor = { "Do zrobienia": MAY.bubbleGum, "W toku": MAY.sunshine, "Gotowe": MAY.seaSpray };
  const grouped = STATUS.slice(0,2).reduce((acc, s) => {
    acc[s] = lista.filter(i => getProp(i, "Status") === s);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 14, color: MAY.forest }}>Dodaj zadanie</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Co trzeba zrobić?" value={zadanie} onChange={setZadanie} placeholder="np. zapłacić za prąd" />
          <div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kto?</div>
            <div style={{ display: "flex", gap: 6 }}>
              {KTO.map(k => <Chip key={k} active={kto === k} onClick={() => setKto(k)}>{k}</Chip>)}
            </div>
          </div>
          <Btn onClick={dodaj} disabled={saving || !zadanie}>
            {success ? "✓ Dodano!" : saving ? "Zapisuję…" : "Dodaj zadanie"}
          </Btn>
        </div>
      </Card>

      {["Do zrobienia","W toku"].map(s => grouped[s]?.length > 0 && (
        <Card key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[s] }} />
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: MAY.forest, opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>{s}</div>
          </div>
          {grouped[s].map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + MAY.babyBlue }}>
              <div>
                <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: MAY.forest }}>{getProp(item, "Zadanie")}</div>
                <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>{getProp(item, "Odpowiedzialny")}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {s === "Do zrobienia" && <button onClick={() => zmienStatus(item.id, "W toku")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: `1px solid ${MAY.matcha}`, background: "white", color: MAY.forest, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>→ W toku</button>}
                <button onClick={() => zmienStatus(item.id, "Gotowe")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: `1px solid ${MAY.seaSpray}`, background: "white", color: MAY.forest, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✓ Gotowe</button>
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

// ======== DASHBOARD ========
function Dashboard({ token }) {
  const [stats, setStats] = useState({ wydatki: 0, zakupy: 0, zadania: 0, posilki: 0 });

  useEffect(() => {
    if (!token) return;
    window._notionToken = token;
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      notionQuery(DB.wydatki),
      notionQuery(DB.zakupy, { property: "Kupione", checkbox: { equals: false } }),
      notionQuery(DB.zadania, { property: "Status", select: { does_not_equal: "Gotowe" } }),
      notionQuery(DB.posilki, { property: "Data", date: { on_or_after: today } }),
    ]).then(([w, z, t, p]) => {
      const totalW = (w.results||[]).reduce((s,pg) => s + (getProp(pg,"Kwota")||0), 0);
      setStats({ wydatki: totalW, zakupy: (z.results||[]).length, zadania: (t.results||[]).length, posilki: (p.results||[]).length });
    });
  }, [token]);

  const tiles = [
    { label: "Wydatki w tym miesiącu", value: stats.wydatki.toFixed(0) + " zł", icon: "₿", color: MAY.sunshine, accent: MAY.forest },
    { label: "Do kupienia", value: stats.zakupy + " produktów", icon: "☐", color: MAY.babyBlue, accent: MAY.forest },
    { label: "Otwarte zadania", value: stats.zadania + " zadań", icon: "✓", color: MAY.blush, accent: MAY.forest },
    { label: "Posiłki w planie", value: stats.posilki + " dań", icon: "◎", color: MAY.matcha, accent: MAY.forest },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "8px 0" }}>
        <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: MAY.forest }}>Dzień dobry 👋</div>
        <div style={{ fontSize: 14, color: MAY.forest, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
          {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tiles.map(t => (
          <Card key={t.label} style={{ background: t.color, boxShadow: "none", border: "none" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: t.accent }}>{t.value}</div>
            <div style={{ fontSize: 11, color: MAY.forest, opacity: 0.45, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{t.label}</div>
          </Card>
        ))}
      </div>
      <Card style={{ background: MAY.seaSpray }}>
        <div style={{ fontSize: 13, color: MAY.forest, opacity: 0.6, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>Notion</div>
        <a href="https://www.notion.so/358f8cff1ae3813dba98e304eadeb22f" target="_blank" style={{ color: MAY.forest, fontSize: 14, fontFamily: "'DM Sans', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          🏠 Otwórz Ekosystem Domu w Notion →
        </a>
      </Card>
    </div>
  );
}

// ======== SETUP (token) ========
function Setup({ onToken }) {
  const [t, setT] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: MAY.bg }}>
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 6, color: MAY.forest }}>🏠 Dom</div>
        <div style={{ fontSize: 14, color: MAY.forest, opacity: 0.45, fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>Połącz z Notion żeby zacząć</div>

        <div style={{ background: MAY.blush, borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: MAY.forest, opacity: 0.6, lineHeight: 1.6 }}>
          <strong style={{ color: MAY.forest }}>Jak uzyskać token?</strong><br/>
          1. Wejdź na <a href="https://www.notion.so/my-integrations" target="_blank" style={{ color: MAY.forest }}>notion.so/my-integrations</a><br/>
          2. Kliknij <strong>New integration</strong><br/>
          3. Nadaj nazwę (np. "Dom App")<br/>
          4. Skopiuj <strong>Internal Integration Token</strong><br/>
          5. W Notion wejdź na stronę Ekosystem Domu → ⋯ → <strong>Add connections</strong> → wybierz swoją integrację
        </div>

        <Input label="Notion Integration Token" value={t} onChange={setT} placeholder="secret_..." />
        <div style={{ marginTop: 12 }}>
          <Btn onClick={() => onToken(t)} disabled={!t.startsWith("secret_")}>
            Połącz z Notion
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ======== MAIN APP ========
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [token, setToken] = useState(() => localStorage.getItem("notion_token") || "");

  function handleToken(t) {
    localStorage.setItem("notion_token", t);
    setToken(t);
  }

  if (!token) return <Setup onToken={handleToken} />;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 480, margin: "0 auto", background: MAY.bg, minHeight: "100vh", paddingBottom: 80 }}>
        <div style={{ padding: "20px 20px 0" }}>
          {tab === "dashboard" && <Dashboard token={token} />}
          {tab === "wydatki" && <WydatkiTab token={token} />}
          {tab === "zakupy" && <ZakupyTab token={token} />}
          {tab === "posilki" && <PosilkiTab token={token} />}
          {tab === "zadania" && <ZadaniaTab token={token} />}
        </div>

        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: "rgba(247,244,238,0.96)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid " + MAY.seaSpray,
          display: "flex", justifyContent: "space-around", padding: "10px 0 16px",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
            }}>
              <div style={{ fontSize: 18, opacity: tab === t.id ? 1 : 0.35 }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: tab === t.id ? MAY.forest : MAY.seaSpray, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
