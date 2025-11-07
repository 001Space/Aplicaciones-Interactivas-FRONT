import { apiClient } from './api';

export const productService = {
  async getProductos() {
    try {
      const productos = await apiClient.getProductos();
      return productos;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  async getProducto(id) {
    try {
      const producto = await apiClient.getProducto(id);
      return producto;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw error;
    }
  },

  async createProducto(productoData) {
    try {
      const producto = await apiClient.createProducto(productoData);
      return producto;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  },

  async updateProducto(id, productoData) {
    try {
      const producto = await apiClient.updateProducto(id, productoData);
      return producto;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  },

  async deleteProducto(id) {
    try {
      const result = await apiClient.deleteProducto(id);
      return result;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }
};