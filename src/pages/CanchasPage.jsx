import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin, Star, X, ArrowLeft, Map, List } from "lucide-react";
import CanchaCard from "../features/canchas/components/CanchaCard";
import FiltrosCanchas from "../features/canchas/components/FiltrosCanchas";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";
import GeolocationSearch from "../components/GeolocationSearch";
import GoogleMapsView from "../components/GoogleMapsView";

// Importamos la acción para obtener canchas del backend
import { fetchCanchas } from "../redux/slices/canchasSlice";

const CanchasPage = () => {
  const dispatch = useDispatch();
  const { list: canchas, loading } = useSelector((state) => state.canchas);

  // Estado local para errores
  const [error, setError] = useState(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vistaActual, setVistaActual] = useState("mapa"); // 'lista' o 'mapa' - por defecto mapa
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

  // Cargar canchas desde el backend al montar el componente
  useEffect(() => {
    try {
      dispatch(fetchCanchas(busqueda));
    } catch (err) {
      setError(err.message || "Error al cargar las canchas");
    }
  }, [dispatch, busqueda]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
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

  // Ya no necesitamos filtrar localmente, el backend se encarga de eso
  const canchasFiltradas = canchas;

  return (
    <div className="p-6">
      {/* Encabezado y búsqueda */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Encuentra tu cancha perfecta
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Más de {canchas.length} canchas disponibles cerca de ti
        </p>

        <div className="max-w-2xl mx-auto mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre o ubicación..."
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

            {/* Toggle para cambiar entre vista lista y mapa */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setVistaActual("mapa")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === "mapa"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Map className="w-4 h-4" />
                Mapa
              </button>
              <button
                onClick={() => setVistaActual("lista")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === "lista"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>
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
        <Alert variant="error" title="Error al cargar canchas" onClose={() => setError(null)}>
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
      ) : canchasFiltradas.length > 0 ? (
        vistaActual === "mapa" ? (
          <GoogleMapsView userLocation={filtros.coordenadas} canchas={canchasFiltradas} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canchasFiltradas.map((cancha) => (
              <CanchaCard
                key={cancha._id}
                cancha={{
                  ...cancha,
                  precio: cancha.precioHora, // Mapear precioHora a precio para compatibilidad
                  horariosDisponibles: cancha.horarios || [], // Asegurar que siempre haya un array de horarios
                }}
                isFavorite={false} // En una implementación real, esto vendría del estado
                onToggleFavorite={() => toggleFavorito(cancha._id)}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<MapPin className="w-8 h-8 text-gray-400 dark:text-gray-300" />}
          title="No se encontraron canchas"
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
