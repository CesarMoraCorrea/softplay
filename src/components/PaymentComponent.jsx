import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Wallet, TestTube, CheckCircle, AlertCircle, Loader } from "lucide-react";
import Button from "./common/Button";
import api from "../api/axios.js";

// Configurar Stripe con clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_4eC39HqLyjWDarjtT1zdp7dc");

// Componente interno para el formulario de pago con Stripe
function StripePaymentForm({ reservaId, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Crear payment intent
      const { data } = await api.post("/payments/intent", { 
        reservaId, 
        paymentMethod: "stripe" 
      });
      
      const { clientSecret } = data;
      
      // Confirmar el pago
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setMessage(result.error.message);
        onPaymentError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // Confirmar el pago en el backend
        await api.post("/payments/confirm", {
          reservaId,
          paymentMethod: "stripe",
          transactionId: result.paymentIntent.id
        });
        
        setMessage("¡Pago exitoso!");
        onPaymentSuccess(result.paymentIntent);
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      const errorMessage = error.response?.data?.message || "Error al procesar el pago";
      setMessage(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pagar con Tarjeta
          </>
        )}
      </Button>
      
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.includes("exitoso") 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}>
          {message.includes("exitoso") ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message}
        </div>
      )}
    </form>
  );
}

// Componente principal de pago
export default function PaymentComponent({ reserva, onPaymentSuccess }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await api.get("/payments/methods");
      setPaymentMethods(data);
      if (data.length > 0) {
        setSelectedMethod(data[0].id);
      }
    } catch (error) {
      console.error("Error al cargar métodos de pago:", error);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Crear orden de PayPal
      const { data } = await api.post("/payments/intent", {
        reservaId: reserva._id,
        paymentMethod: "paypal"
      });

      // Simular confirmación de PayPal (en producción sería con PayPal SDK)
      setTimeout(async () => {
        try {
          await api.post("/payments/confirm", {
            reservaId: reserva._id,
            paymentMethod: "paypal",
            transactionId: data.orderId
          });
          
          setMessage("¡Pago con PayPal exitoso!");
          onPaymentSuccess({ id: data.orderId, method: "paypal" });
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Error al confirmar pago con PayPal";
          setMessage(errorMessage);
        } finally {
          setLoading(false);
        }
      }, 2000); // Simular delay de PayPal
    } catch (error) {
      console.error("Error en pago PayPal:", error);
      const errorMessage = error.response?.data?.message || "Error al procesar pago con PayPal";
      setMessage(errorMessage);
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Crear transacción de prueba
      const { data } = await api.post("/payments/intent", {
        reservaId: reserva._id,
        paymentMethod: "test"
      });

      // Confirmar automáticamente
      await api.post("/payments/confirm", {
        reservaId: reserva._id,
        paymentMethod: "test",
        transactionId: data.transactionId
      });
      
      setMessage("¡Pago de prueba exitoso!");
      onPaymentSuccess({ id: data.transactionId, method: "test" });
    } catch (error) {
      console.error("Error en pago de prueba:", error);
      const errorMessage = error.response?.data?.message || "Error al procesar pago de prueba";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    setMessage(error);
  };

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case "stripe":
        return <CreditCard className="w-5 h-5" />;
      case "paypal":
        return <Wallet className="w-5 h-5" />;
      case "test":
        return <TestTube className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  if (reserva.estado !== "pendiente") {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Completar Pago
      </h3>
      
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Total a pagar: <span className="font-semibold text-lg">${reserva.total.toLocaleString('es-AR')}</span>
        </p>
      </div>

      {/* Selector de método de pago */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Selecciona un método de pago:
        </label>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <label key={method.id} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mr-3"
              />
              <div className="flex items-center gap-3">
                {getMethodIcon(method.id)}
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {method.name}
                    {method.testMode && (
                      <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                        Modo Prueba
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Formulario de pago según método seleccionado */}
      {selectedMethod === "stripe" && (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            reservaId={reserva._id}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </Elements>
      )}

      {selectedMethod === "paypal" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Serás redirigido a PayPal para completar el pago de forma segura.
            </p>
          </div>
          <Button 
            onClick={handlePayPalPayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Procesando con PayPal...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Pagar con PayPal
              </>
            )}
          </Button>
        </div>
      )}

      {selectedMethod === "test" && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Modo de Prueba:</strong> Este pago no procesará dinero real. 
              Solo para fines de desarrollo y testing.
            </p>
          </div>
          <Button 
            onClick={handleTestPayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Procesando pago de prueba...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Simular Pago (Gratis)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Mensaje de estado */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
          message.includes("exitoso") 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}>
          {message.includes("exitoso") ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message}
        </div>
      )}
    </div>
  );
}