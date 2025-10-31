import axios from "axios";

// En desarrollo, usa el proxy de Vite para evitar puertos mal configurados
const baseURL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api");

const api = axios.create({
  baseURL: baseURL,
});

// Interceptor de request para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Error response:", {
        status: error.response.status,
        data: JSON.stringify(error.response.data, null, 2), // <- aquí lo hacemos legible
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Axios config error:", error.message);
    }
    return Promise.reject(error);
  }
);


export default api;