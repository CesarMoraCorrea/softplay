import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, CreditCard, AlertCircle, DollarSign, MapPin } from "lucide-react";
import api from "../../../api/axios";
import { imageUrl } from "../../../utils/imageUrl";
import { timeStringToFloat, floatToTimeString, generarSlotsHorario, DEPORTE_ICONS } from "../utils/reservaHelpers";
import { MiniCalendar, Stepper, SelectionChip } from "./ReservaFormParts";

const STEPS = ["Deporte", "Escenario", "Fecha y Hora", "Confirmar"];

export default function SedeReservaForm({ sede, onClose }) {
  const navigate = useNavigate();
  const isConfirmedRef = useRef(false);
  const stepRef = useRef(null);

  const [step, setStep] = useState(0);
  const [deporte, setDeporte] = useState(null);
  const [escenario, setEscenario] = useState(null);
  const [horas, setHoras] = useState(1);
  const [dia, setDia] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [bloqueoId, setBloqueoId] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [creating, setCreating] = useState(null);
  const [error, setError] = useState("");

  const goTo = (s) => {
    setStep(s);
    setTimeout(() => stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const deportes = useMemo(() =>
    [...new Set((sede.escenarios||[]).filter(e=>e.activo!==false).map(e=>e.tipoDeporte))].sort()
  , [sede.escenarios]);

  const escenariosFiltrados = useMemo(() =>
    deporte ? (sede.escenarios||[]).filter(e=>e.activo!==false&&e.tipoDeporte===deporte) : []
  , [sede.escenarios, deporte]);

  const canchaConfig = useMemo(() => escenario ? {
    configuracionHorarioSede: sede.configuracionHorario,
    usarHorarioPersonalizado: escenario.usarHorarioPersonalizado,
    configuracionHorario: escenario.configuracionHorario,
  } : null, [escenario, sede.configuracionHorario]);

  const total = (escenario?.precioPorHora||0)*horas;

  const slotsData = useMemo(() =>
    (canchaConfig&&dia) ? generarSlotsHorario(canchaConfig,`${dia}T00:00`) : {cerrado:false,slots:[]}
  , [canchaConfig, dia]);

  useEffect(() => {
    if (!escenario||!dia) { setHorasOcupadas([]); return; }
    const id = String(escenario._id);
    const fn = async () => {
      try { const {data}=await api.get(`/reservas/ocupados/${id}?fecha=${dia}&ignorarBloqueoId=${bloqueoId||""}`); setHorasOcupadas(data||[]); } catch {}
    };
    fn(); const t=setInterval(fn,3000); return ()=>clearInterval(t);
  }, [escenario, dia, bloqueoId]);

  useEffect(() => {
    const cleanup = () => {
      if (bloqueoId&&!isConfirmedRef.current) {
        const base=(import.meta.env.VITE_API_URL||"/api");
        const tok=localStorage.getItem("token")?.replace(/['"]+/g,"");
        fetch(`${base}/reservas/${bloqueoId}`,{method:"DELETE",headers:{Authorization:`Bearer ${tok}`},keepalive:true}).catch(()=>{});
      }
    };
    window.addEventListener("beforeunload",cleanup);
    return ()=>{ window.removeEventListener("beforeunload",cleanup); if(bloqueoId&&!isConfirmedRef.current) cleanup(); };
  }, [bloqueoId]);

  const liberarBloqueo = async () => {
    if (bloqueoId&&!isConfirmedRef.current) { try{await api.delete(`/reservas/${bloqueoId}`);}catch{} setBloqueoId(null); }
  };

  const selDeporte = (d) => {
    liberarBloqueo(); setDeporte(d); setEscenario(null); setDia(""); setHoraInicio(""); setError("");
    setTimeout(()=>goTo(1),120);
  };

  const selEscenario = (e) => {
    liberarBloqueo(); setEscenario(e); setDia(""); setHoraInicio(""); setError("");
    setTimeout(()=>goTo(2),120);
  };

  const selDia = (d) => {
    liberarBloqueo(); setDia(d); setHoraInicio(""); setError("");
  };

  const selHora = async (slot) => {
    setError("");
    const horaStr=floatToTimeString(slot);
    if (bloqueoId) { try{await api.delete(`/reservas/${bloqueoId}`);}catch{} setBloqueoId(null); }
    try {
      const {data}=await api.post("/reservas/bloquear",{sedeId:String(sede._id),escenarioId:String(escenario._id),fecha:dia,horas:Number(horas),horaInicio:horaStr});
      setBloqueoId(data?._id||data?.id); setHoraInicio(horaStr);
      setTimeout(()=>goTo(3),200);
    } catch(e) { setError(e.response?.data?.message||"Esta hora ya fue tomada. Elige otra."); }
  };

  const changeDuracion = async (h) => { liberarBloqueo(); setHoras(h); setHoraInicio(""); setError(""); };

  const crearReserva = async (tipo) => {
    if (!bloqueoId) { setError("Selecciona una hora primero."); return; }
    setCreating(tipo); setError("");
    try {
      const {data:resp}=await api.patch(`/reservas/${bloqueoId}/estado`,{estadoPago:tipo==="mercadopago"?"pagado":"pendiente"});
      if (tipo==="mercadopago") {
        const {data:mp}=await api.post("/payments/intent",{reservaId:resp._id,paymentMethod:"mercadopago"});
        if (mp.init_point){isConfirmedRef.current=true;setBloqueoId(null);window.location.href=mp.init_point;return;}
        throw new Error("No se pudo obtener link de MercadoPago.");
      }
      isConfirmedRef.current=true; setBloqueoId(null); setReserva(resp);
    } catch(e) { setError(e.response?.data?.message||e.message||"Error al crear reserva."); }
    finally { setCreating(null); }
  };

  const isOcupado = (slot) => {
    const end=slot+horas;
    return horasOcupadas.some(o=>{ const s=timeStringToFloat(o.horaInicio),e=timeStringToFloat(o.horaFin); return slot<e&&end>s; });
  };

  const isPast = (slot) => {
    if (!dia) return false;
    const now=new Date(), sel=new Date(dia+"T00:00:00");
    if (sel.toDateString()!==now.toDateString()) return false;
    const h=Math.floor(slot),m=Math.round((slot-h)*60);
    return h<now.getHours()||(h===now.getHours()&&m<=now.getMinutes());
  };

  // SUCCESS
  if (reserva) {
    const paid=reserva.estadoPago==="pagado";
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className={`rounded-2xl p-8 text-center border-2 ${paid?"bg-green-50 dark:bg-green-900/20 border-green-200":"bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${paid?"bg-green-100":"bg-yellow-100"}`}>
            {paid?<CheckCircle className="w-8 h-8 text-green-600"/>:<Clock className="w-8 h-8 text-yellow-600"/>}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${paid?"text-green-900 dark:text-green-200":"text-yellow-900 dark:text-yellow-200"}`}>{paid?"¡Pago exitoso!":"¡Reserva separada!"}</h2>
          <p className={`text-sm mb-6 ${paid?"text-green-700":"text-yellow-800"}`}>{paid?"Tu cancha está garantizada ✓":"Paga en la sede el día de tu reserva."}</p>
          <p className="font-mono text-lg font-bold text-gray-900 dark:text-white mb-6">#{reserva._id?.slice(-8).toUpperCase()}</p>
          <div className="flex gap-3">
            <button onClick={()=>navigate("/reservas")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">Ver Mis Reservas</button>
            <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Otra Reserva</button>
          </div>
        </div>
      </div>
    );
  }

  const horaFin = horaInicio ? floatToTimeString(timeStringToFloat(horaInicio)+horas) : "";

  return (
    <div className="w-full" ref={stepRef}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={step>0?()=>goTo(step-1):onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{sede.nombre}</h1>
          {sede.ubicacion?.direccion&&<p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0"/>{sede.ubicacion.direccion}</p>}
        </div>
      </div>

      {/* Stepper */}
      <Stepper current={step} steps={STEPS}/>

      {/* Selection summary chips */}
      {(deporte||escenario||dia) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {deporte&&<SelectionChip icon={DEPORTE_ICONS[deporte]||"🏟️"} label={deporte} onEdit={()=>goTo(0)}/>}
          {escenario&&<SelectionChip label={escenario.nombre} onEdit={()=>goTo(1)}/>}
          {dia&&<SelectionChip label={new Date(dia+"T00:00:00").toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"})} onEdit={()=>goTo(2)}/>}
          {horaInicio&&<SelectionChip label={`${horaInicio} - ${horaFin} (${horas}h)`} onEdit={()=>{setHoraInicio("");setBloqueoId(null);goTo(2);}}/>}
        </div>
      )}

      {/* STEP 0 — Deporte */}
      {step===0&&(
        <div className="animate-fadeIn">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">¿Qué deporte quieres jugar?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {deportes.map(d=>(
              <button key={d} onClick={()=>selDeporte(d)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-semibold transition-all hover:scale-105 ${deporte===d?"bg-blue-600 text-white border-blue-600 shadow-lg":"bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md"}`}>
                <span className="text-3xl">{DEPORTE_ICONS[d]||"🏟️"}</span>
                <span className="text-sm">{d}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1 — Escenario */}
      {step===1&&(
        <div className="animate-fadeIn">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Elige el escenario para <span className="text-blue-600">{deporte}</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {escenariosFiltrados.map(esc=>{
              const img=esc.imagenes?.[0]?imageUrl(esc.imagenes[0]):sede.imagenes?.[0]?imageUrl(sede.imagenes[0]):null;
              const sel=escenario?._id===esc._id;
              return (
                <button key={esc._id} onClick={()=>selEscenario(esc)}
                  className={`text-left rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${sel?"border-blue-600 ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg":"border-gray-200 dark:border-gray-700"}`}>
                  {img?<img src={img} alt={esc.nombre} className="w-full h-36 object-cover"/>
                    :<div className="w-full h-28 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-4xl">{DEPORTE_ICONS[esc.tipoDeporte]||"🏟️"}</div>}
                  <div className="p-3 bg-white dark:bg-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">{esc.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{esc.superficie}</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">${esc.precioPorHora?.toLocaleString("es-AR")}<span className="text-xs font-normal text-gray-400">/h</span></p>
                  </div>
                  {sel&&<div className="bg-blue-600 text-white text-xs font-bold py-1.5 text-center">✓ Seleccionado</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2 — Fecha & Hora */}
      {step===2&&(
        <div className="animate-fadeIn">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Elige duración, fecha y hora</h2>
          {/* Duración */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Duración</p>
            <div className="flex flex-wrap gap-2">
              {[1,1.5,2,3,4].map(h=>(
                <button key={h} onClick={()=>changeDuracion(h)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${horas===h?"bg-blue-600 text-white shadow-md scale-105":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                  {h === 1 ? "1 hora" : h === 1.5 ? "1h 30m" : `${h} horas`}
                </button>
              ))}
            </div>
          </div>
          {/* Calendar + Slots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Fecha</p>
              <MiniCalendar value={dia} onChange={selDia}/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {dia?"Hora de inicio":"← Elige una fecha primero"}
                {dia&&horasOcupadas.length>0&&<span className="text-orange-500 font-normal text-xs ml-2">• Algunos horarios ocupados</span>}
              </p>
              {dia&&(
                slotsData.cerrado
                  ?<div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-500 border border-gray-200 dark:border-gray-700">Cerrado este día</div>
                  :slotsData.slots.length===0
                    ?<div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-500 border border-gray-200 dark:border-gray-700">Sin horarios configurados</div>
                    :<div className="grid grid-cols-4 gap-2">
                      {slotsData.slots.map(slot=>{
                        const oc=isOcupado(slot),past=isPast(slot),hs=floatToTimeString(slot),sel=horaInicio===hs,dis=oc||past;
                        return <button key={slot} disabled={dis} onClick={()=>!dis&&selHora(slot)}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            oc?"bg-red-50 dark:bg-red-900/20 text-red-300 dark:text-red-600 line-through cursor-not-allowed":
                            past?"bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed":
                            sel?"bg-blue-600 text-white shadow-lg scale-105":
                            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 hover:scale-105"
                          }`}>{hs}</button>;
                      })}
                    </div>
              )}
              {!dia&&<div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-sm">Selecciona una fecha para ver los horarios disponibles</div>}
            </div>
          </div>
          {error&&<div className="flex items-center gap-2 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0"/><p className="text-sm text-red-700 dark:text-red-300">{error}</p></div>}
        </div>
      )}

      {/* STEP 3 — Confirmar */}
      {step===3&&(
        <div className="animate-fadeIn max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">Confirma tu reserva</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
            {escenario?.imagenes?.[0]&&<img src={imageUrl(escenario.imagenes[0])} alt={escenario.nombre} className="w-full h-40 object-cover"/>}
            <div className="p-5 space-y-3">
              {[
                {label:"Sede",value:sede.nombre},
                {label:"Escenario",value:escenario?.nombre},
                {label:"Deporte",value:deporte},
                {label:"Fecha",value:dia?new Date(dia+"T00:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"}):""},
                {label:"Horario",value:horaInicio&&horaFin?`${horaInicio} → ${horaFin} (${horas}h)`:""},
              ].map(r=>(
                <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right ml-4">{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1"><DollarSign className="w-4 h-4 text-blue-500"/>Total</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
          {error&&<div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0"/><p className="text-sm text-red-700 dark:text-red-300">{error}</p></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button disabled={!!creating} onClick={()=>crearReserva("pendiente")}
              className="py-4 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors disabled:opacity-60 text-sm">
              {creating==="pendiente"?"Procesando...":"Reservar · Pagar en sede"}
            </button>
            <button disabled={!!creating} onClick={()=>crearReserva("mercadopago")}
              className="py-4 rounded-xl font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              style={{backgroundColor:"#009ee3"}}>
              <CreditCard className="w-4 h-4"/>
              {creating==="mercadopago"?"Redirigiendo...":"Pagar con MercadoPago"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
