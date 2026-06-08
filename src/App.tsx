// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── COLORES CAPO'S ───────────────────────────────────────────────────────────
const BRAND = { red: "#c8391a", gold: "#e8a030" };

const THEMES = {
  day: {
    bg: "#fdf6ee", surface: "#f5ece0", card: "#eedfd0", border: "#ddd0bc",
    accent: BRAND.red, accentBg: "rgba(200,57,26,0.10)",
    gold: BRAND.gold, goldBg: "rgba(232,160,48,0.12)",
    red: "#c8391a", redBg: "rgba(200,57,26,0.10)",
    green: "#2e7d52", greenBg: "rgba(46,125,82,0.12)",
    blue: "#1e5fa8", blueBg: "rgba(30,95,168,0.10)",
    text: "#1e1208", soft: "#7a6a58", muted: "#b8a898",
  },
  night: {
    bg: "#16110c", surface: "#1f1810", card: "#281f14", border: "#3a2e22",
    accent: "#e04828", accentBg: "rgba(224,72,40,0.15)",
    gold: "#e8a030", goldBg: "rgba(232,160,48,0.15)",
    red: "#e04828", redBg: "rgba(224,72,40,0.15)",
    green: "#3ab870", greenBg: "rgba(58,184,112,0.14)",
    blue: "#4a8fee", blueBg: "rgba(74,143,238,0.14)",
    text: "#f5ece0", soft: "#a09080", muted: "#5a4e40",
  },
};

const ThemeCtx = createContext({ mode: "day", C: THEMES.day, toggle: () => {} });
const useT = () => useContext(ThemeCtx);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;overflow:hidden;}
  body{font-family:'Inter',sans-serif;font-size:14px;}
  button{font-family:'Inter',sans-serif;}
  input,select,textarea{font-family:'Inter',sans-serif;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{border-radius:2px;background:#c0b0a0;}
  @keyframes pop{0%{transform:scale(.93);opacity:0}100%{transform:scale(1);opacity:1}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
  .pop{animation:pop .18s ease both;}
`;


// ─── HOOK: TIEMPO TRANSCURRIDO ────────────────────────────────────────────────
function useElapsed() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n+1), 30000); // actualiza cada 30s
    return () => clearInterval(t);
  }, []);
  const elapsed = (openedAt) => {
    if (!openedAt) return null;
    const mins = Math.floor((Date.now() - openedAt) / 60000);
    if (mins < 1)  return { label:"< 1 min",  color:"#2e7d52" };
    if (mins < 20) return { label:`${mins} min`, color:"#2e7d52" };
    if (mins < 40) return { label:`${mins} min`, color:"#e8a030" };
    return { label:`${mins} min ⚠`, color:"#c8391a" };
  };
  return elapsed;
}

// ─── DATOS ────────────────────────────────────────────────────────────────────
const MENU_CATS = [
  { cat: "🍖 Platos", items: [
    { id: "p1", name: "Milanesa c/guarn.", price: 35000 },
    { id: "p2", name: "Pollo a la plancha", price: 30000 },
    { id: "p3", name: "Bife de chorizo",    price: 55000 },
    { id: "p4", name: "Hamburguesa doble",  price: 28000 },
    { id: "p5", name: "Pizza muzza",        price: 42000 },
  ]},
  { cat: "🥗 Entradas", items: [
    { id: "e1", name: "Empanadas x6",   price: 18000 },
    { id: "e2", name: "Ensalada César", price: 20000 },
    { id: "e3", name: "Provoleta",      price: 22000 },
  ]},
  { cat: "🥤 Bebidas", items: [
    { id: "b1", name: "Gaseosa",      price: 7000  },
    { id: "b2", name: "Agua mineral", price: 4000  },
    { id: "b3", name: "Cerveza 1L",   price: 18000 },
    { id: "b4", name: "Vino copa",    price: 15000 },
    { id: "b5", name: "Jugo natural", price: 9000  },
  ]},
  { cat: "🍮 Postres", items: [
    { id: "d1", name: "Flan casero", price: 9000  },
    { id: "d2", name: "Tiramisú",    price: 14000 },
  ]},
];
const ALL_ITEMS = MENU_CATS.flatMap(c => c.items);
const byId = id => ALL_ITEMS.find(i => i.id === id);


// ─── INVENTARIO INICIAL ───────────────────────────────────────────────────────
const INIT_INVENTORY = [
  { id:"i1", name:"Harina 000",       unit:"kg",     stock:45, min:10, cat:"Secos"     },
  { id:"i2", name:"Carne vacuna",     unit:"kg",     stock:8,  min:15, cat:"Frescos"   },
  { id:"i3", name:"Queso muzzarella", unit:"kg",     stock:6,  min:5,  cat:"Lácteos"   },
  { id:"i4", name:"Tomate triturado", unit:"lata",   stock:24, min:10, cat:"Conservas" },
  { id:"i5", name:"Aceite de oliva",  unit:"L",      stock:4,  min:3,  cat:"Secos"     },
  { id:"i6", name:"Pollo",            unit:"kg",     stock:5,  min:10, cat:"Frescos"   },
  { id:"i7", name:"Huevos",           unit:"docena", stock:5,  min:4,  cat:"Frescos"   },
  { id:"i8", name:"Azúcar",           unit:"kg",     stock:20, min:5,  cat:"Secos"     },
];

const INIT_TABLES = [
  { id:1, label:"M1", cap:4, zone:"Salón"   },
  { id:2, label:"M2", cap:2, zone:"Salón"   },
  { id:3, label:"M3", cap:4, zone:"Salón"   },
  { id:4, label:"M4", cap:6, zone:"Salón"   },
  { id:5, label:"M5", cap:4, zone:"Terraza" },
  { id:6, label:"M6", cap:4, zone:"Terraza" },
  { id:7, label:"M7", cap:8, zone:"Privado" },
  { id:8, label:"M8", cap:2, zone:"Barra"   },
  { id:9, label:"M9", cap:2, zone:"Barra"   },
];

const fmt = n => new Intl.NumberFormat("es-PY").format(Math.round(n));
const nowHM = () => new Date().toLocaleTimeString("es-PY", { hour:"2-digit", minute:"2-digit" });
const uid = () => Math.random().toString(36).slice(2,7).toUpperCase();

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const ROLES = {
  admin:  { label:"Admin",     icon:"🏠" },
  cajero: { label:"Cajero/a",  icon:"💰" },
  mozo:   { label:"Mozo/Moza", icon:"🪑" },
  cocina: { label:"Cocina",    icon:"🍳" },
};
const CAN = {
  admin:  { salon:true,  cocina:true,  caja:true,  buffet:true,  delivery:true,  reportes:true,  config:true  },
  cajero: { salon:true,  cocina:false, caja:true,  buffet:true,  delivery:true,  reportes:true,  config:false },
  mozo:   { salon:true,  cocina:false, caja:false, buffet:false, delivery:true,  reportes:false, config:false },
  cocina: { salon:false, cocina:true,  caja:false, buffet:false, delivery:false, reportes:false, config:false },
};
const INIT_USERS = [
  { id:"u1", name:"Administración", role:"admin"  },
  { id:"u2", name:"Marcos",   role:"cajero" },
  { id:"u3", name:"Carlos",   role:"mozo"   },
  { id:"u4", name:"Laura",    role:"mozo"   },
  { id:"u5", name:"Rodrigo",  role:"cocina" },
];

// ─── PRIMITIVOS ───────────────────────────────────────────────────────────────
function Btn({ children, onClick, color, bg, disabled, style, size="md" }) {
  const { C } = useT();
  const cl = color || C.accent;
  const pad = size==="sm" ? "5px 11px" : size==="lg" ? "13px 22px" : "8px 15px";
  const fs  = size==="sm" ? 12 : size==="lg" ? 15 : 13;
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ padding:pad, fontSize:fs, fontWeight:700, borderRadius:8,
        border:`1.5px solid ${cl}55`, background: bg||cl+"22", color:cl,
        cursor:disabled?"not-allowed":"pointer", opacity:disabled?.4:1,
        transition:"background .12s", lineHeight:1, ...style }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=cl+"38"; }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=bg||cl+"22"; }}>
      {children}
    </button>
  );
}

function Tag({ children, color }) {
  const { C } = useT();
  const cl = color || C.soft;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px",
      borderRadius:99, fontSize:11, fontWeight:700,
      background:cl+"22", color:cl, border:`1px solid ${cl}33`, letterSpacing:.3 }}>
      {children}
    </span>
  );
}

function Overlay({ children, onClose, width=480 }) {
  const { C } = useT();
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)",
        display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div className="pop" style={{ background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:14, width, maxWidth:"96vw", maxHeight:"92vh", overflow:"auto",
        boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>
        {children}
      </div>
    </div>
  );
}

function CaposLogo({ size="sm" }) {
  const { C } = useT();
  const big = size==="lg";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:big?"center":"flex-start", lineHeight:1 }}>
      <div style={{ fontFamily:"'Playfair Display'", fontWeight:800,
        fontSize:big?52:20, color:BRAND.red, letterSpacing:big?6:1 }}>
        CAPO<span style={{ color:BRAND.gold }}>'</span>S
      </div>
      <div style={{ fontSize:big?12:9, fontWeight:600, color:C.soft,
        letterSpacing:big?5:2, textTransform:"uppercase", marginTop:big?4:1 }}>
        {big ? "Restobar · Desde 1988" : "Restobar"}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { mode, toggle, C } = useT();
  return (
    <button onClick={toggle}
      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px",
        borderRadius:99, border:`1.5px solid ${C.border}`, background:C.surface,
        color:C.soft, cursor:"pointer", fontSize:12, fontWeight:600 }}>
      {mode==="day" ? "🌙 Noche" : "☀️ Día"}
    </button>
  );
}

// ─── ESTADO RESTAURANTE ───────────────────────────────────────────────────────
function useRestaurantState() {
  const [tickets,    setTickets]    = useState({});
  const [deliveries, setDeliveries] = useState([]);
  const [buffets,    setBuffets]    = useState([]);
  const [cashLog,    setCashLog]    = useState([
    { id:"c0", desc:"Apertura caja", amount:100000, type:"in", method:"Efectivo", time:"09:00" },
  ]);
  const [pricePerKg, setPricePerKg] = useState(35000);
  // Menú dinámico — cada item puede activarse/desactivarse
  const [menuItems, setMenuItems] = useState(
    MENU_CATS.flatMap(c => c.items.map(i => ({ ...i, active:true, cat:c.cat })))
  );
  // Inventario
  const [inventory, setInventory] = useState(INIT_INVENTORY);

  const toggleMenuItem  = id => setMenuItems(ms => ms.map(m => m.id===id ? {...m, active:!m.active} : m));
  const updateMenuPrice = (id, price) => setMenuItems(ms => ms.map(m => m.id===id ? {...m, price} : m));
  const addMenuItem     = item => setMenuItems(ms => [...ms, { ...item, id:"m"+uid(), active:true }]);
  const removeMenuItem  = id => setMenuItems(ms => ms.filter(m => m.id!==id));

  const updateStock  = (id, delta) => setInventory(inv => inv.map(i => i.id===id ? {...i, stock:Math.max(0,parseFloat((i.stock+delta).toFixed(3)))} : i));
  const addInventory = item => setInventory(inv => [...inv, { ...item, id:"i"+uid() }]);
  const removeInventory = id => setInventory(inv => inv.filter(i => i.id!==id));

  const openTable  = tid => setTickets(t => ({ ...t, [tid]:{ id:tid, lines:[], opened:nowHM(), openedAt:Date.now(), paid:false } }));
  const closeTable = tid => setTickets(t => { const n={...t}; delete n[tid]; return n; });

  const addLine = (tid, itemId, qty=1, note="") => setTickets(t => {
    const tk = t[tid] || { id:tid, lines:[], opened:nowHM(), openedAt:Date.now(), paid:false };
    const ex = tk.lines.find(l => l.itemId===itemId && l.note===note && l.status==="cooking");
    const lines = ex
      ? tk.lines.map(l => l===ex ? {...l, qty:l.qty+qty} : l)
      : [...tk.lines, { lid:uid(), itemId, qty, note, status:"draft" }];
    return { ...t, [tid]:{ ...tk, lines } };
  });

  const removeLine = (tid, lid) => setTickets(t => ({
    ...t, [tid]:{ ...t[tid], lines:t[tid].lines.filter(l => l.lid!==lid) }
  }));

  const advanceLine = (tid, lid) => {
    const next = { cooking:"ready", ready:"served" };
    setTickets(t => ({
      ...t, [tid]:{ ...t[tid], lines:t[tid].lines.map(l =>
        l.lid===lid ? {...l, status:next[l.status]||l.status} : l) }
    }));
  };

  // Enviar TODOS los ítems draft de una mesa a cocina
  const sendToKitchen = (tid) => setTickets(t => ({
    ...t, [tid]:{ ...t[tid], lines:t[tid].lines.map(l =>
      l.status==="draft" ? {...l, status:"cooking"} : l) }
  }));

  // Mozo marca todos los "ready" como "served"
  const markDelivered = (tid) => setTickets(t => ({
    ...t, [tid]:{ ...t[tid], lines:t[tid].lines.map(l =>
      l.status==="ready" ? {...l, status:"served"} : l) }
  }));

  const payTicket = (tid, method, userName, comprobante) => {
    const tk = tickets[tid]; if (!tk) return;
    const total = tk.lines.reduce((s,l) => s+(byId(l.itemId)?.price||0)*l.qty, 0);
    const desc = comprobante
      ? `[${userName}] Mesa ${tid} · comp. ${comprobante}`
      : `[${userName}] Mesa ${tid}`;
    setCashLog(cl => [...cl, { id:uid(), desc, amount:total, type:"in", method, time:nowHM() }]);
    closeTable(tid);
  };

  const addDelivery = d => setDeliveries(ds => [...ds, { ...d, id:"DEL-"+uid(), status:"cooking", opened:nowHM(), openedAt:Date.now() }]);
  const advanceDelivery = id => {
    const next = { cooking:"ready", ready:"delivering", delivering:"delivered" };
    setDeliveries(ds => ds.map(d => d.id===id ? {...d, status:next[d.status]||d.status} : d));
  };
  const payDelivery = (id, method) => {
    const d = deliveries.find(x => x.id===id); if (!d) return;
    const total = (d.lines||[]).reduce((s,l) => s+(byId(l.itemId)?.price||0)*l.qty, 0);
    setCashLog(cl => [...cl, { id:uid(), desc:`Delivery ${d.client}`, amount:total, type:"in", method, time:nowHM() }]);
    setDeliveries(ds => ds.map(x => x.id===id ? {...x, paid:true} : x));
  };

  const addBuffet = (kg, pax, method) => {
    const total = kg * pricePerKg;
    setBuffets(bs => [...bs, { id:"BUF-"+uid(), kg, pax, pricePerKg, total, method, time:nowHM() }]);
    setCashLog(cl => [...cl, { id:uid(), desc:`Buffet ${kg}kg · ${pax}pax`, amount:total, type:"in", method, time:nowHM() }]);
  };

  const addCash = (desc, amount, type, method) =>
    setCashLog(cl => [...cl, { id:uid(), desc, amount, type, method, time:nowHM() }]);

  return { tickets, deliveries, buffets, cashLog, pricePerKg, setPricePerKg,
    menuItems, toggleMenuItem, updateMenuPrice, addMenuItem, removeMenuItem,
    inventory, updateStock, addInventory, removeInventory,
    openTable, closeTable, addLine, removeLine, advanceLine, sendToKitchen, markDelivered,
    payTicket, addDelivery, advanceDelivery, payDelivery, addBuffet, addCash };
}

// ─── COCINA ───────────────────────────────────────────────────────────────────
function KitchenScreen({ tickets, deliveries, advanceLine }) {
  const { C } = useT();
  const elapsed = useElapsed();
  const cooking=[], ready=[];
  Object.values(tickets).forEach(tk =>
    tk.lines.forEach(l => {
      const e = { ...l, item:byId(l.itemId), label:`Mesa ${tk.id}`, openedAt:tk.openedAt };
      if (l.status==="cooking") cooking.push(e);
      else if (l.status==="ready") ready.push(e);
    })
  );
  deliveries.filter(d => d.status!=="delivered").forEach(d =>
    (d.lines||[]).forEach(l => {
      const e = { ...l, item:byId(l.itemId), label:`🛵 ${d.client}`, openedAt:d.openedAt };
      if (l.status==="cooking") cooking.push(e);
      else if (l.status==="ready") ready.push(e);
    })
  );

  const KCard = ({ e, side }) => (
    <div className="pop" style={{ background:C.card, border:`2px solid ${side==="cooking"?C.gold:C.green}55`,
      borderRadius:10, padding:14, marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800, lineHeight:1.2, color:C.text }}>{e.qty}× {e.item?.name}</div>
          {e.note && <div style={{ marginTop:4, fontSize:13, color:C.gold, fontWeight:700 }}>⚠ {e.note}</div>}
          <div style={{ marginTop:6, fontSize:13, color:C.soft, fontFamily:"'JetBrains Mono'" }}>{e.label}</div>
          {e.openedAt && (() => { const t=elapsed(e.openedAt); return t ? <div style={{ fontSize:12, fontWeight:700, color:t.color, marginTop:2 }}>⏱ {t.label}</div> : null; })()}
        </div>
        {side==="cooking" && (
          <button onClick={() => advanceLine(parseInt(e.label.replace("Mesa ","")), e.lid)}
            style={{ padding:"10px 16px", borderRadius:8, border:"none", fontWeight:800, fontSize:14,
              cursor:"pointer", background:C.gold, color:"#fff", flexShrink:0 }}>
            ✓ Lista
          </button>
        )}
        {side==="ready" && (
          <div style={{ padding:"8px 12px", borderRadius:8, background:C.greenBg,
            border:`1px solid ${C.green}44`, color:C.green, fontSize:13, fontWeight:700 }}>
            Mozo entrega →
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:C.bg }}>
      <div style={{ padding:"12px 20px", background:C.surface, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:14 }}>
        <CaposLogo />
        <span style={{ fontSize:14, fontWeight:700, color:C.text }}>COCINA</span>
        {cooking.length>0 && <Tag color={C.gold}>{cooking.length} preparando</Tag>}
        {ready.length>0   && <Tag color={C.green}>{ready.length} listas</Tag>}
      </div>
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", overflow:"hidden" }}>
        <div style={{ borderRight:`2px solid ${C.border}`, padding:16, overflow:"auto" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.gold, textTransform:"uppercase",
            letterSpacing:1.2, marginBottom:12 }}>🔥 Preparando ({cooking.length})</div>
          {cooking.length===0
            ? <div style={{ color:C.muted, textAlign:"center", paddingTop:60 }}>Sin pedidos</div>
            : cooking.map(e => <KCard key={e.lid} e={e} side="cooking" />)}
        </div>
        <div style={{ padding:16, overflow:"auto" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.green, textTransform:"uppercase",
            letterSpacing:1.2, marginBottom:12 }}>🍽 Para servir ({ready.length})</div>
          {ready.length===0
            ? <div style={{ color:C.muted, textAlign:"center", paddingTop:60 }}>Sin platos listos</div>
            : ready.map(e => <KCard key={e.lid} e={e} side="ready" />)}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL MESA ───────────────────────────────────────────────────────────────
function TableModal({ tid, ticket, onClose, onOpen, onAdd, onRemove, onSendKitchen, onMarkDelivered, onPay, canPay }) {
  const { C } = useT();
  const elapsed = useElapsed();
  const [search, setSearch] = useState("");
  const [note,   setNote]   = useState("");
  const [paying,      setPaying]      = useState(false);
  const [method,      setMethod]      = useState("Efectivo");
  const [recibido,    setRecibido]    = useState("");
  const [comprobante, setComprobante] = useState("");
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 80); }, []);

  const lines      = ticket?.lines || [];
  const total      = lines.reduce((s,l) => s+(byId(l.itemId)?.price||0)*l.qty, 0);
  const draftLines = lines.filter(l => l.status==="draft");
  const hasDraft   = draftLines.length > 0;
  const hasCooking = lines.some(l => l.status==="cooking");
  const hasReady   = lines.some(l => l.status==="ready");
  const allServed  = lines.length > 0 && lines.every(l => l.status==="served");

  const q = search.toLowerCase();
  const items = q ? ALL_ITEMS.filter(i => i.name.toLowerCase().includes(q)) : ALL_ITEMS;

  const stColor = { draft:C.muted, cooking:C.gold, ready:C.green, served:C.soft };
  const stLabel = { draft:"⏳ Borrador", cooking:"🔥 En cocina", ready:"✓ Listo", served:"Entregado" };

  // Estado visual de la mesa
  const mesaStatus = !ticket ? null
    : allServed   ? { label:"Todo entregado", color:C.green }
    : hasReady    ? { label:"Listo para entregar", color:C.green }
    : hasCooking  ? { label:"En cocina", color:C.gold }
    : hasDraft    ? { label:"Armando pedido", color:C.blue }
    : null;

  return (
    <Overlay onClose={onClose} width={600}>
      {/* Header */}
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:20, fontWeight:800, color:C.text }}>Mesa {tid}</span>
          {ticket && <Tag color={C.accent}>desde {ticket.opened}</Tag>}
          {ticket?.openedAt && (() => { const e=elapsed(ticket.openedAt); return e?<Tag color={e.color}>⏱ {e.label}</Tag>:null; })()}
          {mesaStatus && <Tag color={mesaStatus.color}>{mesaStatus.label}</Tag>}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>

      {!ticket ? (
        <div style={{ padding:40, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🪑</div>
          <div style={{ color:C.soft, marginBottom:20 }}>Mesa libre</div>
          <Btn size="lg" onClick={onOpen}>Abrir mesa</Btn>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:420 }}>

          {/* IZQ: Menú */}
          <div style={{ borderRight:`1px solid ${C.border}`, padding:14, display:"flex", flexDirection:"column", gap:8 }}>
            <input ref={ref} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar plato..."
              style={{ width:"100%", background:C.card, border:`1.5px solid ${C.border}`,
                borderRadius:8, color:C.text, fontSize:14, padding:"8px 12px", outline:"none" }} />
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota (opcional)"
              style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`,
                borderRadius:7, color:C.text, fontSize:12, padding:"6px 12px", outline:"none" }} />
            <div style={{ flex:1, overflow:"auto", maxHeight:280 }}>
              {items.map(item => (
                <button key={item.id} onClick={() => { onAdd(item.id,1,note); setNote(""); }}
                  style={{ width:"100%", display:"flex", justifyContent:"space-between",
                    padding:"9px 10px", marginBottom:4, borderRadius:7, background:C.card,
                    border:`1px solid ${C.border}`, color:C.text, cursor:"pointer", textAlign:"left" }}
                  onMouseEnter={e => e.currentTarget.style.background=C.accentBg}
                  onMouseLeave={e => e.currentTarget.style.background=C.card}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{item.name}</span>
                  <span style={{ fontSize:12, color:C.accent, fontFamily:"'JetBrains Mono'", fontWeight:700 }}>₲{fmt(item.price)}</span>
                </button>
              ))}
            </div>
            {/* Botón enviar a cocina */}
            {hasDraft && (
              <button onClick={onSendKitchen}
                style={{ padding:"11px", borderRadius:9, border:"none",
                  background:C.accent, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                🍳 Enviar a cocina ({draftLines.length} ítem{draftLines.length!==1?"s":""})
              </button>
            )}
            {!hasDraft && hasCooking && (
              <div style={{ padding:"10px", borderRadius:9, background:C.goldBg,
                border:`1px solid ${C.gold}44`, textAlign:"center", fontSize:13,
                color:C.gold, fontWeight:600 }}>
                🔥 Pedido en cocina — podés seguir agregando
              </div>
            )}
          </div>

          {/* DER: Ticket */}
          <div style={{ padding:14, display:"flex", flexDirection:"column" }}>
            <div style={{ flex:1, overflow:"auto", maxHeight:280 }}>
              {lines.length===0
                ? <div style={{ color:C.muted, textAlign:"center", paddingTop:40, fontSize:13 }}>Sin ítems aún</div>
                : lines.map(l => {
                    const item = byId(l.itemId);
                    const isDraft = l.status==="draft";
                    return (
                      <div key={l.lid} style={{ display:"flex", alignItems:"flex-start", gap:8,
                        padding:"8px 0", borderBottom:`1px solid ${C.border}`,
                        opacity:isDraft?1:.85 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{l.qty}× {item?.name}</div>
                          {l.note && <div style={{ fontSize:11, color:C.gold }}>↳ {l.note}</div>}
                          <Tag color={stColor[l.status]}>{stLabel[l.status]}</Tag>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:13, fontFamily:"'JetBrains Mono'", color:C.accent }}>₲{fmt((item?.price||0)*l.qty)}</div>
                          {isDraft && <button onClick={() => onRemove(l.lid)}
                            style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:15 }}>✕</button>}
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Footer del ticket */}
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ color:C.soft, fontWeight:600 }}>Total</span>
                <span style={{ fontSize:24, fontWeight:800, fontFamily:"'JetBrains Mono'", color:C.accent }}>₲{fmt(total)}</span>
              </div>

              {/* Botón MARCAR ENTREGADO — cuando hay ítems listos */}
              {hasReady && !allServed && (
                <button onClick={onMarkDelivered}
                  style={{ width:"100%", padding:"11px", borderRadius:9, border:"none",
                    background:C.green, color:"#fff", fontWeight:800, fontSize:14,
                    cursor:"pointer", marginBottom:8 }}>
                  ✓ Marcar todo entregado
                </button>
              )}

              {/* Botón COBRAR — solo si todo está servido y tiene permiso */}
              {canPay ? (
                allServed
                  ? <Btn size="lg" color={C.green} style={{ width:"100%" }} onClick={() => setPaying(true)}>
                      💰 Cobrar
                    </Btn>
                  : <div style={{ padding:"10px", borderRadius:9, background:C.border+"44",
                      textAlign:"center", fontSize:12, color:C.muted, fontWeight:600 }}>
                      {hasDraft ? "Enviá el pedido a cocina primero"
                        : hasCooking ? "Esperando que cocina marque listo"
                        : hasReady ? "Marcá los platos como entregados"
                        : lines.length===0 ? "Sin ítems en el pedido"
                        : "Esperando confirmación"}
                    </div>
              ) : (
                allServed && <div style={{ padding:"10px", borderRadius:9, background:C.goldBg,
                  textAlign:"center", fontSize:12, color:C.gold, fontWeight:600, border:`1px solid ${C.gold}44` }}>
                  ✓ Listo para cobrar — llamá al cajero
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {paying && (() => {
        const recibidoNum = parseFloat(recibido.replace(/[^0-9.]/g,"")) || 0;
        const vuelto = recibidoNum - total;
        const okEfectivo = method !== "Efectivo" || recibidoNum >= total;
        const okTarjeta  = method !== "Tarjeta"  || comprobante.trim().length > 0;
        const canConfirm = okEfectivo && okTarjeta;
        return (
          <Overlay onClose={() => { setPaying(false); setRecibido(""); setComprobante(""); }} width={340}>
            <div style={{ padding:24 }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:4 }}>Cobrar Mesa {tid}</div>
              <div style={{ fontSize:32, fontWeight:800, fontFamily:"'JetBrains Mono'", color:C.accent, marginBottom:18 }}>₲{fmt(total)}</div>

              {/* Método de pago */}
              <div style={{ fontSize:11, color:C.soft, marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:.5 }}>Método de pago</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                {["Efectivo","Tarjeta","QR","Transferencia"].map(m => (
                  <button key={m} onClick={() => { setMethod(m); setRecibido(""); setComprobante(""); }}
                    style={{ padding:10, borderRadius:8,
                      border:`2px solid ${method===m?C.accent:C.border}`,
                      background:method===m?C.accentBg:C.card, color:method===m?C.accent:C.soft,
                      cursor:"pointer", fontWeight:600, fontSize:13 }}>{m}</button>
                ))}
              </div>

              {/* Efectivo: monto recibido + vuelto */}
              {method==="Efectivo" && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:C.soft, marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:.5 }}>Monto recibido</div>
                  <input value={recibido} onChange={e => setRecibido(e.target.value)} type="number"
                    placeholder="0" autoFocus
                    style={{ width:"100%", background:C.card, border:`2px solid ${recibidoNum>=total&&recibidoNum>0?C.green:C.border}`,
                      borderRadius:9, color:C.text, fontSize:26, fontFamily:"'JetBrains Mono'",
                      fontWeight:700, padding:"10px 14px", outline:"none", textAlign:"center",
                      marginBottom:10, transition:"border-color .15s" }} />
                  {recibidoNum >= total && recibidoNum > 0 && (
                    <div className="pop" style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      background:C.greenBg, border:`1px solid ${C.green}44`, borderRadius:9, padding:"10px 14px" }}>
                      <span style={{ fontWeight:700, color:C.green }}>Vuelto</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontWeight:800, fontSize:22, color:C.green }}>₲{fmt(vuelto)}</span>
                    </div>
                  )}
                  {recibidoNum > 0 && recibidoNum < total && (
                    <div style={{ background:C.redBg, border:`1px solid ${C.red}44`, borderRadius:9,
                      padding:"8px 14px", textAlign:"center", fontSize:13, color:C.red, fontWeight:600 }}>
                      Faltan ₲{fmt(total - recibidoNum)}
                    </div>
                  )}
                </div>
              )}

              {/* Tarjeta: número de comprobante */}
              {method==="Tarjeta" && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:C.soft, marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:.5 }}>N° de comprobante</div>
                  <input value={comprobante} onChange={e => setComprobante(e.target.value)}
                    placeholder="Ingresá el número" autoFocus
                    style={{ width:"100%", background:C.card, border:`2px solid ${comprobante?C.green:C.border}`,
                      borderRadius:9, color:C.text, fontSize:16, fontFamily:"'JetBrains Mono'",
                      padding:"10px 14px", outline:"none", textAlign:"center",
                      transition:"border-color .15s" }} />
                  {!comprobante && <div style={{ fontSize:11, color:C.muted, marginTop:4, textAlign:"center" }}>Requerido para confirmar</div>}
                </div>
              )}

              {/* QR / Transferencia: sin campo extra */}
              {(method==="QR"||method==="Transferencia") && (
                <div style={{ marginBottom:16, padding:"10px 14px", background:C.blueBg,
                  border:`1px solid ${C.blue}44`, borderRadius:9, fontSize:13, color:C.blue,
                  fontWeight:600, textAlign:"center" }}>
                  {method==="QR" ? "Verificá el pago en la app antes de confirmar" : "Verificá la transferencia antes de confirmar"}
                </div>
              )}

              <Btn size="lg" color={C.green} style={{ width:"100%" }} disabled={!canConfirm}
                onClick={() => {
                  onPay(method, comprobante || null);
                  setPaying(false); setRecibido(""); setComprobante(""); onClose();
                }}>
                ✓ Confirmar cobro
              </Btn>
            </div>
          </Overlay>
        );
      })()}
    </Overlay>
  );
}

// ─── MODAL DELIVERY ───────────────────────────────────────────────────────────
function DeliveryModal({ onClose, onSave }) {
  const { C } = useT();
  const [client,  setClient]  = useState("");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");
  const [method,  setMethod]  = useState("Efectivo");
  const [lines,   setLines]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [note,    setNote]    = useState("");

  const total = lines.reduce((s,l) => s+(byId(l.itemId)?.price||0)*l.qty, 0);
  const q = search.toLowerCase();
  const items = q ? ALL_ITEMS.filter(i => i.name.toLowerCase().includes(q)) : ALL_ITEMS;

  const addItem = itemId => {
    setLines(ls => {
      const ex = ls.find(l => l.itemId===itemId && l.note===note);
      if (ex) return ls.map(l => l===ex ? {...l, qty:l.qty+1} : l);
      return [...ls, { lid:uid(), itemId, qty:1, note, status:"cooking" }];
    });
    setNote("");
  };

  const iStyle = { width:"100%", background:C.card, border:`1.5px solid ${C.border}`,
    borderRadius:8, color:C.text, fontSize:13, padding:"8px 10px", outline:"none" };

  return (
    <Overlay onClose={onClose} width={580}>
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:17, fontWeight:700, color:C.text }}>🛵 Nuevo delivery</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ padding:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[["Cliente *",client,setClient],["Teléfono",phone,setPhone],["Dirección",address,setAddress]].map(([l,v,s]) => (
            <div key={l}>
              <div style={{ fontSize:11, color:C.soft, marginBottom:3 }}>{l}</div>
              <input value={v} onChange={e => s(e.target.value)} style={iStyle} />
            </div>
          ))}
          <div>
            <div style={{ fontSize:11, color:C.soft, marginBottom:6 }}>Pago</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {["Efectivo","Tarjeta","QR","Transferencia"].map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{ padding:"7px", borderRadius:7,
                  border:`1.5px solid ${method===m?C.accent:C.border}`,
                  background:method===m?C.accentBg:C.card, color:method===m?C.accent:C.soft,
                  cursor:"pointer", fontWeight:600, fontSize:12 }}>{m}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={iStyle} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota (opcional)"
            style={{ ...iStyle, fontSize:12 }} />
          <div style={{ overflow:"auto", maxHeight:200 }}>
            {items.map(item => (
              <button key={item.id} onClick={() => addItem(item.id)}
                style={{ width:"100%", display:"flex", justifyContent:"space-between",
                  padding:"7px 10px", marginBottom:3, borderRadius:6, background:C.card,
                  border:`1px solid ${C.border}`, color:C.text, cursor:"pointer", textAlign:"left" }}
                onMouseEnter={e => e.currentTarget.style.background=C.accentBg}
                onMouseLeave={e => e.currentTarget.style.background=C.card}>
                <span style={{ fontSize:13 }}>{item.name}</span>
                <span style={{ fontSize:12, color:C.accent, fontFamily:"'JetBrains Mono'" }}>₲{fmt(item.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {lines.length>0 && (
        <div style={{ margin:"0 16px 12px", background:C.card, borderRadius:10, padding:12, border:`1px solid ${C.border}` }}>
          {lines.map(l => {
            const item = byId(l.itemId);
            return (
              <div key={l.lid} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <span style={{ fontSize:13, color:C.text }}>{l.qty}× {item?.name} {l.note ? <span style={{ color:C.gold, fontSize:11 }}>({l.note})</span> : ""}</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:13, fontFamily:"'JetBrains Mono'", color:C.accent }}>₲{fmt((item?.price||0)*l.qty)}</span>
                  <button onClick={() => setLines(ls => ls.filter(x => x.lid!==l.lid))} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer" }}>✕</button>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:8, marginTop:4,
            display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.soft, fontWeight:600 }}>Total</span>
            <span style={{ fontFamily:"'JetBrains Mono'", fontWeight:800, color:C.accent, fontSize:16 }}>₲{fmt(total)}</span>
          </div>
        </div>
      )}
      <div style={{ padding:"0 16px 16px" }}>
        <Btn size="lg" style={{ width:"100%" }} disabled={!client||lines.length===0}
          onClick={() => { onSave({ client,phone,address,method,lines }); onClose(); }}>
          Enviar a cocina →
        </Btn>
      </div>
    </Overlay>
  );
}

// ─── MODAL BUFFET ─────────────────────────────────────────────────────────────
function BuffetModal({ pricePerKg, setPricePerKg, onClose, onSave }) {
  const { C } = useT();
  const [kg,     setKg]     = useState("");
  const [pax,    setPax]    = useState(1);
  const [method, setMethod] = useState("Efectivo");
  const [editP,  setEditP]  = useState(false);
  const kgNum = parseFloat(kg)||0;
  const total = kgNum * pricePerKg;
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 80); }, []);

  return (
    <Overlay onClose={onClose} width={360}>
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:17, fontWeight:700, color:C.text }}>🍽 Buffet / Kilo</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
        {/* Precio/kg */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize:11, color:C.soft, marginBottom:2 }}>Precio / kg</div>
            {editP
              ? <input value={pricePerKg} onChange={e => setPricePerKg(parseInt(e.target.value)||0)} type="number"
                  style={{ width:130, background:"none", border:"none", color:C.accent, fontSize:22,
                    fontFamily:"'JetBrains Mono'", fontWeight:700, outline:"none" }}
                  onBlur={() => setEditP(false)} autoFocus />
              : <div style={{ fontSize:22, fontFamily:"'JetBrains Mono'", fontWeight:700, color:C.accent }}>
                  ₲{fmt(pricePerKg)}
                </div>}
          </div>
          {!editP && <button onClick={() => setEditP(true)} style={{ background:"none", border:`1px solid ${C.border}`,
            borderRadius:6, color:C.soft, cursor:"pointer", padding:"4px 10px", fontSize:12 }}>✏</button>}
        </div>

        {/* Personas */}
        <div>
          <div style={{ fontSize:11, color:C.soft, marginBottom:8 }}>Personas</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[1,2,3,4,5,6,7,8].map(n => (
              <button key={n} onClick={() => setPax(n)} style={{ width:36, height:36, borderRadius:7,
                border:`2px solid ${pax===n?C.accent:C.border}`,
                background:pax===n?C.accentBg:C.card, color:pax===n?C.accent:C.soft,
                cursor:"pointer", fontWeight:700, fontSize:14 }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Peso */}
        <div>
          <div style={{ fontSize:11, color:C.soft, marginBottom:6 }}>
            Peso en balanza (kg){pax>1?` — ${pax} bandejas`:""}
          </div>
          <input ref={ref} value={kg} onChange={e => setKg(e.target.value)}
            type="number" step="0.001" placeholder="0.000"
            style={{ width:"100%", background:C.card,
              border:`2px solid ${kgNum>0?C.accent:C.border}`, borderRadius:10,
              color:C.text, fontSize:34, fontFamily:"'JetBrains Mono'", fontWeight:700,
              padding:"12px 16px", outline:"none", textAlign:"center", transition:"border-color .15s" }} />
        </div>

        {kgNum>0 && (
          <div className="pop" style={{ background:C.accentBg, border:`1px solid ${C.accent}44`,
            borderRadius:10, padding:"12px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:C.soft, fontSize:13 }}>{kgNum.toFixed(3)} kg × ₲{fmt(pricePerKg)}</span>
              <span style={{ fontSize:26, fontFamily:"'JetBrains Mono'", fontWeight:800, color:C.accent }}>₲{fmt(total)}</span>
            </div>
            {pax>1 && <div style={{ fontSize:12, color:C.soft, marginTop:4, textAlign:"right" }}>≈ ₲{fmt(total/pax)} por persona</div>}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {["Efectivo","Tarjeta","QR","Transferencia"].map(m => (
            <button key={m} onClick={() => setMethod(m)} style={{ padding:9, borderRadius:7,
              border:`1.5px solid ${method===m?C.accent:C.border}`,
              background:method===m?C.accentBg:C.card, color:method===m?C.accent:C.soft,
              cursor:"pointer", fontWeight:600, fontSize:13 }}>{m}</button>
          ))}
        </div>

        <Btn size="lg" color={C.green} style={{ width:"100%" }} disabled={kgNum===0}
          onClick={() => { onSave(kgNum,pax,method); onClose(); }}>
          ✓ Registrar — ₲{fmt(total)}
        </Btn>
      </div>
    </Overlay>
  );
}

// ─── MODAL CAJA ───────────────────────────────────────────────────────────────

// ─── MODAL MENÚ ───────────────────────────────────────────────────────────────
function MenuModal({ menuItems, onToggle, onUpdatePrice, onAdd, onRemove, onClose }) {
  const { C } = useT();
  const [tab,    setTab]    = useState("lista");
  const [form,   setForm]   = useState({ name:"", price:"", cat:"🍖 Platos" });
  const [editId, setEditId] = useState(null);
  const [editPx, setEditPx] = useState("");

  const cats = [...new Set(menuItems.map(m => m.cat))];
  const iStyle = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:7,
    color:C.text, fontSize:13, padding:"7px 10px", outline:"none" };

  return (
    <Overlay onClose={onClose} width={540}>
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:17, fontWeight:700, color:C.text }}>🍽 Gestión del Menú</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
        {[["lista","📋 Lista"],["nuevo","+ Nuevo ítem"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding:"11px 18px", background:"none",
            border:"none", borderBottom:`2px solid ${tab===v?C.accent:"transparent"}`,
            color:tab===v?C.accent:C.soft, cursor:"pointer", fontWeight:600, fontSize:13 }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:16, maxHeight:480, overflow:"auto" }}>
        {tab==="lista" && (
          <div>
            {cats.map(cat => (
              <div key={cat} style={{ marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase",
                  letterSpacing:1, marginBottom:8 }}>{cat}</div>
                {menuItems.filter(m => m.cat===cat).map(m => (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10,
                    padding:"10px 12px", borderRadius:8, background:C.card,
                    border:`1.5px solid ${m.active?C.border:C.muted+"44"}`,
                    marginBottom:6, opacity:m.active?1:.55, transition:"opacity .2s" }}>
                    {/* Toggle activo */}
                    <button onClick={() => onToggle(m.id)} style={{ width:38, height:22, borderRadius:99,
                      border:"none", background:m.active?C.green:C.muted+"66", cursor:"pointer",
                      position:"relative", flexShrink:0, transition:"background .2s" }}>
                      <span style={{ position:"absolute", top:3, left:m.active?18:3, width:16, height:16,
                        borderRadius:"50%", background:"#fff", transition:"left .2s", display:"block" }} />
                    </button>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{m.name}</div>
                      <div style={{ fontSize:11, color:C.soft }}>{m.active?"Disponible":"No disponible"}</div>
                    </div>
                    {/* Precio editable */}
                    {editId===m.id ? (
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <input value={editPx} onChange={e => setEditPx(e.target.value)} type="number"
                          style={{ ...iStyle, width:100, fontSize:13 }} autoFocus
                          onKeyDown={e => { if(e.key==="Enter"){ onUpdatePrice(m.id,parseInt(editPx)||m.price); setEditId(null); }}} />
                        <Btn size="sm" color={C.green} onClick={() => { onUpdatePrice(m.id,parseInt(editPx)||m.price); setEditId(null); }}>✓</Btn>
                      </div>
                    ) : (
                      <button onClick={() => { setEditId(m.id); setEditPx(String(m.price)); }}
                        style={{ background:C.accentBg, border:`1px solid ${C.accent}44`, borderRadius:6,
                          color:C.accent, cursor:"pointer", padding:"4px 10px", fontSize:12,
                          fontFamily:"'JetBrains Mono'", fontWeight:700 }}>
                        ₲{fmt(m.price)}
                      </button>
                    )}
                    <button onClick={() => onRemove(m.id)} style={{ background:"none", border:"none",
                      color:C.muted, cursor:"pointer", fontSize:16, flexShrink:0 }}>✕</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab==="nuevo" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:360, margin:"0 auto" }}>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Nombre del plato *</div>
              <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))}
                placeholder="Ej: Lomo saltado" style={{ ...iStyle, width:"100%" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Precio (₲) *</div>
              <input value={form.price} onChange={e => setForm(f => ({...f,price:e.target.value}))}
                type="number" placeholder="Ej: 35000" style={{ ...iStyle, width:"100%" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Categoría</div>
              <select value={form.cat} onChange={e => setForm(f => ({...f,cat:e.target.value}))}
                style={{ ...iStyle, width:"100%" }}>
                {["🍖 Platos","🥗 Entradas","🥤 Bebidas","🍮 Postres"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Btn size="lg" style={{ width:"100%" }}
              disabled={!form.name||!form.price}
              onClick={() => {
                onAdd({ name:form.name, price:parseInt(form.price), cat:form.cat });
                setForm({ name:"", price:"", cat:"🍖 Platos" });
                setTab("lista");
              }}>
              + Agregar al menú
            </Btn>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ─── MODAL INVENTARIO ─────────────────────────────────────────────────────────
function InventarioModal({ inventory, onUpdate, onAdd, onRemove, onClose }) {
  const { C } = useT();
  const [tab,  setTab]  = useState("stock");
  const [form, setForm] = useState({ name:"", unit:"kg", stock:"", min:"", cat:"Frescos" });
  const critical = inventory.filter(i => i.stock <= i.min);
  const warning  = inventory.filter(i => i.stock > i.min && i.stock <= i.min * 1.5);

  const iStyle = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:7,
    color:C.text, fontSize:13, padding:"7px 10px", outline:"none" };

  return (
    <Overlay onClose={onClose} width={520}>
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:C.text }}>📦 Inventario</span>
          {critical.length>0 && (
            <span style={{ background:C.red+"22", color:C.red, border:`1px solid ${C.red}44`,
              borderRadius:99, padding:"2px 10px", fontSize:12, fontWeight:700 }}>
              ⚠ {critical.length} crítico{critical.length>1?"s":""}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>

      {/* Alerta crítica */}
      {critical.length>0 && (
        <div style={{ margin:"12px 16px 0", background:C.red+"15", border:`1.5px solid ${C.red}55`,
          borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.red, marginBottom:6 }}>
            🚨 Necesitás reponer urgente:
          </div>
          {critical.map(i => (
            <div key={i.id} style={{ fontSize:13, color:C.red, marginBottom:2 }}>
              • <strong>{i.name}</strong> — quedan {i.stock} {i.unit} (mínimo: {i.min} {i.unit})
            </div>
          ))}
        </div>
      )}
      {warning.length>0 && !critical.length && (
        <div style={{ margin:"12px 16px 0", background:C.gold+"15", border:`1.5px solid ${C.gold}44`,
          borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:4 }}>
            ⚠ Stock bajo — revisá pronto:
          </div>
          {warning.map(i => (
            <div key={i.id} style={{ fontSize:13, color:C.gold, marginBottom:2 }}>
              • {i.name} — {i.stock} {i.unit}
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginTop:12 }}>
        {[["stock","📋 Stock"],["nuevo","+ Agregar"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding:"10px 18px", background:"none",
            border:"none", borderBottom:`2px solid ${tab===v?C.accent:"transparent"}`,
            color:tab===v?C.accent:C.soft, cursor:"pointer", fontWeight:600, fontSize:13 }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:16, maxHeight:400, overflow:"auto" }}>
        {tab==="stock" && inventory.map(i => {
          const pct  = Math.min(100, (i.stock / (i.min*3))*100);
          const isCrit = i.stock<=i.min;
          const isWarn = !isCrit && i.stock<=i.min*1.5;
          const barColor = isCrit?C.red:isWarn?C.gold:C.green;
          return (
            <div key={i.id} style={{ background:C.card, border:`1.5px solid ${isCrit?C.red+"55":C.border}`,
              borderRadius:9, padding:"11px 13px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:C.text }}>{i.name}</div>
                  <div style={{ fontSize:11, color:C.soft }}>{i.cat} · mín. {i.min} {i.unit}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {isCrit && <span style={{ fontSize:11, color:C.red, fontWeight:700 }}>🚨 CRÍTICO</span>}
                  {isWarn && <span style={{ fontSize:11, color:C.gold, fontWeight:700 }}>⚠ BAJO</span>}
                  <span style={{ fontFamily:"'JetBrains Mono'", fontWeight:700, fontSize:14, color:barColor }}>
                    {i.stock} {i.unit}
                  </span>
                </div>
              </div>
              {/* Barra de nivel */}
              <div style={{ height:5, background:C.border, borderRadius:3, marginBottom:8, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:3, transition:"width .4s" }} />
              </div>
              {/* Ajuste rápido */}
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <button onClick={() => onUpdate(i.id,-1)} style={{ width:28, height:28, borderRadius:6,
                  border:`1px solid ${C.border}`, background:C.surface, color:C.red,
                  cursor:"pointer", fontWeight:700, fontSize:16 }}>−</button>
                <button onClick={() => onUpdate(i.id,1)} style={{ width:28, height:28, borderRadius:6,
                  border:`1px solid ${C.border}`, background:C.surface, color:C.green,
                  cursor:"pointer", fontWeight:700, fontSize:16 }}>+</button>
                <button onClick={() => onUpdate(i.id,5)} style={{ padding:"4px 10px", borderRadius:6,
                  border:`1px solid ${C.greenBg}`, background:C.greenBg, color:C.green,
                  cursor:"pointer", fontSize:12, fontWeight:600 }}>+5</button>
                <button onClick={() => onUpdate(i.id,10)} style={{ padding:"4px 10px", borderRadius:6,
                  border:`1px solid ${C.greenBg}`, background:C.greenBg, color:C.green,
                  cursor:"pointer", fontSize:12, fontWeight:600 }}>+10</button>
                <div style={{ flex:1 }} />
                <button onClick={() => onRemove(i.id)} style={{ background:"none", border:"none",
                  color:C.muted, cursor:"pointer", fontSize:15 }}>✕</button>
              </div>
            </div>
          );
        })}

        {tab==="nuevo" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:360, margin:"0 auto" }}>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Nombre *</div>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                placeholder="Ej: Aceite girasol" style={{ ...iStyle, width:"100%" }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div>
                <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Stock actual *</div>
                <input value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))}
                  type="number" placeholder="0" style={{ ...iStyle, width:"100%" }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Stock mínimo *</div>
                <input value={form.min} onChange={e => setForm(f=>({...f,min:e.target.value}))}
                  type="number" placeholder="0" style={{ ...iStyle, width:"100%" }} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div>
                <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Unidad</div>
                <select value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))}
                  style={{ ...iStyle, width:"100%" }}>
                  {["kg","g","L","ml","unidad","docena","lata","bolsa"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Categoría</div>
                <select value={form.cat} onChange={e => setForm(f=>({...f,cat:e.target.value}))}
                  style={{ ...iStyle, width:"100%" }}>
                  {["Frescos","Lácteos","Secos","Conservas","Bebidas","Otros"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Btn size="lg" style={{ width:"100%" }}
              disabled={!form.name||!form.stock||!form.min}
              onClick={() => {
                onAdd({ name:form.name, unit:form.unit, stock:parseFloat(form.stock),
                  min:parseFloat(form.min), cat:form.cat });
                setForm({ name:"", unit:"kg", stock:"", min:"", cat:"Frescos" });
                setTab("stock");
              }}>+ Agregar ingrediente</Btn>
          </div>
        )}
      </div>
    </Overlay>
  );
}

function CajaModal({ cashLog, onClose, onAdd }) {
  const { C } = useT();
  const [form, setForm] = useState({ desc:"", amount:"", type:"in", method:"Efectivo" });
  const total    = cashLog.reduce((s,c) => c.type==="in"?s+c.amount:s-c.amount, 0);
  const ingresos = cashLog.filter(c => c.type==="in" ).reduce((s,c) => s+c.amount, 0);
  const egresos  = cashLog.filter(c => c.type==="out").reduce((s,c) => s+c.amount, 0);
  const buffetT  = cashLog.filter(c => c.desc?.startsWith("Buffet")).reduce((s,c) => s+c.amount, 0);

  const iStyle = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:7,
    color:C.text, fontSize:13, padding:"7px 10px", outline:"none" };

  return (
    <Overlay onClose={onClose} width={500}>
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:17, fontWeight:700, color:C.text }}>💰 Caja del día</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ padding:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
          {[["Caja",fmt(total),total>=0?C.green:C.red],["Ingresos",fmt(ingresos),C.green],
            ["Egresos",fmt(egresos),C.red],["Buffet",fmt(buffetT),C.gold]].map(([l,v,cl]) => (
            <div key={l} style={{ background:C.card, borderRadius:8, padding:"10px 12px", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, color:C.soft, textTransform:"uppercase", letterSpacing:.5 }}>{l}</div>
              <div style={{ fontSize:15, fontFamily:"'JetBrains Mono'", fontWeight:700, color:cl, marginTop:2 }}>₲{v}</div>
            </div>
          ))}
        </div>

        {/* Nuevo movimiento */}
        <div style={{ background:C.card, borderRadius:10, padding:12, marginBottom:14, border:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            {["in","out"].map(tp => (
              <button key={tp} onClick={() => setForm(f => ({...f, type:tp}))}
                style={{ flex:1, padding:7, borderRadius:7,
                  border:`1.5px solid ${form.type===tp?(tp==="in"?C.green:C.red):C.border}`,
                  background:form.type===tp?(tp==="in"?C.greenBg:C.redBg):"transparent",
                  color:form.type===tp?(tp==="in"?C.green:C.red):C.soft,
                  cursor:"pointer", fontWeight:700, fontSize:13 }}>
                {tp==="in"?"↑ Ingreso":"↓ Egreso"}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:6, marginBottom:6 }}>
            <input value={form.desc} onChange={e => setForm(f => ({...f,desc:e.target.value}))} placeholder="Descripción" style={iStyle} />
            <input value={form.amount} onChange={e => setForm(f => ({...f,amount:e.target.value}))} placeholder="Monto" type="number" style={{ ...iStyle, width:110 }} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["Efectivo","Tarjeta","QR","Transf."].map(m => (
              <button key={m} onClick={() => setForm(f => ({...f,method:m}))}
                style={{ flex:1, padding:5, borderRadius:6,
                  border:`1px solid ${form.method===m?C.accent:C.border}`,
                  background:form.method===m?C.accentBg:"transparent",
                  color:form.method===m?C.accent:C.soft, cursor:"pointer", fontSize:11, fontWeight:600 }}>{m}</button>
            ))}
            <Btn size="sm" onClick={() => {
              if (!form.desc||!form.amount) return;
              onAdd(form.desc,parseInt(form.amount),form.type,form.method);
              setForm({desc:"",amount:"",type:"in",method:"Efectivo"});
            }} disabled={!form.desc||!form.amount}>+ Agregar</Btn>
          </div>
        </div>

        <div style={{ overflow:"auto", maxHeight:240 }}>
          {[...cashLog].reverse().map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10,
              padding:"8px 10px", borderRadius:7, background:C.card,
              border:`1px solid ${C.border}`, marginBottom:5 }}>
              <span style={{ fontSize:16 }}>{c.type==="in"?"⬆":"⬇"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.text }}>{c.desc}</div>
                <div style={{ fontSize:11, color:C.muted }}>{c.time} · {c.method}</div>
              </div>
              <span style={{ fontFamily:"'JetBrains Mono'", fontWeight:700, fontSize:14,
                color:c.type==="in"?C.green:C.red }}>
                {c.type==="in"?"+":"-"}₲{fmt(c.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

// ─── MODAL USUARIOS ───────────────────────────────────────────────────────────
function UsersModal({ onClose }) {
  const { C } = useT();
  const [users,   setUsers]  = useState(INIT_USERS);
  const [adding,  setAdding] = useState(false);
  const [form,    setForm]   = useState({ name:"", role:"mozo" });

  return (
    <Overlay onClose={onClose} width={460}>
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:17, fontWeight:700, color:C.text }}>👥 Usuarios</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ padding:16 }}>
        {users.map(u => {
          const role = ROLES[u.role];
          return (
            <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
              background:C.card, border:`1px solid ${C.border}`, borderRadius:8, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{role.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:C.text }}>{u.name}</div>
                <div style={{ fontSize:12, color:C.soft }}>{role.label}</div>
              </div>
              <button onClick={() => setUsers(us => us.filter(x => x.id!==u.id))}
                style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
          );
        })}
        {!adding
          ? <button onClick={() => setAdding(true)} style={{ width:"100%", marginTop:8, padding:10,
              borderRadius:8, border:`1.5px dashed ${C.border}`, background:"transparent",
              color:C.soft, cursor:"pointer", fontWeight:600, fontSize:13 }}>+ Agregar usuario</button>
          : (
            <div style={{ background:C.card, border:`1px solid ${C.accent}44`, borderRadius:10, padding:14, marginTop:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))}
                  placeholder="Nombre" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, fontSize:13, padding:"7px 10px", outline:"none" }} />
                <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, fontSize:13, padding:"7px 10px", outline:"none" }}>
                  {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <Btn style={{ flex:1 }} onClick={() => {
                  if (!form.name) return;
                  setUsers(us => [...us, { id:"u"+Date.now(), ...form }]);
                  setForm({ name:"", role:"mozo" }); setAdding(false);
                }} disabled={!form.name}>Guardar</Btn>
                <Btn color={C.soft} onClick={() => setAdding(false)}>Cancelar</Btn>
              </div>
            </div>
          )}
      </div>
    </Overlay>
  );
}

// ─── USER BADGE ───────────────────────────────────────────────────────────────
function UserBadge({ user, onLogout }) {
  const { C } = useT();
  const [open, setOpen] = useState(false);
  const role = ROLES[user.role];
  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:"flex", alignItems:"center", gap:7,
        padding:"5px 12px", borderRadius:99, border:`1.5px solid ${C.accent}44`,
        background:C.accentBg, cursor:"pointer" }}>
        <span style={{ fontSize:15 }}>{role.icon}</span>
        <span style={{ fontSize:13, fontWeight:700, color:C.accent }}>{user.name}</span>
        <span style={{ fontSize:10, color:C.muted }}>▼</span>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:C.surface,
          border:`1px solid ${C.border}`, borderRadius:10, padding:8, minWidth:160,
          boxShadow:"0 8px 24px rgba(0,0,0,.2)", zIndex:300 }}>
          <div style={{ padding:"6px 10px", marginBottom:6, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{user.name}</div>
            <div style={{ fontSize:11, color:C.soft }}>{role.label}</div>
          </div>
          <button onClick={() => { setOpen(false); onLogout(); }}
            style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"none",
              background:C.redBg, color:C.red, cursor:"pointer", fontWeight:600, fontSize:13, textAlign:"left" }}>
            ↩ Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const { C } = useT();
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", background:C.bg, padding:20 }}>
      <div style={{ marginBottom:36, textAlign:"center" }}>
        <CaposLogo size="lg" />
        <div style={{ fontSize:12, color:C.muted, marginTop:12, letterSpacing:2, textTransform:"uppercase" }}>
          Sistema de gestión
        </div>
      </div>
      <div className="pop" style={{ width:"100%", maxWidth:400 }}>
        <div style={{ fontSize:13, color:C.soft, textAlign:"center", marginBottom:14 }}>¿Quién sos?</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {INIT_USERS.map(u => {
            const role = ROLES[u.role];
            return (
              <button key={u.id} onClick={() => onLogin(u)}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 16px",
                  borderRadius:12, border:`1.5px solid ${C.border}`, background:C.card,
                  cursor:"pointer", textAlign:"left", transition:"all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.background=C.accentBg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.card; }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:C.accentBg,
                  border:`2px solid ${C.accent}44`, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:22, flexShrink:0 }}>{role.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{u.name}</div>
                  <div style={{ fontSize:12, color:C.soft, marginTop:1 }}>{role.label}</div>
                </div>
                <div style={{ fontSize:18, color:C.muted }}>→</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position:"fixed", bottom:14, fontSize:11, color:C.muted }}>Capo's Restobar · Sistema de gestión</div>
    </div>
  );
}

// ─── SALÓN ────────────────────────────────────────────────────────────────────
function SalonScreen({ state, currentUser, can }) {
  const { C } = useT();
  const { tickets, deliveries, cashLog, pricePerKg, setPricePerKg,
    menuItems, toggleMenuItem, updateMenuPrice, addMenuItem, removeMenuItem,
    inventory, updateStock, addInventory, removeInventory,
    openTable, addLine, removeLine, advanceLine, sendToKitchen, markDelivered, payTicket,
    addDelivery, advanceDelivery, payDelivery, addBuffet, addCash } = state;

  const [selTable,    setSelTable]    = useState(null);
  const activeMenu = menuItems.filter(m => m.active);
  const elapsed = useElapsed();
  const [showDel,     setShowDel]     = useState(false);
  const [showBuffet,  setShowBuffet]  = useState(false);
  const [showCaja,    setShowCaja]    = useState(false);
  const [showUsers,     setShowUsers]     = useState(false);
  const [showMenu,      setShowMenu]      = useState(false);
  const [showInventario,setShowInventario] = useState(false);
  const [tab,           setTab]           = useState("salon");

  const cajaTotal  = cashLog.reduce((s,c) => c.type==="in"?s+c.amount:s-c.amount, 0);
  const draftAll   = Object.values(tickets).flatMap(t => t.lines).filter(l => l.status==="draft").length;
  const cookingAll = Object.values(tickets).flatMap(t => t.lines).filter(l => l.status==="cooking").length;
  const readyAll   = Object.values(tickets).flatMap(t => t.lines).filter(l => l.status==="ready").length;
  const pendingDel = deliveries.filter(d => d.status!=="delivered").length;

  const stockCrit  = inventory.filter(i => i.stock<=i.min).length;
  const ventasHoy  = cashLog.filter(c => c.type==="in" ).reduce((s,c) => s+c.amount, 0);
  const gastosHoy  = cashLog.filter(c => c.type==="out").reduce((s,c) => s+c.amount, 0);
  const buffetHoy  = cashLog.filter(c => c.desc?.startsWith("Buffet")).reduce((s,c) => s+c.amount, 0);

  const delNext  = { cooking:"ready", ready:"delivering", delivering:"delivered" };
  const delColor = { cooking:C.gold, ready:C.green, delivering:C.blue, delivered:C.muted };
  const delLabel = { cooking:"En cocina", ready:"Lista", delivering:"En camino", delivered:"Entregado" };

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:C.bg }}>
      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"0 16px", display:"flex", alignItems:"center", flexShrink:0 }}>
        <div style={{ marginRight:20, padding:"8px 0" }}><CaposLogo /></div>
        {[["salon","🪑 Salón"],["delivery","🛵 Delivery"],["reportes","📊 Reportes"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding:"16px 14px", background:"none",
            border:"none", borderBottom:`2px solid ${tab===v?C.accent:"transparent"}`,
            color:tab===v?C.accent:C.soft, cursor:"pointer", fontWeight:600, fontSize:13, whiteSpace:"nowrap" }}>{l}</button>
        ))}
        <div style={{ flex:1 }} />
        {draftAll>0   && <div style={{ display:"flex", alignItems:"center", gap:5, marginRight:12 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:C.blue, display:"block", animation:"blink 1.4s infinite" }} />
          <span style={{ fontSize:12, color:C.blue, fontWeight:600 }}>{draftAll} sin enviar</span>
        </div>}
        {cookingAll>0 && <div style={{ display:"flex", alignItems:"center", gap:5, marginRight:12 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:C.gold, display:"block", animation:"blink 1.4s infinite" }} />
          <span style={{ fontSize:12, color:C.gold, fontWeight:600 }}>{cookingAll} en cocina</span>
        </div>}
        {readyAll>0 && <span style={{ fontSize:12, color:C.green, fontWeight:600, marginRight:12 }}>✓ {readyAll} listas</span>}
        <div style={{ display:"flex", gap:8, padding:"8px 0", marginRight:100 }}>
          {can.config && <Btn size="sm" color={C.accent} onClick={() => setShowMenu(true)}>🍽 Menú</Btn>}
          {can.config && (
            <button onClick={() => setShowInventario(true)} style={{ display:"flex", alignItems:"center", gap:5,
              padding:"5px 11px", borderRadius:8, border:`1.5px solid ${stockCrit>0?C.red+"55":C.border}`,
              background:stockCrit>0?C.redBg:C.surface, color:stockCrit>0?C.red:C.soft,
              cursor:"pointer", fontSize:12, fontWeight:700 }}>
              📦 {stockCrit>0?`⚠ ${stockCrit} bajo stock`:"Inventario"}
            </button>
          )}
          {can.buffet && <Btn size="sm" color={C.gold} onClick={() => setShowBuffet(true)}>🍽 Buffet/Kilo</Btn>}
          {can.caja   && <Btn size="sm" color={C.green} onClick={() => setShowCaja(true)}>💰 Caja ₲{fmt(cajaTotal)}</Btn>}
        </div>
      </div>

      <div style={{ flex:1, overflow:"auto", padding:16 }}>
        {/* SALÓN */}
        {tab==="salon" && (
          <div>
            {["Salón","Terraza","Privado","Barra"].map(zone => {
              const zt = INIT_TABLES.filter(t => t.zone===zone);
              return (
                <div key={zone} style={{ marginBottom:22 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase",
                    letterSpacing:1.2, marginBottom:10 }}>{zone}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                    {zt.map(t => {
                      const tk = tickets[t.id];
                      const hasReady   = tk?.lines.some(l => l.status==="ready");
                      const hasDraft   = tk?.lines.some(l => l.status==="draft");
                      const hasCooking = tk?.lines.some(l => l.status==="cooking");
                      const ttl = tk?.lines.reduce((s,l) => s+(byId(l.itemId)?.price||0)*l.qty, 0)||0;
                      const bc  = !tk?C.border:hasReady?C.green:hasCooking?C.gold:hasDraft?C.blue:C.border;
                      const bg  = !tk?C.card:hasReady?C.greenBg:hasCooking?C.goldBg:hasDraft?C.blueBg:C.card;
                      return (
                        <button key={t.id} onClick={() => setSelTable(t.id)}
                          style={{ width:100, height:100, borderRadius:12, border:`2px solid ${bc}`,
                            background:bg, cursor:"pointer", display:"flex", flexDirection:"column",
                            alignItems:"center", justifyContent:"center", gap:3,
                            position:"relative", transition:"all .15s" }}
                          onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                          onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                          <div style={{ fontSize:18, fontWeight:800, color:tk?C.text:C.soft }}>{t.label}</div>
                          <div style={{ fontSize:11, color:C.soft }}>{t.cap} pers.</div>
                          {tk && <div style={{ fontSize:11, fontFamily:"'JetBrains Mono'", fontWeight:700, color:C.accent }}>₲{fmt(ttl)}</div>}
                          {tk && <div style={{ fontSize:10, color:C.soft }}>{tk.lines.length} ítem{tk.lines.length!==1?"s":""}</div>}
                          {tk?.openedAt && (() => { const e=elapsed(tk.openedAt); return e ? <div style={{ fontSize:10, fontWeight:700, color:e.color }}>⏱ {e.label}</div> : null; })()}
                          {hasReady && <span style={{ position:"absolute", top:6, right:6, width:8, height:8, borderRadius:"50%", background:C.green }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DELIVERY */}
        {tab==="delivery" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontWeight:700, color:C.text }}>Pedidos delivery</span>
                {pendingDel>0 && <Tag color={C.accent}>{pendingDel} activos</Tag>}
              </div>
              <Btn onClick={() => setShowDel(true)}>+ Nuevo pedido</Btn>
            </div>
            {deliveries.length===0
              ? <div style={{ textAlign:"center", color:C.muted, paddingTop:60 }}>Sin pedidos delivery hoy</div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                  {[...deliveries].reverse().map(d => {
                    const ttl = (d.lines||[]).reduce((s,l) => s+(byId(l.itemId)?.price||0)*l.qty, 0);
                    const sc = delColor[d.status];
                    const ns = delNext[d.status];
                    return (
                      <div key={d.id} style={{ background:C.card, border:`1.5px solid ${sc}55`, borderRadius:10, padding:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div>
                            <div style={{ fontWeight:700, color:C.text }}>{d.client}</div>
                            {d.phone   && <div style={{ fontSize:12, color:C.soft }}>{d.phone}</div>}
                            {d.address && <div style={{ fontSize:12, color:C.soft }}>📍 {d.address}</div>}
                            {d.openedAt && (() => { const e=elapsed(d.openedAt); return e ? <div style={{ fontSize:12, fontWeight:700, color:e.color, marginTop:2 }}>⏱ {e.label} desde pedido</div> : null; })()}
                          </div>
                          <Tag color={sc}>{delLabel[d.status]}</Tag>
                        </div>
                        {(d.lines||[]).map(l => <div key={l.lid} style={{ fontSize:13, color:C.soft, marginBottom:2 }}>{l.qty}× {byId(l.itemId)?.name}</div>)}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                          marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                          <span style={{ fontFamily:"'JetBrains Mono'", fontWeight:700, color:C.accent }}>₲{fmt(ttl)}</span>
                          <div style={{ display:"flex", gap:6 }}>
                            {!d.paid && d.status==="delivered" && <Btn size="sm" color={C.green} onClick={() => payDelivery(d.id,d.method)}>Cobrar</Btn>}
                            {ns && <Btn size="sm" color={sc} onClick={() => advanceDelivery(d.id)}>
                              {ns==="ready"?"✓ Lista":ns==="delivering"?"🛵 Salió":"✓ Entregado"}
                            </Btn>}
                          </div>
                        </div>
                        {d.paid && <div style={{ fontSize:11, color:C.green, marginTop:4 }}>✓ Cobrado · {d.method}</div>}
                      </div>
                    );
                  })}
                </div>}
          </div>
        )}

        {/* REPORTES */}
        {tab==="reportes" && (
          <div style={{ maxWidth:680 }}>
            <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:16 }}>Resumen del día</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              {[
                ["Ventas",ventasHoy,C.green,"📈"],
                ["Caja",cajaTotal,cajaTotal>=0?C.green:C.red,"💰"],
                ["Gastos",gastosHoy,C.red,"📉"],
                ["Buffet",buffetHoy,C.gold,"🍽"],
                ["Mesas abiertas",Object.keys(tickets).length,C.blue,"🪑"],
                ["Pedidos delivery",deliveries.length,C.blue,"🛵"],
              ].map(([l,v,cl,ic]) => (
                <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`,
                  borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:24 }}>{ic}</span>
                  <div>
                    <div style={{ fontSize:11, color:C.soft, textTransform:"uppercase", letterSpacing:.5 }}>{l}</div>
                    <div style={{ fontSize:20, fontFamily:"'JetBrains Mono'", fontWeight:800, color:cl }}>
                      {typeof v==="number"&&l!=="Mesas abiertas"&&l!=="Pedidos delivery"?`₲${fmt(v)}`:v}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontWeight:700, color:C.text, marginBottom:10 }}>Últimos movimientos</div>
            {[...cashLog].reverse().slice(0,10).map(c => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
                background:C.card, borderRadius:7, border:`1px solid ${C.border}`, marginBottom:5 }}>
                <span>{c.type==="in"?"⬆":"⬇"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.text }}>{c.desc}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{c.time} · {c.method}</div>
                </div>
                <span style={{ fontFamily:"'JetBrains Mono'", fontWeight:700,
                  color:c.type==="in"?C.green:C.red }}>
                  {c.type==="in"?"+":"-"}₲{fmt(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {selTable!==null && (
        <TableModal
          tid={selTable}
          ticket={tickets[selTable]}
          onClose={() => setSelTable(null)}
          onOpen={() => openTable(selTable)}
          onAdd={(id,qty,note) => addLine(selTable,id,qty,note)}
          onRemove={lid => removeLine(selTable,lid)}
          onSendKitchen={() => sendToKitchen(selTable)}
          onMarkDelivered={() => markDelivered(selTable)}
          onPay={(method, comp) => payTicket(selTable,method,currentUser.name,comp)}
          canPay={can.caja}
        />
      )}
      {showDel    && <DeliveryModal onClose={() => setShowDel(false)} onSave={addDelivery} />}
      {showBuffet     && <BuffetModal pricePerKg={pricePerKg} setPricePerKg={setPricePerKg} onClose={() => setShowBuffet(false)} onSave={addBuffet} />}
      {showCaja       && <CajaModal cashLog={cashLog} onClose={() => setShowCaja(false)} onAdd={addCash} />}
      {showUsers      && <UsersModal onClose={() => setShowUsers(false)} />}
      {showMenu       && <MenuModal menuItems={menuItems} onToggle={toggleMenuItem} onUpdatePrice={updateMenuPrice} onAdd={addMenuItem} onRemove={removeMenuItem} onClose={() => setShowMenu(false)} />}
      {showInventario && <InventarioModal inventory={inventory} onUpdate={updateStock} onAdd={addInventory} onRemove={removeInventory} onClose={() => setShowInventario(false)} />}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const state = useRestaurantState();
  const [user,   setUser]   = useState(null);
  const [screen, setScreen] = useState("salon");
  const [mode,   setMode]   = useState("day");

  const C   = THEMES[mode];
  const ctx = { mode, C, toggle: () => setMode(m => m==="day"?"night":"day") };

  const login  = u => { setUser(u); setScreen(u.role==="cocina"?"cocina":"salon"); };
  const logout = () => { setUser(null); setScreen("salon"); };

  const can = user ? CAN[user.role] : {};
  const stockAlert = state.inventory.filter(i => i.stock<=i.min).length;

  const auditedState = user ? {
    ...state,
    payTicket: (tid, method, comprobante) => state.payTicket(tid, method, user.name, comprobante),
  } : state;

  return (
    <ThemeCtx.Provider value={ctx}>
      <style>{css}</style>
      <div style={{ background:C.bg, color:C.text, height:"100vh", overflow:"hidden" }}>

        {/* Toggle día/noche — siempre visible */}
        <div style={{ position:"fixed", top:10, right:12, zIndex:600, display:"flex", gap:8, alignItems:"center" }}>
          <ThemeToggle />
          {user && can.config && stockAlert>0 && (
            <span style={{ background:C.red+"22", color:C.red, border:`1px solid ${C.red}44`,
              borderRadius:99, padding:"4px 10px", fontSize:12, fontWeight:700, animation:"blink 2s infinite" }}>
              📦 {stockAlert} bajo stock
            </span>
          )}
          {user && <UserBadge user={user} onLogout={logout} />}
        </div>

        {/* Selector pantallas — solo admin/roles con ambas */}
        {user && can.salon && can.cocina && (
          <div style={{ position:"fixed", bottom:14, right:14, zIndex:500, display:"flex", gap:8 }}>
            <button onClick={() => setScreen("salon")} style={{ padding:"8px 15px", borderRadius:99,
              border:`2px solid ${screen==="salon"?C.accent:C.border}`,
              background:screen==="salon"?C.accentBg:C.surface,
              color:screen==="salon"?C.accent:C.soft, cursor:"pointer", fontWeight:700, fontSize:13 }}>🪑 Salón</button>
            <button onClick={() => setScreen("cocina")} style={{ padding:"8px 15px", borderRadius:99,
              border:`2px solid ${screen==="cocina"?C.green:C.border}`,
              background:screen==="cocina"?C.greenBg:C.surface,
              color:screen==="cocina"?C.green:C.soft, cursor:"pointer", fontWeight:700, fontSize:13 }}>🍳 Cocina</button>
          </div>
        )}

        {!user && <LoginScreen onLogin={login} />}
        {user && screen==="salon"  && can.salon  && <SalonScreen state={auditedState} currentUser={user} can={can} />}
        {user && screen==="cocina" && can.cocina  && <KitchenScreen tickets={state.tickets} deliveries={state.deliveries} advanceLine={state.advanceLine} advanceAllReady={state.advanceAllReady} />}
      </div>
    </ThemeCtx.Provider>
  );
}
