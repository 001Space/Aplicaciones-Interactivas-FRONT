import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import './Catalog.css';
import { categoryService } from '../services/categoryService';

function Filters({ categorias, value, onChange }) {
  const set = (k, v) => onChange?.({ ...value, [k]: v });

  return (
    <div className="filters-grid">
      <div className="filter-group">
        <label className="filter-label">Buscar</label>
        <input
          placeholder="Buscar productos..."
          value={value.q || ""}
          onChange={e => set("q", e.target.value)}
          className="filter-input"
        />
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Categoría</label>
        <select
          value={value.categoriaId || ""}
          onChange={e => set("categoriaId", e.target.value || undefined)}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Ordenar por</label>
        <select
          value={value.sortBy || "featured"}
          onChange={e => set("sortBy", e.target.value)}
          className="filter-select"
        >
          <option value="featured">Destacados</option>
          <option value="name">Nombre A-Z</option>
          <option value="price-low">Precio: Menor a Mayor</option>
          <option value="price-high">Precio: Mayor a Menor</option>
        </select>
      </div>
    </div>
  );
}

const Catalog = () => {
  const [filters, setFilters] = useState({
    q: '',
    categoriaId: undefined,
    sortBy: 'featured'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  
  const { products, loading, error, stats, refetch } = useProducts(filters);
  const { addToCart: addToCartHook, loading: cartLoading } = useCart();
  const { user } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriasError, setCategoriasError] = useState(null);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setCategoriasLoading(true);
        setCategoriasError(null);
        const data = await categoryService.getCategorias();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setCategoriasError(err);
        setCategorias([]);
      } finally {
        setCategoriasLoading(false);
      }
    };
    loadCategorias();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = async (product, event) => {
    event.preventDefault(); 
    event.stopPropagation(); 

    if (!user) {
      showNotification('Por favor inicia sesión para agregar productos al carrito', 'error');
      return;
    }

    setAddingToCart(product.id);
    
    try {
      const result = await addToCartHook(product);
      
      if (result.success) {
        showNotification(`${product.nombre} agregado al carrito`, 'success');
      } else {
        showNotification(result.error || 'Error al agregar al carrito', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error al agregar al carrito', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      categoriaId: undefined,
      sortBy: 'featured'
    });
  };

  const handleRefetch = () => {
    refetch();
  };

  const getProductImage = (product) => {
    if (product.imagenUrl) return product.imagenUrl;
    if (product.imagen) return product.imagen;
    return `https://picsum.photos/300/200?random=${product.id}`;
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '$0.00';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Agotado', class: 'out-of-stock' };
    if (stock <= 5) return { text: `Últimas ${stock} unidades`, class: 'low-stock' };
    return { text: 'En stock', class: 'in-stock' };
  };

  const getCategoryName = (categoriaId) => {
    const categoria = categorias.find(c => c.id == categoriaId);
    return categoria ? categoria.nombre : `Categoría ${categoriaId}`;
  };

  return (
    <div className="catalog-page">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <section className="catalog-hero">
        <div className="container">
          <div className="catalog-hero-content">
            <h1 className="catalog-hero-title">
              Catálogo <span className="highlight">Completo</span>
            </h1>
            <p className="catalog-hero-description">
              Explora todos nuestros granos de café premium. 
              Descubre una selección exclusiva para los verdaderos amantes del café.
            </p>
            <div className="catalog-hero-buttons">
              <button 
                className={`btn-primary ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter"></i>
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {showFilters && (
        <section className="filters-panel">
          <div className="container">
            <div className="filters-header">
              <h3>Filtrar Productos</h3>
              <button className="btn-outline" onClick={clearFilters}>
                <i className="fas fa-times"></i>
                Limpiar Filtros
              </button>
            </div>
            
            <Filters 
              categorias={categorias}
              value={filters}
              onChange={setFilters}
            />

            <div className="filters-stats">
              <div className="stat-item">
                <span className="stat-number">{stats?.total || 0}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="catalog-content-section">
        <div className="container">
          <div className="catalog-controls">
            <div className="controls-left">
              <p className="product-count-text">

                
                {filters.categoriaId && ` (Filtrado por: ${getCategoryName(filters.categoriaId)})`}
                {filters.q && ` (Buscando: "${filters.q}")`}
              </p>
              
              <div className="active-filters">
                {filters.categoriaId && (
                  <span className="active-filter-tag">
                    Categoría: {getCategoryName(filters.categoriaId)}
                    <button onClick={() => setFilters(prev => ({...prev, categoriaId: undefined}))}>×</button>
                  </span>
                )}
                {filters.q && (
                  <span className="active-filter-tag">
                    Buscando: "{filters.q}"
                    <button onClick={() => setFilters(prev => ({...prev, q: ''}))}>×</button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando productos premium...</p>
              <small>Buscando los mejores granos para ti</small>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error al cargar productos</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button 
                  onClick={handleRefetch}
                  className="btn-primary"
                >
                  <i className="fas fa-sync"></i>
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="catalog-content">
              {!products || products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No hay productos disponibles</h3>
                  <p>
                    {filters.categoriaId 
                      ? `No encontramos productos en la categoría "${getCategoryName(filters.categoriaId)}"`
                      : filters.q
                      ? `No encontramos productos que coincidan con "${filters.q}"`
                      : 'No hay productos disponibles en este momento'
                    }
                  </p>
                  <div className="empty-actions">
                    <button onClick={clearFilters} className="btn-primary">
                      <i className="fas fa-times"></i>
                      Limpiar Filtros
                    </button>
                    <Link to="/" className="btn-outline">
                      <i className="fas fa-home"></i>
                      Volver al Inicio
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="products-grid-catalog">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product.stock || 0);
                      const isAdding = addingToCart === product.id;
                      
                      return (
                        <Link 
                          to={`/producto/${product.id}`}
                          key={product.id} 
                          className="product-card-catalog product-card-link"
                        >
                          <div className="product-image-catalog">
                            <img 
                              src={getProductImage(product)} 
                              alt={product.nombre}
                              onError={(e) => {
                                e.target.src = `https://picsum.photos/300/200?random=${product.id}`;
                              }}
                            />
                                                        {product.stock !== undefined && product.stock <= 10 && (
                              <div className={`stock-badge-catalog ${stockStatus.class}`}>
                                {stockStatus.text}
                              </div>
                            )}
                          </div>
                          
                          <div className="product-info-catalog">
                            <h3 className="product-name-catalog">{product.nombre}</h3>
                            
                            {product.categoriaId && (
                              <div className="product-category-catalog">
                                <span className="category-badge-catalog">
                                  {getCategoryName(product.categoriaId)}
                                </span>
                              </div>
                            )}
                            
                            <p className="product-description-catalog">
                              {product.descripcion || 'Granos de café premium seleccionados cuidadosamente.'}
                            </p>

                            <div className="product-price-catalog">
                              {formatPrice(product.precio)}
                            </div>

                            <div className="stock-info-catalog">
                              <span className={`stock-text ${stockStatus.class}`}>
                                {stockStatus.text}
                              </span>
                            </div>

                            <button 
                              className={`add-to-cart-btn-catalog ${product.stock === 0 ? 'disabled' : ''} ${isAdding ? 'loading' : ''}`}
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={product.stock === 0 || cartLoading || isAdding || !user}
                            >
                              {isAdding ? (
                                <div className="loading-spinner-small"></div>
                              ) : product.stock === 0 ? (
                                'Agotado'
                              ) : !user ? (
                                <>
                                  <i className="fas fa-lock"></i>
                                  Iniciar Sesión
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-shopping-cart"></i>
                                  Agregar al Carrito
                                </>
                              )}
                            </button>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="catalog-footer">
                    <div className="catalog-summary">
                      <p className="final-product-count">
                        Mostrando <strong>{products.length}</strong> productos
                        {filters.categoriaId && ` en ${getCategoryName(filters.categoriaId)}`}
                      </p>
                      {/* Removed extra stats (disponibles/premium) for cleaner footer */}
                    </div>
                    <div className="catalog-actions">
                      <Link to="/" className="btn-outline">
                        <i className="fas fa-home"></i>
                        Volver al Inicio
                      </Link>
                      
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Catalog;
