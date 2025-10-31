import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCanchas } from "../redux/slices/canchasSlice.js";
import { Link } from "react-router-dom";
import { imageUrl } from "../utils/imageUrl.js";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Filter, 
  X, 
  ChevronDown, 
  Heart, 
  Share2,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowLeft
} from "lucide-react";

export default function Canchas() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.canchas);
  
  // Estados para búsqueda y filtros
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    location: "",
    radius: 10,
    minPrice: 0,
    maxPrice: 100,
    fieldType: "",
    date: "",
    timeSlot: "",
    services: [],
    minRating: 0,
    horario: [],
    calificacion: 0,
    tipoCancha: ""
  });

  const popularSearches = ["Centro"];
  const fieldTypes = ["Césped Natural", "Césped Artificial", "Pista Cubierta"];
  const services = ["Aparcamiento", "Iluminación", "Vestuarios", "Duchas", "Alquiler de Equipos", "Cafetería"];
  const timeSlots = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  useEffect(() => {
    dispatch(fetchCanchas());
  }, [dispatch]);

  const search = () => {
    dispatch(fetchCanchas(q));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    // Aquí puedes aplicar la lógica de filtrado según el tipo seleccionado
  };

  const handleServiceToggle = (service) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      radius: 10,
      minPrice: 0,
      maxPrice: 100,
      fieldType: "",
      date: "",
      timeSlot: "",
      services: [],
      minRating: 0,
      horario: [],
      calificacion: 0,
      tipoCancha: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors mr-4">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Encuentra tu cancha perfecta
              </h1>
              <p className="text-gray-600">
                Más de {list.length} canchas disponibles cerca de ti
              </p>
            </div>
          </div>

          {/* Búsqueda principal */}
          <div className="max-w-4xl mx-auto">
            <div className="relative flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Buscar canchas por nombre, ubicación..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && search()}
                />
              </div>
              <button 
                onClick={search}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Buscar
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {/* Búsquedas populares */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500 mr-2">Populares:</span>
              {popularSearches.map(search => (
                <button
                  key={search}
                  onClick={() => setQ(search)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ciudad/Zona"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2">
                  <label className="text-xs text-gray-500">Radio: {filters.radius}km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', e.target.value)}
                    className="w-full mt-1 accent-blue-600"
                  />
                </div>
              </div>

              {/* Fecha y Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filters.timeSlot}
                  onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                >
                  <option value="">Cualquier horario</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Precio por Hora
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ${filters.minPrice} - ${filters.maxPrice}
                </div>
              </div>

              {/* Tipo de Campo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Campo
                </label>
                <select
                  value={filters.fieldType}
                  onChange={(e) => handleFilterChange('fieldType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  {fieldTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Servicios */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Servicios</label>
              <div className="flex flex-wrap gap-2">
                {services.map(service => (
                  <button
                    key={service}
                    onClick={() => handleServiceToggle(service)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.services.includes(service)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Valoración */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Valoración Mínima</label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', rating)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.minRating === rating
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    {rating > 0 ? `${rating}+` : 'Todas'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles de vista y resultados */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {list.length} canchas encontradas
            </h2>
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Buscando...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg ${viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="Vista de cuadrícula"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="Vista de lista"
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 relative"
              aria-label="Mostrar filtros"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {Object.values(filters).some(val => 
                Array.isArray(val) ? val.length > 0 : val !== "" && val !== 0
              ) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Grid de canchas */}
        <div className={`grid gap-8 ${
          viewType === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {list.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
            >
              {/* Imagen con overlay */}
              <div className="relative overflow-hidden">
                {c.imagenes?.[0] ? (
                  <img
                    src={imageUrl(c.imagenes[0])}
                    alt={c.nombre}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback cuando no hay imagen o falla la carga */}
                <div className={`w-full h-56 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center ${c.imagenes?.[0] ? 'hidden' : 'flex'}`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">{c.nombre}</p>
                  <p className="text-gray-400 text-sm">Imagen no disponible</p>
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Botones de acción en overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={() => toggleFavorite(c._id)}
                    className="p-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl hover:bg-white transition-all duration-200 hover:scale-110"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        favorites.has(c._id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600 hover:text-red-500'
                      }`} 
                    />
                  </button>
                  <button className="p-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl hover:bg-white transition-all duration-200 hover:scale-110">
                    <Share2 className="w-5 h-5 text-gray-600 hover:text-blue-500" />
                  </button>
                </div>

                {/* Badge de disponibilidad */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm">
                    ✓ Disponible
                  </span>
                </div>

                {/* Badge de precio destacado */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/95 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                    <span className="text-lg font-bold text-green-600">${c.precioHora}</span>
                    <span className="text-sm text-gray-500">/h</span>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-7">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      {c.nombre}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{c.direccion}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700">4.8</span>
                  </div>
                </div>

                {/* Precio destacado */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-3xl font-bold text-gray-900">${c.precioHora}</span>
                        <span className="text-gray-500 ml-1">/hora</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Distancia</p>
                      <p className="text-lg font-semibold text-gray-700">2.3 km</p>
                    </div>
                  </div>
                </div>

                {/* Servicios disponibles */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Servicios incluidos</p>
                  <div className="flex flex-wrap gap-2">
                    {['Aparcamiento', 'Vestuarios', 'Iluminación'].slice(0, 3).map(service => (
                      <span 
                        key={service}
                        className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      >
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Horarios disponibles */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Próximos horarios</p>
                  <div className="flex gap-2">
                    {['18:00', '19:00', '20:00'].map(time => (
                      <span key={time} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botón de acción */}
                <Link 
                  to={`/canchas/${c._id}`}
                  className="block w-full py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-center font-bold rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group-hover:shadow-2xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Ver Detalles y Reservar
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {!loading && list.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron canchas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Intenta ajustar tus criterios de búsqueda
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}