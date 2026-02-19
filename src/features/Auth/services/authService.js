import api from "../../../api/axios.js";

/**
 * Servicios de autenticación
 * Contienen la lógica de peticiones HTTP hacia el backend
 */

export const authService = {
  /**
   * Realiza el login del usuario
   * @param {Object} credentials - { email, password, captchaId, captchaInput }
   * @returns {Promise} Token y datos del usuario
   */
  login: async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error de conexión";
      throw new Error(message);
    }
  },

  /**
   * Realiza el registro de nuevo usuario
   * @param {Object} userData - { name, email, password, role, captchaId, captchaInput }
   * @returns {Promise} Token y datos del nuevo usuario
   */
  register: async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error de conexión";
      throw new Error(message);
    }
  },

  /**
   * Obtiene los datos del usuario actual
   * @returns {Promise} Datos del usuario autenticado
   */
  getMe: async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al obtener usuario";
      throw new Error(message);
    }
  },

  /**
   * Guarda el token en localStorage
   * @param {string} token - JWT token
   */
  saveToken: (token) => {
    localStorage.setItem("token", token);
  },

  /**
   * Obtiene el token del localStorage
   * @returns {string|null} Token o null
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Guarda los datos del usuario en localStorage
   * @param {Object} user - Objeto de usuario
   */
  saveUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  /**
   * Obtiene los datos del usuario del localStorage
   * @returns {Object|null} Objeto del usuario o null
   */
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Limpia el token y usuario del localStorage (logout)
   */
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export default authService;
