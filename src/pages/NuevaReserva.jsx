import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, CreditCard, AlertCircle, DollarSign, MapPin, ArrowRight } from "lucide-react";
import api from "../api/axios";
import { imageUrl } from "../utils/imageUrl";
import { timeStringToFloat, floatToTimeString, generarSlotsHorario, DEPORTE_ICONS } from "../features/reservas/utils/reservaHelpers";
import { MiniCalendar, Stepper, SelectionChip } from "../features/reservas/components/ReservaFormParts";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-6bcf8da9-9b71-484a-b133-b4666f3de6a6', { locale: 'es-CO' });

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const KEEPALIVE_BASE = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith("http")
  ? import.meta.env.VITE_API_URL
  : import.meta.env.DEV
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;

const STEPS = ["Horario", "Confirmar"];

export default function NuevaReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isConfirmedRef = useRef(false);
  const isBloqueandoRef = useRef(false);
  const topRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sede, setSede] = useState(null);
  const [cancha, setCancha] = useState(location?.state?.cancha || null);

  const [step, setStep] = useState(0);
  const [horas, setHoras] = useState(1);
  const [dia, setDia] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  
  const [bloqueoId, setBloqueoId] = useState(null);
  const bloqueoIdRef = useRef(null);
  const [loadingSlot, setLoadingSlot] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [creating, setCreating] = useState(null);
  const [mpPreferenceId, setMpPreferenceId] = useState(null);

  useEffect(() => { bloqueoIdRef.current = bloqueoId; }, [bloqueoId]);

  const goTo = (s) => {
    setStep(s);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
      if (typeof value.$oid === "string") return value.$oid.trim();
      if (typeof value.toString === "function") {
        const parsed = value.toString();
        return parsed && parsed !== "[object Object]" ? parsed.trim() : "";
      }
    }
    return "";
  };

  // Fetch Escenario and Sede on mount
  useEffect(() => {
    const fetchCancha = async () => {
      try {
        setLoading(true);
        const safeId = normalizeId(id);

        const stateCancha = location?.state?.cancha || null;
        const stateCanchaId = normalizeId(stateCancha?.escenarioId) || normalizeId(stateCancha?._id);
        
        let fetchedCancha = stateCancha;

        if (!(stateCancha && stateCanchaId && stateCanchaId === safeId)) {
          if (!safeId || safeId === "undefined" || safeId === "null" || safeId === "[object Object]") {
            throw new Error("Escenario inválido.");
          }
          try {
            const { data } = await api.get(`/sedes/escenarios/${encodeURIComponent(safeId)}`);
            fetchedCancha = data;
          } catch (primaryError) {
            const { data: escenarios } = await api.get(`/sedes?view=escenarios`);
            const found = Array.isArray(escenarios) && escenarios.find((item) => {
              const currentId = normalizeId(item?.escenarioId) || normalizeId(item?._id);
              return currentId === safeId;
            });
            if (found) fetchedCancha = found;
            else throw primaryError;
          }
        }

        setCancha(fetchedCancha);
        if (fetchedCancha?.sedeId) {
          const sedeRes = await api.get(`/sedes/${fetchedCancha.sedeId}`);
          setSede(sedeRes.data);
        }
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error al cargar la información de la cancha");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCancha();
  }, [id, location?.state]);

  const canchaConfig = useMemo(() => cancha && sede ? {
    configuracionHorarioSede: sede.configuracionHorario,
    usarHorarioPersonalizado: cancha.usarHorarioPersonalizado,
    configuracionHorario: cancha.configuracionHorario,
  } : null, [cancha, sede]);

  const total = (cancha?.precioHora || cancha?.precioPorHora || 0) * horas;
  const horaFin = horaInicio ? floatToTimeString(timeStringToFloat(horaInicio) + horas) : "";

  const slotsData = useMemo(() =>
    (canchaConfig && dia) ? generarSlotsHorario(canchaConfig, `${dia}T00:00`) : { cerrado: false, slots: [] }
  , [canchaConfig, dia]);

  /* ── Polling horas ocupadas ── */
  useEffect(() => {
    const escenarioId = cancha?.escenarioId || cancha?._id || normalizeId(id);
    if (!escenarioId || !dia) { setHorasOcupadas([]); return; }
    
    const fetchOcupados = async () => {
      try { const { data } = await api.get(`/reservas/ocupados/${escenarioId}?fecha=${dia}&ignorarBloqueoId=${bloqueoId || ""}`); setHorasOcupadas(data || []); } catch {}
    };
    
    fetchOcupados(); const t = setInterval(fetchOcupados, 3000); return () => clearInterval(t);
  }, [cancha, dia, bloqueoId, id]);

  /* ── Cleanup bloqueo al salir/navegar ── */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const bid = bloqueoIdRef.current;
      if (bid && !isConfirmedRef.current) {
        const tok = localStorage.getItem("token")?.replace(/['"]+/g, "");
        fetch(`${KEEPALIVE_BASE}/reservas/${bid}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok}` }, keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      const bid = bloqueoIdRef.current;
      if (bid && !isConfirmedRef.current) {
        api.delete(`/reservas/${bid}`).catch(() => {});
      }
    };
  }, []);

  const liberarBloqueo = () => {
    const bid = bloqueoIdRef.current;
    if (bid && !isConfirmedRef.current) {
      bloqueoIdRef.current = null;
      setBloqueoId(null);
      api.delete(`/reservas/${bid}`).catch(() => {});
    }
  };

  /* ── Handlers ── */
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
    setLoadingSlot(slot);
    const horaStr = floatToTimeString(slot);

    const prevId = bloqueoIdRef.current;
    bloqueoIdRef.current = null;
    setBloqueoId(null);

    try {
      const deletePromise = prevId
        ? api.delete(`/reservas/${prevId}`).catch(() => {})
        : Promise.resolve();

      const escenarioId = cancha?.escenarioId || cancha?._id || normalizeId(id);
      
      const [, { data }] = await Promise.all([
        deletePromise,
        api.post("/reservas/bloquear", {
          sedeId: String(sede._id),
          escenarioId: String(escenarioId),
          fecha: dia,
          horas: Number(horas),
          horaInicio: horaStr,
        }),
      ]);

      const newId = data?._id || data?.id;
      bloqueoIdRef.current = newId;
      setBloqueoId(newId);
      setHoraInicio(horaStr);
      setTimeout(() => goTo(1), 150);
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
      const { data: resp } = await api.patch(`/reservas/${bloqueoId}/estado`, { estadoPago: tipo === "mercadopago" ? "pagado" : "pendiente" });
      if (tipo === "mercadopago") {
        const { data: mp } = await api.post("/payments/intent", { reservaId: resp._id, paymentMethod: "mercadopago" });
        if (mp.preferenceId) {
          isConfirmedRef.current = true;
          setBloqueoId(null);
          setMpPreferenceId(mp.preferenceId);
          return;
        }
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

  /* ── RENDER STATES ── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Cargando escenario...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !cancha) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center border border-red-200">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">Error</h3>
            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
            <Link to="/canchas"><Button><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button></Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (reserva) {
    const paid = reserva.estadoPago === "pagado";
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto py-12 px-4">
          <div className={`rounded-2xl p-8 text-center border-2 ${paid ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${paid ? "bg-green-100 dark:bg-green-900/40" : "bg-yellow-100 dark:bg-yellow-900/40"}`}>
              {paid ? <CheckCircle className="w-8 h-8 text-green-600" /> : <Clock className="w-8 h-8 text-yellow-600" />}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${paid ? "text-green-900 dark:text-green-200" : "text-yellow-900 dark:text-yellow-200"}`}>{paid ? "¡Pago exitoso!" : "¡Reserva separada!"}</h2>
            <p className={`text-sm mb-4 ${paid ? "text-green-700 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>{paid ? "Tu cancha está garantizada ✓" : "Paga en la sede el día de tu reserva."}</p>
            <p className="font-mono text-lg font-bold text-gray-900 dark:text-white mb-6">#{reserva._id?.slice(-8).toUpperCase()}</p>
            <div className="flex gap-3">
              <Link to="/reservas" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">Ver Reservas</Link>
              <Link to="/canchas" className="flex-1 py-3 border-2 border-gray-300 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Volver</Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const img = cancha?.imagenes?.[0] ? imageUrl(cancha.imagenes[0]) : sede?.imagenes?.[0] ? imageUrl(sede.imagenes[0]) : null;

  /* ══════════════════════════════════════════════════
     RENDER PRINCIPAL
  ══════════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6" ref={topRef}>
        
        {/* Header con tarjeta info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Link to="/canchas" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-md">
            {img 
              ? <img src={img} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="Cancha" />
              : <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">{DEPORTE_ICONS[cancha?.tipoDeporte] || "🏟️"}</div>
            }
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">{cancha?.nombre}</h1>
              <p className="text-xs text-gray-500 truncate">{sede?.nombre}</p>
              {sede?.ubicacion?.direccion && <p className="text-xs text-gray-400 flex items-center gap-1 truncate mt-0.5"><MapPin className="w-3 h-3 flex-shrink-0"/>{sede.ubicacion.direccion}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Stepper current={step} steps={STEPS} />

          {(dia || horaInicio) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {dia && <SelectionChip label={new Date(dia + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })} onEdit={() => { setDia(""); setHoraInicio(""); liberarBloqueo(); goTo(0); }} />}
              {horaInicio && <SelectionChip label={`${horaInicio} – ${horaFin} (${horas}h)`} onEdit={() => { setHoraInicio(""); liberarBloqueo(); goTo(0); }} />}
            </div>
          )}

          {/* ══ PASO 0: Horario ══ */}
          {step === 0 && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Duración</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 1.5, 2, 3, 4].map(h => (
                    <button key={h} onClick={() => changeDuracion(h)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${horas === h
                        ? "bg-blue-600 text-white shadow-md scale-105"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}>
                      {h === 1 ? "1 hora" : h === 1.5 ? "1h 30min" : `${h} horas`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Fecha</p>
                  <MiniCalendar value={dia} onChange={selDia} />
                </div>

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
                    <div className="flex items-center justify-center h-40 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500">Sede cerrada este día</div>
                  ) : slotsData.slots.length === 0 ? (
                    <div className="flex items-center justify-center h-40 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500">Sin horarios configurados</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slotsData.slots.map(slot => {
                        const oc = isOcupado(slot), past = isPast(slot), hs = floatToTimeString(slot);
                        const isLoading = loadingSlot === slot;
                        const dis = oc || past || (loadingSlot !== null && !isLoading);
                        return (
                          <button key={slot} disabled={dis || isLoading} onClick={() => selHora(slot)}
                            className={`py-3 rounded-xl text-sm font-semibold transition-all relative ${
                              isLoading ? "bg-blue-600 text-white scale-105 shadow-lg cursor-wait" :
                              oc ? "bg-red-50 dark:bg-red-900/10 text-red-300 dark:text-red-700 line-through cursor-not-allowed text-xs" :
                              past ? "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed" :
                              dis ? "opacity-40 cursor-not-allowed bg-white border border-gray-200 text-gray-400" :
                              "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 hover:shadow-md"
                            }`}>
                            {isLoading
                              ? <span className="flex items-center justify-center gap-1">
                                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                  {hs}
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
                <div className="flex items-center gap-2 mt-5 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ══ PASO 1: Confirmar ══ */}
          {step === 1 && (
            <div className="animate-fadeIn max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5 shadow-sm">
                <div className="p-5 space-y-2.5">
                  {[
                    { label: "Sede", value: sede?.nombre },
                    { label: "Cancha", value: cancha?.nombre },
                    { label: "Deporte", value: cancha?.tipoDeporte || "No especificado" },
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
                <div className="flex items-center gap-2 mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {!mpPreferenceId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button disabled={!!creating} onClick={() => crearReserva("pendiente")}
                    className="py-4 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors disabled:opacity-60 text-sm">
                    {creating === "pendiente" ? "Procesando..." : "Reservar · Pagar en sede"}
                  </button>
                  <button disabled={!!creating} onClick={() => crearReserva("mercadopago")}
                    className="py-4 rounded-xl font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                    style={{ backgroundColor: "#009ee3" }}>
                    <CreditCard className="w-4 h-4" />
                    {creating === "mercadopago" ? "Procesando..." : "Pagar con MercadoPago"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 bg-white dark:bg-transparent rounded-lg">
                  <div className="w-full max-w-sm">
                    <Wallet
                      initialization={{
                        preferenceId: mpPreferenceId,
                        marketplace: true,
                        redirectMode: 'modal'
                      }}
                      customization={{ texts: { valueProp: 'security_details' } }}
                      onReady={() => console.log('Brick Wallet listo')}
                      onError={(err) => console.error('Error en Brick Wallet:', err)}
                      onSubmit={() => console.log('Pago iniciado en Wallet')}
                    />
                  </div>
                  <button onClick={() => setMpPreferenceId(null)} className="mt-4 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
