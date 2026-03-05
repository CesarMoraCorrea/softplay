import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Calendar, Clock, MapPin, Users, Info, ChevronLeft, ChevronRight, X, CreditCard, AlertCircle, ArrowRight, CheckCircle, Check, Tag, DollarSign } from "lucide-react";
import api from "../api/axios.js";
import { crearReservaThunk } from "../redux/slices/reservasSlice.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Button from "../components/common/Button.jsx";
import DateTimeSelector from "../components/common/DateTimeSelector.jsx";
import { imageUrl } from "../utils/imageUrl.js";

// Componente de Step Indicator
function StepIndicator({ step, totalSteps = 3 }) {
  const steps = [
    { number: 1, label: "Detalles" },
    { number: 2, label: "Revisión" },
    { number: 3, label: "Confirmación" },
  ];

  return (
    <div className="flex justify-center items-center flex-wrap md:flex-nowrap max-w-3xl mx-auto mb-8 gap-y-4">
      {steps.map((s, idx) => (
        <div key={s.number} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${step >= s.number
              ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
          >
            {step > s.number ? "✓" : s.number}
          </div>
          <p
            className={`ml-2 text-sm font-medium transition-colors duration-300 ${step >= s.number
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
              }`}
          >
            {s.label}
          </p>
          {idx < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 md:w-32 h-1 mx-2 md:mx-4 rounded transition-all duration-300 ${step > s.number ? "bg-blue-600 dark:bg-blue-700" : "bg-gray-300 dark:bg-gray-700"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Componente de Image Gallery
function ImageGallery({ imagenes, nombre }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="w-full h-56 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Sin imágenes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={imageUrl(imagenes[currentImageIdx])}
          alt={`${nombre} ${currentImageIdx + 1}`}
          className="w-full h-56 object-cover transition-opacity duration-300"
        />
      </div>

      {imagenes.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentImageIdx(
                (prev) => (prev - 1 + imagenes.length) % imagenes.length
              )
            }
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
          </button>
          <button
            onClick={() =>
              setCurrentImageIdx((prev) => (prev + 1) % imagenes.length)
            }
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
          </button>

          <div className="flex justify-center gap-2 mt-3">
            {imagenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIdx ? "bg-primary w-6" : "bg-gray-300 dark:bg-gray-600 w-2"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// El componente Modal de Confirmación ha sido eliminado para usar un flujo lineal por Pasos

// Helper Auxiliar para parsear hora (Ej: "06:30" -> 6.5)
const timeStringToFloat = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h + (m / 60);
};

// Helper para re-formatear Float de vuelta a string (Ej: 6.5 -> "06:30")
const floatToTimeString = (floatHour) => {
  const h = Math.floor(floatHour);
  const m = Math.round((floatHour - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

// Generador Dinámico de Bloques de Tiempo en base a la configuración
const generarSlotsHorario = (cancha, fechaString) => {
  if (!fechaString || !fechaString.includes("T")) return [];
  const dateObj = new Date(fechaString.split("T")[0] + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  let configGlobal = cancha?.configuracionHorarioSede || {};
  if (cancha?.usarHorarioPersonalizado && cancha?.configuracionHorario) {
    configGlobal = cancha.configuracionHorario;
  }

  const dailyConfig = configGlobal.horarioPorDia?.[dayOfWeek] || { isAbierto: true, apertura: "06:00", cierre: "22:00", descansos: [] };

  if (!dailyConfig.isAbierto) return { cerrado: true, slots: [] };

  const startFloat = timeStringToFloat(dailyConfig.apertura) || 6.0;
  const endFloat = timeStringToFloat(dailyConfig.cierre) || 22.0;
  const intervalFloat = (configGlobal.intervaloMinutos || 60) / 60; // 0.5 o 1.0

  const rests = (dailyConfig.descansos || []).map(d => ({
    start: timeStringToFloat(d.inicio),
    end: timeStringToFloat(d.fin)
  }));

  const slots = [];
  for (let current = startFloat; current < endFloat; current += intervalFloat) {
    const isResting = rests.some(r => current < r.end && (current + intervalFloat) > r.start);
    if (!isResting) {
      slots.push(current);
    }
  }
  return { cerrado: false, slots };
};

export default function NuevaReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const initialCanchaFromState = location?.state?.cancha || null;

  // Estados para la cancha y formulario
  const [cancha, setCancha] = useState(initialCanchaFromState);
  const [sede, setSede] = useState(null);
  const [loading, setLoading] = useState(!initialCanchaFromState);
  const [error, setError] = useState("");

  // Estados del formulario de reserva
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState(1);
  const [creatingReserva, setCreatingReserva] = useState(false);
  const [reserva, setReserva] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [bloqueoId, setBloqueoId] = useState(null);

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

  useEffect(() => {
    const fetchCancha = async () => {
      try {
        setLoading(true);
        const safeId = normalizeId(id);

        const stateCancha = location?.state?.cancha || null;
        const stateCanchaId = normalizeId(stateCancha?.escenarioId) || normalizeId(stateCancha?._id);
        if (stateCancha && stateCanchaId && stateCanchaId === safeId) {
          setCancha(stateCancha);
          setError("");
          // Fetch sede info
          if (stateCancha.sedeId) {
            try {
              const sedeRes = await api.get(`/sedes/${stateCancha.sedeId}`);
              setSede(sedeRes.data);
            } catch (e) {
              console.error("Error fetching sede:", e);
            }
          }
          setLoading(false);
          return;
        }

        if (!safeId || safeId === "undefined" || safeId === "null" || safeId === "[object Object]") {
          setError("Escenario inválido. Vuelve a seleccionar el escenario.");
          setCancha(null);
          setLoading(false);
          return;
        }

        try {
          const { data } = await api.get(`/sedes/escenarios/${encodeURIComponent(safeId)}`);
          setCancha(data);
          setError("");

          // Fetch sede info
          if (data.sedeId) {
            try {
              const sedeRes = await api.get(`/sedes/${data.sedeId}`);
              setSede(sedeRes.data);
            } catch (e) {
              console.error("Error fetching sede:", e);
            }
          }
          return;
        } catch (primaryError) {
          const { data: escenarios } = await api.get(`/sedes?view=escenarios`);
          const escenario = Array.isArray(escenarios)
            ? escenarios.find((item) => {
              const currentId = normalizeId(item?.escenarioId) || normalizeId(item?._id);
              return currentId === safeId;
            })
            : null;

          if (escenario) {
            setCancha(escenario);
            setError("");
            return;
          }

          throw primaryError;
        }
      } catch (err) {
        const backendMessage = err?.response?.data?.message;
        setError(backendMessage || "Error al cargar la información de la cancha");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCancha();
    }
  }, [id, location?.state]);

  // Nuevo Effect: Fetch de horas ocupadas cuando cambia la fecha (Día), la Cancha, o el Bloqueo Propio
  useEffect(() => {
    const fetchHorasOcupadas = async () => {
      const escenarioIdSelected = cancha?.escenarioId || cancha?._id || normalizeId(id);
      if (!escenarioIdSelected || !fecha) return;

      try {
        const queryDate = fecha.split("T")[0];
        // Inyectamos nuestro bloqueoId para que el backend lo ignore y nuestra selección no salga Roja
        const url = `/reservas/ocupados/${escenarioIdSelected}?fecha=${queryDate}&ignorarBloqueoId=${bloqueoId || ''}`;
        const { data } = await api.get(url);
        setHorasOcupadas(data || []);
      } catch (err) {
        console.error("No se pudieron obtener las horas ocupadas", err);
      }
    };

    // Primera carga inmediata
    fetchHorasOcupadas();

    // Polling Automático rápido cada 3 segundos para una UX instantánea
    const poller = setInterval(() => {
      fetchHorasOcupadas();
    }, 3000);

    return () => clearInterval(poller);
  }, [fecha, cancha, id, bloqueoId]);

  // Nuevo Effect: Liberar reserva si el usuario cierra la ventana o se va de la página
  useEffect(() => {
    const handleUnload = () => {
      if (bloqueoId) {
        // En un hook unload, navigator.sendBeacon o fetch con keepalive son mejores que axios
        const origin = window.location.origin.includes('localhost:5173') ? 'http://localhost:5000/api' : '/api';
        const url = `${origin}/reservas/${bloqueoId}`;
        const token = localStorage.getItem("token")?.replace(/['"]+/g, '');

        fetch(url, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          keepalive: true
        }).catch(err => console.error("Error silencioso liberando al salir:", err));
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    // Limpieza al desmontar el componente (navegar a otra página web dentro del SPA de React)
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (bloqueoId) {
        handleUnload();
      }
    };
  }, [bloqueoId]);

  const calcularTotal = () => {
    return (cancha?.precioHora || 0) * Number(horas);
  };

  const autoBloquearHora = async (fechaSeleccionada, duracionSeleccionada) => {
    try {
      if (bloqueoId) {
        try {
          await api.delete(`/reservas/${bloqueoId}`);
        } catch (e) { /* ignorar */ }
        setBloqueoId(null);
      }

      const escenarioIdSelected = cancha?.escenarioId || cancha?._id || id;
      if (!escenarioIdSelected) return;

      const payloadBloqueo = {
        sedeId: cancha.sedeId,
        escenarioId: escenarioIdSelected,
        fecha: fechaSeleccionada,
        horas: Number(duracionSeleccionada),
      };

      const response = await api.post("/reservas/bloquear", payloadBloqueo);
      setBloqueoId(response.data?._id);
      setError("");

    } catch (e) {
      setError(e.response?.data?.message || "Esta hora justo acaba de ser tomada por otra persona. Por favor, elige otra.");
      setFecha(fechaSeleccionada.split("T")[0] + "T00:00"); // Reset back to just the day
    }
  };

  const manejarSeleccionFecha = async (nuevaFecha) => {
    setFecha(nuevaFecha);
    if (nuevaFecha && nuevaFecha.split("T")[1] !== "00:00") {
      await autoBloquearHora(nuevaFecha, horas);
    }
  };

  const handleDuracionChange = async (newHoras) => {
    const validHoras = Math.max(1, Math.min(12, newHoras));
    setHoras(validHoras);

    // Si había una hora seleccionada y cambia la duración, 
    // soltamos el bloqueo y reseteamos la hora porque las condiciones (y choques) cambiaron
    if (fecha && fecha.includes("T") && fecha.split("T")[1] !== "00:00") {
      setFecha(fecha.split("T")[0] + "T00:00");
      if (bloqueoId) {
        try {
          await api.delete(`/reservas/${bloqueoId}`);
        } catch (e) { /* silent fail */ }
        setBloqueoId(null);
      }
    }
  };

  const handleContinueToReview = async () => {
    if (!fecha || !horas || fecha.split("T")[1] === "00:00") {
      setError("Por favor completa la hora elegida en el paso 3");
      return;
    }

    // Si por alguna razón el payload falló
    if (!bloqueoId) {
      setError("La sesión expiró o no se pudo reservar. Selecciona nuevamente.");
      return;
    }

    setError("");
    setCurrentStep(2);
  };

  const clearAndGoBackToStep1 = async () => {
    setCurrentStep(1);
    // Eliminar carrito temporal si decidio volver y cancelar explicitamente
    if (bloqueoId) {
      try {
        await api.delete(`/reservas/${bloqueoId}`);
      } catch (e) { }
      setBloqueoId(null);
      setFecha(fecha.split("T")[0] + "T00:00");
    }
  };

  const crearReserva = async (tipoAccion = "pendiente") => {
    setCreatingReserva(true);
    setError("");

    try {
      // Como ya tenemos una reserva bloqueada real en Mongo con un ID (bloqueoId),
      // enviamos un PATH al Backend para formalizar su estadoPago
      if (!bloqueoId) {
        throw new Error("No hay reserva en el carrito.");
      }

      const payload = tipoAccion === "pagado"
        ? { estadoPago: "pagado" }
        : { estadoPago: "pendiente" };

      const { data: respuesta } = await api.patch(`/reservas/${bloqueoId}/estado`, payload);

      if (respuesta && respuesta._id) {
        setBloqueoId(null); // MUY IMPORTANTE: Desvincular de limpieza unload para que no lo borre al salir de la page
        setReserva(respuesta);
        setCurrentStep(3);
        setShowConfirmation(false);
      } else {
        setError("Error al crear la reserva");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al crear la reserva");
      console.error(err);
    } finally {
      setCreatingReserva(false);
    }
  };

  const handleContinue = () => {
    navigate("/mis-reservas");
  };

  const handleFinish = () => {
    navigate("/canchas");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Cargando escenario...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !cancha) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl shadow-lg p-8 text-center border border-red-200 dark:border-red-800">
            <div className="flex justify-center mb-4">
              <div className="bg-red-200 dark:bg-red-900/40 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
              Error al cargar
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-6 max-w-md mx-auto">{error}</p>
            <Link to="/canchas">
              <Button>
                <ArrowRight className="w-4 h-4 mr-2" />
                Volver a Canchas
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <StepIndicator step={currentStep} />

        {!reserva ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel Izquierdo - Info del Escenario (Solo en Paso 1) */}
            {currentStep === 1 && (
              <div className="lg:col-span-1 space-y-6">
                {/* Card del Escenario */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                  {/* Galería de imágenes */}
                  <div className="mb-5">
                    <ImageGallery imagenes={cancha?.imagenes} nombre={cancha?.nombre} />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {cancha?.nombre}
                  </h2>

                  {/* Información rápida */}
                  <div className="space-y-3 mb-5">
                    {cancha?.tipoCancha && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                          {cancha.tipoCancha}
                        </span>
                      </div>
                    )}

                    {cancha?.direccion && (
                      <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-900 dark:text-green-200">
                          {cancha.direccion}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-blue-100/10 dark:from-primary/20 dark:to-blue-900/20 rounded-lg border border-primary/20">
                      <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Precio por hora</p>
                        <p className="text-lg font-bold text-primary">
                          ${cancha?.precioHora?.toLocaleString("es-AR") || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cancha?.descripcion && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {cancha.descripcion}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card de la Sede */}
                {sede && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6 border border-purple-100 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-3">
                      Sede
                    </h3>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      {sede.nombre}
                    </p>
                    {sede.servicios && sede.servicios.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sede.servicios.slice(0, 3).map((servicio, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200 px-2 py-1 rounded-full"
                          >
                            {servicio}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Panel Derecho - Formulario de Reserva */}
            <div className={`transition-all duration-300 ${currentStep === 1 ? 'lg:col-span-2' : 'lg:col-span-3 max-w-5xl mx-auto w-full'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                {currentStep === 1 && (
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Completa tu Reserva
                  </h3>
                )}
                {/* STEP 1: Selección de Detalles */}
                {currentStep === 1 && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Duración */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-primary" />
                          1. Selecciona la Duración de tu Reserva
                        </div>
                      </label>
                      <div className="grid grid-cols-3 sm:flex flex-wrap gap-2 mb-4">
                        {[1, 1.5, 2, 3, 4, 5].map((h) => (
                          <button
                            key={h}
                            onClick={() => handleDuracionChange(h)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${horas === h
                              ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg scale-105"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fecha y Hora */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          2. Elige Fecha
                        </div>
                      </label>
                      <DateTimeSelector
                        value={fecha}
                        onChange={manejarSeleccionFecha}
                      />
                    </div>

                    {/* 3. Selección de Hora Independiente */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-primary" />
                          3. Selecciona hora de inicio
                        </div>
                        {horasOcupadas.length > 0 && (
                          <p className="text-xs font-normal text-orange-600 dark:text-orange-400 mt-1">
                            Existen reservas para este día. Los horarios que cruzan con tu duración están deshabilitados.
                          </p>
                        )}
                      </label>

                      {fecha && fecha.includes("T") ? (() => {
                        const horarioData = generarSlotsHorario(cancha, fecha);

                        if (horarioData.cerrado) {
                          return (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center border-2 border-dashed border-red-200 dark:border-red-900/50">
                              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2 opacity-50" />
                              <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Cerrado este día</p>
                              <p className="text-xs text-red-500 dark:text-red-300">La cancha o sede no preste servicios en el día seleccionado. Intenta con otra fecha.</p>
                            </div>
                          );
                        }

                        if (horarioData.slots.length === 0) {
                          return (
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 text-center border border-orange-200 dark:border-orange-900/50">
                              <p className="text-orange-600 dark:text-orange-400 font-semibold mb-1">Cerrado este día</p>
                              <p className="text-xs text-orange-500 dark:text-orange-300">No hay horarios disponibles configurados para prestrar servicio hoy.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-inner border border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                              {horarioData.slots.map((h) => {
                                const now = new Date();
                                const selectedDateObj = new Date(fecha.split("T")[0] + "T00:00:00");
                                const isTodayLocal = selectedDateObj.getDate() === now.getDate() &&
                                  selectedDateObj.getMonth() === now.getMonth() &&
                                  selectedDateObj.getFullYear() === now.getFullYear();

                                const hInt = Math.floor(h);
                                const hMins = Math.round((h - hInt) * 60);
                                const isPastHour = isTodayLocal && (hInt < now.getHours() || (hInt === now.getHours() && hMins <= now.getMinutes()));

                                // Check de Choque Temporal 
                                const startPropuesto = h;
                                const endPropuesto = h + horas;
                                const isOccupied = horasOcupadas.some(ocupada => {
                                  const [hOcStart, m1] = ocupada.horaInicio.split(":").map(Number);
                                  const [hOcEnd, m2] = ocupada.horaFin.split(":").map(Number);
                                  const ocStart = hOcStart + (m1 / 60);
                                  const ocEnd = hOcEnd + (m2 / 60);
                                  return (startPropuesto < ocEnd && endPropuesto > ocStart);
                                });

                                const isDisabled = isPastHour || isOccupied;

                                const horaExactaStr = floatToTimeString(h);
                                const isSelected = fecha.split("T")[1] === horaExactaStr;

                                return (
                                  <button
                                    key={h}
                                    disabled={isDisabled}
                                    onClick={() => {
                                      if (!isDisabled) {
                                        const baseString = fecha.split("T")[0];
                                        manejarSeleccionFecha(`${baseString}T${horaExactaStr}`);
                                      }
                                    }}
                                    className={`px-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isOccupied
                                      ? "opacity-60 cursor-not-allowed bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 line-through decoration-red-500"
                                      : isPastHour
                                        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                                        : isSelected
                                          ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg scale-105"
                                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                      }`}
                                  >
                                    {horaExactaStr}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400">Por favor, selecciona primero un día en el paso 2.</p>
                        </div>
                      )}
                    </div>



                    {/* Resumen de Reserva y Costo */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 transition-all duration-300">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Resumen de tu Selección
                      </h4>

                      <div className="space-y-3 mb-4 pb-4 border-b border-blue-200 dark:border-blue-800/50">
                        <div className="flex justify-between items-center bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Día</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {fecha ? new Date(fecha.split("T")[0] + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", month: "short", day: "numeric" }) : "-"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Horario</span>
                          <span className={`font-semibold ${fecha && fecha.includes("T") && fecha.split("T")[1] !== "00:00" ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
                            {fecha && fecha.includes("T") && fecha.split("T")[1] !== "00:00" ? (
                              (() => {
                                const validStartTime = fecha.split("T")[1];
                                const [h, m] = validStartTime.split(":").map(Number);
                                const endH = h + Math.floor(horas);
                                const endM = m + (horas % 1) * 60;
                                const endString = `${endH.toString().padStart(2, '0')}:${endM === 0 ? '00' : '30'}`;
                                return `${validStartTime} hasta ${endString}`;
                              })()
                            ) : "Esperando selección..."}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Precio por hora</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${cancha?.precioHora?.toLocaleString("es-AR") || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Duración</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {horas} {horas === 1 ? "hora" : "horas"}
                          </span>
                        </div>
                        <div className="border-t-2 border-blue-300 dark:border-blue-700 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              Total
                            </span>
                            <span className="text-3xl font-bold text-primary">
                              ${calcularTotal().toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 animate-shake">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Botón Continuar */}
                    <Button
                      onClick={handleContinueToReview}
                      disabled={!fecha || !horas || (fecha && !fecha.includes("T")) || (fecha && fecha.split("T")[1] === "00:00")}
                      className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
                      size="lg"
                    >
                      Continuar a Revisión
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: Revisión y Pago Simulado */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 md:p-8 border border-blue-100 dark:border-blue-800 text-center">
                      <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Detalles de Reserva</h3>
                      <p className="text-blue-700 dark:text-blue-300 max-w-md mx-auto">
                        Revisa tu selección. En este momento tu cancha se encuentra bloqueada a tu nombre para que nadie más la tome mientras finalizas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sede</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">{sede?.nombre || cancha?.sedeId?.nombre || "No especificada"}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Escenario</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
                          {cancha?.nombre?.includes("-") ? cancha.nombre.split("-").pop().trim() : cancha?.nombre}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Día Reservado</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-base lg:text-lg leading-tight">
                          {fecha ? new Date(fecha.split("T")[0] + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hora y Duración</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {fecha && fecha.includes("T") ? (
                            (() => {
                              const validStartTime = fecha.split("T")[1];
                              const [h, m] = validStartTime.split(":").map(Number);
                              const endH = h + Math.floor(horas);
                              const endM = m + (horas % 1) * 60;
                              const endString = `${endH.toString().padStart(2, '0')}:${endM === 0 ? '00' : '30'}`;
                              return `${validStartTime} hasta ${endString} (${horas}h)`;
                            })()
                          ) : ""}
                        </p>
                      </div>

                      <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 rounded-xl p-6 border border-primary/20 flex flex-col sm:flex-row justify-between items-center mt-2">
                        <div className="text-center sm:text-left mb-2 sm:mb-0">
                          <p className="text-sm text-primary mb-1 font-medium">Monto Total a Pagar / Pendiente</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Las tarifas en sitio pueden variar si dejas el monto pendiente.</p>
                        </div>
                        <p className="font-bold text-primary text-4xl">
                          ${calcularTotal().toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>

                    {/* Botonera Step 2 */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => setCurrentStep(1)}
                        disabled={creatingReserva}
                        variant="outline"
                        className="py-4 font-semibold w-full sm:w-1/4"
                      >
                        Volver atrás
                      </Button>
                      <Button
                        onClick={() => crearReserva("pendiente")}
                        disabled={creatingReserva}
                        className="py-4 font-bold text-lg w-full sm:w-1/3 bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700 flex items-center justify-center gap-2"
                      >
                        {creatingReserva ? "..." : "Reservar (Pendiente)"}
                        <Clock className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => crearReserva("pagado")}
                        disabled={creatingReserva}
                        className="py-4 font-bold text-lg w-full sm:flex-1 flex items-center justify-center gap-2 shadow-lg"
                      >
                        {creatingReserva ? "Procesando..." : "Confirmar (Simular Pago)"}
                        <CreditCard className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl shadow-xl p-12 text-center border-2 ${reserva?.estadoPago === "pagado"
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
              : "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800"
              }`}>

              <div className="flex justify-center mb-12">
                <div className="relative">
                  {reserva?.estadoPago === "pagado" ? (
                    <>
                      <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse scale-150"></div>
                      <div className="relative bg-green-100 dark:bg-green-900/40 p-6 rounded-full">
                        <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-pulse scale-150"></div>
                      <div className="relative bg-yellow-100 dark:bg-yellow-900/40 p-6 rounded-full">
                        <Clock className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <h3 className={`text-4xl font-bold mb-3 mt-4 ${reserva?.estadoPago === "pagado" ? "text-green-900 dark:text-green-200" : "text-yellow-900 dark:text-yellow-200"}`}>
                {reserva?.estadoPago === "pagado" ? "¡Pago Simulado Exitoso!" : "¡Reserva Separada!"}
              </h3>
              <p className={`text-lg mb-8 max-w-md mx-auto ${reserva?.estadoPago === "pagado" ? "text-green-700 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`}>
                {reserva?.estadoPago === "pagado"
                  ? "Tu pago simulado ha sido procesado y tienes tu cancha garantizada al 100%."
                  : "Tu reserva fue aislada exitosamente y quedó en estado pendiente. Por favor acércate a la sede puntualmente para realizar tu pago."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Escenario Elegido</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {cancha?.nombre?.includes("-") ? cancha.nombre.split("-").pop().trim() : cancha?.nombre}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado de Pago</p>
                  {reserva?.estadoPago === "pagado" ? (
                    <p className="font-bold text-green-600 dark:text-green-400">✅ Pagado</p>
                  ) : (
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">⏳ Pendiente</p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-blue-100/10 dark:from-primary/20 dark:to-blue-900/20 rounded-xl p-4 border border-primary/30 shadow-sm">
                  <p className="text-xs text-primary mb-1">{reserva?.estadoPago === "pagado" ? "Total Pagado" : "Total a Pagar en Sitio"}</p>
                  <p className="font-bold text-primary text-lg">
                    ${calcularTotal().toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">🎟️ Número de Ticket:</span>{" "}
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{reserva?._id?.slice(-8).toUpperCase()}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleContinue}
                  className="flex-1 py-3 text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Ver Mis Reservas
                </Button>
                <Button
                  onClick={handleFinish}
                  variant="outline"
                  className="flex-1 py-3 text-base"
                >
                  Buscar Más Escenarios
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
