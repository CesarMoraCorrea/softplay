import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiArrowLeft,
  FiTag,
  FiAlertCircle,
  FiX,
  FiMapPin,
  FiCheck,
  FiRefreshCw
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { misReservasThunk, cancelarReservaThunk } from "../redux/slices/reservasSlice.js";

export default function MisReservas() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.reservas);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => { dispatch(misReservasThunk()); }, [dispatch]);

  // Función para manejar la cancelación de reserva
  const handleCancelReserva = (reserva) => {
    setReservaToCancel(reserva);
    setShowCancelModal(true);
  };

  // Confirmar cancelación
  const confirmCancelReserva = async () => {
    if (!reservaToCancel) return;

    try {
      setCanceling(true);
      await dispatch(cancelarReservaThunk(reservaToCancel._id)).unwrap();
      setShowCancelModal(false);
      setReservaToCancel(null);
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert('Error al cancelar la reserva. Inténtalo de nuevo.');
    } finally {
      setCanceling(false);
    }
  };

  // Verificar si una reserva puede ser cancelada
  const canCancelReserva = (reserva) => {
    return reserva.estado === 'pendiente';
  };

  // Función para obtener el color del estado
  const getStatusColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pagada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'confirmada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'completada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Para evitar desfases, usamos UTC Date si viene de MongoDB con formato ISO a 00:00Z, pero asumiéndolo normal el toLocaleDateString suele acertar localmente. Ajuste simple:
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Reservas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona y revisa todas tus reservas de canchas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(misReservasThunk())}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <Link to="/canchas">
            <Button variant="outline" className="flex items-center gap-2">
              <FiArrowLeft className="w-4 h-4" />
              Ver Canchas
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : list.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(reserva => (
            <div key={reserva._id} className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-xl dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
              {/* Borde superior de color por estado */}
              <div className={`absolute top-0 left-0 w-full h-1 ${reserva.estado === 'confirmada' ? 'bg-green-500' :
                reserva.estado === 'pendiente' ? 'bg-yellow-400' :
                  reserva.estado === 'pagada' ? 'bg-green-500' :
                    reserva.estado === 'completada' ? 'bg-blue-500' :
                      'bg-red-500'
                }`} />

              <div className="flex justify-between items-start mb-4">
                <div className="pr-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {reserva.cancha?.nombre}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <FiMapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">
                      {reserva.cancha?.ubicacion
                        ? (typeof reserva.cancha.ubicacion === 'string'
                          ? reserva.cancha.ubicacion
                          : "Ubicación GPS")
                        : 'Sede'
                      }
                    </span>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(reserva.estado)}`}>
                  {reserva.estado}
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {formatDate(reserva.fecha)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {reserva.horaInicio} a {reserva.horaFin} ({reserva.horas}h)
                    </p>
                  </div>
                </div>

                {reserva.cancha?.tipoCancha && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/40 text-orange-500 dark:text-orange-300 flex items-center justify-center flex-shrink-0">
                      <FiTag className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reserva.cancha.tipoCancha}
                    </p>
                  </div>
                )}
              </div>

              {/* Tira punteada estilo "boleto" */}
              <div className="relative flex items-center justify-between py-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-2 mt-auto">
                <div className="absolute -left-8 w-4 h-4 rounded-full bg-gray-50 dark:bg-gray-900" />
                <div className="absolute -right-8 w-4 h-4 rounded-full bg-gray-50 dark:bg-gray-900" />

                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total a Pagar</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  ${reserva.total.toLocaleString('es-AR')}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex justify-between items-center gap-2 pt-2">
                {reserva.estado === 'pendiente' ? (
                  <button
                    onClick={() => handleCancelReserva(reserva)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors px-2 py-1"
                  >
                    Cancelar
                  </button>
                ) : <div />}
                <Link to={`/reservas/${reserva._id}`} className="flex-1">
                  <Button size="sm" className="w-full text-xs py-2 shadow-none hover:shadow-md transition-all">Ver Detalle</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FiAlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No tienes reservas</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Aún no has realizado ninguna reserva. Explora las canchas disponibles y reserva tu espacio.
            </p>
            <Link to="/canchas" className="mt-4">
              <Button>Buscar Canchas</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Modal de confirmación para cancelar reserva */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Confirmar Cancelación
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ¿Estás seguro de que deseas cancelar esta reserva?
              </p>

              {reservaToCancel && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    {reservaToCancel.cancha?.nombre}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="capitalize"><strong>Fecha:</strong> {formatDate(reservaToCancel.fecha)}</p>
                    <p><strong>Horario:</strong> {reservaToCancel.horaInicio} a {reservaToCancel.horaFin}</p>
                    <p><strong>Duración:</strong> {reservaToCancel.horas} {reservaToCancel.horas === 1 ? 'hora' : 'horas'}</p>
                    <p><strong>Total:</strong> ${reservaToCancel.total.toLocaleString('es-AR')}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-red-600 dark:text-red-400">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 font-medium py-3 rounded-lg transition-all duration-200"
              >
                No, mantener
              </Button>
              <Button
                onClick={confirmCancelReserva}
                disabled={canceling}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {canceling ? 'Cancelando...' : 'Sí, cancelar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
