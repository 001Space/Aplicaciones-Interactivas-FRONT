import { apiClient } from './api';

export const categoryService = {
  async getCategorias() {
    try {
      const response = await apiClient.getCategorias();
      console.log('📂 Categorías obtenidas de API:', response);
      
      if (response.content && Array.isArray(response.content)) {
        return response.content;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Formato de respuesta inesperado:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      throw error;
    }
  },

  async createCategoria(categoriaData) {
    try {
      console.log('🆕 Creando categoría:', categoriaData);
      const response = await apiClient.createCategoria(categoriaData);
      console.log('✅ Categoría creada en BD:', response);
      return response;
    } catch (error) {
      if (error?.status === 403) {
        console.error('❌ Error 403 creando categoría (permisos insuficientes):', error);
        throw new Error('No autorizado para crear categorías (permisos insuficientes).');
      }
      console.error('❌ Error creando categoría:', error);
      throw error;
    }
  },

  async updateCategoria(id, categoriaData) {
    try {
      console.log('✏️ Actualizando categoría:', id, categoriaData);
      const response = await apiClient.updateCategoria(id, categoriaData);
      console.log('✅ Categoría actualizada en BD:', response);
      return response;
    } catch (error) {
      if (error?.status === 403) {
        console.error('❌ Error 403 actualizando categoría (permisos insuficientes):', error);
        throw new Error('No autorizado para actualizar categorías (permisos insuficientes).');
      }
      console.error('❌ Error actualizando categoría:', error);
      throw error;
    }
  },

  async deleteCategoria(id) {
    try {
      console.log('🗑️ Eliminando categoría:', id);
      await apiClient.deleteCategoria(id);
      console.log('✅ Categoría eliminada de BD');
    } catch (error) {
        if (error?.status === 403) {
        console.error('❌ Error 403 eliminando categoría (permisos insuficientes):', error);
        throw new Error('No autorizado para eliminar categorías (permisos insuficientes).');
      }
      console.error('❌ Error eliminando categoría:', error);
      throw error;
    }
  }
};
