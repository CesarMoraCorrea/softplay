import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  X,
} from "lucide-react";

// Fix íconos Leaflet para Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Home() {
  const mapRef = useRef(null);        // div del mapa
  const mapInstance = useRef(null);   // objeto Leaflet
  const fieldMarkersRef = useRef([]); // marcadores de canchas

  const [fields, setFields] = useState([]);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [userPos, setUserPos] = useState(null);

  // catálogos
  const fieldTypes = ["Césped Natural", "Césped Artificial", "Pista Cubierta"];
  const servicesCatalog = [
    "Aparcamiento",
    "Iluminación",
    "Vestuarios",
    "Duchas",
    "Alquiler de Equipos",
    "Cafetería",
  ];
  const timeSlots = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  // Filtros
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
  });

  // Inicializar mapa solo una vez
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([-34.6037, -58.3816], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    // Geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos({ lat, lng });
          mapInstance.current.setView([lat, lng], 14);
          L.marker([lat, lng])
            .addTo(mapInstance.current)
            .bindPopup("Tu ubicación actual")
            .openPopup();
        },
        (err) => {
          console.warn("Error de geolocalización:", err);
          setError("No pudimos obtener tu ubicación");
        }
      );
    }

    fetchFields();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleServiceToggle = (service) => {
    setFilters((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
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
    });
  };

  const clearFieldMarkers = () => {
    fieldMarkersRef.current.forEach((m) => {
      if (mapInstance.current && mapInstance.current.hasLayer(m)) {
        mapInstance.current.removeLayer(m);
      }
    });
    fieldMarkersRef.current = [];
  };

  const fetchFields = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);

      params.set("minPrice", String(filters.minPrice));
      params.set("maxPrice", String(filters.maxPrice));
      if (filters.fieldType) params.set("fieldType", filters.fieldType);
      if (filters.location) params.set("location", filters.location);
      if (filters.date) params.set("date", filters.date);
      if (filters.timeSlot) params.set("timeSlot", filters.timeSlot);
      if (filters.minRating) params.set("minRating", String(filters.minRating));
      if (filters.services.length) params.set("services", filters.services.join(","));
      if (filters.radius) params.set("radius", String(filters.radius));

      if (userPos) {
        params.set("lat", String(userPos.lat));
        params.set("lng", String(userPos.lng));
      }

      const res = await fetch(`/api/canchas?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar canchas");
      const data = await res.json();
      setFields(data);

      clearFieldMarkers();

      const markers = [];
      data.forEach((field) => {
        if (field.ubicacion?.lat && field.ubicacion?.lng) {
          const marker = L.marker([field.ubicacion.lat, field.ubicacion.lng])
            .addTo(mapInstance.current)
            .bindPopup(
              `<b>${field.nombre}</b><br/>${field.direccion || ""}<br/>$${field.precioHora}/hora`
            );
          fieldMarkersRef.current.push(marker);
          markers.push(marker);
        }
      });

      if (markers.length) {
        const group = L.featureGroup(markers);
        mapInstance.current.fitBounds(group.getBounds().pad(0.25));
      }
    } catch (err) {
      console.error("Error cargando canchas:", err);
      setError("Error cargando canchas");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero + Buscador */}
      <section className="py-10 bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">  perfecta</h1>
          <p className="text-gray-600 mb-6">
            Más de {fields.length} canchas disponibles cerca de ti
          </p>

          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre o ubicación..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                onKeyDown={(e) => e.key === "Enter" && fetchFields()}
              />
            </div>
            <button
              onClick={fetchFields}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Buscar
            </button>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="px-4 py-3 border rounded-lg flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtros
            </button>
          </div>
        </div>
      </section>

      {/* Panel de Filtros */}
      {showFilters && (
        <section className="bg-white border-b shadow-sm py-6">
          <div className="max-w-7xl mx-auto px-4">
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
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Aquí mantienes los filtros (ubicación, precio, tipo, servicios, etc.) */}
            {/* ... mismos bloques de filtros que ya tienes ... */}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={fetchFields}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Aplicar filtros
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mapa */}
      <section className="flex-1 relative">
        <div ref={mapRef} className="w-full h-[500px]" />
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}