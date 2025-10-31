import React from 'react';
import PropTypes from 'prop-types';
import { X, Calendar, Clock, DollarSign, MapPin, Star, Tag, Wifi, Droplets, Car, Coffee, LightbulbIcon, ShoppingBag, ArrowLeft } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { Link } from 'react-router-dom';

const FiltrosCanchas = ({
  filtros,
  onFiltrosChange,
  onAplicarFiltros,
  onLimpiarFiltros,
  onCerrar,
  className = '',
}) => {
  // Catálogos
  const tiposCanchas = ["Fútbol 5", "Fútbol 7", "Fútbol 11", "Tenis", "Padel", "Basquet"];
  const serviciosCatalogo = [
    { id: "aparcamiento", nombre: "Aparcamiento", icon: <Car className="w-4 h-4" /> },
    { id: "iluminacion", nombre: "Iluminación", icon: <LightbulbIcon className="w-4 h-4" /> },
    { id: "vestuarios", nombre: "Vestuarios", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "duchas", nombre: "Duchas", icon: <Droplets className="w-4 h-4" /> },
    { id: "wifi", nombre: "WiFi", icon: <Wifi className="w-4 h-4" /> },
    { id: "cafeteria", nombre: "Cafetería", icon: <Coffee className="w-4 h-4" /> },
  ];
  const horarios = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link to="/canchas" className="text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLimpiarFiltros}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Limpiar filtros
          </button>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubicación y radio */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Ubicación
          </h4>
          <div className="space-y-3">
            <Input
              placeholder="Barrio, ciudad o dirección"
              value={filtros.ubicacion}
              onChange={(e) => onFiltrosChange({ ubicacion: e.target.value })}
            />
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Radio de búsqueda: {filtros.radio} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filtros.radio}
                onChange={(e) => onFiltrosChange({ radio: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        {/* Tipo de cancha */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Tipo de cancha
          </h4>
          <div className="flex flex-wrap gap-2">
            {tiposCanchas.map(tipo => (
              <button
                key={tipo}
                onClick={() => {
                  const tipoCancha = [...filtros.tipoCancha];
                  if (tipoCancha.includes(tipo)) {
                    onFiltrosChange({ tipoCancha: tipoCancha.filter(t => t !== tipo) });
                  } else {
                    onFiltrosChange({ tipoCancha: [...tipoCancha, tipo] });
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtros.tipoCancha.includes(tipo) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>
        
        {/* Fecha */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Fecha
          </h4>
          <Input
            type="date"
            value={filtros.fecha}
            onChange={(e) => onFiltrosChange({ fecha: e.target.value })}
            className="w-full"
          />
        </div>
        
        {/* Horarios */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Horario
          </h4>
          <div className="flex flex-wrap gap-2">
            {horarios.map(horario => (
              <button
                key={horario}
                onClick={() => {
                  const horariosList = [...filtros.horario];
                  if (horariosList.includes(horario)) {
                    onFiltrosChange({ horario: horariosList.filter(h => h !== horario) });
                  } else {
                    onFiltrosChange({ horario: [...horariosList, horario] });
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtros.horario.includes(horario) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                {horario}
              </button>
            ))}
          </div>
        </div>
        
        {/* Servicios */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Servicios
          </h4>
          <div className="flex flex-wrap gap-2">
            {serviciosCatalogo.map(servicio => (
              <button
                key={servicio.id}
                onClick={() => {
                  const serviciosList = [...filtros.servicios];
                  if (serviciosList.includes(servicio.nombre)) {
                    onFiltrosChange({ servicios: serviciosList.filter(s => s !== servicio.nombre) });
                  } else {
                    onFiltrosChange({ servicios: [...serviciosList, servicio.nombre] });
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtros.servicios.includes(servicio.nombre) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                {servicio.icon}
                <span>{servicio.nombre}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Calificación */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Calificación mínima
          </h4>
          <div className="flex gap-2">
            {[0, 3, 4, 4.5].map(rating => (
              <button
                key={rating}
                onClick={() => onFiltrosChange({ calificacionMinima: rating })}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${filtros.calificacionMinima === rating ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <Star className="w-4 h-4" />
                {rating > 0 ? `${rating}+` : 'Todas'}
              </button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Precio por hora
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="Mínimo"
                value={filtros.precioMin}
                onChange={(e) => onFiltrosChange({ precioMin: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
              <span className="text-gray-500 dark:text-gray-400">a</span>
              <Input
                type="number"
                placeholder="Máximo"
                value={filtros.precioMax}
                onChange={(e) => onFiltrosChange({ precioMax: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Rango: ${filtros.precioMin} - ${filtros.precioMax}
              </label>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{
                      width: `${(filtros.precioMax / 5000) * 100}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={onCerrar}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={onAplicarFiltros}
        >
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
};

FiltrosCanchas.propTypes = {
  filtros: PropTypes.shape({
    ubicacion: PropTypes.string,
    radio: PropTypes.number,
    precioMin: PropTypes.number,
    precioMax: PropTypes.number,
    tipoCancha: PropTypes.arrayOf(PropTypes.string),
    fecha: PropTypes.string,
    horario: PropTypes.arrayOf(PropTypes.string),
    servicios: PropTypes.arrayOf(PropTypes.string),
    calificacionMinima: PropTypes.number,
    coordenadas: PropTypes.object
  }).isRequired,
  onFiltrosChange: PropTypes.func.isRequired,
  onAplicarFiltros: PropTypes.func.isRequired,
  onLimpiarFiltros: PropTypes.func.isRequired,
  onCerrar: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default FiltrosCanchas;