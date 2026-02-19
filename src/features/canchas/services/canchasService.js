import api from "../../../api/axios.js";

/**
 * Servicios de Canchas
 * Contienen la lógica de peticiones HTTP hacia el backend
 */

export const anchasService = {
  /**
   * Obtiene todas las canchas con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda (tipoCancha, servicios, horarios, etc.)
   * @returns {Promise} Lista de canchas
   */
  getAll: async (filters = {}) => {
    try {
      const { data } = await api.get("/canchas", { params: filters });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al obtener canchas";
      throw new Error(message);
    }
  },

  /**
   * Obtiene una cancha específica por ID
   * @param {string} id - ID de la cancha
   * @returns {Promise} Datos de la cancha
   */
  getById: async (id) => {
    try {
      const { data } = await api.get(`/canchas/${id}`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al obtener cancha";
      throw new Error(message);
    }
  },

  /**
   * Crea una nueva cancha (solo admin)
   * @param {Object} canchaData - Datos de la cancha
   * @returns {Promise} Cancha creada
   */
  create: async (canchaData) => {
    try {
      const { data } = await api.post("/canchas", canchaData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear cancha";
      throw new Error(message);
    }
  },

  /**
   * Actualiza una cancha existente (solo admin)
   * @param {string} id - ID de la cancha
   * @param {Object} canchaData - Datos actualizados
   * @returns {Promise} Cancha actualizada
   */
  update: async (id, canchaData) => {
    try {
      const { data } = await api.put(`/canchas/${id}`, canchaData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar cancha";
      throw new Error(message);
    }
  },

  /**
   * Elimina una cancha (solo admin)
   * @param {string} id - ID de la cancha
   * @returns {Promise} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      const { data } = await api.delete(`/canchas/${id}`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al eliminar cancha";
      throw new Error(message);
    }
  },

  /**
   * Sube una imagen para una cancha
   * @param {FormData} formData - FormData con la imagen
   * @returns {Promise} URL de la imagen subida
   */
  uploadImage: async (formData) => {
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error al subir imagen";
      throw new Error(message);
    }
  },

  /**
   * Busca canchas por ubicación (geolocalización)
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {number} radius - Radio de búsqueda en km
   * @returns {Promise} Canchas cercanas
   */
  searchByLocation: async (lat, lng, radius = 10) => {
    try {
      const { data } = await api.get("/canchas", {
        params: {
          lat,
          lng,
          radius
        }
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Error en búsqueda por ubicación";
      throw new Error(message);
    }
  }
};

export default anchasService;
