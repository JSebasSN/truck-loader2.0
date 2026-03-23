import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import * as FS from "./firestore";
import "./index.css";

// === CONTEXT ===
const Ctx = createContext();
const useApp = () => useContext(Ctx);

// === UTILS ===
const tPct = (t) => { const f = Object.keys(t.posData || {}).length; return t.positions > 0 ? Math.round((f / t.positions) * 100) : 0; };
const tFill = (t) => Object.keys(t.posData || {}).length;
const now = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
const todayFull = () => new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const todayShort = () => new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
const avBg = (n) => { const c = ["#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777","#2563eb","#ca8a04"]; let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return c[Math.abs(h) % c.length]; };
const pCol = (p) => p >= 80 ? "var(--green)" : p >= 30 ? "var(--amber)" : "var(--accent)";

// === ICONS ===
const I={Home:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,Grid:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,Pulse:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,Users:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,Truck:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,Plus:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,Trash:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,Check:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,X:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,Back:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>,Logout:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,Clock:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,UserPlus:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,UserMinus:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,Box:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,Zap:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,Target:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,Save:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,History:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,Refresh:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,Eye:p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>};

// === HOOKS ===
function useToast() { const [t, sT] = useState(null); const sh = useCallback(m => { sT(m); setTimeout(() => sT(null), 2200); }, []); return { sh, T: t ? <div className="toast">{t}</div> : null }; }

function useConfirm() {
  const [s, sS] = useState({ open: false, title: "", msg: "", fn: () => {}, okLabel: "", okColor: "" });
  const ask = useCallback((title, msg, fn, okLabel, okColor) => sS({ open: true, title, msg, fn, okLabel: okLabel || "Eliminar", okColor: okColor || "" }), []);
  const close = useCallback(() => sS(x => ({ ...x, open: false })), []);
  const El = s.open ? <div className="ov" onClick={close}><div className="md cfm" onClick={e => e.stopPropagation()}>
    <div className="cfm-ic" style={{ background: s.okColor ? `${s.okColor}20` : "var(--rbg)" }}><I.Trash style={{ width: 28, height: 28, color: s.okColor || "var(--red)" }} /></div>
    <div className="cfm-t">{s.title}</div><div className="cfm-m">{s.msg}</div>
    <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
      <button className="btn btn-o" style={{ flex: 1 }} onClick={close}>Cancelar</button>
      <button className="btn" style={{ flex: 1, background: s.okColor || "var(--red)", color: "#fff" }} onClick={() => { s.fn(); close(); }}>{s.okLabel}</button>
    </div>
  </div></div> : null;
  return { ask, El };
}

function Modal({ open, onClose, title, sub, children }) {
  if (!open) return null;
  return <div className="ov" onClick={onClose}><div className="md" onClick={e => e.stopPropagation()}>
    <div className="mh"><div><div className="mt-h">{title}</div>{sub && <div className="ms-h">{sub}</div>}</div>
    <button className="btn-ic" onClick={onClose}><I.X style={{ width: 16, height: 16 }} /></button></div>{children}
  </div></div>;
}

// === LOGIN ===
function Login() {
  const [tab, sTab] = useState("in");
  const [email, sEmail] = useState("");
  const [pass, sPass] = useState("");
  const [name, sName] = useState("");
  const [role, sRole] = useState("carretillero");
  const [err, sErr] = useState("");
  const [loading, sLoading] = useState(false);

  const doIn = async () => {
    sErr(""); sLoading(true);
    try { await signInWithEmailAndPassword(auth, email, pass); }
    catch (e) { sErr(e.code === "auth/invalid-credential" ? "Credenciales incorrectas" : e.message); }
    sLoading(false);
  };

  const doUp = async () => {
    if (!name || !email || !pass) return sErr("Todos los campos son obligatorios");
    if (pass.length < 6) return sErr("La contraseña debe tener al menos 6 caracteres");
    sErr(""); sLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await FS.createUser(cred.user.uid, { name: name.trim(), email: email.trim(), role });
    } catch (e) {
      sErr(e.code === "auth/email-already-in-use" ? "Email ya registrado" : e.message);
    }
    sLoading(false);
  };

  return <div className="lw"><div className="lb an">
    <div className="lhd"><h1>TruckLoader</h1><p>Control de carga de camiones</p></div>
    <div className="tabs">
      <button className={`tab ${tab === "in" ? "on" : ""}`} onClick={() => { sTab("in"); sErr(""); }}>Iniciar Sesión</button>
      <button className={`tab ${tab === "up" ? "on" : ""}`} onClick={() => { sTab("up"); sErr(""); }}>Registro</button>
    </div>
    {err && <div className="eb">{err}</div>}
    {tab === "up" && <>
      <div className="field"><label>Nombre</label><input className="inp" placeholder="Tu nombre" value={name} onChange={x => sName(x.target.value)} /></div>
      <div className="field"><label>Rol</label>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${role === "admin" ? "on" : ""}`} onClick={() => sRole("admin")}>Admin</button>
          <button className={`tab ${role === "carretillero" ? "on" : ""}`} onClick={() => sRole("carretillero")}>Carretillero</button>
        </div>
      </div>
    </>}
    <div className="field"><label>Email</label><input className="inp" type="email" placeholder="correo@ejemplo.com" value={email} onChange={x => sEmail(x.target.value)} /></div>
    <div className="field"><label>Contraseña</label><input className="inp" type="password" placeholder="••••••••" value={pass} onChange={x => sPass(x.target.value)} onKeyDown={x => x.key === "Enter" && (tab === "in" ? doIn() : doUp())} /></div>
    <button className="btn btn-a btn-bl" style={{ marginTop: 4 }} onClick={tab === "in" ? doIn : doUp} disabled={loading}>
      {loading ? "Cargando..." : tab === "in" ? "Entrar" : "Crear Cuenta"}
    </button>
  </div></div>;
}

// === HOME ===
function Home() {
  const { user, trucks } = useApp();
  const active = trucks.filter(t => t.status === "active" || t.status === "pending");
  const done = trucks.filter(t => t.status === "completed");
  return <div className="page an" key="home">
    <div className="wc"><div className="wc-hi">Bienvenido</div><div className="wc-nm">{user.name}</div><div className="wc-bg"><I.Users />{user.role === "admin" ? "Administrador" : "Carretillero"}</div></div>
    <div className="stats">
      <div className="stat"><div className="stat-i" style={{ background: "var(--abg)" }}><I.Zap style={{ color: "var(--accent)" }} /></div><div className="stat-v" style={{ color: "var(--accent)" }}>{active.length}</div><div className="stat-l">Activos</div></div>
      <div className="stat"><div className="stat-i" style={{ background: "var(--gbg2)" }}><I.Check style={{ color: "var(--green)" }} /></div><div className="stat-v" style={{ color: "var(--green)" }}>{done.length}</div><div className="stat-l">Completados</div></div>
      <div className="stat"><div className="stat-i" style={{ background: "var(--ambg)" }}><I.Truck style={{ color: "var(--amber)" }} /></div><div className="stat-v" style={{ color: "var(--amber)" }}>{trucks.length}</div><div className="stat-l">Total</div></div>
    </div>
    <div className="sh"><div className="st"><I.Clock /> Actividad Reciente</div></div>
    {trucks.length === 0 ? <div className="em"><I.Truck /><p>No hay camiones</p></div> : trucks.slice(0, 6).map(t => {
      const p2 = tPct(t); return <div key={t.id} className="tr" style={{ cursor: "default" }}>
        <div className={`tri ${t.status === "completed" ? "dn" : ""}`}><I.Truck /></div>
        <div className="trf"><div className="trn">{t.route}</div><div className="trs">{t.arrivalTime}</div></div>
        <div className="trr"><div className="trp" style={{ color: pCol(p2) }}>{p2}%</div><div className="pb" style={{ width: 44 }}><div className="pf" style={{ width: `${p2}%`, background: pCol(p2) }} /></div></div>
      </div>;
    })}
    <button className="mlo" onClick={() => signOut(auth)}><I.Logout /> Cerrar Sesión</button>
  </div>;
}

// === DETAIL ===
function Detail({ truck, onBack }) {
  const { sh, T } = useToast();
  const { ask, El } = useConfirm();
  const [sel, sSel] = useState(null);
  const p = tPct(truck), f = tFill(truck);

  const pick = async (name) => {
    if (sel == null) return;
    const newPosData = { ...(truck.posData || {}), [sel]: name };
    await FS.updateTruck(truck.id, { posData: newPosData });
    sSel(null); sh(`Pos ${sel} → ${name}`);
  };
  const clear = (pos) => {
    ask("Vaciar posición", `¿Vaciar la posición ${pos}?`, async () => {
      const newPosData = { ...(truck.posData || {}) }; delete newPosData[pos];
      await FS.updateTruck(truck.id, { posData: newPosData }); sh(`Pos ${pos} vaciada`);
    });
  };
  const finish = async () => {
    await FS.updateTruck(truck.id, { status: "completed", departureTime: now() });
    sh("¡Carga finalizada!"); setTimeout(onBack, 700);
  };

  return <div className="page an" key={"d-" + truck.id}>{T}{El}
    <button className="btn btn-o btn-sm" onClick={onBack} style={{ marginBottom: 16 }}><I.Back style={{ width: 16, height: 16 }} /> Volver</button>
    <div className="dhd"><div className="dhr"><I.Truck />{truck.route}</div><div className="dg">
      <div className="dc"><div className="dcl">Llegada</div><div className="dcv">{truck.arrivalTime}</div></div>
      <div className="dc"><div className="dcl">Salida</div><div className="dcv">{truck.departureTime || "—"}</div></div>
      <div className="dc"><div className="dcl">Progreso</div><div className="dcv" style={{ color: pCol(p) }}>{p}%</div></div>
      <div className="dc"><div className="dcl">Posiciones</div><div className="dcv">{f}/{truck.positions}</div></div>
    </div><div className="pb pb-lg" style={{ marginTop: 14 }}><div className="pf" style={{ width: `${p}%`, background: pCol(p) }} /></div></div>
    <div className="sh"><div className="st"><I.Box /> Mapa de Carga</div><span className={`bg ${truck.status === "completed" ? "bg-g" : "bg-c"}`}>{truck.status === "completed" ? "Completo" : "En carga"}</span></div>
    <div className="pgrid" style={{ marginBottom: 20 }}>{Array.from({ length: truck.positions }, (_, i) => i + 1).map(pos => {
      const ld = truck.posData?.[pos]; return <div key={pos} className={`pc ${ld ? "ok" : ""}`} onClick={() => { if (truck.status === "completed") return; ld ? clear(pos) : sSel(pos); }}>
        <div className="pcn">{pos}</div>{ld && <div className="pcl">{ld}</div>}</div>;
    })}</div>
    {truck.status !== "completed" && <button className="btn btn-g btn-bl" onClick={finish} style={{ marginBottom: 16 }}><I.Check style={{ width: 20, height: 20 }} /> Terminar Carga</button>}
    <Modal open={sel !== null} onClose={() => sSel(null)} title={`Cargar Posición ${sel}`} sub="Seleccionar destino">
      {(truck.loadNames || []).map(ln => <button key={ln} className="lo" onClick={() => pick(ln)}>{ln}</button>)}
      {(!truck.loadNames || truck.loadNames.length === 0) && <div className="em"><p>Sin destinos</p></div>}
    </Modal>
  </div>;
}

// === CREATE TRUCK ===
function CreateTruck({ open, onClose }) {
  const { user } = useApp();
  const { sh, T } = useToast();
  const [r, sR] = useState(""); const [pos, sPos] = useState("32"); const [auto, sAuto] = useState(true);
  const [at, sAt] = useState(""); const [dt, sDt] = useState(""); const [lns, sLns] = useState([]); const [nln, sNln] = useState("");
  const addLn = () => { if (!nln.trim()) return; sLns([...lns, nln.trim().toUpperCase()]); sNln(""); };
  const rmLn = i => sLns(lns.filter((_, j) => j !== i));
  const create = async () => {
    if (!r.trim()) return;
    await FS.createTruck({ route: r.trim().toUpperCase(), positions: parseInt(pos) || 32, arrivalTime: auto ? now() : at, departureTime: dt || "", status: "pending", loadNames: [...lns], posData: {}, createdBy: user.id });
    sh("Camión creado"); sR(""); sPos("32"); sLns([]); sNln(""); onClose();
  };
  return <>{T}<Modal open={open} onClose={onClose} title="Nuevo Camión" sub="Configurar ruta y posiciones">
    <div className="field"><label>Ruta</label><input className="inp" placeholder="Ej: Madrid - Barcelona" value={r} onChange={x => sR(x.target.value)} /></div>
    <div className="field"><label>Nº Posiciones</label><input className="inp" type="number" value={pos} onChange={x => sPos(x.target.value)} /></div>
    <div className="field"><label>Hora de Llegada</label><div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {auto ? <div className="inp" style={{ background: "var(--abg)", borderColor: "var(--accent)", color: "var(--accent)", fontSize: 13, flex: 1 }}>Hora actual al crear</div> : <input className="inp" style={{ flex: 1 }} placeholder="HH:MM" value={at} onChange={x => sAt(x.target.value)} />}
      <button className={`btn btn-sm ${auto ? "btn-a" : "btn-o"}`} onClick={() => sAuto(!auto)}>{auto ? "Auto" : "Manual"}</button></div></div>
    <div className="field"><label>Hora Salida (Opcional)</label><input className="inp" placeholder="HH:MM" value={dt} onChange={x => sDt(x.target.value)} /></div>
    <div className="field"><label>Destinos de Carga</label><p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>Nombres rápidos para posiciones</p>
      {lns.map((l, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}><div className="inp" style={{ flex: 1, padding: "10px 14px", fontSize: 13 }}>{l}</div><button className="btn-ic" style={{ background: "var(--rbg)", border: "1px solid rgba(248,113,113,.12)", width: 34, height: 34 }} onClick={() => rmLn(i)}><I.X style={{ width: 14, height: 14, color: "var(--red)" }} /></button></div>)}
      <div style={{ display: "flex", gap: 8 }}><input className="inp" style={{ flex: 1 }} placeholder="Nombre destino" value={nln} onChange={x => sNln(x.target.value)} onKeyDown={x => x.key === "Enter" && addLn()} /><button className="btn btn-a btn-sm" onClick={addLn}><I.Plus style={{ width: 16, height: 16 }} /></button></div></div>
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button className="btn btn-o" style={{ flex: 1 }} onClick={onClose}>Cancelar</button><button className="btn btn-a" style={{ flex: 2 }} onClick={create}>Crear</button></div>
  </Modal></>;
}

// === GESTION ===
function Gestion() {
  const { user, trucks, users, assigns } = useApp();
  const { sh, T } = useToast(); const { ask, El } = useConfirm();
  const [crO, sCrO] = useState(false); const [vw, sVw] = useState(null);
  const myM = assigns.map(id => users.find(u => u.id === id)).filter(Boolean);
  const active = trucks.filter(t => t.status === "active" || t.status === "pending");
  const done = trucks.filter(t => t.status === "completed");

  const delT = (id, e) => { e.stopPropagation(); ask("Eliminar camión", "Se perderán todos los datos de carga.", async () => { await FS.deleteTruck(id); sh("Eliminado"); }); };
  const resetDay = () => {
    ask("Reiniciar jornada", "Se guardará el registro del día y se vaciarán todas las posiciones.", async () => {
      const entry = { date: todayShort(), time: now(), fullDate: todayFull(), trucks: trucks.map(t => ({ route: t.route, positions: t.positions, filled: tFill(t), pct: tPct(t), status: t.status, arrivalTime: t.arrivalTime, departureTime: t.departureTime, posData: { ...(t.posData || {}) }, loadNames: [...(t.loadNames || [])] })) };
      await FS.resetDay(trucks, entry); sh("Jornada guardada y reiniciada");
    }, "Guardar y Reiniciar", "var(--green)");
  };

  if (vw) { const t = trucks.find(x => x.id === vw); if (!t) { sVw(null); return null; } return <Detail truck={t} onBack={() => sVw(null)} />; }

  return <div className="page an" key="gestion">{T}{El}
    {user.role === "admin" && <><div className="sh"><div className="st"><I.Users /> Mis Carretilleros</div><span className="bg bg-p">{myM.length}</span></div>
      {myM.length === 0 ? <div className="em" style={{ padding: "20px 0 24px" }}><p>Sin carretilleros asignados</p></div> :
        <div style={{ marginBottom: 24 }}>{myM.map(u => <div key={u.id} className="ur"><div className="av" style={{ background: avBg(u.name) }}>{u.name[0]}</div><div className="uri"><div className="urn">{u.name}</div><div className="ure">{u.email}</div></div></div>)}</div>}</>}
    <div className="sh"><div className="st"><I.Clock /> Camiones Activos</div><span className="bg bg-a">{active.length}</span></div>
    {active.length === 0 ? <div className="em" style={{ padding: "20px 0 24px" }}><I.Truck /><p>Sin camiones activos</p></div> :
      <div style={{ marginBottom: 24 }}>{active.map(t => { const p2 = tPct(t); return <div key={t.id}><div className="tr" onClick={() => sVw(t.id)}><div className="tri"><I.Truck /></div><div className="trf"><div className="trn">{t.route}</div><div className="trs">{t.arrivalTime} · {tFill(t)}/{t.positions} pos</div></div><div className="trr"><span className={`bg ${t.status === "active" ? "bg-g" : "bg-a"}`}>{t.status === "active" ? "Activo" : "Pendiente"}</span><div className="trp" style={{ color: pCol(p2) }}>{p2}%</div></div></div>
        {user.role === "admin" && <div style={{ display: "flex", gap: 6, marginTop: 2, marginBottom: 10 }}><button className="btn btn-o btn-sm" style={{ flex: 1 }} onClick={() => sVw(t.id)}><I.Target style={{ width: 14, height: 14 }} /> Ver</button><button className="btn btn-r btn-sm" style={{ flex: 1 }} onClick={e => delT(t.id, e)}><I.Trash style={{ width: 14, height: 14 }} /> Eliminar</button></div>}</div>; })}</div>}
    {done.length > 0 && <><div className="sh"><div className="st"><I.Check /> Completados</div><span className="bg bg-g">{done.length}</span></div>
      <div style={{ marginBottom: 24 }}>{done.map(t => { const p2 = tPct(t); return <div key={t.id} className="tr" onClick={() => sVw(t.id)}><div className="tri dn"><I.Truck /></div><div className="trf"><div className="trn">{t.route}</div><div className="trs">Llegada: {t.arrivalTime} · Salida: {t.departureTime || "—"}</div></div><div className="trr"><span className="bg bg-g">Completo</span><div className="trp" style={{ color: "var(--green)" }}>{p2}%</div></div></div>; })}</div></>}
    {user.role === "admin" && <div className="reset-box"><div className="reset-title"><I.Refresh /> Reiniciar jornada</div><div className="reset-desc">Guarda el registro del día y vacía todas las posiciones sin eliminar camiones.</div><button className="btn btn-g btn-bl" onClick={resetDay}><I.Save style={{ width: 18, height: 18 }} /> Guardar Día y Reiniciar</button></div>}
    {user.role === "admin" && <><button className="fab" onClick={() => sCrO(true)}><I.Plus /></button><CreateTruck open={crO} onClose={() => sCrO(false)} /></>}
  </div>;
}

// === MOZO GESTION ===
function MozoG() {
  const { trucks } = useApp(); const [vw, sVw] = useState(null);
  const active = trucks.filter(t => t.status === "active" || t.status === "pending");
  const done = trucks.filter(t => t.status === "completed");
  if (vw) { const t = trucks.find(x => x.id === vw); if (!t) { sVw(null); return null; } return <Detail truck={t} onBack={() => sVw(null)} />; }
  return <div className="page an" key="mozog">
    <div className="sh"><div className="st"><I.Truck /> Camiones para Cargar</div><span className="bg bg-a">{active.length}</span></div>
    {active.length === 0 ? <div className="em"><I.Truck /><p>Sin camiones pendientes</p></div> :
      <div style={{ marginBottom: 24 }}>{active.map(t => { const p2 = tPct(t); return <div key={t.id} className="tr" onClick={() => sVw(t.id)}><div className="tri"><I.Truck /></div><div className="trf"><div className="trn">{t.route}</div><div className="trs">{tFill(t)}/{t.positions} pos</div></div><div className="trp" style={{ color: pCol(p2) }}>{p2}%</div></div>; })}</div>}
    {done.length > 0 && <><div className="sh"><div className="st"><I.Check /> Completados</div></div><div>{done.map(t => <div key={t.id} className="tr" onClick={() => sVw(t.id)}><div className="tri dn"><I.Truck /></div><div className="trf"><div className="trn">{t.route}</div><div className="trs">Salida: {t.departureTime || "—"}</div></div><span className="bg bg-g">Completo</span></div>)}</div></>}
  </div>;
}

// === MONITOR ===
function Monitor() {
  const { trucks } = useApp(); const [vw, sVw] = useState(null);
  const active = trucks.filter(t => t.status === "active" || t.status === "pending");
  if (vw) { const t = trucks.find(x => x.id === vw); if (!t) { sVw(null); return null; } return <Detail truck={t} onBack={() => sVw(null)} />; }
  return <div className="page an" key="monitor">
    <div className="sh"><div className="st"><I.Pulse /> Monitoreo en Tiempo Real</div><span className="bg bg-p">{active.length}</span></div>
    {active.length === 0 ? <div className="em"><I.Pulse /><p>Sin camiones activos</p></div> :
      <div className="mg">{active.map(t => { const p2 = tPct(t); return <div key={t.id} className="mc" onClick={() => sVw(t.id)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="tri" style={{ width: 32, height: 32, borderRadius: 9 }}><I.Truck style={{ width: 16, height: 16 }} /></div><span className={`bg ${t.status === "active" ? "bg-g" : "bg-a"}`} style={{ fontSize: 9 }}>{t.status === "active" ? "Activo" : "Pendiente"}</span></div>
        <div className="mcr">{t.route}</div><div className="mcs">{tFill(t)}/{t.positions} · {p2}%</div><div className="pb" style={{ marginTop: 10 }}><div className="pf" style={{ width: `${p2}%`, background: pCol(p2) }} /></div></div>; })}</div>}
  </div>;
}

// === ASSIGN ===
function CrUser({ open, onClose }) {
  const { sh, T } = useToast();
  const [n, sN] = useState(""); const [e, sE] = useState(""); const [p, sP] = useState("");
  const [loading, sLoading] = useState(false);
  const create = async () => {
    if (!n || !e || !p) return; if (p.length < 6) return;
    sLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, e.trim(), p);
      await FS.createUser(cred.user.uid, { name: n.trim(), email: e.trim(), role: "carretillero" });
      sh("Carretillero creado"); sN(""); sE(""); sP(""); onClose();
      // Note: creating user with admin's auth will sign out admin. 
      // For production, use Firebase Admin SDK or Cloud Function.
      // For now we re-sign in the admin after.
    } catch (err) { sh("Error: " + err.message); }
    sLoading(false);
  };
  return <>{T}<Modal open={open} onClose={onClose} title="Nuevo Carretillero" sub="Crear usuario mozo">
    <div className="field"><label>Nombre</label><input className="inp" placeholder="Nombre" value={n} onChange={x => sN(x.target.value)} /></div>
    <div className="field"><label>Email</label><input className="inp" type="email" placeholder="correo@ejemplo.com" value={e} onChange={x => sE(x.target.value)} /></div>
    <div className="field"><label>Contraseña</label><input className="inp" type="password" placeholder="Mínimo 6 caracteres" value={p} onChange={x => sP(x.target.value)} /></div>
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}><button className="btn btn-o" style={{ flex: 1 }} onClick={onClose}>Cancelar</button><button className="btn btn-a" style={{ flex: 2 }} onClick={create} disabled={loading}>{loading ? "Creando..." : "Crear"}</button></div>
  </Modal></>;
}

function Assign() {
  const { user, users, assigns } = useApp();
  const { sh, T } = useToast(); const { ask, El } = useConfirm();
  const [cuO, sCuO] = useState(false);
  const all = users.filter(u => u.role === "carretillero");

  const toggle = async (uid) => {
    const newAssigns = assigns.includes(uid) ? assigns.filter(x => x !== uid) : [...assigns, uid];
    await FS.setAssigns(user.id, newAssigns);
    sh(assigns.includes(uid) ? "Desasignado" : "Asignado");
  };
  const del = (uid) => {
    const u = users.find(x => x.id === uid);
    ask("Eliminar carretillero", `¿Eliminar a ${u?.name || "este usuario"}?`, async () => {
      await FS.deleteUser(uid); sh("Eliminado");
    });
  };

  return <div className="page an" key="assign">{T}{El}
    <div className="sh"><div className="st"><I.Users /> Todos los Carretilleros</div><span className="bg bg-p">{all.length}</span></div>
    {all.length === 0 ? <div className="em"><I.Users /><p>Sin carretilleros</p></div> :
      <div>{all.map(u => { const assigned = assigns.includes(u.id); return <div key={u.id} className="ur">
        <div className="av" style={{ background: avBg(u.name) }}>{u.name[0]}</div>
        <div className="uri"><div className="urn">{u.name}</div><div className="ure">{u.email}</div></div>
        <button className={`btn btn-sm ${assigned ? "btn-r" : "btn-a"}`} onClick={() => toggle(u.id)}>{assigned ? <I.UserMinus style={{ width: 15, height: 15 }} /> : <I.UserPlus style={{ width: 15, height: 15 }} />}</button>
        <button className="btn-ic" style={{ background: "var(--rbg)", border: "1px solid rgba(248,113,113,.1)", width: 34, height: 34 }} onClick={() => del(u.id)}><I.Trash style={{ width: 14, height: 14, color: "var(--red)" }} /></button>
      </div>; })}</div>}
    <button className="fab" onClick={() => sCuO(true)}><I.Plus /></button>
    <CrUser open={cuO} onClose={() => sCuO(false)} />
  </div>;
}

// === HISTORIAL ===
function Historial() {
  const { history } = useApp();
  const { ask, El } = useConfirm(); const { sh, T } = useToast();
  const [expanded, sExp] = useState(null);

  const delEntry = (id) => { ask("Eliminar registro", "¿Eliminar este registro del historial?", async () => { await FS.deleteHistory(id); sh("Eliminado"); }); };

  return <div className="page an" key="historial">{T}{El}
    <div className="sh"><div className="st"><I.History /> Historial de Jornadas</div><span className="bg bg-p">{history.length}</span></div>
    {history.length === 0 ? <div className="em"><I.History /><p>No hay registros guardados</p><p style={{ marginTop: 6, fontSize: 12 }}>Usa "Guardar Día y Reiniciar" en Gestión</p></div> :
      <div>{history.map((h, i) => {
        const totalPos = h.trucks.reduce((a, t) => a + t.positions, 0);
        const totalFilled = h.trucks.reduce((a, t) => a + t.filled, 0);
        const isOpen = expanded === i;
        return <div key={h.id || i} className="h-day" onClick={() => sExp(isOpen ? null : i)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><div className="h-date">{h.fullDate || h.date}</div><div className="h-time">Guardado a las {h.time}</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-ic" style={{ width: 30, height: 30, background: isOpen ? "var(--abg)" : "var(--bg-3)" }} onClick={e => { e.stopPropagation(); sExp(isOpen ? null : i); }}><I.Eye style={{ width: 14, height: 14, color: isOpen ? "var(--accent)" : "var(--t3)" }} /></button>
              <button className="btn-ic" style={{ width: 30, height: 30, background: "var(--rbg)", border: "1px solid rgba(248,113,113,.1)" }} onClick={e => { e.stopPropagation(); delEntry(h.id); }}><I.Trash style={{ width: 13, height: 13, color: "var(--red)" }} /></button>
            </div>
          </div>
          <div className="h-stats"><div className="h-stat"><I.Truck />{h.trucks.length} camiones</div><div className="h-stat"><I.Box />{totalFilled}/{totalPos} pos</div><div className="h-stat" style={{ color: "var(--green)" }}><I.Check />{totalPos > 0 ? Math.round((totalFilled / totalPos) * 100) : 0}%</div></div>
          {isOpen && <div className="h-trucks">{h.trucks.map((t, j) => <div key={j} className="h-truck">
            <div className="tri" style={{ width: 32, height: 32, borderRadius: 8, background: t.status === "completed" ? "var(--gbg2)" : "var(--abg)" }}><I.Truck style={{ width: 15, height: 15, color: t.status === "completed" ? "var(--green)" : "var(--accent)" }} /></div>
            <div className="h-truck-name">{t.route}</div>
            <span className={`bg ${t.status === "completed" ? "bg-g" : "bg-a"}`} style={{ fontSize: 9 }}>{t.status === "completed" ? "Completo" : t.status}</span>
            <div className="h-truck-pct" style={{ color: pCol(t.pct) }}>{t.pct}%</div>
          </div>)}</div>}
        </div>;
      })}</div>}
  </div>;
}

// === APP ===
export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading
  const [userData, setUserData] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [users, setUsers] = useState([]);
  const [assigns, setAssigns] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("home");

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { setAuthUser(u); if (!u) { setUserData(null); setTrucks([]); setUsers([]); setAssigns([]); setHistory([]); } });
  }, []);

  // Load user data from Firestore
  useEffect(() => {
    if (!authUser) return;
    FS.getUser(authUser.uid).then(u => {
      if (u) setUserData(u);
      else { // Auto-create user doc if missing (e.g. first admin)
        const fallback = { name: authUser.email?.split("@")[0] || "User", email: authUser.email, role: "carretillero" };
        FS.createUser(authUser.uid, fallback).then(() => setUserData({ id: authUser.uid, ...fallback }));
      }
    });
  }, [authUser]);

  // Real-time listeners
  useEffect(() => {
    if (!userData) return;
    const unsubs = [
      FS.onTrucks(setTrucks),
      FS.onUsers(setUsers),
      FS.onHistory(setHistory),
    ];
    if (userData.role === "admin") {
      unsubs.push(FS.onAssigns(userData.id, setAssigns));
    }
    return () => unsubs.forEach(u => u());
  }, [userData]);

  // Loading
  if (authUser === undefined) return <div className="loading-screen"><div className="spinner" /></div>;

  // Not logged in
  if (!authUser || !userData) return <Login />;

  const user = { ...userData, id: authUser.uid };
  const adm = user.role === "admin";
  const nav = adm
    ? [{ id: "home", l: "Inicio", ic: I.Home }, { id: "gestion", l: "Gestión", ic: I.Grid }, { id: "monitor", l: "Monitoreo", ic: I.Pulse }, { id: "historial", l: "Historial", ic: I.History }, { id: "assign", l: "Asignar", ic: I.Users }]
    : [{ id: "home", l: "Inicio", ic: I.Home }, { id: "gestion", l: "Camiones", ic: I.Grid }, { id: "monitor", l: "Monitoreo", ic: I.Pulse }];

  const pg = () => {
    switch (tab) {
      case "home": return <Home />;
      case "gestion": return adm ? <Gestion /> : <MozoG />;
      case "monitor": return <Monitor />;
      case "historial": return adm ? <Historial /> : null;
      case "assign": return adm ? <Assign /> : null;
      default: return <Home />;
    }
  };

  return <Ctx.Provider value={{ user, trucks, users, assigns, history }}>
    <div className="shell">
      <aside className="sb">
        <div className="sb-logo"><span>TruckLoader</span></div>
        <nav className="sb-nav">{nav.map(n => <button key={n.id} className={`si ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}><n.ic />{n.l}</button>)}</nav>
        <div className="sb-ft">
          <div className="sb-u"><div className="av" style={{ background: avBg(user.name), width: 32, height: 32, fontSize: 13 }}>{user.name[0]}</div><div><div className="sb-un">{user.name}</div><div className="sb-ur">{adm ? "Administrador" : "Carretillero"}</div></div></div>
          <button className="slo" onClick={() => signOut(auth)}><I.Logout /> Cerrar Sesión</button>
        </div>
      </aside>
      <div className="main">{pg()}</div>
      <nav className="bnav">{nav.map(n => <button key={n.id} className={`bni ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}><n.ic />{n.l}</button>)}</nav>
    </div>
  </Ctx.Provider>;
}
