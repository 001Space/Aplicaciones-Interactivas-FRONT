 
import React from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';

const ProductGrid = ({ sortBy, onProductCountChange }) => {
  const { products, loading, error } = useProducts();

  React.useEffect(() => {
    if (onProductCountChange) {
      if (loading) {
        onProductCountChange('Cargando productos...');
      } else if (error) {
        onProductCountChange('Error al cargar productos');
      } else if (products && products.length > 0) {
        onProductCountChange(`${products.length} productos encontrados`);
      } else {
        onProductCountChange('No hay productos disponibles');
      }
    }
  }, [products, loading, error, onProductCountChange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-accent-primary"></div>
        <span className="ml-3 text-lg">Cargando productos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error al cargar productos</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-accent-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-hover-highlight transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">☕</div>
        <h2 className="text-2xl font-semibold mb-4">No hay productos disponibles</h2>
        <p className="text-gray-600">Prueba más tarde o contacta al administrador.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;