import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, Star, Heart } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { imageUrl } from '../../../utils/imageUrl';

const CanchaCard = ({
  cancha,
  isFavorite = false,
  onToggleFavorite,
  className = '',
}) => {
  const {
    _id,
    nombre,
    direccion,
    precioHora,
    precio, // Para compatibilidad con ambos formatos
    tipo,
    tipoCancha,
    imagenes,
    calificacion,
    servicios = [],
    horariosDisponibles = [],
  } = cancha;
  
  // Usar precioHora o precio, dependiendo de cuál esté disponible
  const precioMostrar = precioHora || precio || 0;

  // Imagen por defecto si no hay imágenes
  const imagenPrincipal = imagenes && imagenes.length > 0
    ? imagenes[0].startsWith('http') 
      ? imagenes[0] 
      : imageUrl(imagenes[0])
    : '/images/canchas/default.svg';

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card 
      variant="glass" 
      className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="relative">
        {/* Imagen */}
        <Link to={`/canchas/${_id}`}>
          <img 
            src={imagenPrincipal} 
            alt={nombre} 
            className="w-full h-48 object-cover"
          />
        </Link>
        
        {/* Botón de favorito */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(_id)}
            className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
            />
          </button>
        )}
        
        {/* Tipo de cancha */}
        {(tipoCancha || tipo) && (
          <Badge 
            variant="primary" 
            className="absolute bottom-3 left-3"
          >
            {tipoCancha || tipo}
          </Badge>
        )}
      </div>
      
      <Card.Body>
        {/* Título y calificación */}
        <div className="flex justify-between items-start mb-2">
          <Link to={`/canchas/${_id}`}>
            <Card.Title className="text-lg hover:text-primary transition-colors">
              {nombre}
            </Card.Title>
          </Link>
          
          {calificacion > 0 && (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-sm">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="font-medium">{calificacion.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Dirección */}
        {direccion && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{direccion}</span>
          </div>
        )}
        
        {/* Servicios */}
        {servicios && servicios.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {servicios.slice(0, 3).map((servicio, index) => (
              <Badge key={index} variant="outline" size="sm" rounded="full">
                {servicio}
              </Badge>
            ))}
            {servicios.length > 3 && (
              <Badge variant="outline" size="sm" rounded="full">
                +{servicios.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Horarios disponibles */}
        {horariosDisponibles && horariosDisponibles.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Horarios disponibles:</h4>
            <div className="flex flex-wrap gap-1">
              {horariosDisponibles.slice(0, 3).map((horario, index) => (
                <Badge key={index} variant="success" size="sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {horario}
                </Badge>
              ))}
              {horariosDisponibles.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{horariosDisponibles.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Body>
      
      <Card.Footer className="flex justify-between items-center">
        {/* Precio */}
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{formatPrice(precioMostrar)}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">/hora</span>
        </div>
        
        {/* Botón de reserva */}
        <Link 
          to={`/reservar/${_id}`}
          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Reservar
        </Link>
      </Card.Footer>
    </Card>
  );
};

CanchaCard.propTypes = {
  cancha: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    direccion: PropTypes.string,
    precioHora: PropTypes.number.isRequired,
    tipoCancha: PropTypes.string,
    imagenes: PropTypes.arrayOf(PropTypes.string),
    calificacion: PropTypes.number,
    servicios: PropTypes.arrayOf(PropTypes.string),
    horariosDisponibles: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
  className: PropTypes.string
};

export default CanchaCard;