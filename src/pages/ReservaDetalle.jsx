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

  // Formatear fecha asegurando la zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
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
        <div className="max-w-4xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border-t-[12px] border-primary">
          <div className="grid grid-cols-1 md:grid-cols-3">

            {/* PANEL PRINCIPAL - IZQUIERDA (2 columnas) */}
            <div className="md:col-span-2 p-8 md:pr-12 md:pl-10 space-y-8 relative">

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {reserva.cancha?.nombre || "Cancha"}
                  </h2>
                  <p className="text-sm font-medium text-gray-400 mt-2 uppercase tracking-widest">
                    ID #{reserva._id.substring(reserva._id.length - 8)}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/80 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600/80 dark:text-blue-300/80 font-semibold uppercase tracking-wide">Fecha de Juego</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                      {formatDate(reserva.fecha)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/80 text-purple-600 dark:text-purple-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600/80 dark:text-purple-300/80 font-semibold uppercase tracking-wide">Horario y Duración</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {reserva.horaInicio} a {reserva.horaFin}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                      Turno de {reserva.horas} {reserva.horas === 1 ? "hora" : "horas"}
                    </p>
                  </div>
                </div>

                {reserva.cancha?.tipoCancha && (
                  <div className="flex gap-4 p-5 bg-orange-50/50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800/80 text-orange-600 dark:text-orange-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600/80 dark:text-orange-300/80 font-semibold uppercase tracking-wide">Deporte</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {reserva.cancha.tipoCancha}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BARRA LATERAL (RECIBO) - DERECHA */}
            <div className="bg-gray-50 dark:bg-gray-900 p-8 flex flex-col justify-between border-l border-dashed border-gray-300 dark:border-gray-700 relative">
              {/* Semi-círculos de corte de "boleto" (Opcional - visual effect) */}
              <div className="hidden md:block absolute -left-4 top-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 -mt-4 shadow-inner" />

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Estado de Reserva</p>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${getStatusColor(
                      reserva.estado
                    ).replace('bg-', 'border-').replace('text-', 'text-')}`}
                  >
                    {getStatusIcon(reserva.estado)}
                    <span className="font-bold tracking-wide capitalize">{reserva.estado}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Costo Total</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Tarifa base</span>
                    <span className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                      ${reserva.total.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {reserva.estado === "pendiente" && (
                  <div className="bg-yellow-100/50 dark:bg-yellow-900/40 border-l-4 border-yellow-500/80 p-4 rounded mt-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200/90 font-medium leading-relaxed">
                      El módulo de pagos quedará para una implementación posterior. Mantén tu reserva como pendiente.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 space-y-3">
                <Link to="/canchas" className="w-full block">
                  <Button className="w-full shadow-lg py-6 font-bold text-sm tracking-wide">
                    BUSCAR ALGO MÁS
                  </Button>
                </Link>
                <Link to="/reservas" className="w-full block">
                  <Button variant="outline" className="w-full py-4 text-sm bg-transparent border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
                    Volver al Historial
                  </Button>
                </Link>
              </div>
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
