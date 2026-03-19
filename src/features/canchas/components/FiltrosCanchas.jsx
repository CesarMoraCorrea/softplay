import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar, Clock, DollarSign, MapPin, Star, Tag, Wifi, Droplets, Car, Coffee, LightbulbIcon, Lightbulb, ShoppingBag, ArrowLeft, Archive } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { Link } from 'react-router-dom';

const FiltrosCanchas = ({
  filtros,
  sedesBase = [],
  onFiltrosChange,
  onAplicarFiltros,
  onLimpiarFiltros,
  onCerrar,
  className = '',
}) => {
  // Local state to hold draft filters while user interacts with the modal
  const [draft, setDraft] = useState(filtros);

  // Sync draft if parent `filtros` change (e.g., cleared via chips)
  useEffect(() => {
    setDraft(filtros);
  }, [filtros]);

  const handleDraftChange = (changes) => {
    setDraft(prev => ({ ...prev, ...changes }));
  };

  const handleLimpiar = () => {
    setDraft({
      ubicacion: "",
      precioMin: 0,
      precioMax: 5000,
      tipoCancha: [],
      fecha: "",
      horario: [],
      servicios: [],
      calificacionMinima: 0,
      radio: 10,
      coordenadas: null,
    });
    onLimpiarFiltros();
  };
  // Catálogos
  // Helper para asignar un ícono dinámico según el nombre del servicio
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes("aparcamiento") || name.includes("parqueadero") || name.includes("parking")) return Car;
    if (name.includes("iluminación") || name.includes("luz")) return Lightbulb;
    if (name.includes("vestuario") || name.includes("locker")) return Archive;
    if (name.includes("ducha") || name.includes("agua")) return Droplets;
    if (name.includes("wifi") || name.includes("internet")) return Wifi;
    if (name.includes("cafetería") || name.includes("bar") || name.includes("comida") || name.includes("snack") || name.includes("kiosko")) return Coffee;
    return Tag; // Default icon
  };

  const { tiposCancha, servicios } = useMemo(() => {
    const tipos = new Set();
    const servs = new Set();
    
    (sedesBase || []).forEach(sede => {
       (sede.escenarios || []).forEach(esc => {
          if (esc.tipoDeporte) tipos.add(esc.tipoDeporte);
       });
       if (sede.tipoCancha) tipos.add(sede.tipoCancha);
       if (sede.tipoDeporte) tipos.add(sede.tipoDeporte);

       if (Array.isArray(sede.servicios)) {
          sede.servicios.forEach(s => servs.add(s));
       }
    });

    return {
       tiposCancha: Array.from(tipos).filter(Boolean).sort(),
       servicios: Array.from(servs).filter(Boolean).sort().map(s => ({
         id: s,
         nombre: s, // Use the service name as both id and name
         icon: getServiceIcon(s)
       }))
    };
  }, [sedesBase]);

  const horarios = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  const getPillClasses = (isActive) => {
    const base = "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none select-none";
    if (isActive) {
      return `${base} bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-[0.98]`;
    }
    return `${base} bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`;
  };

  return (
    <div className={`p-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Ubicación y radio */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <MapPin className="w-4 h-4 text-gray-500" />
            Ubicación
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Barrio, ciudad o dirección"
              value={draft.ubicacion}
              onChange={(e) => handleDraftChange({ ubicacion: e.target.value })}
              className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700/80 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-shadow"
            />
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Radio de búsqueda: {draft.radio} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={draft.radio}
                disabled={!draft.coordenadas}
                onChange={(e) => handleDraftChange({ radio: parseInt(e.target.value) })}
                className={`w-full accent-blue-600 ${!draft.coordenadas ? 'opacity-40 cursor-not-allowed mx-0' : ''}`}
              />
              {!draft.coordenadas && (
                 <p className="text-xs text-orange-500/90 font-medium mt-1 leading-tight">Activa tu ubicación GPS en la barra de búsqueda principal para usar el radio.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Tipo de cancha */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <Tag className="w-4 h-4 text-gray-500" />
            Tipo de cancha
          </h4>
          <div className="flex flex-wrap gap-2">
            {tiposCancha.map(tipo => (
              <button
                key={tipo}
                onClick={() => {
                  const tipoCancha = [...draft.tipoCancha];
                  if (tipoCancha.includes(tipo)) {
                    handleDraftChange({ tipoCancha: tipoCancha.filter(t => t !== tipo) });
                  } else {
                    handleDraftChange({ tipoCancha: [...tipoCancha, tipo] });
                  }
                }}
                className={getPillClasses(draft.tipoCancha.includes(tipo))}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>
        
        {/* Fecha */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" />
            Fecha
          </h4>
          <input
            type="date"
            value={draft.fecha}
            onChange={(e) => handleDraftChange({ fecha: e.target.value })}
            className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700/80 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-shadow"
          />
        </div>
        
        {/* Horarios */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <Clock className="w-4 h-4 text-gray-500" />
            Horario
          </h4>
          <div className="flex flex-wrap gap-2">
            {horarios.map(horario => (
              <button
                key={horario}
                onClick={() => {
                  const horariosList = [...draft.horario];
                  if (horariosList.includes(horario)) {
                    handleDraftChange({ horario: horariosList.filter(h => h !== horario) });
                  } else {
                    handleDraftChange({ horario: [...horariosList, horario] });
                  }
                }}
                className={getPillClasses(draft.horario.includes(horario))}
              >
                {horario}
              </button>
            ))}
          </div>
        </div>
        
        {/* Servicios */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <ShoppingBag className="w-4 h-4 text-gray-500" />
            Servicios
          </h4>
          <div className="flex flex-wrap gap-2">
            {servicios.map(servicio => {
              const IconComponent = servicio.icon;
              return (
                <button
                  key={servicio.id}
                  onClick={() => {
                    const serviciosList = [...draft.servicios];
                    if (serviciosList.includes(servicio.nombre)) {
                      handleDraftChange({ servicios: serviciosList.filter(s => s !== servicio.nombre) });
                    } else {
                      handleDraftChange({ servicios: [...serviciosList, servicio.nombre] });
                    }
                  }}
                  className={getPillClasses(draft.servicios.includes(servicio.nombre))}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{servicio.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Calificación */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <Star className="w-4 h-4 text-gray-500" />
            Calificación mínima
          </h4>
          <div className="flex gap-2">
            {[0, 3, 4, 4.5].map(rating => (
              <button
                key={rating}
                onClick={() => handleDraftChange({ calificacionMinima: rating })}
                className={getPillClasses(draft.calificacionMinima === rating)}
              >
                <Star className={`w-4 h-4 ${draft.calificacionMinima === rating ? 'fill-current' : ''}`} />
                {rating > 0 ? `${rating}+` : 'Todas'}
              </button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <DollarSign className="w-4 h-4 text-gray-500" />
            Precio por hora
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-semibold">$</span>
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={draft.precioMin === 0 ? '' : draft.precioMin}
                  onChange={(e) => handleDraftChange({ precioMin: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/80 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-shadow"
                />
              </div>
              <span className="text-gray-400 font-medium">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-semibold">$</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={draft.precioMax}
                  onChange={(e) => handleDraftChange({ precioMax: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/80 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/60 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <button
          onClick={handleLimpiar}
          className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors py-1.5 px-2"
        >
          Limpiar configuración
        </button>
        <div className="flex w-full sm:w-auto gap-3">
          <Button
            variant="secondary"
            onClick={onCerrar}
            className="flex-1 sm:flex-none py-2"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => onAplicarFiltros(draft)}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-6 py-2"
          >
            Aplicar 
          </Button>
        </div>
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
  sedesBase: PropTypes.array,
  onFiltrosChange: PropTypes.func.isRequired,
  onAplicarFiltros: PropTypes.func.isRequired,
  onLimpiarFiltros: PropTypes.func.isRequired,
  onCerrar: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default FiltrosCanchas;