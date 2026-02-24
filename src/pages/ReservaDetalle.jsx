import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";
import PaymentComponent from "../components/PaymentComponent";
import api from "../api/axios.js";

export default function ReservaDetalle() {
  const { id } = useParams();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReserva();
  }, [id]);

  const fetchReserva = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/reservas/${id}`);
      setReserva(data);
    } catch (err) {
      console.error("Error al cargar la reserva:", err);
      setError("No se pudo cargar la información de la reserva");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    // Actualizar el estado de la reserva después del pago exitoso
    setReserva((prev) => ({
      ...prev,
      estado: "pagada",
      paymentStatus: "succeeded",
      transactionId: paymentData.id,
      paymentDate: new Date(),
    }));
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener color según estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "pagada":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  // Obtener icono según estado
  const getStatusIcon = (estado) => {
    switch (estado) {
      case "pagada":
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "cancelada":
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Detalles de Reserva</h1>
        <Link to="/canchas">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Canchas
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{error}</h3>
            <Link to="/reservas" className="mt-4">
              <Button>Ver Mis Reservas</Button>
            </Link>
          </div>
        </div>
      ) : reserva ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Encabezado con estado */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  {reserva.cancha?.nombre || "Cancha"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Reserva #{reserva._id.substring(reserva._id.length - 6)}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(
                  reserva.estado
                )}`}
              >
                {getStatusIcon(reserva.estado)}
                <span className="font-medium capitalize">{reserva.estado}</span>
              </div>
            </div>
          </div>

          {/* Detalles de la reserva */}
          <div className="p-6 space-y-6">
            {/* Fecha y hora */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Información de la Reserva
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Fecha y Hora</p>
                    <p className="text-gray-600 dark:text-gray-400">{formatDate(reserva.fecha)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Duración</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {reserva.horas} {reserva.horas === 1 ? "hora" : "horas"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la cancha */}
            {reserva.cancha && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Información de la Cancha
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reserva.cancha.tipoCancha && (
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Tipo de Cancha
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {reserva.cancha.tipoCancha}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Precio Total</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${reserva.total.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Componente de pago para reservas pendientes */}
            {reserva.estado === "pendiente" && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <PaymentComponent reserva={reserva} onPaymentSuccess={handlePaymentSuccess} />
              </div>
            )}

            {/* Información de pago para reservas pagadas */}
            {reserva.estado === "pagada" && reserva.transactionId && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-medium text-green-800 dark:text-green-300">
                      Pago Confirmado
                    </h4>
                  </div>
                  <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
                    <p>
                      <strong>ID de Transacción:</strong> {reserva.transactionId}
                    </p>
                    {reserva.paymentMethod && (
                      <p>
                        <strong>Método de Pago:</strong> {reserva.paymentMethod}
                      </p>
                    )}
                    {reserva.paymentDate && (
                      <p>
                        <strong>Fecha de Pago:</strong>{" "}
                        {new Date(reserva.paymentDate).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
              <Link to="/reservas">
                <Button variant="outline">Ver Todas Mis Reservas</Button>
              </Link>
              <Link to="/canchas">
                <Button>Buscar Más Canchas</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-16 h-16 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Reserva no encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              No se pudo encontrar la información de esta reserva.
            </p>
            <Link to="/reservas" className="mt-4">
              <Button>Ver Mis Reservas</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
