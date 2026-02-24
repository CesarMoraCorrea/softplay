import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";
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
    <div className="flex justify-between items-center mb-8">
      {steps.map((s, idx) => (
        <div key={s.number} className="flex items-center flex-1">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
              step >= s.number
                ? "bg-primary text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {step > s.number ? "✓" : s.number}
          </div>
          <p
            className={`ml-2 text-sm font-medium transition-colors duration-300 ${
              step >= s.number
                ? "text-primary dark:text-primary"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {s.label}
          </p>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                step > s.number ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentImageIdx ? "bg-primary w-6" : "bg-gray-300 dark:bg-gray-600 w-2"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente Modal de Confirmación
function ConfirmationModal({ isOpen, cancha, reservaData, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  const fechaObj = new Date(reservaData.fecha);
  const fechaFormato = fechaObj.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaFormato = fechaObj.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slideUp">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Revisar Reserva
            </h3>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Escenario
              </p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {cancha?.nombre}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Fecha
                </p>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  {fechaFormato}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Hora
                </p>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  {horaFormato}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Duración
                </p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {reservaData.horas}h
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                  Total
                </p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                  ${reservaData.total.toLocaleString("es-AR")}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ℹ️ Tu reserva quedará en estado <span className="font-semibold">Pendiente</span> y podrás
                gestionarla desde "Mis Reservas"
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Creando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const calcularTotal = () => {
    return (cancha?.precioHora || 0) * Number(horas);
  };

  const handleDuracionChange = (newHoras) => {
    setHoras(Math.max(1, Math.min(12, newHoras)));
  };

  const handleOpenConfirmation = () => {
    if (!fecha || !horas) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!cancha?.sedeId || !(cancha?.escenarioId || cancha?._id || id)) {
      setError("No se pudo identificar la sede o el escenario de la reserva");
      return;
    }

    setError("");
    setCurrentStep(2);
    setShowConfirmation(true);
  };

  const crearReserva = async () => {
    setCreatingReserva(true);
    setError("");

    try {
      const payload = {
        sedeId: cancha.sedeId,
        escenarioId: cancha.escenarioId || cancha._id || id,
        fecha,
        horas: Number(horas),
      };

      console.log("Payload enviado a backend:", payload);

      const { payload: respuesta } = await dispatch(crearReservaThunk(payload));

      if (respuesta && respuesta._id) {
        setReserva(respuesta);
        setCurrentStep(3);
        setShowConfirmation(false);
      } else {
        setError("Error al crear la reserva");
      }
    } catch (err) {
      setError(err.message || "Error al crear la reserva");
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
            {/* Panel Izquierdo - Info del Escenario */}
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

            {/* Panel Derecho - Formulario de Reserva */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Completa tu Reserva
                </h3>

                <div className="space-y-8">
                  {/* Fecha y Hora */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Fecha y hora de inicio
                      </div>
                    </label>
                    <DateTimeSelector 
                      value={fecha} 
                      onChange={setFecha}
                    />
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-primary" />
                        Duración de la Reserva
                      </div>
                    </label>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 6, 8].map((h) => (
                        <button
                          key={h}
                          onClick={() => handleDuracionChange(h)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            horas === h
                              ? "bg-primary text-white shadow-lg scale-105"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={horas}
                      onChange={(e) => handleDuracionChange(Number(e.target.value))}
                      min="1"
                      max="12"
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                    />
                  </div>

                  {/* Resumen de Costo */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Resumen del Costo
                    </h4>
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
                    onClick={handleOpenConfirmation}
                    disabled={!fecha || !horas}
                    className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
                    size="lg"
                  >
                    Revisar Reserva
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl p-12 text-center border-2 border-green-200 dark:border-green-800">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse scale-150"></div>
                  <div className="relative bg-green-100 dark:bg-green-900/40 p-6 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <h3 className="text-4xl font-bold text-green-900 dark:text-green-200 mb-3">
                ¡Reserva Creada!
              </h3>
              <p className="text-lg text-green-700 dark:text-green-300 mb-8 max-w-md mx-auto">
                Tu reserva fue registrada correctamente y quedó en estado pendiente. Próximamente podrás
                realizar el pago.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Escenario</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {cancha?.nombre}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estado</p>
                  <p className="font-bold text-yellow-600 dark:text-yellow-400">Pendiente</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-blue-100/10 dark:from-primary/20 dark:to-blue-900/20 rounded-xl p-4 border border-primary/30">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                  <p className="font-bold text-primary text-lg">
                    ${calcularTotal().toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">ℹ️ Información:</span> Tu número de reserva es{" "}
                  <span className="font-mono font-bold text-primary">{reserva?._id?.slice(-8)}</span>
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

        {/* Modal de Confirmación */}
        <ConfirmationModal
          isOpen={showConfirmation}
          cancha={cancha}
          reservaData={{
            fecha,
            horas: Number(horas),
            total: calcularTotal(),
          }}
          onConfirm={crearReserva}
          onCancel={() => {
            setShowConfirmation(false);
            setCurrentStep(1);
          }}
          isLoading={creatingReserva}
        />
      </div>
    </DashboardLayout>
  );
}
