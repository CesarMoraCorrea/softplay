import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom"; // Not needed for vista state
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, MapPin, Star, X, Map, List, Building2 } from "lucide-react";
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
  const [filtros, setFiltros] = useState({
    ubicacion: "",
    precioMin: 0,
    precioMax: 5000,
    tipoCancha: [],
    fecha: "",
    horario: [],
    servicios: [],
    calificacionMinima: 0,
    radio: 10, // Radio de búsqueda en km
    coordenadas: null, // Para almacenar lat/lng de la ubicación actual
  });

  // Cargar canchas desde el backend al montar el componente y cada vez que cambie la búsqueda
  // Solo cuando NO hay una sede seleccionada
  useEffect(() => {
    try {
      let query = "";

      if (selectedSedeId) {
        // Si hay sede seleccionada, enviar parámetros para filtrar escenarios del backend
        const params = new URLSearchParams();
        params.set("view", "escenarios");
        params.set("sedeId", selectedSedeId);
        if (busqueda) params.set("q", busqueda);
        query = params.toString();
        dispatch(fetchCanchas(query));
      } else if (!selectedSedeId) {
        // Si no hay sede, buscar sedes por término general
        query = busqueda ? `q=${encodeURIComponent(busqueda)}` : "";
        dispatch(fetchCanchas(query));
      }
    } catch (err) {
      setError(err.message || "Error al cargar las sedes");
    }
  }, [dispatch, busqueda, selectedSedeId]);

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

  const aplicarFiltros = () => {
    // Construir parámetros de búsqueda para la API
    const params = new URLSearchParams();

    if (busqueda) params.set("q", busqueda);
    if (filtros.ubicacion) params.set("location", filtros.ubicacion);
    if (filtros.precioMin > 0) params.set("minPrice", String(filtros.precioMin));
    if (filtros.precioMax < 5000) params.set("maxPrice", String(filtros.precioMax));
    if (filtros.tipoCancha.length) params.set("fieldType", filtros.tipoCancha.join(","));
    if (filtros.fecha) params.set("date", filtros.fecha);
    if (filtros.horario.length) params.set("timeSlot", filtros.horario.join(","));
    if (filtros.servicios.length) params.set("services", filtros.servicios.join(","));
    if (filtros.calificacionMinima > 0) params.set("minRating", String(filtros.calificacionMinima));
    if (filtros.radio) params.set("radius", String(filtros.radio));

    // Agregar coordenadas si están disponibles
    if (filtros.coordenadas) {
      params.set("lat", String(filtros.coordenadas.lat));
      params.set("lng", String(filtros.coordenadas.lng));
    }

    // Llamar a la API con los filtros
    try {
      dispatch(fetchCanchas(params.toString()));
    } catch (err) {
      setError(err.message || "Error al aplicar filtros");
    }

    setFiltrosAbiertos(false);
  };

  const limpiarFiltros = () => {
    setFiltros({
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

  return (
    <div className="p-6">
      {/* Encabezado y búsqueda */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {selectedSede ? selectedSede.nombre : "Encuentra tu sede y escenario"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {selectedSede
            ? `${escenariosSeleccionados.length} escenarios disponibles`
            : `${sedes.length} sedes disponibles cerca de ti`}
        </p>

        <div className="max-w-2xl mx-auto mt-4 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <Input
              placeholder={selectedSede ? "Buscar escenarios..." : "Buscar por nombre o ubicación..."}
              value={busqueda}
              onChange={handleBusquedaChange}
              icon={<Search className="w-5 h-5 text-gray-400" />}
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={() => setFiltrosAbiertos(true)}
              icon={<Filter className="w-5 h-5" />}
            >
              Filtros
            </Button>

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
                className="ml-2 text-sm"
              >
                Volver
              </Button>
            )}
          </div>

          {/* Componente de geolocalización */}
          <GeolocationSearch onLocationFound={handleLocationFound} className="mt-2" />


        </div>
      </div>

      {/* Filtros aplicados */}
      {Object.values(filtros).some((v) =>
        Array.isArray(v) ? v.length > 0 : v !== "" && v !== 0 && v !== 5000
      ) && (
          <div className="flex flex-wrap gap-2">
            {filtros.ubicacion && (
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                <MapPin className="w-4 h-4" />
                {filtros.ubicacion}
                <button onClick={() => handleFiltrosChange({ ubicacion: "" })}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {filtros.tipoCancha.map((tipo) => (
              <div
                key={tipo}
                className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {tipo}
                <button
                  onClick={() =>
                    handleFiltrosChange({
                      tipoCancha: filtros.tipoCancha.filter((t) => t !== tipo),
                    })
                  }
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {filtros.calificacionMinima > 0 && (
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                {filtros.calificacionMinima}+
                <button onClick={() => handleFiltrosChange({ calificacionMinima: 0 })}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Más filtros aplicados aquí */}

            <button
              onClick={limpiarFiltros}
              className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
            >
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
        size="lg"
      >
        <FiltrosCanchas
          filtros={filtros}
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
