import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom"; // Not needed for vista state
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, MapPin, Star, X, Map, List, Building2, DollarSign, Calendar, Clock, Tag, Trash2, Radar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CanchaCard from "../features/canchas/components/CanchaCard";
import FiltrosCanchas from "../features/canchas/components/FiltrosCanchas";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";
import Card from "../components/common/Card";
import GeolocationSearch from "../components/GeolocationSearch";
import GoogleMapsView from "../components/GoogleMapsView";

// Importamos la acción para obtener canchas del backend
import { fetchCanchas } from "../redux/slices/canchasSlice";
import api from "../api/axios";

const CanchasPage = () => {
  const dispatch = useDispatch();
  const { list: sedes, loading } = useSelector((state) => state.canchas);

  // Estado local para errores
  const [error, setError] = useState(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vistaActual, setVistaActual] = useState("mapa"); // 'lista' o 'mapa'
  const [vistaPrevia, setVistaPrevia] = useState("mapa"); // Track view before entering scenarios
  const [selectedSedeId, setSelectedSedeId] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null); // Para guardar la sede seleccionada
  const [rangoPreciosGlobal, setRangoPreciosGlobal] = useState({ min: 0, max: 200000 });
  const [filtros, setFiltros] = useState({
    ubicacion: "",
    precioMin: 0,
    precioMax: 200000,
    tipoCancha: [],
    fecha: "",
    horario: [],
    servicios: [],
    calificacionMinima: 0,
    radio: 20, // Empieza siempre en el máximo (20 km)
    coordenadas: null, // Para almacenar lat/lng de la ubicación actual
  });

  const [sedesBase, setSedesBase] = useState([]);

  useEffect(() => {
    // Fetch base sedes initially to fuel the dynamic filters options
    api.get("/sedes")
      .then(res => {
        const data = res.data;
        setSedesBase(data);

        // Compute global min/max price dynamically
        let globalMin = Infinity;
        let globalMax = 0;

        data.forEach(sede => {
          (sede.escenarios || []).forEach(esc => {
            const p = Number(esc.precioPorHora);
            if (p > 0 && p < globalMin) globalMin = p;
            if (p > globalMax) globalMax = p;
          });
        });

        if (globalMin === Infinity) globalMin = 0;
        if (globalMax === 0) globalMax = 200000;

        setRangoPreciosGlobal({ min: globalMin, max: globalMax });

        // Autocompletar filtros actuales solo si no hay un min/max diferente ajustado por el host
        setFiltros(prev => ({
          ...prev,
          precioMin: prev.precioMin === 0 ? globalMin : prev.precioMin,
          precioMax: prev.precioMax === 200000 ? globalMax : prev.precioMax
        }));
      })
      .catch(console.error);
  }, []);

  const fetchWithFilters = React.useCallback((currentFiltros, search, view, sedeId) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (view) params.set("view", view);
    if (sedeId) params.set("sedeId", sedeId);

    if (currentFiltros.ubicacion) params.set("location", currentFiltros.ubicacion);

    // Si los valores inscritos en los inputs reflejan los límites globales por defecto, los ignoramos 
    // en la consulta (query) para que solo queden 'escritos' sin disparar el estado de filtrado.
    if (currentFiltros.precioMin > 0 && currentFiltros.precioMin !== rangoPreciosGlobal.min) {
      params.set("minPrice", String(currentFiltros.precioMin));
    }
    if (currentFiltros.precioMax > 0 && currentFiltros.precioMax !== rangoPreciosGlobal.max) {
      params.set("maxPrice", String(currentFiltros.precioMax));
    }

    if (currentFiltros.tipoCancha.length) params.set("fieldType", currentFiltros.tipoCancha.join(","));
    if (currentFiltros.fecha) params.set("date", currentFiltros.fecha);
    if (currentFiltros.horario.length) params.set("timeSlot", currentFiltros.horario.join(","));
    if (currentFiltros.servicios.length) params.set("services", currentFiltros.servicios.join(","));
    if (currentFiltros.calificacionMinima > 0) params.set("minRating", String(currentFiltros.calificacionMinima));
    if (currentFiltros.coordenadas) {
      params.set("lat", String(currentFiltros.coordenadas.lat));
      params.set("lng", String(currentFiltros.coordenadas.lng));
      if (currentFiltros.radio && currentFiltros.radio !== 20) {
        params.set("radius", String(currentFiltros.radio));
      }
    }
    dispatch(fetchCanchas(params.toString())).catch(err => {
      setError(err.message || "Error al cargar las sedes");
    });
  }, [dispatch, rangoPreciosGlobal]);

  // Cargar canchas desde el backend cada vez que cambie la búsqueda o los filtros
  useEffect(() => {
    if (!selectedSedeId) {
      // Si no hay sede seleccionada, buscar sedes aplicando filtros
      fetchWithFilters(filtros, busqueda);
    } else {
      // Si hay sede seleccionada, buscar escenarios aplicando los mismos filtros
      fetchWithFilters(filtros, busqueda, "escenarios", selectedSedeId);
    }
  }, [fetchWithFilters, filtros, busqueda, selectedSedeId]);

  useEffect(() => {
    if (!selectedSedeId || !selectedSede) return;
    // Solo validar si no estamos mostrando escenarios
    // (cuando mostramos escenarios, 'sedes' contiene escenarios, no sedes)
    if (selectedSede && selectedSede._id === selectedSedeId) return;

    setSelectedSedeId(null);
    setSelectedSede(null);
  }, [selectedSedeId, selectedSede]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value); // Captura el texto que escribe el usuario
  };

  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
  };

  const aplicarFiltros = (draftFiltros) => {
    setFiltros(draftFiltros);
    setFiltrosAbiertos(false);
  };

  const limpiarFiltros = () => {
    setFiltros({
      ubicacion: "",
      precioMin: rangoPreciosGlobal.min,
      precioMax: rangoPreciosGlobal.max,
      tipoCancha: [],
      fecha: "",
      horario: [],
      servicios: [],
      calificacionMinima: 0,
      radio: 20,
      coordenadas: null,
    });
  };

  // Manejar cuando se encuentra la ubicación del usuario
  const handleLocationFound = (position) => {
    setFiltros((prev) => ({
      ...prev,
      coordenadas: position,
    }));
  };

  const toggleFavorito = (canchaId) => {
    // En una implementación real, esto sería una acción de Redux
    console.log("Toggle favorito para cancha:", canchaId);
  };

  const handleVerEscenarios = (sede) => {
    setVistaPrevia(vistaActual); // Remember current view before switching
    setSelectedSedeId(sede._id);
    setSelectedSede(sede);
    setBusqueda("");
    setVistaActual("lista");
  };

  // Cuando hay sede seleccionada, `sedes` contiene los escenarios filtrados del backend
  const escenariosSeleccionados = selectedSedeId ? sedes : [];

  // En vista mapa: siempre muestra sedes (deselecciona automáticamente)
  // En vista lista: muestra escenarios si hay sede seleccionada, sino sedes
  const mapItems = !selectedSede
    ? sedes.map((sede) => ({
      _id: sede._id,
      isSede: true,
      nombre: sede.nombre,
      direccion: sede?.ubicacion?.direccion,
      ubicacion: {
        lat: sede?.ubicacion?.lat,
        lng: sede?.ubicacion?.lng,
      },
      imagenes: sede.imagenes,
      calificacion: sede.calificacion,
      precioHora: sede.precioHoraDesde || sede.escenarios?.[0]?.precioHora || 0,
      servicios: sede.servicios || [],
      horarios: sede.configuracionHorario?.horarioPorDia || sede.horarios || null,
      escenariosCount: (sede.escenarios || []).length,
      barrio: sede?.ubicacion?.barrio || "",
    }))
    : escenariosSeleccionados;

  const hasActiveFilters =
    filtros.ubicacion !== "" ||
    (filtros.precioMin !== rangoPreciosGlobal.min && filtros.precioMin > 0) ||
    (filtros.precioMax !== rangoPreciosGlobal.max && filtros.precioMax < 200000) ||
    filtros.tipoCancha.length > 0 ||
    filtros.calificacionMinima > 0 ||
    filtros.fecha !== "" ||
    filtros.horario.length > 0 ||
    filtros.servicios.length > 0 ||
    (filtros.coordenadas !== null && filtros.radio !== 20);

  return (
    <div className="px-4 sm:px-6 pb-6 pt-2 lg:pt-3">
      {/* Encabezado y búsqueda */}
      <div className="text-center mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {selectedSede ? selectedSede.nombre : "Encuentra tu sede y escenario"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          {selectedSede
            ? `${escenariosSeleccionados.length} escenarios disponibles`
            : `${sedes.length} sedes disponibles cerca de ti`}
        </p>

        <div className="w-full max-w-5xl mx-auto mt-4 mb-6 px-2 lg:px-0 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex w-full lg:w-auto flex-1 flex-col sm:flex-row gap-3">
            <div className="w-full flex-1">
              <Input
                placeholder={selectedSede ? "Buscar escenarios..." : "Buscador de canchas..."}
                value={busqueda}
                onChange={handleBusquedaChange}
                icon={<Search className="w-5 h-5 text-gray-400" />}
                className="w-full"
              />
            </div>
            <div className="flex justify-center gap-3 w-full sm:w-auto">
              <div className="flex-shrink-0">
                <GeolocationSearch onLocationFound={handleLocationFound} />
              </div>
              <Button
                variant="secondary"
                onClick={() => setFiltrosAbiertos(true)}
                icon={<Filter className="w-5 h-5" />}
                className="flex-1 sm:flex-none justify-center"
              >
                Filtros
              </Button>
            </div>
          </div>

          <div className="flex w-full lg:w-auto justify-center lg:justify-end">

            {/* Toggle premium tipo Segmented Control */}
            <div className="relative flex bg-gray-200/70 dark:bg-gray-800 rounded-xl p-1 shadow-inner h-11 items-center w-56 mx-auto sm:mx-0">
              {/* Background pill */}
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-600 rounded-lg shadow-sm border border-gray-100/50 dark:border-gray-500/50"
                animate={{
                  left: vistaActual === "mapa" ? "4px" : "calc(50%)",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
              <button
                onClick={() => {
                  setVistaActual("mapa");
                  // Deseleccionar sede al cambiar a mapa para mostrar todas las sedes
                  if (selectedSedeId) {
                    setSelectedSedeId(null);
                    setSelectedSede(null);
                    setBusqueda("");
                  }
                }}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors ${vistaActual === "mapa"
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
              >
                <Map className="w-4 h-4" />
                Mapa
              </button>
              <button
                onClick={() => setVistaActual("lista")}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors ${vistaActual === "lista"
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>

            {selectedSede && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Restore the view the user was on before entering scenarios
                  setSelectedSedeId(null);
                  setSelectedSede(null);
                  setVistaActual(vistaPrevia);
                }}
                className="ml-2 text-sm shrink-0"
              >
                Volver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros aplicados */}
      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            {filtros.ubicacion && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {filtros.ubicacion}
                <button onClick={() => handleFiltrosChange({ ubicacion: "" })} className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {(filtros.precioMin !== rangoPreciosGlobal.min || filtros.precioMax !== rangoPreciosGlobal.max) && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all">
                <DollarSign className="w-3.5 h-3.5 text-green-500" />
                ${filtros.precioMin} - ${filtros.precioMax}
                <button
                  onClick={() =>
                    handleFiltrosChange({ precioMin: rangoPreciosGlobal.min, precioMax: rangoPreciosGlobal.max })
                  }
                  className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {filtros.tipoCancha.map((tipo) => (
              <div
                key={tipo}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all"
              >
                {tipo}
                <button
                  onClick={() =>
                    handleFiltrosChange({
                      tipoCancha: filtros.tipoCancha.filter((t) => t !== tipo),
                    })
                  }
                  className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {filtros.calificacionMinima > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all">
                <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                {filtros.calificacionMinima}+
                <button onClick={() => handleFiltrosChange({ calificacionMinima: 0 })} className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {filtros.fecha && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {filtros.fecha}
                <button onClick={() => handleFiltrosChange({ fecha: "" })} className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {filtros.horario.map((hor) => (
              <div
                key={hor}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                {hor}
                <button
                  onClick={() =>
                    handleFiltrosChange({
                      horario: filtros.horario.filter((h) => h !== hor),
                    })
                  }
                  className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {filtros.servicios.map((srv) => (
              <div
                key={srv}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {srv}
                <button
                  onClick={() =>
                    handleFiltrosChange({
                      servicios: filtros.servicios.filter((s) => s !== srv),
                    })
                  }
                  className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {filtros.coordenadas && filtros.radio && filtros.radio !== 20 && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 transition-all">
                <Radar className="w-3.5 h-3.5 text-orange-500" />
                Radio a {filtros.radio} km
                <button
                  onClick={() => handleFiltrosChange({ radio: 20 })}
                  className="ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={limpiarFiltros}
            className="inline-flex items-center shrink-0 gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar todos
          </button>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert variant="error" title="Error al cargar sedes" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resultados */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80"></div>
          ))}
        </div>
      ) : sedes.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={vistaActual + (selectedSede ? "selected" : "all")}
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {vistaActual === "mapa" ? (
              <GoogleMapsView userLocation={filtros.coordenadas} canchas={mapItems} onVerEscenarios={handleVerEscenarios} />
            ) : (
              !selectedSede ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sedes.map((sede) => (
                    <Card key={sede._id} variant="glass" className="overflow-hidden p-0 group cursor-pointer flex flex-col">
                      {/* Foto de la Sede al tope del Card */}
                      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        {(sede.imagenes && sede.imagenes.length > 0) ? (
                          <img src={sede.imagenes[0]} alt={sede.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 className="w-10 h-10 opacity-30" />
                          </div>
                        )}
                      </div>

                      {/* Contenido (Textos y Botones) */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{sede.nombre}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="line-clamp-1">{sede?.ubicacion?.direccion || "Dirección no disponible"}</span>
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                            <Building2 className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{(sede.escenarios || []).length} escenarios</span>
                          <span className="text-gray-500 dark:text-gray-400">{sede?.ubicacion?.barrio || "Sin barrio"}</span>
                        </div>

                        <div className="mt-auto pt-5">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-md transform hover:-translate-y-0.5 transition-all" onClick={() => handleVerEscenarios(sede)}>
                            Ver escenarios disponibles
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {escenariosSeleccionados.length > 0 ? (
                    escenariosSeleccionados.map((cancha) => (
                      <CanchaCard
                        key={cancha.escenarioId || cancha._id}
                        cancha={cancha}
                        isFavorite={false}
                        onToggleFavorite={() => toggleFavorito(cancha._id)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={<MapPin className="w-8 h-8 text-gray-400 dark:text-gray-300" />}
                      title="No se encontraron escenarios"
                      description="Prueba con otra búsqueda."
                    >
                      <Button variant="primary" onClick={() => setBusqueda("")}>
                        Limpiar búsqueda
                      </Button>
                    </EmptyState>
                  )}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <EmptyState
          icon={<MapPin className="w-8 h-8 text-gray-400 dark:text-gray-300" />}
          title="No se encontraron sedes"
          description="Prueba ajustar los filtros o la búsqueda para encontrar mejores resultados."
        >
          <Button variant="primary" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        </EmptyState>
      )}

      {/* Modal de filtros */}
      <Modal
        open={filtrosAbiertos}
        title="Filtros de búsqueda"
        onClose={() => setFiltrosAbiertos(false)}
        size="xl"
      >
        <FiltrosCanchas
          filtros={filtros}
          sedesBase={sedesBase}
          onFiltrosChange={handleFiltrosChange}
          onAplicarFiltros={aplicarFiltros}
          onLimpiarFiltros={limpiarFiltros}
          onCerrar={() => setFiltrosAbiertos(false)}
        />
      </Modal>
    </div>
  );
};

export default CanchasPage;
