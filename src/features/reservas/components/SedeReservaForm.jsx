import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, CreditCard, AlertCircle, DollarSign, MapPin, Loader2, X } from "lucide-react";
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
  const bloqueoIdRef = useRef(null);
  const [loadingSlot, setLoadingSlot] = useState(null); // slot con spinner activo
  const [reserva, setReserva] = useState(null);
  const [creating, setCreating] = useState(null);
  const [error, setError] = useState("");
  const [mpWaiting, setMpWaiting] = useState(false); // modal espera MP
  const [mpReservaId, setMpReservaId] = useState(null);
  const mpPollRef = useRef(null); // interval del polling

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

  // Libera bloqueo anterior (fire-and-forget: no bloquea la UI)
  const liberarBloqueo = () => {
    const id = bloqueoIdRef.current;
    if (id && !isConfirmedRef.current) {
      bloqueoIdRef.current = null;
      setBloqueoId(null);
      api.delete(`/reservas/${id}`).catch(() => {}); // no esperamos, es limpieza
    }
  };

  /* ── Handlers ── */
  const selDeporte = (d) => {
    if (d === deporte) return;
    liberarBloqueo();
    setDeporte(d); setEscenario(null); setDia(""); setHoraInicio(""); setError("");
  };

  const selEscenario = (e) => {
    liberarBloqueo();
    setEscenario(e); setDia(""); setHoraInicio(""); setError("");
    setTimeout(() => goTo(1), 150);
  };

  const selDia = (d) => {
    liberarBloqueo();
    setDia(d); setHoraInicio(""); setError("");
  };

  const changeDuracion = (h) => {
    liberarBloqueo();
    setHoras(h); setHoraInicio(""); setError("");
  };

  const selHora = async (slot) => {
    if (isBloqueandoRef.current) return;
    isBloqueandoRef.current = true;
    setError("");
    setLoadingSlot(slot); // feedback visual inmediato
    const horaStr = floatToTimeString(slot);

    // Capturar y limpiar ref ANTES de la petición
    const prevId = bloqueoIdRef.current;
    bloqueoIdRef.current = null;
    setBloqueoId(null);

    try {
      // DELETE del anterior y POST del nuevo en PARALELO—reduce latencia a 1 RTT
      const deletePromise = prevId
        ? api.delete(`/reservas/${prevId}`).catch(() => {})
        : Promise.resolve();

      const [, { data }] = await Promise.all([
        deletePromise,
        api.post("/reservas/bloquear", {
          sedeId: String(sede._id),
          escenarioId: String(escenario._id),
          fecha: dia,
          horas: Number(horas),
          horaInicio: horaStr,
        }),
      ]);

      const newId = data?._id || data?.id;
      bloqueoIdRef.current = newId;
      setBloqueoId(newId);
      setHoraInicio(horaStr);
      setTimeout(() => goTo(2), 150);
    } catch (e) {
      setError(e.response?.data?.message || "Esta hora ya fue tomada. Elige otra.");
    } finally {
      isBloqueandoRef.current = false;
      setLoadingSlot(null);
    }
  };

  const crearReserva = async (tipo) => {
    if (!bloqueoId) { setError("Selecciona una hora primero."); return; }
    setCreating(tipo); setError("");
    try {
      const { data: resp } = await api.patch(`/reservas/${bloqueoId}/estado`, { estadoPago: tipo === "mercadopago" ? "processing" : "pendiente" });
      if (tipo === "mercadopago") {
        const { data: mp } = await api.post("/payments/intent", { reservaId: resp._id, paymentMethod: "mercadopago" });
        const checkoutUrl = mp.sandbox_init_point || mp.init_point;
        if (!checkoutUrl) throw new Error("No se pudo obtener link de MercadoPago.");

        // Abrir MP en ventana nueva y empezar polling
        isConfirmedRef.current = true;
        setBloqueoId(null);
        setMpReservaId(resp._id);
        setMpWaiting(true);
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");

        // Polling cada 3 s hasta confirmar pago
        mpPollRef.current = setInterval(async () => {
          try {
            const { data: status } = await api.get(`/payments/mercadopago/status/${resp._id}`);
            if (status.estadoPago === "pagado") {
              clearInterval(mpPollRef.current);
              setMpWaiting(false);
              setReserva(status);
            }
          } catch {}
        }, 3000);
        return;
      }
      isConfirmedRef.current = true; setBloqueoId(null); setReserva(resp);
    } catch (e) { setError(e.response?.data?.message || e.message || "Error al crear reserva."); }
    finally { setCreating(null); }
  };

  // Limpiar el polling al desmontar
  useEffect(() => () => { if (mpPollRef.current) clearInterval(mpPollRef.current); }, []);

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

  /* ── MODAL ESPERA MERCADOPAGO ── */
  if (mpWaiting) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="rounded-2xl p-8 text-center border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-2">Esperando confirmación de pago</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
            Se abrió la ventana de MercadoPago. Completa el pago allí y esta pantalla se actualizará automáticamente.
          </p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-6">
            Si la ventana no se abrió,{" "}
            <button
              className="underline font-semibold"
              onClick={async () => {
                try {
                  const { data: mp } = await api.get(`/payments/mercadopago/status/${mpReservaId}`);
                  const { data: pref } = await api.post("/payments/intent", { reservaId: mpReservaId, paymentMethod: "mercadopago" });
                  const url = pref.sandbox_init_point || pref.init_point;
                  if (url) window.open(url, "_blank", "noopener,noreferrer");
                } catch {}
              }}
            >
              haz clic aquí para abrirla de nuevo
            </button>
            .
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/reservas")}
              className="flex-1 py-3 border-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              Ver mis reservas
            </button>
            <button
              onClick={() => {
                if (mpPollRef.current) clearInterval(mpPollRef.current);
                setMpWaiting(false);
                setMpReservaId(null);
                isConfirmedRef.current = false;
              }}
              className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SUCCESS ── */
  if (reserva) {
    const paid = reserva.estadoPago === "pagado";
    const fechaStr = reserva.fecha
      ? new Date(String(reserva.fecha).slice(0, 10) + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : null;
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className={`rounded-2xl p-8 text-center border-2 ${paid ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${paid ? "bg-green-100 dark:bg-green-900/40" : "bg-yellow-100 dark:bg-yellow-900/40"}`}>
            {paid ? <CheckCircle className="w-10 h-10 text-green-600" /> : <Clock className="w-10 h-10 text-yellow-600" />}
          </div>
          <h2 className={`text-2xl font-bold mb-1 ${paid ? "text-green-900 dark:text-green-200" : "text-yellow-900 dark:text-yellow-200"}`}>
            {paid ? "¡Reserva y pago confirmados!" : "¡Reserva separada!"}
          </h2>
          <p className={`text-sm mb-5 ${paid ? "text-green-700 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>
            {paid ? "Tu cancha está garantizada. ¡Nos vemos en la cancha!" : "Paga en la sede el día de tu reserva."}
          </p>

          {/* Detalles de la reserva */}
          <div className={`rounded-xl p-4 mb-5 text-left space-y-2 ${paid ? "bg-green-100/60 dark:bg-green-900/30" : "bg-yellow-100/60 dark:bg-yellow-900/30"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Detalle de tu reserva</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">N° Reserva</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">#{(reserva.reservaId || reserva._id)?.slice(-8).toUpperCase()}</span>
            </div>
            {fechaStr && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Fecha</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">{fechaStr}</span>
              </div>
            )}
            {reserva.horaInicio && reserva.horaFin && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Horario</span>
                <span className="font-semibold text-gray-900 dark:text-white">{reserva.horaInicio} – {reserva.horaFin}</span>
              </div>
            )}
            {reserva.total && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total pagado</span>
                <span className="font-bold text-gray-900 dark:text-white">${Number(reserva.total).toLocaleString("es-CO")}</span>
              </div>
            )}
            {paid && reserva.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Operación MP</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">#{reserva.transactionId}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/reservas")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
              Ver Mis Reservas
            </button>
            <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Otra Reserva
            </button>
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
            <div className="relative">
              <div className="sticky top-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 pl-1">Deporte</p>
                <div className="flex flex-row lg:flex-col gap-3 flex-wrap">
                  {deportes.map(d => (
                    <button key={d} onClick={() => selDeporte(d)}
                      className={`group relative flex items-center gap-3 px-5 py-4 rounded-[1.25rem] font-semibold text-sm transition-all duration-300 overflow-hidden ${deporte === d
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-white/60 dark:border-white/10 hover:border-blue-400/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1"
                      }`}>
                      {deporte === d && <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 translate-x-[-150%] group-hover:animate-shine" />}
                      <span className="text-2xl drop-shadow-sm">{DEPORTE_ICONS[d] || "🏟️"}</span>
                      <span className="tracking-wide">{d}</span>
                    </button>
                  ))}
                </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {escenariosFiltrados.map(esc => {
                      const img = esc.imagenes?.[0] ? imageUrl(esc.imagenes[0]) : sede.imagenes?.[0] ? imageUrl(sede.imagenes[0]) : null;
                      return (
                        <button key={esc._id} onClick={() => selEscenario(esc)}
                          className="text-left rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-white/60 dark:border-white/10 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl relative flex flex-col h-full">
                          <div className="relative w-full h-40 overflow-hidden">
                            {img
                              ? <img src={img} alt={esc.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                              : <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">{DEPORTE_ICONS[esc.tipoDeporte] || "🏟️"}</div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between relative z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-lg tracking-tight mb-1">{esc.nombre}</p>
                              <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg text-xs font-medium mb-3">{esc.superficie}</span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Precio</p>
                                <p className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">${esc.precioPorHora?.toLocaleString("es-AR")}<span className="text-xs font-medium text-gray-400 ml-1">/h</span></p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex items-center justify-center gap-2 shadow-lg">
                            Reservar escenario <ArrowRight className="w-4 h-4" />
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
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 pl-1">Duración de la reserva</p>
            <div className="flex flex-wrap gap-3">
              {[1, 1.5, 2, 3, 4].map(h => (
                <button key={h} onClick={() => changeDuracion(h)}
                  className={`relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${horas === h
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-white/60 dark:border-white/10 hover:border-blue-400/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:-translate-y-1"
                  }`}>
                  {horas === h && <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 translate-x-[-150%] animate-shine" />}
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slotsData.slots.map(slot => {
                    const oc = isOcupado(slot), past = isPast(slot), hs = floatToTimeString(slot);
                    const isLoading = loadingSlot === slot;
                    const dis = oc || past || (loadingSlot !== null && !isLoading);
                    return (
                      <button key={slot} disabled={dis || isLoading} onClick={() => selHora(slot)}
                        className={`group relative py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                          isLoading ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 shadow-xl shadow-blue-500/30 cursor-wait" :
                          oc ? "bg-red-50/50 dark:bg-red-900/10 text-red-300 dark:text-red-700/50 line-through cursor-not-allowed opacity-70" :
                          past ? "bg-gray-50/50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50" :
                          dis ? "opacity-40 cursor-not-allowed bg-white/60 dark:bg-gray-800/60 border border-white/60 dark:border-gray-700 text-gray-400" :
                          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                        }`}>
                        {isLoading
                          ? <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                            </span>
                          : hs}
                      </button>
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
        <div className="animate-fadeIn max-w-lg mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-20"></div>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-gray-800 overflow-hidden mb-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            {(escenario?.imagenes?.[0] || sede.imagenes?.[0]) && (
              <div className="relative h-48 w-full p-4 pb-0">
                <img src={imageUrl(escenario?.imagenes?.[0] || sede.imagenes?.[0])} alt={escenario?.nombre} className="w-full h-full object-cover rounded-2xl shadow-inner" />
              </div>
            )}
            <div className="p-8 pt-6 space-y-4">
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Resumen de reserva</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{escenario?.nombre}</h3>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5"/> {sede?.nombre}</p>
              </div>

              <div className="space-y-3 p-5 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                {[
                  { label: "Deporte", value: deporte || "No especificado" },
                  { label: "Fecha", value: dia ? new Date(dia + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "" },
                  { label: "Horario", value: horaInicio && horaFin ? `${horaInicio} → ${horaFin}` : "" },
                  { label: "Duración", value: horas === 1 ? "1 hora" : horas === 1.5 ? "1h 30min" : `${horas} horas` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{r.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize text-right">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs">Total a pagar</span>
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button disabled={!!creating} onClick={() => crearReserva("pendiente")}
              className="group relative overflow-hidden py-4 rounded-2xl font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 transition-all shadow-xl disabled:opacity-60 text-sm hover:-translate-y-0.5">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {creating === "pendiente" ? "Procesando..." : "Reservar · Pagar en sede"}
              </span>
            </button>
            <button disabled={!!creating} onClick={() => crearReserva("mercadopago")}
              className="group relative overflow-hidden py-4 rounded-2xl font-bold text-white transition-all shadow-xl disabled:opacity-60 flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 shadow-blue-500/20"
              style={{ backgroundColor: "#009ee3" }}>
              <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 translate-x-[-150%] group-hover:animate-shine" />
              <CreditCard className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{creating === "mercadopago" ? "Redirigiendo..." : "Pagar con MercadoPago"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
