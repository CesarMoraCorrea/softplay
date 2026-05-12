import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import SedeReservaForm from "../features/reservas/components/SedeReservaForm";
import api from "../api/axios";

export default function SedeReservaPage() {
  const { sedeId } = useParams();
  const navigate = useNavigate();
  const [sede, setSede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sedeId) return;
    setLoading(true);
    api.get(`/sedes/${sedeId}`)
      .then(({ data }) => setSede(data))
      .catch(() => setError("No se pudo cargar la información de la sede."))
      .finally(() => setLoading(false));
  }, [sedeId]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center h-72">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-pulse" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando sede...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 dark:text-red-300 font-semibold mb-4">{error}</p>
            <button
              onClick={() => navigate("/canchas")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Canchas
            </button>
          </div>
        )}

        {!loading && !error && sede && (
          <SedeReservaForm
            sede={sede}
            onClose={() => navigate("/canchas")}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
