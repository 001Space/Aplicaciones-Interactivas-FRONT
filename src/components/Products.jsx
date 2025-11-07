
import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import './Products.css';

const getDefaultImage = (productName) => {
  const defaultImages = {
    'geisha': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23F0EAD6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%236B8E23'%3E☕ Geisha%3C/text%3E%3C/svg%3E",
    'marcala': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23F0EAD6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%236B8E23'%3E☕ Marcala%3C/text%3E%3C/svg%3E",
    'default': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23F0EAD6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%236B8E23'%3E☕ Café Premium%3C/text%3E%3C/svg%3E"
  };

  const nameLower = productName?.toLowerCase() || '';
  
  if (nameLower.includes('geisha')) return defaultImages.geisha;
  if (nameLower.includes('marcala')) return defaultImages.marcala;
  
  return defaultImages.default;
};

const Products = () => {
  const [filters, setFilters] = useState({
    categoriaId: '',
    q: ''
  });
  
  const { products, loading, error } = useProducts(filters);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      alert('Por favor inicia sesión para agregar productos al carrito');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    setSuccessMessage('');

    try {
      const result = await addToCart(product, 1);
      
      if (result.success) {
        setSuccessMessage(`✅ "${product.nombre}" agregado al carrito`);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar producto al carrito');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, q: e.target.value }));
  };

  if (loading) {
    return (
      <section className="products" id="products">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando productos desde la base de datos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="products" id="products">
        <div className="container">
          <div className="error-message">
            <h3>Error al cargar productos</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="products" id="products">
      <div className="container">
        <div className="section-header">
          <h2>Nuestra Colección Premium</h2>
          <p>Descubre tu próximo café favorito</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="status-panel">
          <h4>📊 Estado del Sistema</h4>
          <div className="status-info">
            <span><strong>Productos cargados:</strong> {products?.length || 0}</span>
            <span><strong>Estado:</strong> 
              {loading ? '🔄 Cargando...' : error ? '❌ Error' : products?.length > 0 ? '✅ Con datos' : '⚠️ Sin datos'}
            </span>
            <span><strong>Filtro:</strong> "{filters.q}"</span>
          </div>
          {products?.length === 0 && !loading && !error && (
            <p className="no-data-warning">
              ⚠️ No hay productos en la base de datos o no se pudieron cargar
            </p>
          )}
        </div>

        <div className="products-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="search-input"
              onChange={handleSearch}
              value={filters.q}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="products-grid">
          {products && products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img 
                    src={product.imagenUrl || product.imagen || getDefaultImage(product.nombre)} 
                    alt={product.nombre}
                    onError={(e) => {
                      e.target.src = getDefaultImage(product.nombre);
                    }}
                  />
                  {(product.stock > 0 || product.stock === undefined || product.stock === null) ? (
                    <div className="stock-badge in-stock">En stock</div>
                  ) : (
                    <div className="stock-badge out-of-stock">Sin Stock</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.nombre}</h3>
                  <p className="product-description">
                    {product.descripcion || "Descripción no disponible"}
                  </p>
                  <div className="product-price">
                    ${product.precio ? product.precio.toFixed(2) : '0.00'}
                  </div>
                  
                  <div className="product-meta">
                    {product.categoria && (
                      <div className="product-category">
                        <strong>Categoría:</strong> {product.categoria.nombre}
                      </div>
                    )}
                    {product.stock !== undefined && product.stock !== null && (
                      <div className="product-stock">
                        <strong>Stock:</strong> {product.stock} unidades
                      </div>
                    )}
                  </div>
                  
                  <div className="product-actions">
                    <button 
                      className={`add-to-cart-btn ${addingToCart[product.id] ? 'adding' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        addingToCart[product.id] || 
                        (product.stock !== undefined && product.stock !== null && product.stock === 0)
                      }
                    >
                      {addingToCart[product.id] ? (
                        <>
                          <span className="loading-spinner-small"></span>
                          Agregando...
                        </>
                      ) : (
                        '🛒 Agregar al Carrito'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No se encontraron productos</h3>
              <p>
                {error 
                  ? `Error: ${error}` 
                  : 'La base de datos está vacía o no hay productos disponibles'
                }
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-btn"
              >
                Reintentar carga
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;