import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios.js";
import { crearReservaThunk } from "../redux/slices/reservasSlice.js";
import PaymentComponent from "../components/PaymentComponent.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Button from "../components/common/Button.jsx";
import { imageUrl } from "../utils/imageUrl.js";

export default function NuevaReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados para la cancha y formulario
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados del formulario de reserva
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState(1);
  const [creatingReserva, setCreatingReserva] = useState(false);

  // Estados del flujo de pago
  const [reserva, setReserva] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const fetchCancha = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/canchas/${id}`);
        setCancha(data);
      } catch (err) {
        setError("Error al cargar la información de la cancha");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCancha();
    }
  }, [id]);

  const calcularTotal = () => {
    return (cancha?.precioHora || 0) * Number(horas);
  };

  const crearReserva = async () => {
    if (!fecha || !horas) {
      setError("Por favor completa todos los campos");
      return;
    }

    setCreatingReserva(true);
    setError("");

    try {
      const { payload } = await dispatch(
        crearReservaThunk({
          canchaId: id,
          fecha,
          horas: Number(horas),
        })
      );

      if (payload && payload._id) {
        setReserva(payload);
        setShowPaymentOptions(true);
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

  const handlePaymentSuccess = (paymentData) => {
    setPaymentCompleted(true);
    setPaymentMethod(paymentData.method || "stripe");
    // Actualizar el estado de la reserva
    setReserva((prev) => ({
      ...prev,
      estado: "pagada",
      transactionId: paymentData.id,
    }));
  };

  const handlePayLater = () => {
    setPaymentCompleted(true);
    setPaymentMethod("later");
    // La reserva queda en estado "pendiente"
  };

  const handleContinue = () => {
    navigate("/reservas");
  };

  const handleFinish = () => {
    navigate("/canchas");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Cargando información de la cancha...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !cancha) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Link to="/canchas">
            <Button>Volver a Canchas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información de la cancha */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {cancha?.nombre}
            </h2>

            {cancha?.imagenes && cancha.imagenes.length > 0 && (
              <div className="mb-4">
                <img
                  src={imageUrl(cancha.imagenes[0])}
                  alt={cancha.nombre}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              {cancha?.direccion && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Ubicación</p>
                    <p className="text-gray-600 dark:text-gray-400">{cancha.direccion}</p>
                  </div>
                </div>
              )}

              {cancha?.tipoCancha && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Tipo de Cancha</p>
                    <p className="text-gray-600 dark:text-gray-400">{cancha.tipoCancha}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Precio por Hora</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    ${cancha?.precioHora?.toLocaleString("es-AR") || 0}
                  </p>
                </div>
              </div>
            </div>

            {cancha?.descripcion && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{cancha.descripcion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de reserva y pago */}
        <div className="lg:col-span-2">
          {!showPaymentOptions ? (
            /* Formulario de reserva */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Detalles de la Reserva
              </h3>

              <div className="space-y-6">
                {/* Fecha y hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha y hora de inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Duración (horas)
                  </label>
                  <input
                    type="number"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    min="1"
                    max="12"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Resumen del costo */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Precio por hora:</span>
                    <span className="font-medium">
                      ${cancha?.precioHora?.toLocaleString("es-AR") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Duración:</span>
                    <span className="font-medium">
                      {horas} {horas === 1 ? "hora" : "horas"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ${calcularTotal().toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <p className="text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Botón de crear reserva */}
                <Button
                  onClick={crearReserva}
                  disabled={creatingReserva || !fecha || !horas}
                  className="w-full"
                  size="lg"
                >
                  {creatingReserva ? "Creando Reserva..." : "Crear Reserva"}
                </Button>
              </div>
            </div>
          ) : (
            /* Opciones de pago */
            <div className="space-y-6">
              {!paymentCompleted ? (
                <>
                  {/* Resumen de la reserva creada */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                        Reserva Creada Exitosamente
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-green-700 dark:text-green-400 font-medium">Fecha:</p>
                        <p className="text-green-600 dark:text-green-300">
                          {new Date(reserva?.fecha).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-700 dark:text-green-400 font-medium">Total:</p>
                        <p className="text-green-600 dark:text-green-300 text-lg font-bold">
                          ${reserva?.total?.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opciones de pago */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Opciones de Pago
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Elige cómo quieres completar tu reserva
                      </p>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Pagar ahora */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              Pagar Ahora
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Completa el pago inmediatamente y confirma tu reserva
                          </p>

                          {/* Componente de pago */}
                          <PaymentComponent
                            reserva={reserva}
                            onPaymentSuccess={handlePaymentSuccess}
                          />
                        </div>
                      </div>

                      {/* Pagar después */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              Pagar Después
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Reserva tu cancha ahora y paga más tarde. Tu reserva quedará pendiente
                            hasta completar el pago.
                          </p>
                          <Button
                            onClick={handlePayLater}
                            variant="outline"
                            className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                          >
                            Reservar sin Pagar Ahora
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Confirmación final */
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {paymentMethod === "later" ? "¡Reserva Guardada!" : "¡Pago Completado!"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {paymentMethod === "later"
                      ? "Tu reserva ha sido guardada. Recuerda completar el pago antes de la fecha programada."
                      : "Tu reserva ha sido confirmada y el pago procesado exitosamente."}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Estado:</p>
                        <p
                          className={`${
                            paymentMethod === "later" ? "text-yellow-600" : "text-green-600"
                          }`}
                        >
                          {paymentMethod === "later" ? "Pendiente de Pago" : "Pagada"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          ID de Reserva:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {reserva?._id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleContinue} className="flex items-center gap-2">
                      Ver Mis Reservas
                    </Button>
                    <Button onClick={handleFinish} variant="outline">
                      Buscar Más Canchas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
