import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  console.log('🎯 ProductCard renderizando:', {
    id: product.id,
    nombre: product.nombre,
    precio: product.precio,
    tieneImagen: !!(product.imagenUrl || product.imagen),
    estructura: Object.keys(product)
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  const {
    id,
    nombre,
    descripcion,
    precio,
    imagenUrl,
    imagen,
    stock,
    categoria,
    origen,
    nivelTueste,
    disponible,
    descuento: descuentoRaw, 
  } = product;

  const formatCOP = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const precioConDescuento = Number(product?.precioConDescuento) || Number(precio) || 0;
  const hasDiscount = precioConDescuento < precio;
  const ahorro = hasDiscount ? precio - precioConDescuento : 0;
  const percent = hasDiscount ? Math.round((ahorro / precio) * 100) : 0;
  const finalPrice = hasDiscount ? precioConDescuento : precio;


  const handleAddToCart = async () => {
    console.log('🛒 Intentando agregar al carrito:', nombre);
    try {
      await addToCart(product);
      console.log('✅ Producto agregado al carrito:', nombre);
    } catch (error) {
      console.error('❌ Error añadiendo al carrito:', error);
    }
  };

  const handleImageError = (e) => {
    console.log('❌ Error cargando imagen para:', nombre, 'URL:', e.target.src);
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Imagen cargada correctamente:', nombre);
    setImageLoaded(true);
  };

  const getProductBadge = () => {
    if (hasDiscount) return `${percent}% OFF`;
    if (precio > 50000) return '⭐ Premium';
    if (origen === 'Colombia') return '🇨🇴 Colombiano';
    if (categoria === 'orgánico') return '🌱 Orgánico';
    return '☕ Especial';
  };

  const getImageUrl = () => {
    if (imageError) {
      return `https://picsum.photos/300/200?random=${id}&grayscale`;
    }
    const url = imagenUrl || imagen;
    if (url && !url.includes('example.com')) {
      return url;
    }
    return `https://picsum.photos/300/200?random=${id}`;
  };

  return (
    <div 
      className="product-card-catalog"
      style={{ 
        border: '2px solid #4CAF50',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        background: '#4CAF50',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        zIndex: 10
      }}>
        CARD
      </div>

      <div className="product-image-container" style={{ border: '1px solid #FF9800', position: 'relative' }}>
        {!imageLoaded && !imageError && (
          <div className="image-skeleton">
            <div className="skeleton-loader"></div>
          </div>
        )}
        <img
          src={getImageUrl()}
          alt={nombre}
          className="product-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ border: '1px solid #2196F3' }}
        />
        <div className="product-badge">
          {getProductBadge()}
        </div>

        {hasDiscount && (
          <div
            className="discount-chip"
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: '#e6ffed',
              border: '1px solid #22c55e',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {percent}% OFF
          </div>
        )}
      </div>

      <div className="product-info-catalog" style={{ border: '1px solid #9C27B0' }}>
        <div className="product-category" style={{ color: '#673AB7' }}>
          {categoria || 'Café Especial'}
        </div>
        <h3 className="product-name-catalog" style={{ color: '#1976D2' }}>
          {nombre || 'Producto sin nombre'}
        </h3>
        <p className="product-description-catalog">
          {descripcion || 'Granos de café premium seleccionados cuidadosamente.'}
        </p>
        
        {origen && (
          <div className="product-origin">
            <span className="origin-icon">📍</span>
            {origen}
          </div>
        )}

        <div className="product-meta">
          <div className="roast-level">
            <span className="roast-label">Tostado:</span>
            <span className={`roast-value roast-${(nivelTueste || 'medio').toLowerCase()}`}>
              {nivelTueste || 'Medio'}
            </span>
          </div>
          <div className="product-stock">
            <span className="stock-icon">📦</span>
            {stock || 0} disponibles
          </div>
        </div>

        <div className="product-footer-catalog">
          <div className="price-section">
            <div className="product-price-catalog" style={{ color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="current-price">{formatCOP(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="original-price" style={{ textDecoration: 'line-through', color: '#888' }}>
                    {formatCOP(precio || 0)}
                  </span>
                  <span
                    className="discount-pill"
                    style={{
                      background: '#e6ffed',
                      border: '1px solid #22c55e',
                      color: '#166534',
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    {percent}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
          
          <button
            className="add-to-cart-btn-catalog"
            onClick={handleAddToCart}
            disabled={!disponible || (stock !== undefined && stock <= 0)}
            style={{ border: '1px solid #F57C00' }}
          >
            <span className="cart-icon">🛒</span>
            {(disponible === false || (stock !== undefined && stock <= 0)) ? 'Agotado' : 'Añadir al Carrito'}
          </button>
        </div>

        {(disponible === false || (stock !== undefined && stock <= 0)) && (
          <div className="out-of-stock-banner">
            Próximamente disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
