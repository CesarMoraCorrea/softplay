import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle, Clock, CreditCard, AlertCircle, DollarSign, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../api/axios";
import { imageUrl } from "../../../utils/imageUrl";
import { timeStringToFloat, floatToTimeString, generarSlotsHorario, DEPORTE_ICONS } from "../utils/reservaHelpers";

/* ── DateTimeSelector mínimo (solo calendario, sin hora — la hora se elige aparte) ── */
function MiniCalendar({ value, onChange }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = new Date(); today.setHours(0,0,0,0);

  const days = useMemo(() => {
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth();
    const first = new Date(y, m, 1).getDay();
    const last = new Date(y, m+1, 0).getDate();
    const prev = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = first-1; i >= 0; i--) cells.push({ d: new Date(y,m-1,prev-i), cur: false });
    for (let i = 1; i <= last; i++) cells.push({ d: new Date(y,m,i), cur: true });
    while (cells.length < 42) cells.push({ d: new Date(y,m+1,cells.length-first-last+1), cur: false });
    return cells;
  }, [viewMonth]);

  const selDate = value ? value.split("T")[0] : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth()-1))} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft className="w-4 h-4"/></button>
        <span className="text-sm font-semibold text-gray-800 dark:text-white capitalize">{viewMonth.toLocaleDateString("es-AR",{month:"long",year:"numeric"})}</span>
        <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth()+1))} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight className="w-4 h-4"/></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["D","L","M","M","J","V","S"].map((d,i) => <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((cell, i) => {
          const isPast = cell.d < today;
          const iso = `${cell.d.getFullYear()}-${String(cell.d.getMonth()+1).padStart(2,"0")}-${String(cell.d.getDate()).padStart(2,"0")}`;
          const isSel = selDate === iso;
          const isToday = cell.d.getTime() === today.getTime();
          return (
            <button key={i} disabled={isPast || !cell.cur}
              onClick={() => onChange(iso)}
              className={`aspect-square rounded text-xs font-medium transition-all ${
                isPast || !cell.cur ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" :
                isSel ? "bg-blue-600 text-white shadow-md font-bold" :
                isToday ? "border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold" :
                "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20"
              }`}
            >{cell.d.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Sección con lock visual ── */
function Section({ num, title, locked, children }) {
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${locked ? "border-gray-200 dark:border-gray-700 opacity-60" : "border-blue-200 dark:border-blue-800 shadow-sm"}`}>
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${locked ? "bg-gray-200 dark:bg-gray-700 text-gray-500" : "bg-blue-600 text-white"}`}>{num}</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {locked && <Lock className="w-4 h-4 text-gray-400 ml-auto"/>}
      </div>
      {!locked && <div className="p-4">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function SedeReservaForm({ sede, onClose }) {
  const navigate = useNavigate();
  const isConfirmedRef = useRef(false);

  // ── Estado cascada ──
  const [deporte, setDeporte] = useState(null);
  const [escenario, setEscenario] = useState(null);
  const [horas, setHoras] = useState(1);
  const [dia, setDia] = useState("");           // "YYYY-MM-DD"
  const [horaInicio, setHoraInicio] = useState(""); // "HH:mm"
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [bloqueoId, setBloqueoId] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [creating, setCreating] = useState(null); // null | "pendiente" | "mercadopago"
  const [error, setError] = useState("");

  // ── Datos derivados ──
  const deportes = useMemo(() => [...new Set(
    (sede.escenarios || []).filter(e => e.activo !== false).map(e => e.tipoDeporte)
  )].sort(), [sede.escenarios]);

  const escenariosFiltrados = useMemo(() =>
    deporte ? (sede.escenarios || []).filter(e => e.activo !== false && e.tipoDeporte === deporte) : []
  , [sede.escenarios, deporte]);

  const canchaConfig = useMemo(() => escenario ? {
    configuracionHorarioSede: sede.configuracionHorario,
    usarHorarioPersonalizado: escenario.usarHorarioPersonalizado,
    configuracionHorario: escenario.configuracionHorario,
  } : null, [escenario, sede.configuracionHorario]);

  const total = (escenario?.precioPorHora || 0) * horas;
  const fechaCompleta = dia && horaInicio ? `${dia}T${horaInicio}` : dia ? `${dia}T00:00` : "";

  // ── Slots de hora ──
  const slotsData = useMemo(() =>
    (canchaConfig && dia) ? generarSlotsHorario(canchaConfig, `${dia}T00:00`) : { cerrado: false, slots: [] }
  , [canchaConfig, dia]);

  // ── Polling horas ocupadas ──
  useEffect(() => {
    if (!escenario || !dia) { setHorasOcupadas([]); return; }
    const escId = String(escenario._id);
    const fetch = async () => {
      try {
        const { data } = await api.get(`/reservas/ocupados/${escId}?fecha=${dia}&ignorarBloqueoId=${bloqueoId||""}`);
        setHorasOcupadas(data || []);
      } catch {}
    };
    fetch();
    const poll = setInterval(fetch, 3000);
    return () => clearInterval(poll);
  }, [escenario, dia, bloqueoId]);

  // ── Cleanup bloqueo al salir ──
  useEffect(() => {
    const cleanup = () => {
      if (bloqueoId && !isConfirmedRef.current) {
        const origin = window.location.origin.includes("localhost:5173") ? "http://localhost:5000/api" : "/api";
        const token = localStorage.getItem("token")?.replace(/['"]+/g, "");
        fetch(`${origin}/reservas/${bloqueoId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", cleanup);
    return () => { window.removeEventListener("beforeunload", cleanup); if (bloqueoId && !isConfirmedRef.current) cleanup(); };
  }, [bloqueoId]);

  // ── Handlers cascada ──
  const selectDeporte = (d) => {
    if (d === deporte) return;
    liberarBloqueo();
    setDeporte(d); setEscenario(null); setDia(""); setHoraInicio(""); setHorasOcupadas([]); setError("");
  };

  const selectEscenario = (e) => {
    if (e._id === escenario?._id) return;
    liberarBloqueo();
    setEscenario(e); setDia(""); setHoraInicio(""); setHorasOcupadas([]); setError("");
  };

  const selectDia = (d) => {
    liberarBloqueo();
    setDia(d); setHoraInicio(""); setError("");
  };

  const liberarBloqueo = async () => {
    if (bloqueoId && !isConfirmedRef.current) {
      try { await api.delete(`/reservas/${bloqueoId}`); } catch {}
      setBloqueoId(null);
    }
  };

  const selectHora = async (slot) => {
    setError("");
    const horaStr = floatToTimeString(slot);
    // Si ya tenía otro bloqueo, liberarlo
    if (bloqueoId) { try { await api.delete(`/reservas/${bloqueoId}`); } catch {} setBloqueoId(null); }
    try {
      const { data } = await api.post("/reservas/bloquear", {
        sedeId: String(sede._id),
        escenarioId: String(escenario._id),
        fecha: dia,
        horas: Number(horas),
        horaInicio: horaStr,
      });
      setBloqueoId(data?._id || data?.id);
      setHoraInicio(horaStr);
    } catch (e) {
      setError(e.response?.data?.message || "Esta hora acaba de ser tomada. Elige otra.");
    }
  };

  const changeDuracion = async (h) => {
    liberarBloqueo();
    setHoras(h); setHoraInicio(""); setError("");
  };

  const crearReserva = async (tipo) => {
    if (!bloqueoId) { setError("Selecciona una hora primero."); return; }
    setCreating(tipo); setError("");
    try {
      const { data: resp } = await api.patch(`/reservas/${bloqueoId}/estado`, {
        estadoPago: tipo === "pagado" ? "pagado" : "pendiente",
      });
      if (tipo === "mercadopago") {
        const { data: mp } = await api.post("/payments/intent", { reservaId: resp._id, paymentMethod: "mercadopago" });
        if (mp.init_point) { isConfirmedRef.current = true; setBloqueoId(null); window.location.href = mp.init_point; return; }
        throw new Error("No se pudo obtener link de MercadoPago.");
      }
      isConfirmedRef.current = true; setBloqueoId(null); setReserva(resp);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Error al crear la reserva.");
    } finally { setCreating(null); }
  };

  // ── Verificar choque de hora ──
  const isOcupado = (slot) => {
    const end = slot + horas;
    return horasOcupadas.some(o => {
      const s = timeStringToFloat(o.horaInicio), e = timeStringToFloat(o.horaFin);
      return slot < e && end > s;
    });
  };

  const isPastHour = (slot) => {
    if (!dia) return false;
    const now = new Date();
    const selDate = new Date(dia + "T00:00:00");
    const isToday = selDate.toDateString() === now.toDateString();
    if (!isToday) return false;
    const h = Math.floor(slot), m = Math.round((slot - h) * 60);
    return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
  };

  // ════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ════════════════════════════════════════════════
  if (reserva) {
    const pagado = reserva.estadoPago === "pagado";
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className={`rounded-2xl p-8 text-center border-2 ${pagado ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"}`}>
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${pagado ? "bg-green-100 dark:bg-green-900/40" : "bg-yellow-100 dark:bg-yellow-900/40"}`}>
              {pagado ? <CheckCircle className="w-12 h-12 text-green-600"/> : <Clock className="w-12 h-12 text-yellow-600"/>}
            </div>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${pagado ? "text-green-900 dark:text-green-200" : "text-yellow-900 dark:text-yellow-200"}`}>
            {pagado ? "¡Pago Exitoso!" : "¡Reserva Separada!"}
          </h2>
          <p className={`mb-6 text-sm ${pagado ? "text-green-700 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>
            {pagado ? "Tu pago fue procesado. Cancha garantizada ✓" : "Acércate a la sede para pagar en el momento."}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-left mb-6 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-1">🎟️ Ticket</p>
            <p className="font-mono font-bold text-gray-900 dark:text-white">{reserva._id?.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/reservas")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">Ver Mis Reservas</button>
            <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Otra Reserva</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // MAIN FORM
  // ════════════════════════════════════════════════
  const horaSelFlt = horaInicio ? timeStringToFloat(horaInicio) : null;
  const paso4Habilitado = !!bloqueoId && !!horaInicio;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{sede.nombre}</h2>
          {sede.ubicacion?.direccion && <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3"/>{sede.ubicacion.direccion}</p>}
        </div>
      </div>

      {/* ── PASO 1: Deporte ── */}
      <Section num={1} title="Elige tu deporte" locked={false}>
        <div className="flex flex-wrap gap-2">
          {deportes.map(d => (
            <button key={d} onClick={() => selectDeporte(d)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                deporte === d ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400"
              }`}>
              <span className="text-lg">{DEPORTE_ICONS[d] || "🏟️"}</span> {d}
            </button>
          ))}
        </div>
      </Section>

      {/* ── PASO 2: Escenario ── */}
      <Section num={2} title="Elige el escenario" locked={!deporte}>
        {deporte && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {escenariosFiltrados.map(esc => {
              const img = esc.imagenes?.[0] ? imageUrl(esc.imagenes[0]) : sede.imagenes?.[0] ? imageUrl(sede.imagenes[0]) : null;
              const sel = escenario?._id === esc._id;
              return (
                <button key={esc._id} onClick={() => selectEscenario(esc)}
                  className={`text-left rounded-xl border-2 overflow-hidden transition-all ${sel ? "border-blue-600 shadow-lg ring-2 ring-blue-300 dark:ring-blue-800" : "border-gray-200 dark:border-gray-700 hover:border-blue-300"}`}>
                  {img && <img src={img} alt={esc.nombre} className="w-full h-32 object-cover"/>}
                  {!img && <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-3xl">{DEPORTE_ICONS[esc.tipoDeporte] || "🏟️"}</div>}
                  <div className="p-3 bg-white dark:bg-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{esc.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{esc.superficie}</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">${esc.precioPorHora?.toLocaleString("es-AR")}/h</p>
                  </div>
                  {sel && <div className="bg-blue-600 text-white text-xs font-bold py-1 text-center">✓ Seleccionado</div>}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── PASO 3: Duración + Fecha + Hora ── */}
      <Section num={3} title="Selecciona duración, fecha y hora" locked={!escenario}>
        {escenario && (
          <div className="space-y-5">
            {/* Duración */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duración</p>
              <div className="flex flex-wrap gap-2">
                {[1, 1.5, 2, 3, 4].map(h => (
                  <button key={h} onClick={() => changeDuracion(h)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${horas === h ? "bg-blue-600 text-white shadow-md scale-105" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Calendario */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fecha</p>
              <MiniCalendar value={dia} onChange={selectDia} />
            </div>

            {/* Grid de horas */}
            {dia && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hora de inicio
                  {horasOcupadas.length > 0 && <span className="text-orange-500 font-normal text-xs ml-2">• Algunos horarios están ocupados</span>}
                </p>
                {slotsData.cerrado ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">La sede está cerrada este día</div>
                ) : slotsData.slots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">No hay horarios configurados</div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {slotsData.slots.map(slot => {
                      const ocupado = isOcupado(slot);
                      const pasado = isPastHour(slot);
                      const horaStr = floatToTimeString(slot);
                      const selHora = horaInicio === horaStr;
                      const disabled = ocupado || pasado;
                      return (
                        <button key={slot} disabled={disabled} onClick={() => !disabled && selectHora(slot)}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            ocupado ? "opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/20 text-red-400 line-through" :
                            pasado ? "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400" :
                            selHora ? "bg-blue-600 text-white shadow-lg scale-105" :
                            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          }`}>
                          {horaStr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── PASO 4: Confirmación ── */}
      <Section num={4} title="Confirma tu reserva" locked={!paso4Habilitado}>
        {paso4Habilitado && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sede", value: sede.nombre },
                { label: "Escenario", value: escenario?.nombre },
                { label: "Fecha", value: dia ? new Date(dia+"T00:00:00").toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"}) : "" },
                { label: "Horario", value: horaInicio ? `${horaInicio} → ${floatToTimeString(timeStringToFloat(horaInicio)+horas)}` : "" },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
                <DollarSign className="w-5 h-5"/>Total
              </div>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">${total.toLocaleString("es-AR")}</span>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button disabled={!!creating} onClick={() => crearReserva("pendiente")}
                className="py-3 rounded-xl font-bold text-sm bg-yellow-500 hover:bg-yellow-600 text-white transition-colors disabled:opacity-60">
                {creating === "pendiente" ? "Procesando..." : "Reservar (Pagar en sede)"}
              </button>
              <button disabled={!!creating} onClick={() => crearReserva("mercadopago")}
                className="py-3 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#009ee3" }}>
                <CreditCard className="w-4 h-4"/>
                {creating === "mercadopago" ? "Redirigiendo..." : "Pagar con MercadoPago"}
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
