import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, CreditCard, AlertCircle, DollarSign, MapPin } from "lucide-react";
import api from "../../../api/axios";
import { imageUrl } from "../../../utils/imageUrl";
import { timeStringToFloat, floatToTimeString, generarSlotsHorario, DEPORTE_ICONS } from "../utils/reservaHelpers";
import { MiniCalendar, Stepper, SelectionChip } from "./ReservaFormParts";

// Para el fetch keepalive de beforeunload, necesitamos URL absoluta.
// En producción VITE_API_URL es la URL completa del backend.
// En desarrollo, el proxy de Vite (/api → localhost:5000) no funciona con keepalive,
// así que usamos la URL directa del backend.
const KEEPALIVE_BASE = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith("http")
  ? import.meta.env.VITE_API_URL
  : import.meta.env.DEV
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;

const STEPS = ["Cancha", "Horario", "Confirmar"];

export default function SedeReservaForm({ sede, onClose }) {
  const navigate = useNavigate();
  const isConfirmedRef = useRef(false);
  const isBloqueandoRef = useRef(false); // guard anti-doble-click
  const topRef = useRef(null);

  const [step, setStep] = useState(0);
  const [deporte, setDeporte] = useState(null);
  const [escenario, setEscenario] = useState(null);
  const [horas, setHoras] = useState(1);
  const [dia, setDia] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [bloqueoId, setBloqueoId] = useState(null);
  // Ref en sinc con bloqueoId: permite que los cleanups lean el valor ACTUAL
  // sin quedar capturados en el closure del useEffect de registro inicial
  const bloqueoIdRef = useRef(null);
  const [reserva, setReserva] = useState(null);
  const [creating, setCreating] = useState(null);
  const [error, setError] = useState("");

  // Mantiene el ref siempre sincronizado con el estado
  useEffect(() => { bloqueoIdRef.current = bloqueoId; }, [bloqueoId]);

  const goTo = (s) => {
    setStep(s);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const deportes = useMemo(() =>
    [...new Set((sede.escenarios || []).filter(e => e.activo !== false).map(e => e.tipoDeporte))].sort()
  , [sede.escenarios]);

  const escenariosFiltrados = useMemo(() =>
    deporte ? (sede.escenarios || []).filter(e => e.activo !== false && e.tipoDeporte === deporte) : []
  , [sede.escenarios, deporte]);

  const canchaConfig = useMemo(() => escenario ? {
    configuracionHorarioSede: sede.configuracionHorario,
    usarHorarioPersonalizado: escenario.usarHorarioPersonalizado,
    configuracionHorario: escenario.configuracionHorario,
  } : null, [escenario, sede.configuracionHorario]);

  const total = (escenario?.precioPorHora || 0) * horas;
  const horaFin = horaInicio ? floatToTimeString(timeStringToFloat(horaInicio) + horas) : "";

  const slotsData = useMemo(() =>
    (canchaConfig && dia) ? generarSlotsHorario(canchaConfig, `${dia}T00:00`) : { cerrado: false, slots: [] }
  , [canchaConfig, dia]);

  /* ── Polling horas ocupadas ── */
  useEffect(() => {
    if (!escenario || !dia) { setHorasOcupadas([]); return; }
    const id = String(escenario._id);
    const fetch = async () => {
      try { const { data } = await api.get(`/reservas/ocupados/${id}?fecha=${dia}&ignorarBloqueoId=${bloqueoId || ""}`); setHorasOcupadas(data || []); } catch {}
    };
    fetch(); const t = setInterval(fetch, 3000); return () => clearInterval(t);
  }, [escenario, dia, bloqueoId]);

  /* ── Cleanup: registrado UNA VEZ, lee siempre el ref actual ── */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const id = bloqueoIdRef.current;
      if (id && !isConfirmedRef.current) {
        const tok = localStorage.getItem("token")?.replace(/['"]+/g, "");
        fetch(`${KEEPALIVE_BASE}/reservas/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok}` }, keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Desmontar: liberar bloqueo activo si lo hay
      const id = bloqueoIdRef.current;
      if (id && !isConfirmedRef.current) {
        api.delete(`/reservas/${id}`).catch(() => {});
      }
    };
  }, []); // deps vacíos: se registra una sola vez, usa ref para leer el valor actual

  // Libera el bloqueo activo - limpia ref INMEDIATAMENTE para evitar doble-delete
  const liberarBloqueo = async () => {
    const id = bloqueoIdRef.current;
    if (id && !isConfirmedRef.current) {
      bloqueoIdRef.current = null; // limpiar ref antes del await para evitar re-entrada
      setBloqueoId(null);
      try { await api.delete(`/reservas/${id}`); } catch {}
    }
  };

  /* ── Handlers ── */
  const selDeporte = async (d) => {
    if (d === deporte) return;
    await liberarBloqueo();
    setDeporte(d); setEscenario(null); setDia(""); setHoraInicio(""); setError("");
  };

  const selEscenario = async (e) => {
    await liberarBloqueo();
    setEscenario(e); setDia(""); setHoraInicio(""); setError("");
    setTimeout(() => goTo(1), 150);
  };

  const selDia = async (d) => {
    await liberarBloqueo();
    setDia(d); setHoraInicio(""); setError("");
  };

  const changeDuracion = async (h) => {
    await liberarBloqueo();
    setHoras(h); setHoraInicio(""); setError("");
  };

  const selHora = async (slot) => {
    if (isBloqueandoRef.current) return;
    isBloqueandoRef.current = true;
    setError("");
    const horaStr = floatToTimeString(slot);
    // Capturar y limpiar ref ANTES del await para que el cleanup no intente borrarlo de nuevo
    const prevId = bloqueoIdRef.current;
    if (prevId) {
      bloqueoIdRef.current = null;
      setBloqueoId(null);
      try { await api.delete(`/reservas/${prevId}`); } catch {}
    }
    try {
      const { data } = await api.post("/reservas/bloquear", {
        sedeId: String(sede._id),
        escenarioId: String(escenario._id),
        fecha: dia,
        horas: Number(horas),
        horaInicio: horaStr,
      });
      const newId = data?._id || data?.id;
      bloqueoIdRef.current = newId;
      setBloqueoId(newId);
      setHoraInicio(horaStr);
      setTimeout(() => goTo(2), 200);
    } catch (e) {
      setError(e.response?.data?.message || "Esta hora ya fue tomada. Elige otra.");
    } finally {
      isBloqueandoRef.current = false;
    }
  };

  const crearReserva = async (tipo) => {
    if (!bloqueoId) { setError("Selecciona una hora primero."); return; }
    setCreating(tipo); setError("");
    try {
      const { data: resp } = await api.patch(`/reservas/${bloqueoId}/estado`, { estadoPago: tipo === "mercadopago" ? "pagado" : "pendiente" });
      if (tipo === "mercadopago") {
        const { data: mp } = await api.post("/payments/intent", { reservaId: resp._id, paymentMethod: "mercadopago" });
        if (mp.init_point) { isConfirmedRef.current = true; setBloqueoId(null); window.location.href = mp.init_point; return; }
        throw new Error("No se pudo obtener link de MercadoPago.");
      }
      isConfirmedRef.current = true; setBloqueoId(null); setReserva(resp);
    } catch (e) { setError(e.response?.data?.message || e.message || "Error al crear reserva."); }
    finally { setCreating(null); }
  };

  const isOcupado = (slot) => {
    const end = slot + horas;
    return horasOcupadas.some(o => { const s = timeStringToFloat(o.horaInicio), e = timeStringToFloat(o.horaFin); return slot < e && end > s; });
  };

  const isPast = (slot) => {
    if (!dia) return false;
    const now = new Date(), sel = new Date(dia + "T00:00:00");
    if (sel.toDateString() !== now.toDateString()) return false;
    const h = Math.floor(slot), m = Math.round((slot - h) * 60);
    return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
  };

  /* ── SUCCESS ── */
  if (reserva) {
    const paid = reserva.estadoPago === "pagado";
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className={`rounded-2xl p-8 text-center border-2 ${paid ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${paid ? "bg-green-100 dark:bg-green-900/40" : "bg-yellow-100 dark:bg-yellow-900/40"}`}>
            {paid ? <CheckCircle className="w-8 h-8 text-green-600" /> : <Clock className="w-8 h-8 text-yellow-600" />}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${paid ? "text-green-900 dark:text-green-200" : "text-yellow-900 dark:text-yellow-200"}`}>{paid ? "¡Pago exitoso!" : "¡Reserva separada!"}</h2>
          <p className={`text-sm mb-4 ${paid ? "text-green-700 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>{paid ? "Tu cancha está garantizada ✓" : "Paga en la sede el día de tu reserva."}</p>
          <p className="font-mono text-lg font-bold text-gray-900 dark:text-white mb-6">#{reserva._id?.slice(-8).toUpperCase()}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate("/reservas")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">Ver Mis Reservas</button>
            <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Otra Reserva</button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="w-full" ref={topRef}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={step > 0 ? () => goTo(step - 1) : onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{sede.nombre}</h1>
          {sede.ubicacion?.direccion && <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{sede.ubicacion.direccion}</p>}
        </div>
      </div>

      <Stepper current={step} steps={STEPS} />

      {/* Selection chips */}
      {(deporte || escenario || dia) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {deporte && <SelectionChip icon={DEPORTE_ICONS[deporte] || "🏟️"} label={deporte} onEdit={() => goTo(0)} />}
          {escenario && <SelectionChip label={escenario.nombre} onEdit={() => goTo(0)} />}
          {dia && <SelectionChip label={new Date(dia + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })} onEdit={() => { setDia(""); setHoraInicio(""); liberarBloqueo(); goTo(1); }} />}
          {horaInicio && <SelectionChip label={`${horaInicio} – ${horaFin} (${horas}h)`} onEdit={() => { setHoraInicio(""); liberarBloqueo(); goTo(1); }} />}
        </div>
      )}

      {/* ══ PASO 0: Cancha (Deporte + Escenario en la misma pantalla) ══ */}
      {step === 0 && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            {/* Columna izquierda: deportes */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Deporte</p>
              <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                {deportes.map(d => (
                  <button key={d} onClick={() => selDeporte(d)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${deporte === d
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}>
                    <span className="text-xl">{DEPORTE_ICONS[d] || "🏟️"}</span>{d}
                  </button>
                ))}
              </div>
            </div>

            {/* Columna derecha: escenarios filtrados */}
            <div>
              {!deporte ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 gap-2">
                  <span className="text-3xl">👈</span>
                  <p className="text-sm font-medium">Selecciona un deporte para ver los escenarios</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Escenarios disponibles · {deporte}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {escenariosFiltrados.map(esc => {
                      const img = esc.imagenes?.[0] ? imageUrl(esc.imagenes[0]) : sede.imagenes?.[0] ? imageUrl(sede.imagenes[0]) : null;
                      return (
                        <button key={esc._id} onClick={() => selEscenario(esc)}
                          className="text-left rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl border-gray-200 dark:border-gray-700 hover:border-blue-500 group bg-white dark:bg-gray-800">
                          {img
                            ? <img src={img} alt={esc.nombre} className="w-full h-36 object-cover group-hover:brightness-105 transition-all" />
                            : <div className="w-full h-28 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-4xl">{DEPORTE_ICONS[esc.tipoDeporte] || "🏟️"}</div>}
                          <div className="p-3">
                            <p className="font-bold text-gray-900 dark:text-white">{esc.nombre}</p>
                            <p className="text-xs text-gray-400 mb-1">{esc.superficie}</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">${esc.precioPorHora?.toLocaleString("es-AR")}<span className="text-xs font-normal text-gray-400">/h</span></p>
                          </div>
                          <div className="bg-blue-600 text-white text-xs font-bold py-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            Reservar este escenario →
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ PASO 1: Horario (Duración + Fecha + Horas) ══ */}
      {step === 1 && (
        <div className="animate-fadeIn">
          {/* Duración */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Duración</p>
            <div className="flex flex-wrap gap-2">
              {[1, 1.5, 2, 3, 4].map(h => (
                <button key={h} onClick={() => changeDuracion(h)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${horas === h
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40 scale-105"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}>
                  {h === 1 ? "1 hora" : h === 1.5 ? "1h 30min" : `${h} horas`}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha + Horas en grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendario */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Fecha</p>
              <MiniCalendar value={dia} onChange={selDia} />
            </div>

            {/* Horas disponibles */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                Hora de inicio
                {dia && horasOcupadas.length > 0 && <span className="text-orange-400 font-normal normal-case ml-2 tracking-normal">• Algunos horarios ocupados</span>}
              </p>
              {!dia ? (
                <div className="flex flex-col items-center justify-center h-52 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 gap-2">
                  <span className="text-3xl">📅</span>
                  <p className="text-sm">Elige una fecha para ver los horarios</p>
                </div>
              ) : slotsData.cerrado ? (
                <div className="flex items-center justify-center h-40 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500">Sede cerrada este día</div>
              ) : slotsData.slots.length === 0 ? (
                <div className="flex items-center justify-center h-40 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500">Sin horarios configurados</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsData.slots.map(slot => {
                    const oc = isOcupado(slot), past = isPast(slot), hs = floatToTimeString(slot), dis = oc || past;
                    return (
                      <button key={slot} disabled={dis} onClick={() => !dis && selHora(slot)}
                        className={`py-3 rounded-xl text-sm font-semibold transition-all ${oc
                          ? "bg-red-50 dark:bg-red-900/10 text-red-300 dark:text-red-700 line-through cursor-not-allowed text-xs"
                          : past ? "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 hover:shadow-md"
                        }`}>{hs}</button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ══ PASO 2: Confirmar ══ */}
      {step === 2 && (
        <div className="animate-fadeIn max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5 shadow-sm">
            {(escenario?.imagenes?.[0] || sede.imagenes?.[0]) && (
              <img src={imageUrl(escenario?.imagenes?.[0] || sede.imagenes?.[0])} alt={escenario?.nombre} className="w-full h-44 object-cover" />
            )}
            <div className="p-5 space-y-2.5">
              {[
                { label: "Sede", value: sede.nombre },
                { label: "Cancha", value: escenario?.nombre },
                { label: "Deporte", value: deporte },
                { label: "Fecha", value: dia ? new Date(dia + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "" },
                { label: "Horario", value: horaInicio && horaFin ? `${horaInicio} → ${horaFin}` : "" },
                { label: "Duración", value: horas === 1 ? "1 hora" : horas === 1.5 ? "1h 30min" : `${horas} horas` },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right ml-4 capitalize">{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-blue-500" />Total a pagar</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button disabled={!!creating} onClick={() => crearReserva("pendiente")}
              className="py-4 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors disabled:opacity-60 text-sm">
              {creating === "pendiente" ? "Procesando..." : "Reservar · Pagar en sede"}
            </button>
            <button disabled={!!creating} onClick={() => crearReserva("mercadopago")}
              className="py-4 rounded-xl font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              style={{ backgroundColor: "#009ee3" }}>
              <CreditCard className="w-4 h-4" />
              {creating === "mercadopago" ? "Redirigiendo..." : "Pagar con MercadoPago"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
