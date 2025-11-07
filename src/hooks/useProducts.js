// hooks/useProducts.js
import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrev: false
  });

  // Función simplificada para validar URLs de imagen
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    const trimmedUrl = url.trim();
    if (trimmedUrl === '') return false;
    
    // URLs problemáticas
    const blockedPatterns = [
      'google.com/url?',
      'google.com/search?',
      'google.com/imgres?',
      'accounts.google.com',
      'drive.google.com'
    ];
    
    if (blockedPatterns.some(pattern => trimmedUrl.includes(pattern))) {
      return false;
    }
    
    // Aceptar URLs HTTP/HTTPS y rutas relativas
    if (trimmedUrl.startsWith('http://') || 
        trimmedUrl.startsWith('https://') || 
        trimmedUrl.startsWith('/') ||
        trimmedUrl.startsWith('data:image/')) {
      return true;
    }
    
    return false;
  };

  // Función para obtener placeholder
  const getCategoryPlaceholder = (category) => {
    const placeholders = {
      'café': '/images/coffee-placeholder.jpg',
      'té': '/images/tea-placeholder.jpg',
      'accesorio': '/images/accessory-placeholder.jpg',
      'default': '/images/product-placeholder.jpg'
    };
    
    const categoryKey = category?.toLowerCase() || 'default';
    return placeholders[categoryKey] || placeholders.default;
  };

  // Función para normalizar productos
  const normalizeProduct = (product) => {
    if (!product) return null;

    // Buscar campo de imagen
    const findImageField = () => {
      const imageFields = ['imagenUrl', 'imagen', 'imageUrl', 'image', 'url'];
      
      for (const field of imageFields) {
        if (product[field] && typeof product[field] === 'string' && product[field].trim() !== '') {
          const imageUrl = product[field].trim();
          if (isValidImageUrl(imageUrl)) {
            return imageUrl;
          }
        }
      }
      
      // Usar placeholder si no hay imagen válida
      const category = product.categoria || product.category || product.categoriaNombre || 'café';
      return getCategoryPlaceholder(category);
    };

    const imageUrl = findImageField();
    const precio = parseFloat(product.precio || product.price || 0);
    const stock = parseInt(product.stock) || 100;

    return {
      id: product.id || `prod-${Date.now()}`,
      nombre: product.nombre || product.name || 'Producto sin nombre',
      descripcion: product.descripcion || product.description || 'Descripción no disponible',
      precio: precio,
      precioConDescuento: product.precioConDescuento,
      categoriaId: product.categoriaId,
      categoriaNombre: product.categoriaNombre,
      imagenUrl: imageUrl,
      stock: stock,
      available: stock > 0,
      categoria: product.categoria || product.categoriaNombre || 'café',
      origen: product.origen || 'Colombia',
      tipo: product.tipo || 'grano'
    };
  };

  // Función para construir parámetros de la API
  const buildApiFilters = (filters, page = 0) => {
    const apiFilters = {
      page: page,
      size: 50 // Más productos por página
    };
    
    if (filters.categoriaId && filters.categoriaId !== '') {
      apiFilters.categoriaId = filters.categoriaId;
    }
    
    if (filters.q && filters.q.trim() !== '') {
      apiFilters.q = filters.q.trim();
    }

    return apiFilters;
  };

  // Función principal para cargar productos
  const loadProducts = async (filters) => {
    try {
      let allProducts = [];
      let currentPage = 0;
      let hasMorePages = true;

      // Cargar múltiples páginas si es necesario
      while (hasMorePages) {
        const apiFilters = buildApiFilters(filters, currentPage);
        const response = await apiClient.getProductos(apiFilters);
        
        let productsData = [];
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(response)) {
          productsData = response;
          hasMorePages = false;
        } else if (response && Array.isArray(response.content)) {
          productsData = response.content;
          hasMorePages = currentPage < (response.totalPages - 1);
          
          setPagination({
            currentPage: currentPage,
            totalPages: response.totalPages || 1,
            totalElements: response.totalElements || productsData.length,
            hasNext: currentPage < (response.totalPages - 1),
            hasPrev: currentPage > 0
          });
        } else if (response && Array.isArray(response.data)) {
          productsData = response.data;
          hasMorePages = false;
        } else {
          productsData = [];
          hasMorePages = false;
        }

        allProducts = [...allProducts, ...productsData];
        currentPage++;

        // Limitar para evitar bucles infinitos
        if (currentPage >= 10 || allProducts.length >= 200) {
          break;
        }
      }

      return allProducts;
    } catch (error) {
      console.error('Error cargando productos:', error);
      throw error;
    }
  };

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allProductsData = await loadProducts(filters);
        
        // Normalizar productos
        const normalizedProducts = allProductsData
          .map(product => normalizeProduct(product))
          .filter(product => product !== null);
        
        setProducts(normalizedProducts);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Error al cargar los productos');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters), reloadKey]);

  // Función para recargar
  const refetch = () => {
    setReloadKey((k) => k + 1);
  };

  return { 
    products, 
    loading, 
    error,
    refetch,
    pagination,
    stats: {
      total: products.length,
      available: products.filter(p => p.available).length,
      premium: products.filter(p => p.premium).length
    }
  };
};
