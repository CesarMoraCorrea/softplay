import React, { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
import Button from './common/Button';

const GeolocationSearch = ({ onLocationFound, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);

  // Función para obtener la ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por tu navegador');
      return;
    }

    setLoading(true);
    setError(null);

    // Firefox's location provider is slower; give it more time
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition({ lat: latitude, lng: longitude });

        // Llamar al callback con la posición encontrada
        if (onLocationFound) {
          onLocationFound({ lat: latitude, lng: longitude });
        }

        setLoading(false);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Usuario denegó la solicitud de geolocalización');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('La información de ubicación no está disponible');
            break;
          case error.TIMEOUT:
            setError('La solicitud para obtener la ubicación del usuario expiró');
            break;
          default:
            setError('Ocurrió un error desconocido');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: isFirefox ? 15000 : 5000, maximumAge: 0 }
    );
  };

  return (
    <div className={`${className}`}>
      <Button
        onClick={getCurrentLocation}
        variant="secondary"
        disabled={loading}
        className={`flex items-center justify-center gap-2 whitespace-nowrap px-3 sm:px-4 ${className}`}
        title="Localizar sedes cerca de mi ubicación"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Cargando...</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Mi Ubicación</span>
          </>
        )}
      </Button>

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50">
          <p className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-200 shadow-lg truncate pointer-events-none">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default GeolocationSearch;