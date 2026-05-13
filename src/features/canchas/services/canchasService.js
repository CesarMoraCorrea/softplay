import axios from '../../../api/axios';

export const canchasService = {
  // Obtener todas las canchas con filtros
  getAll: async (filters = {}) => {
    try {
      const response = await axios.get('/canchas', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener cancha por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`/canchas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Crear cancha (admin)
  create: async (data) => {
    try {
      const response = await axios.post('/canchas', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar cancha (admin)
  update: async (id, data) => {
    try {
      const response = await axios.put(`/canchas/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar cancha (admin)
  delete: async (id) => {
    try {
      const response = await axios.delete(`/canchas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Subir imagen
  uploadImage: async (formData) => {
    try {
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar por geolocalización
  searchByLocation: async (lat, lng, radius = 10) => {
    try {
      const response = await axios.get('/canchas', {
        params: { lat, lng, radius }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
