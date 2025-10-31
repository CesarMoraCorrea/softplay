import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { GoogleMap, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Star, Clock, DollarSign } from "lucide-react";

function GoogleMapsView({ canchas = [], onCanchaSelect, userLocation = null }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
  // Bloquea el auto-fit cuando volvemos a /canchas
  const [suppressFitBounds, setSuppressFitBounds] = useState(false);

  // Geoloc automática si no viene por props
  const [autoUserLocation, setAutoUserLocation] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: ["places", "marker"],
  });

  const parseCoord = (value) => {
    if (value === null || value === undefined) return NaN;
    if (typeof value === "string") {
      const normalized = value.trim().replace(",", ".");
      return Number(normalized);
    }
    return Number(value);
  };

  // Intentar obtener ubicación al inicio si no viene por props
  useEffect(() => {
    if (userLocation && userLocation.lat != null && userLocation.lng != null) return;
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAutoUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err?.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [userLocation]);

  // Usa userLocation si es válido; si no, usa autoUserLocation
  const currentUserLocation = useMemo(() => {
    const latProp = parseCoord(userLocation?.lat);
    const lngProp = parseCoord(userLocation?.lng);
    const validProp =
      !(Number.isNaN(latProp) || Number.isNaN(lngProp)) &&
      latProp >= -90 &&
      latProp <= 90 &&
      lngProp >= -180 &&
      lngProp <= 180;

    if (validProp) {
      return { lat: latProp, lng: lngProp };
    }

    const latAuto = parseCoord(autoUserLocation?.lat);
    const lngAuto = parseCoord(autoUserLocation?.lng);
    const validAuto =
      !(Number.isNaN(latAuto) || Number.isNaN(lngAuto)) &&
      latAuto >= -90 &&
      latAuto <= 90 &&
      lngAuto >= -180 &&
      lngAuto <= 180;

    return validAuto ? { lat: latAuto, lng: lngAuto } : null;
  }, [userLocation, autoUserLocation]);

  // Configuración del mapa
  const mapContainerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "12px",
  };

  // Centro del mapa - usar ubicación del usuario o centro de Cali, Colombia por defecto
  const center = useMemo(() => {
    if (currentUserLocation) {
      return {
        lat: currentUserLocation.lat,
        lng: currentUserLocation.lng,
      };
    }
    // Centro de Cali, Colombia por defecto
    return {
      lat: 3.4516,
      lng: -76.532,
    };
  }, [currentUserLocation]);

  // Opciones del mapa
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
    mapId: mapId || undefined,
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!map || !window.google) return;

    // Si estamos suprimiendo fitBounds, mantenemos vista baja
    if (suppressFitBounds) {
      if (currentUserLocation) {
        map.setCenter(currentUserLocation);
      }
      return;
    }

    // Si hay ubicación del usuario, céntralo y mantén zoom bajo
    if (currentUserLocation) {
      map.setCenter(currentUserLocation);
      map.setZoom(12);
      return;
    }

    // Sin ubicación: encuadra canchas
    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    canchas.forEach((cancha) => {
      const lat = parseCoord(cancha?.ubicacion?.lat ?? cancha?.lat);
      const lng = parseCoord(cancha?.ubicacion?.lng ?? cancha?.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      if (lat > 90 || lat < -90 || lng > 180 || lng < -180) return;
      bounds.extend({ lat, lng });
      hasPoints = true;
    });

    if (hasPoints) {
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        if (map.getZoom() > 16) map.setZoom(16);
      });
      return () => window.google.maps.event.removeListener(listener);
    }
  }, [map, canchas, currentUserLocation, suppressFitBounds]);

  // Reiniciar vista al volver a /canchas
  useEffect(() => {
    if (!map) return;
    if (pathname === "/canchas") {
      setSuppressFitBounds(true);
      setSelectedCancha(null);
      if (currentUserLocation) {
        map.setCenter(currentUserLocation);
      }
      map.setZoom(13);
    } else {
      // En otras rutas, permite auto-fit
      setSuppressFitBounds(false);
    }
  }, [pathname, map, currentUserLocation]);

  // Manejar click en marcador
  const handleMarkerClick = (cancha) => {
    // Redirigir directamente a la página de reserva de la cancha
    if (cancha && cancha._id) {
      navigate(`/reservar/${cancha._id}`);
      return;
    }
    // Fallback: mantener comportamiento anterior
    setSelectedCancha(cancha);
    if (onCanchaSelect) onCanchaSelect(cancha);
  };

  // Cerrar InfoWindow
  const handleInfoWindowClose = () => {
    setSelectedCancha(null);
  };

  // Referencias a marcadores avanzados
  const userAdvancedMarkerRef = useRef(null);
  const canchaAdvancedMarkersRef = useRef([]);

  // Utilidad para limpiar cualquier tipo de marcador
  const clearMarker = (m) => {
    if (!m) return;
    if (typeof m.setMap === "function") {
      m.setMap(null); // clásico
    } else {
      m.map = null; // advanced
    }
  };

  useEffect(() => {
    if (!map || !window.google || !isLoaded) return;

    // Limpieza previa
    clearMarker(userAdvancedMarkerRef.current);
    userAdvancedMarkerRef.current = null;
    canchaAdvancedMarkersRef.current.forEach(clearMarker);
    canchaAdvancedMarkersRef.current = [];

    const canUseAdvanced =
      !!import.meta.env.VITE_GOOGLE_MAPS_MAP_ID &&
      !!window.google.maps.marker &&
      !!window.google.maps.marker.AdvancedMarkerElement &&
      !!window.google.maps.marker.PinElement;

    // Crear marcador de usuario como punto azul circular
    if (currentUserLocation) {
      if (canUseAdvanced) {
        const dot = document.createElement("div");
        dot.style.cssText =
          "width:12px;height:12px;border-radius:50%;background:#4285F4;box-shadow:0 0 0 6px rgba(66,133,244,0.3)";
        userAdvancedMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: currentUserLocation,
          title: "Tu ubicación",
          content: dot,
          zIndex: 1000,
        });
      } else {
        // Fallback clásico: círculo azul
        userAdvancedMarkerRef.current = new window.google.maps.Marker({
          map,
          position: currentUserLocation,
          title: "Tu ubicación",
          zIndex: 1000,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      }
    }

    // Crear marcadores para las canchas (rojo), evitando superposición exacta con tu ubicación
    const created = [];
    canchas.forEach((cancha) => {
      const lat = parseCoord(cancha?.ubicacion?.lat ?? cancha?.lat);
      const lng = parseCoord(cancha?.ubicacion?.lng ?? cancha?.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      if (lat > 90 || lat < -90 || lng > 180 || lng < -180) return;
      if (
        currentUserLocation &&
        Math.abs(lat - currentUserLocation.lat) < 1e-6 &&
        Math.abs(lng - currentUserLocation.lng) < 1e-6
      ) {
        return;
      }

      let marker;
      if (canUseAdvanced) {
        const canchaPin = new window.google.maps.marker.PinElement({
          background: "#EF4444",
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
        });
        marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: cancha?.nombre || "Cancha",
          content: canchaPin.element,
        });
        marker.addListener("click", () => {
          if (cancha && cancha._id) {
            navigate(`/reservar/${cancha._id}`);
            return;
          }
          setSelectedCancha(cancha);
          if (onCanchaSelect) onCanchaSelect(cancha);
        });
      } else {
        marker = new window.google.maps.Marker({
          map,
          position: { lat, lng },
          title: cancha?.nombre || "Cancha",
        });
        marker.addListener("click", () => {
          if (cancha && cancha._id) {
            navigate(`/reservar/${cancha._id}`);
            return;
          }
          setSelectedCancha(cancha);
          if (onCanchaSelect) onCanchaSelect(cancha);
        });
      }

      created.push(marker);
    });
    canchaAdvancedMarkersRef.current = created;

    return () => {
      clearMarker(userAdvancedMarkerRef.current);
      userAdvancedMarkerRef.current = null;
      canchaAdvancedMarkersRef.current.forEach(clearMarker);
      canchaAdvancedMarkersRef.current = [];
    };
  }, [map, isLoaded, canchas, currentUserLocation, navigate, onCanchaSelect]);

  useEffect(() => {
    if (isLoaded) {
      console.log("Google Maps script loaded successfully");
    }
  }, [isLoaded]);

  // Si no hay API key configurada, mostrar vista alternativa
  if (!apiKey || apiKey.trim() === "") {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-800 font-medium mb-2">Canchas Disponibles</h3>
              <p className="text-blue-700 text-sm mb-4">
                Explora las canchas disponibles en nuestra plataforma:
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {canchas.map((cancha) => (
                  <div
                    key={cancha._id}
                    className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {cancha.imagenes && cancha.imagenes.length > 0 && (
                        <img
                          src={cancha.imagenes[0]}
                          alt={cancha.nombre}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2">{cancha.nombre}</h4>

                        <div className="flex items-center gap-1 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {cancha.direccion || "Dirección no disponible"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          {cancha.calificacion && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">
                                {cancha.calificacion.toFixed(1)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600">
                              S/ {cancha.precioHora}/hora
                            </span>
                          </div>
                        </div>

                        {cancha.ubicacion?.lat && cancha.ubicacion?.lng && (
                          <div className="text-xs text-gray-500 mb-3">
                            📍 {cancha.ubicacion.lat.toFixed(4)}, {cancha.ubicacion.lng.toFixed(4)}
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (onCanchaSelect) onCanchaSelect(cancha);
                            window.open(`/reservar/${cancha._id}`, "_blank");
                          }}
                          className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {canchas.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay canchas disponibles para mostrar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar errores de carga del script
  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="text-red-800 font-medium">Error al cargar Google Maps</h3>
        <p className="text-red-600 text-sm mt-1">
          No se pudo cargar Google Maps. Verifica la conexión a internet y la API key.
        </p>
      </div>
    );
  }

  // Mostrar estado de carga mientras el script se inicializa
  if (!isLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GoogleMap
        key={pathname}
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={options}
      >
        {/* Los AdvancedMarkerElement se crean en el efecto */}
        {/* InfoWindow de la cancha seleccionada */}
        {selectedCancha && selectedCancha.ubicacion?.lat && selectedCancha.ubicacion?.lng && (
          <InfoWindow
            position={{
              lat: selectedCancha.ubicacion.lat,
              lng: selectedCancha.ubicacion.lng,
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2">
              {selectedCancha.imagenes?.[0] && (
                <img
                  src={selectedCancha.imagenes[0]}
                  alt={selectedCancha.nombre}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <h3 className="font-semibold text-gray-900 mb-2">{selectedCancha.nombre}</h3>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {selectedCancha.direccion || "Dirección no disponible"}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                {selectedCancha.calificacion && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {selectedCancha.calificacion.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">S/ {selectedCancha.precioHora}/hora</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onCanchaSelect) onCanchaSelect(selectedCancha);
                  window.open(`/reservar/${selectedCancha._id}`, "_blank");
                }}
                className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Reservar
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Información adicional cuando no hay canchas */}
      {isLoaded && canchas.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          <p>No hay canchas para mostrar en el mapa</p>
        </div>
      )}
    </div>
  );
}

export default GoogleMapsView;
