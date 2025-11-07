
import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import './CartPage.css';
import { useNotify } from '../context/NotifyContext';

const CartPage = () => {
  const {
    cart,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    getTotalItems,
    getTotalPrice,
    isValidCartItem,
    getValidCartItems
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const [productosConImagenes, setProductosConImagenes] = useState({});
  const { notify, confirm } = useNotify();

  useEffect(() => {
    const cargarImagenesProductos = async () => {
      if (cart.items && cart.items.length > 0) {
        console.log('🔄 Cargando imágenes para productos del carrito...');
        
        try {
          const data = await apiClient.getProductos();
          console.log('📦 Respuesta de la API de productos:', data);
          
          let todosLosProductos = [];
          
          if (Array.isArray(data)) {
            todosLosProductos = data;
          } else if (data.content && Array.isArray(data.content)) {
            todosLosProductos = data.content;
          } else if (data.data && Array.isArray(data.data)) {
            todosLosProductos = data.data;
          } else if (data.productos && Array.isArray(data.productos)) {
            todosLosProductos = data.productos;
          } else {
            console.warn('⚠️ Formato de respuesta no reconocido:', data);
            todosLosProductos = [];
          }
          
          const mapaProductos = {};
          todosLosProductos.forEach(producto => {
            if (producto && producto.id) {
              mapaProductos[producto.id] = producto;
            }
          });
          
          setProductosConImagenes(mapaProductos);
          console.log('✅ Imágenes cargadas para productos:', Object.keys(mapaProductos).length);
          
        } catch (error) {
          console.error('❌ Error cargando productos:', error);
        }
      }
    };

    cargarImagenesProductos();
  }, [cart.items]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getCartItems = () => {
    if (getValidCartItems) {
      return getValidCartItems();
    }
    
    if (!cart) return [];
    if (Array.isArray(cart)) return cart;
    if (cart.items && Array.isArray(cart.items)) return cart.items.filter(item => 
      item?.itemId || item?.id
    );
    return [];
  };

  const items = getCartItems();

  const getSafeImage = (item) => {
    if (!item) {
      return getDefaultImage();
    }

    console.log('🔍 Buscando imagen para item:', item);

    if (item.productoId && productosConImagenes[item.productoId]) {
      const productoOriginal = productosConImagenes[item.productoId];
      console.log('✅ Producto original encontrado:', productoOriginal);
      
      if (productoOriginal.imagenUrl && productoOriginal.imagenUrl.trim() !== '') {
        console.log('🎯 Imagen encontrada en producto.imagenUrl:', productoOriginal.imagenUrl);
        return productoOriginal.imagenUrl;
      }
      if (productoOriginal.imagen && productoOriginal.imagen.trim() !== '') {
        
        const imageUrl = `http://localhost:8081/uploads/${productoOriginal.imagen}`;
        console.log('🎯 Imagen encontrada en producto.imagen:', imageUrl);
        return imageUrl;
      }
    }

    if (item.imagenUrl && item.imagenUrl.trim() !== '') {
      console.log('🎯 Imagen encontrada en item.imagenUrl:', item.imagenUrl);
      return item.imagenUrl;
    }

    console.log('❌ No se encontró imagen, usando por defecto');
    return getDefaultImage();
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f8f9fa'/%3E%3Cpath d='M80,60 L120,60 L120,100 L80,100 Z' fill='%23e9ecef' stroke='%236c757d' stroke-width='2'/%3E%3Ctext x='100' y='130' text-anchor='middle' font-family='Arial' font-size='14' fill='%236c757d'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
  };

  const getSafePrice = (item) => {
    const price = item?.precioUnitario || item?.precio || item?.producto?.precio || 0;
    return Number(price) || 0;
  };

  const getSafeName = (item) => {
    return item?.nombre || item?.producto?.nombre || 'Producto no disponible';
  };

  const getSafeDescription = (item) => {
    return item?.descripcion || item?.producto?.descripcion || 'Sin descripción disponible';
  };

  const getItemId = (item) => {
    const itemId = item?.itemId || item?.id;
    
    if (itemId === null || itemId === undefined || itemId === '') {
      console.warn('⚠️ Item sin ID válido:', item);
      return null;
    }
    
    return itemId;
  };
  
  const calculateItemSubtotal = (item) => {
    const precio = getSafePrice(item);
    const cantidad = Number(item?.cantidad || 1);
    return (precio * cantidad).toFixed(2);
  };

  const validateItem = (item, operation = 'operar con') => {
    if (!item) {
      notify.error('Error: Producto no disponible');
      return false;
    }

    if (isValidCartItem && !isValidCartItem(item)) {
      notify.error(`Error: No se puede ${operation} este producto (ID inválido)`);
      return false;
    }

    const itemId = getItemId(item);
    if (!itemId) {
      notify.error(`Error: No se puede ${operation} este producto (ID no identificable)`);
      return false;
    }

    return true;
  };

  const handleIncrement = async (item) => {
    if (!validateItem(item, 'incrementar')) return;

    const itemId = getItemId(item);
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const currentQuantity = item?.cantidad || 1;
      
      await updateCartItem(itemId, currentQuantity + 1);
      
    } catch (error) {
      console.error('Error incrementando cantidad:', error);
      notify.error('Error al actualizar la cantidad: ' + error.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleDecrement = async (item) => {
    if (!validateItem(item, 'reducir')) return;

    const itemId = getItemId(item);
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const currentQuantity = item?.cantidad || 1;
      
      if (currentQuantity <= 1) {
        await handleRemoveItem(item);
      } else {
        await updateCartItem(itemId, currentQuantity - 1);
      }
    } catch (error) {
      console.error('Error decrementando cantidad:', error);
      notify.error('Error al actualizar la cantidad: ' + error.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (item) => {
    if (!validateItem(item, 'eliminar')) return;

    const itemId = getItemId(item);
    if (await confirm({ title: 'Eliminar producto', message: '¿Estás seguro de que quieres eliminar este producto del carrito?', confirmText: 'Eliminar', cancelText: 'Cancelar' })) {
      try {
        setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
        await removeFromCart(itemId);
        notify.success('Producto eliminado del carrito');
      } catch (error) {
        console.error('Error eliminando item:', error);
        notify.error('Error: ' + error.message);
      } finally {
        setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
      }
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      notify.info('El carrito está vacío');
      return;
    }

    const invalidItems = items.filter(item => !validateItem(item, 'procesar en el checkout'));
    if (invalidItems.length > 0) {
      notify.warning('Algunos productos no se pueden procesar. Elimínelos del carrito antes de continuar.');
      return;
    }

    try {
      setProcessing(true);
      const result = await checkout();
      
      if (result && result.success) {
        notify.success('¡Pedido realizado con éxito! Gracias por tu compra.');
        navigate('/');
      } else if (result && (result.message || result.total !== undefined)) {
        notify.success('¡Pedido realizado con éxito! Gracias por tu compra.');
        navigate('/');
      } else {
        notify.success('¡Pedido realizado con éxito!');
        navigate('/');
      }
      
    } catch (error) {
      console.error('Error en checkout:', error);
      notify.error('Error al procesar el pedido: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) {
      notify.info('El carrito ya está vacío');
      return;
    }

    if (await confirm({ title: 'Vaciar carrito', message: `¿Estás seguro de que quieres vaciar todo el carrito? Se eliminarán ${getTotalItems()} productos.`, confirmText: 'Vaciar', cancelText: 'Cancelar' })) {
      try {
        await clearCart();
        notify.success('Carrito vaciado correctamente');
      } catch (error) {
        console.error('Error vaciando carrito:', error);
        notify.error('Error al vaciar carrito: ' + error.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="auth-required">
          <h2>🔒 Inicia sesión para ver tu carrito</h2>
          <p>Necesitas estar autenticado para acceder al carrito de compras.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="cart-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1> Mi Carrito de Compras</h1>
        <p>Gestiona tus productos seleccionados</p>
      </div>

      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Reintentar
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega algunos productos deliciosos de nuestro catálogo</p>
          <button onClick={() => navigate('/')} className="btn-primary">
             Continuar Comprando
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h2>Productos en el carrito ({getTotalItems()} items)</h2>
              <button 
                onClick={handleClearCart} 
                disabled={loading} 
                className="btn-danger"
                title="Eliminar todos los productos del carrito"
              >
                {loading ? '🔄 Procesando...' : ' Vaciar Carrito'}
              </button>
            </div>

            <div className="cart-items-list">
              {items.map((item, index) => {
                const itemId = getItemId(item);
                const isUpdating = updatingItems[itemId];
                const currentQuantity = item?.cantidad || 1;
                const itemName = getSafeName(item);
                const itemDescription = getSafeDescription(item);
                const isValidItem = isValidCartItem ? isValidCartItem(item) : true;

                return (
                  <div 
                    key={itemId || `item-${index}`} 
                    className={`cart-item ${isUpdating ? 'updating' : ''} ${!isValidItem ? 'invalid-item' : ''}`}
                    title={!isValidItem ? 'Este producto tiene problemas y no se puede modificar' : ''}
                  >
                    <div className="item-image">
                      <img
                        src={getSafeImage(item)}
                        alt={itemName}
                        onError={(e) => {
                          console.log('❌ Error cargando imagen, usando por defecto');
                          e.target.src = getDefaultImage();
                        }}
                      />
                      {!isValidItem && (
                        <div className="item-warning" title="Producto con problemas">
                          ⚠️
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{itemName}</h3>
                      <p className="item-description">{itemDescription}</p>
                      <div className="item-price">${getSafePrice(item).toFixed(2)} c/u</div>
                      {!isValidItem && (
                        <div className="item-error-message">
                          ⚠️ Este producto no se puede modificar
                        </div>
                      )}
                    </div>

                    <div className="quantity-section">
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleDecrement(item)}
                          disabled={isUpdating || loading || currentQuantity <= 1 || !isValidItem}
                          className="quantity-btn"
                          title={!isValidItem ? 'Producto no modificable' : 'Reducir cantidad'}
                        >
                          -
                        </button>
                        <span className="quantity-display">
                          {isUpdating ? '...' : currentQuantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item)}
                          disabled={isUpdating || loading || !isValidItem}
                          className="quantity-btn"
                          title={!isValidItem ? 'Producto no modificable' : 'Aumentar cantidad'}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-subtotal">
                        ${calculateItemSubtotal(item)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item)}
                      disabled={isUpdating || loading || !isValidItem}
                      className="remove-btn"
                      title={!isValidItem ? 'Producto no se puede eliminar' : 'Eliminar del carrito'}
                    >
                      ❌
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Resumen del Pedido</h3>

              <div className="summary-row">
                <span>Subtotal ({getTotalItems()} items):</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Envío:</span>
                <span className="free-shipping">Gratis</span>
              </div>

              <div className="summary-row">
                <span>Impuestos (21%):</span>
                <span>${(getTotalPrice() * 0.18).toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <strong>Total:</strong>
                <strong className="total-amount">${(getTotalPrice() * 1.18).toFixed(2)}</strong>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={loading || processing || items.length === 0} 
                className="checkout-btn"
                title={items.length === 0 ? 'El carrito está vacío' : 'Finalizar compra'}
              >
                {processing ? ' Procesando...' : ' Proceder al Pago'}
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="continue-shopping-btn"
                title="Seguir buscando productos"
              >
                Seguir Comprando
              </button>

              <div className="security-notice">
                🔒 Compra 100% segura · Pagos protegidos · Envío gratis
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
