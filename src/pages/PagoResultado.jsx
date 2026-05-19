import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle, FiClock, FiCalendar, FiArrowRight } from "react-icons/fi";
import api from "../api/axios";

const REDIRECT_SECONDS = 6;

export default function PagoResultado() {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [reserva, setReserva] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success'|'failure'|'pending'

  const params = new URLSearchParams(location.search);
  const status = params.get("status");
  const reservaId = params.get("reservaId");

  // Consultar estado real del pago al backend
  useEffect(() => {
    const checkStatus = async () => {
      if (reservaId) {
        try {
          const { data } = await api.get(`/payments/mercadopago/status/${reservaId}`);
          if (data.estadoPago === "pagado") {
            setPaymentStatus("success");
          } else if (status === "failure") {
            setPaymentStatus("failure");
          } else {
            setPaymentStatus("pending");
          }
          setReserva(data);
        } catch {
          setPaymentStatus(status || "pending");
        }
      } else {
        setPaymentStatus(status || "pending");
      }
    };
    checkStatus();
  }, [reservaId, status]);

  // Countdown y auto-redirect
  useEffect(() => {
    if (paymentStatus === null) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/mis-reservas?status=${paymentStatus}&reservaId=${reservaId || ""}`, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentStatus, navigate, reservaId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Mientras verifica el estado
  if (paymentStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verificando tu pago…</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus === "success";
  const isFailure = paymentStatus === "failure";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Tarjeta principal */}
        <div className={`rounded-2xl shadow-xl overflow-hidden border-2
          ${isSuccess ? "border-green-200 dark:border-green-700"
            : isFailure ? "border-red-200 dark:border-red-700"
            : "border-yellow-200 dark:border-yellow-700"}`}>

          {/* Header con ícono */}
          <div className={`px-8 py-10 flex flex-col items-center text-center
            ${isSuccess ? "bg-green-50 dark:bg-green-900/40"
              : isFailure ? "bg-red-50 dark:bg-red-900/40"
              : "bg-yellow-50 dark:bg-yellow-900/40"}`}>

            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5
              ${isSuccess ? "bg-green-100 dark:bg-green-800"
                : isFailure ? "bg-red-100 dark:bg-red-800"
                : "bg-yellow-100 dark:bg-yellow-800"}`}>
              {isSuccess
                ? <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-300" />
                : isFailure
                  ? <FiAlertCircle className="w-10 h-10 text-red-600 dark:text-red-300" />
                  : <FiClock className="w-10 h-10 text-yellow-600 dark:text-yellow-300" />}
            </div>

            <h1 className={`text-2xl font-bold mb-2
              ${isSuccess ? "text-green-800 dark:text-green-200"
                : isFailure ? "text-red-800 dark:text-red-200"
                : "text-yellow-800 dark:text-yellow-200"}`}>
              {isSuccess ? "¡Reserva confirmada!" : isFailure ? "Pago no completado" : "Pago en proceso"}
            </h1>

            <p className={`text-sm
              ${isSuccess ? "text-green-700 dark:text-green-300"
                : isFailure ? "text-red-700 dark:text-red-300"
                : "text-yellow-700 dark:text-yellow-300"}`}>
              {isSuccess
                ? "Tu pago fue acreditado y la reserva está confirmada."
                : isFailure
                  ? "El pago fue rechazado. Puedes intentarlo nuevamente."
                  : "Tu pago está siendo procesado. Te notificaremos cuando se confirme."}
            </p>
          </div>

          {/* Detalles de la reserva */}
          {isSuccess && reserva && (
            <div className="bg-white dark:bg-gray-800 px-8 py-5 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Detalle de la reserva
              </h2>
              {reserva.cancha?.nombre && (
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                  <span className="text-lg">🏟️</span>
                  <span>{reserva.cancha.nombre}</span>
                </div>
              )}
              {reserva.fecha && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <FiCalendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="capitalize">{formatDate(reserva.fecha)}</span>
                </div>
              )}
              {reserva.horaInicio && reserva.horaFin && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <FiClock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>{reserva.horaInicio} – {reserva.horaFin}</span>
                </div>
              )}
              {reserva.total && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total pagado</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${Number(reserva.total).toLocaleString("es-CO")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer con botón y countdown */}
          <div className="bg-white dark:bg-gray-800 px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3">
            <Link
              to={`/mis-reservas?status=${paymentStatus}&reservaId=${reservaId || ""}`}
              replace
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all
                ${isSuccess ? "bg-green-600 hover:bg-green-700"
                  : isFailure ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-500 hover:bg-yellow-600"}`}>
              {isSuccess ? "Ver mis reservas" : isFailure ? "Volver e intentar de nuevo" : "Ver estado de mi reserva"}
              <FiArrowRight className="w-4 h-4" />
            </Link>
            {countdown > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Redirigiendo automáticamente en {countdown}s…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
