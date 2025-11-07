
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const { products, loading, error } = useProducts();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);

  useEffect(() => {
    if (!loading && products.length > 0) {
      console.log('🔍 Buscando producto en lista cargada:', productId);
      
      const foundProduct = products.find(p => 
        p.id == productId || 
        p.id === parseInt(productId)
      );
      
      if (foundProduct) {
        console.log('✅ Producto encontrado:', foundProduct);
        setProduct(foundProduct);
      } else {
        console.log('❌ Producto no encontrado en la lista');
        setProduct(null);
      }
    }
  }, [products, loading, productId]);

  const handleBuyNow = async () => {
    if (!user) {
      setShowLoginNotice(true);
      
      setTimeout(() => {
        setShowLoginNotice(false);
      }, 3000);
      
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      console.log('🛒 Agregando al carrito:', {
        productoId: product.id,
        nombre: product.nombre,
        cantidad: quantity
      });

      const result = await addToCart(product, quantity);
      
      if (result.success) {
        console.log('✅ Producto agregado al carrito');
        navigate('/carrito');
      } else {
        console.error('❌ Error al agregar al carrito:', result.error);
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      alert('Error al agregar al carrito: ' + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const getProductImage = (product) => {
    if (product.imagenUrl) return product.imagenUrl;
    if (product.imagen) return product.imagen;
    if (product.urlImagen) return product.urlImagen;
    
    return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando productos desde el servidor...</p>
        <small>Buscando en todas las páginas...</small>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error al Conectar con el Servidor</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
          <button onClick={() => navigate('/')} className="secondary-btn">
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!loading && !product) {
    return (
      <div className="error-container">
        <h2>Producto No Encontrado</h2>
        <p>El producto con ID {productId} no existe en nuestra base de datos.</p>
        <div className="error-actions">
          <button onClick={() => navigate('/catalog')} className="retry-btn">
            Ver Catálogo Completo
          </button>
          <button onClick={() => navigate('/')} className="secondary-btn">
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Buscando producto específico...</p>
      </div>
    );
  }

  const formatPrice = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00');

  const precio = Number(product?.precio) || 0;
  const precioConDescuento = Number(product?.precioConDescuento) || precio;

  const hasDiscount = precioConDescuento < precio;
  const ahorro = hasDiscount ? precio - precioConDescuento : 0;
  const percent = hasDiscount ? Math.round((ahorro / precio) * 100) : 0;
  const finalPrice = hasDiscount ? precioConDescuento : precio;


  return (
    <div className="product-detail">
      {showLoginNotice && (
        <div className="login-notice subtle">
          <div className="notice-content">
            <span className="notice-text">Para comprar, necesitas iniciar sesión</span>
            <button 
              className="notice-close"
              onClick={() => setShowLoginNotice(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <nav className="breadcrumb">
        <button onClick={() => navigate('/')} className="breadcrumb-link">
          Inicio
        </button> / 
        <button onClick={() => navigate('/catalog')} className="breadcrumb-link">
          Productos
        </button> / 
        <span>{product.nombre}</span>
      </nav>

      <div className="product-main">
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={getProductImage(product)} 
              alt={product.nombre}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
              }}
            />
            {hasDiscount && (
              <span className="discount-badge">-{percent}%</span>
            )}
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.nombre}</h1>
          
          <div className="product-meta">
            {product.categoria && (
              <span className="product-category">{product.categoria}</span>
            )}
          </div>

          <div className="product-pricing">
            <span className="current-price">${formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="original-price">${formatPrice(precio)}</span>
                <span className="discount-percent">
                  Ahorras ${formatPrice(ahorro)}
                </span>
              </>
            )}
          </div>

          <div className="availability">
            <span className={`status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'En stock' : 'Agotado'}
            </span>
            <span className="stock-info">
              ({product.stock || 0} unidades disponibles)
            </span>
          </div>

          <div className="product-description">
            <p>{product.descripcion || 'Descripción no disponible.'}</p>
          </div>

          <div className="purchase-options">
            <div className="quantity-selector">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || product.stock === 0}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock || product.stock === 0}
              >
                +
              </button>
            </div>
            
            <div className="action-buttons">
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0 || addingToCart}
              >
                {addingToCart ? 'Procesando...' : 
                 product.stock === 0 ? 'Agotado' : 'Comprar Ahora'}
              </button>
            </div>
          </div>

          <div className="additional-info">
            <div className="info-item">
              <span>🚚 Envío gratuito</span>
            </div>
            <div className="info-item">
              <span>↩️ Devolución en 30 días</span>
            </div>
            <div className="info-item">
              <span>🛡️ Garantía incluida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
