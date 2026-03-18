import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Star, Clock, DollarSign } from "lucide-react";

const mapLibraries = ["places", "marker"];

const mapStyleClean = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }]
  }
];

function GoogleMapsView({ canchas = [], onCanchaSelect, onVerEscenarios, userLocation = null }) {
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
    libraries: mapLibraries,
  });

  const parseCoord = (value) => {
    if (value === null || value === undefined) return NaN;
    if (typeof value === "string") {
      const normalized = value.trim().replace(",", ".");
      return Number(normalized);
    }
    return Number(value);
  };

  const parseEntityId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value !== "[object Object]" ? value : null;
    if (typeof value === "object") {
      if (typeof value.$oid === "string") return value.$oid;
      if (typeof value.toString === "function") {
        const result = value.toString();
        return result && result !== "[object Object]" ? result : null;
      }
    }
    return null;
  };

  const getReservaId = (cancha) => {
    if (cancha?.isSede) return null;
    const escenarioId = parseEntityId(cancha?.escenarioId);
    if (escenarioId) return escenarioId;

    const fallbackId = parseEntityId(cancha?._id) || parseEntityId(cancha?.id);
    const looksLikeEscenario = Boolean(cancha?.tipoCancha) || cancha?.precioHora != null;
    return looksLikeEscenario ? fallbackId : null;
  };

  const obtenerHorarioHoy = (horarios) => {
    if (!horarios) return "Horario no disponible";

    const diaHoyNum = new Date().getDay(); // 0 is Sunday, 6 is Saturday

    // Check if it's the new backend structure: Array(7)
    if (Array.isArray(horarios) && horarios.length === 7) {
      const horarioHoy = horarios[diaHoyNum];
      if (!horarioHoy || horarioHoy.isAbierto === false) return "Cerrado hoy";
      if (horarioHoy.apertura && horarioHoy.cierre) {
        return `${horarioHoy.apertura} - ${horarioHoy.cierre}`;
      }
    }

    // Check if it's a simple apertura/cierre object
    if (horarios.apertura && horarios.cierre) {
      return `${horarios.apertura} - ${horarios.cierre}`;
    }

    // Fallback: check map format { domingo, lunes... }
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaHoy = dias[diaHoyNum];

    // Check if there is a schedule for today
    const horarioHoy = horarios[diaHoy];
    if (horarioHoy) {
      if (horarioHoy.cerrado || !horarioHoy.abierto) return "Cerrado hoy";
      if (horarioHoy.apertura && horarioHoy.cierre) return `${horarioHoy.apertura} - ${horarioHoy.cierre}`;
    }

    // Fallback if not structured by day or missing today
    return "Horarios variables";
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
    height: "calc(100vh - 280px)",
    borderRadius: "12px",
    minHeight: "400px",
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
    // styles is ignored when mapId is present (must configure via Cloud Console)
    ...(mapId ? {} : { styles: mapStyleClean }),
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
    const reservaId = getReservaId(cancha);
    // Redirigir directamente a la página de reserva solo si es un escenario reservable
    if (reservaId) {
      navigate(`/reservar/${reservaId}`);
      return;
    }

    if (onCanchaSelect) onCanchaSelect(cancha);

    // Close any existing card IMMEDIATELY to avoid it being dragged during pan
    setSelectedCancha(null);

    // Pan the map FIRST, then show the card AFTER it settles
    if (map && cancha.ubicacion?.lat && cancha.ubicacion?.lng) {
      const zoom = map.getZoom() || 13;
      const pixelsToShift = 150;
      const latPerPixel = 360 / (256 * Math.pow(2, zoom));
      const latOffset = pixelsToShift * latPerPixel;
      map.panTo({
        lat: cancha.ubicacion.lat + latOffset,
        lng: cancha.ubicacion.lng,
      });
      // Show the new card only after the map pan animation has settled
      setTimeout(() => {
        setSelectedCancha(cancha);
      }, 450);
    } else {
      setSelectedCancha(cancha);
    }
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
        // Custom image marker: circular thumbnail with pointer
        const markerEl = document.createElement('div');
        markerEl.style.cssText = `
          display: flex; flex-direction: column; align-items: center; cursor: pointer;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
          transition: transform 0.2s ease, filter 0.2s ease;
        `;
        markerEl.addEventListener('mouseenter', () => {
          markerEl.style.transform = 'scale(1.15) translateY(-4px)';
          markerEl.style.filter = 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))';
        });
        markerEl.addEventListener('mouseleave', () => {
          markerEl.style.transform = 'scale(1) translateY(0)';
          markerEl.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))';
        });

        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
          width: 64px; height: 64px; border-radius: 50%;
          border: 3px solid #2563EB; background: white; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        `;

        if (cancha.imagenes?.[0]) {
          const img = document.createElement('img');
          img.src = cancha.imagenes[0];
          img.alt = cancha.nombre || 'Sede';
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          imgContainer.appendChild(img);
        } else {
          // Fallback: colored circle with first letter
          imgContainer.style.background = '#2563EB';
          imgContainer.style.color = 'white';
          imgContainer.style.fontSize = '18px';
          imgContainer.style.fontWeight = 'bold';
          imgContainer.innerHTML = (cancha.nombre || 'S').charAt(0).toUpperCase();
        }

        // Small triangle pointer below the circle
        const pointer = document.createElement('div');
        pointer.style.cssText = `
          width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-top: 8px solid #2563EB; margin-top: -1px;
        `;

        markerEl.appendChild(imgContainer);
        markerEl.appendChild(pointer);

        marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: cancha?.nombre || "Cancha",
          content: markerEl,
        });
        marker.addListener("click", () => {
          handleMarkerClick(cancha);
        });
      } else {
        marker = new window.google.maps.Marker({
          map,
          position: { lat, lng },
          title: cancha?.nombre || "Cancha",
        });
        marker.addListener("click", () => {
          handleMarkerClick(cancha);
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
                            const reservaId = getReservaId(cancha);
                            if (onCanchaSelect) onCanchaSelect(cancha);
                            if (reservaId) {
                              window.open(`/reservar/${reservaId}`, "_blank");
                            } else if (onVerEscenarios) {
                              onVerEscenarios(cancha);
                            }
                          }}
                          className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!getReservaId(cancha) && !onVerEscenarios}
                        >
                          {getReservaId(cancha) ? "Reservar" : "Ver escenarios"}
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
      <style>{`
        /* Smooth entrance animation for the popup card */
        @keyframes popupSlideIn {
          0% {
            opacity: 0;
            transform: translate(-50%, calc(-100% - 30px));
          }
          100% {
            opacity: 1;
            transform: translate(-50%, calc(-100% - 45px));
          }
        }
        .popup-card-animated {
          opacity: 0;
          transform: translate(-50%, calc(-100% - 30px));
          animation: popupSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          backface-visibility: hidden;
          will-change: transform, opacity;
        }
        /* Maps container global styles (no longer need hacky rules) */
      `}</style>
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
          <OverlayView
            position={{
              lat: selectedCancha.ubicacion.lat,
              lng: selectedCancha.ubicacion.lng,
            }}
            mapPaneName={OverlayView.FLOAT_PANE}
          >
            <div
              className="relative shadow-2xl rounded-[12px] bg-white w-[280px] sm:w-[320px] text-left popup-card-animated"
            >
              {/* Close Button Inside the Card Overlay */}
              <button
                className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 transition-colors w-7 h-7 rounded-full flex items-center justify-center z-20 shadow-md text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInfoWindowClose();
                }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className="w-4 h-4" strokeWidth='2.5'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>

              <div className="flex flex-col overflow-hidden w-full font-sans relative" style={{ borderRadius: '12px' }}>
                {/* Header Cover Image */}
                <div className="h-40 w-full bg-gray-100 relative" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  {selectedCancha.imagenes?.[0] ? (
                    <img
                      src={selectedCancha.imagenes[0]}
                      alt={selectedCancha.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-200/50">
                      <MapPin className="w-10 h-10 opacity-30" />
                    </div>
                  )}

                  {/* Top-Right: Price Badge */}
                  {selectedCancha.precioHora > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-md text-gray-900 px-2 py-1 rounded shadow-sm text-[11px] font-bold">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      S/ {selectedCancha.precioHora}/h
                    </div>
                  )}

                  {/* Top-Left: Barrio (If available) */}
                  {selectedCancha.barrio && (
                    <div className="absolute top-2 left-2 flex items-center bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-medium tracking-wide shadow-sm">
                      {selectedCancha.barrio}
                    </div>
                  )}

                  {/* Bottom-Left: Rating Badge */}
                  {selectedCancha.calificacion && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-md text-gray-800 px-2.5 py-1 rounded text-[11px] font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span>{selectedCancha.calificacion.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-3.5 pb-5 flex flex-col gap-2.5">
                  {/* Title and Address Row */}
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">
                      {selectedCancha.nombre}
                    </h3>
                    <div className="flex items-start gap-1 mt-1 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 mt-[2px] flex-shrink-0" />
                      <span className="text-xs line-clamp-1 leading-snug">
                        {selectedCancha.direccion || "Dirección no disponible"}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid (Horarios / Escenarios) */}
                  <div className="grid grid-cols-2 gap-2 pb-1 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate" title={obtenerHorarioHoy(selectedCancha.horarios)}>
                        {obtenerHorarioHoy(selectedCancha.horarios)}
                      </span>
                    </div>

                    {selectedCancha.isSede && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-700">
                          {selectedCancha.escenariosCount || 0} {/* fallback if undefined */} Escenarios
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amenities Row (Icons only to save space) */}
                  {selectedCancha.servicios && selectedCancha.servicios.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 w-full mt-0.5 mb-1">
                      {selectedCancha.servicios.slice(0, 5).map((servicio, idx) => (
                        <div key={idx} className="bg-gray-100/80 text-gray-600 text-[9px] font-semibold px-2 py-1 rounded uppercase tracking-wider">
                          {servicio}
                        </div>
                      ))}
                      {selectedCancha.servicios.length > 5 && (
                        <div className="bg-gray-100/80 text-gray-500 text-[9px] font-bold px-1.5 py-1 rounded">
                          +{selectedCancha.servicios.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Call to Action */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const reservaId = getReservaId(selectedCancha);
                      if (onCanchaSelect) onCanchaSelect(selectedCancha);
                      if (reservaId) {
                        window.open(`/reservar/${reservaId}`, "_blank");
                      } else if (onVerEscenarios) {
                        onVerEscenarios(selectedCancha);
                      }
                    }}
                    className="w-full mt-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transform hover:-translate-y-0.5 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!getReservaId(selectedCancha) && !onVerEscenarios}
                  >
                    {getReservaId(selectedCancha) ? "Reservar ahora" : "Ver escenarios disponibles"}
                  </button>
                </div>

                {/* Down Arrow / Tip */}
                <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-[2px_2px_4px_rgba(0,0,0,0.1)]"></div>
              </div>
            </div>
          </OverlayView>
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
