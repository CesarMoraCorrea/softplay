import { useState } from "react";
import api from "../api/axios";

export default function MercadoPagoConnect({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/payments/mercadopago/oauth/url");
      window.location.href = data.url;
    } catch (e) {
      setError("No se pudo obtener la URL de autorización");
      setLoading(false);
    }
  };

  const isConnected = user?.mpConnected;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-w-md">
      <div className="flex items-center gap-3">
        {/* Logo MP */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#009ee3" }}>
          <span className="text-white font-bold text-xs">MP</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">MercadoPago</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected ? "Cuenta conectada ✔" : "Conecta tu cuenta para recibir pagos"}
          </p>
        </div>
        <div className="ml-auto">
          {isConnected ? (
            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
              Activo
            </span>
          ) : (
            <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              No conectado
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!isConnected && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="mt-1 w-full py-2 px-4 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "#009ee3" }}
        >
          {loading ? "Redirigiendo..." : "Conectar cuenta MercadoPago"}
        </button>
      )}

      {isConnected && (
        <p className="text-xs text-gray-400 mt-1">
          ID MP: {user.mpUserId} · {user.mpLiveMode ? "Producción" : "Sandbox/Pruebas"}
        </p>
      )}
    </div>
  );
}
