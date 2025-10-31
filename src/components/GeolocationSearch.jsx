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
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className={`${className}`}>
      <Button
        onClick={getCurrentLocation}
        variant="secondary"
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Obteniendo ubicación...</span>
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            <span>Usar mi ubicación actual</span>
          </>
        )}
      </Button>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default GeolocationSearch;