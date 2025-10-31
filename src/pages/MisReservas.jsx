import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FiCalendar, 
  FiClock, 
  FiDollarSign, 
  FiArrowLeft, 
  FiTag, 
  FiAlertCircle, 
  FiCreditCard, 
  FiX,
  FiMapPin,
  FiCheck,
  FiRefreshCw
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { misReservasThunk, cancelarReservaThunk } from "../redux/slices/reservasSlice.js";

export default function MisReservas(){
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
    switch(estado.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pagada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'confirmada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'completada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {list.map(reserva => (
            <Card key={reserva._id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {reserva.cancha?.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <FiMapPin className="w-3 h-3" />
                      <span>
                        {reserva.cancha?.ubicacion 
                          ? (typeof reserva.cancha.ubicacion === 'string' 
                              ? reserva.cancha.ubicacion 
                              : `${reserva.cancha.ubicacion.lat || ''}, ${reserva.cancha.ubicacion.lng || ''}`)
                          : 'Ubicación no disponible'
                        }
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                    {reserva.estado === 'confirmada' ? 'Confirmada' : 
                     reserva.estado === 'pendiente' ? 'Pendiente' : 
                     reserva.estado === 'pagada' ? 'Pagada' :
                     reserva.estado === 'completada' ? 'Completada' :
                     'Cancelada'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información de la reserva */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <FiCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(reserva.fecha)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                      <FiClock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Duración: {reserva.horas} {reserva.horas === 1 ? 'hora' : 'horas'}
                      </p>
                    </div>
                  </div>
                  
                  {reserva.cancha?.tipoCancha && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                        <FiTag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {reserva.cancha.tipoCancha}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Precio total:</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${reserva.total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
                  
                {/* Acciones */}
                <div className="flex justify-end gap-2 pt-2">
                  {reserva.estado === 'pendiente' && (
                    <>
                      <Link to={`/reservas/${reserva._id}`}>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                        >
                          <FiCreditCard className="w-4 h-4" />
                          Pagar
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        onClick={() => handleCancelReserva(reserva)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                      >
                        <FiX className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  <Link to={`/reservas/${reserva._id}`}>
                    <Button size="sm" variant="outline">Ver detalles</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
                      <p><strong>Fecha:</strong> {formatDate(reservaToCancel.fecha)}</p>
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
