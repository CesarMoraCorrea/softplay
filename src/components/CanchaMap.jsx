import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function CanchaMap({ lat, lng }){
  const center = { lat: Number(lat) || 0, lng: Number(lng) || 0 };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Si no hay API key configurada, mostrar mensaje informativo
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
        <div className="text-center p-6">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Mapa no disponible<br/>
            <span className="text-xs">API key de Google Maps no configurada</span>
          </p>
          {lat && lng && (
            <p className="text-xs text-gray-500 mt-2">
              Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={{ width:"100%", height:"400px" }} center={center} zoom={15}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  )
}
