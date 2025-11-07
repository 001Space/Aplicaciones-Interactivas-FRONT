import React from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import './CartModal.css';
import { useNotify } from '../context/NotifyContext';

const CartModal = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    loading,
    error,
    checkout,
    getTotalItems
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { notify, confirm } = useNotify();

  const handleQuantityChange = async (itemId, newQuantity) => {
    console.log(`🔄 Cambiando cantidad: itemId=${itemId}, nuevaCantidad=${newQuantity}`);
    
    try {
      if (newQuantity <= 0) {
        await handleRemoveItem(itemId);
      } else {
        const result = await updateCartItem(itemId, newQuantity);
        if (!result.success) {
          notify.info(`Error: ${result.error}`);
        }
      }
    } catch (err) {
      console.error('Error en handleQuantityChange:', err);
      notify.info('Error al actualizar la cantidad');
    }
  };

  const handleIncrement = async (itemId, currentQuantity) => {
    await handleQuantityChange(itemId, currentQuantity + 1);
  };

  const handleDecrement = async (itemId, currentQuantity) => {
    await handleQuantityChange(itemId, currentQuantity - 1);
  };

  const handleRemoveItem = async (itemId, productName = 'este producto') => {
    console.log(`🗑️ Intentando eliminar item: ${itemId}`);
    
    if (await confirm(`¿Estás seguro de que quieres eliminar "${productName}" del carrito?`)) {
      try {
        const result = await removeFromCart(itemId);
        if (!result.success) {
          notify.info(`Error: ${result.error}`);
        } else {
          console.log('✅ Producto eliminado exitosamente');
        }
      } catch (err) {
        console.error('Error eliminando producto:', err);
        notify.info('Error al eliminar el producto');
      }
    }
  };

  const handleClearCart = async () => {
    if (cart.items.length === 0) {
      notify.info('El carrito ya está vacío');
      return;
    }

    if (await confirm(`¿Estás seguro de que quieres vaciar todo el carrito? Se eliminarán ${getTotalItems()} productos.`)) {
      try {
        const result = await clearCart();
        if (!result.success) {
          notify.info(`Error: ${result.error}`);
        } else {
          console.log('✅ Carrito vaciado exitosamente');
          notify.info('Carrito vaciado correctamente');
        }
      } catch (err) {
        console.error('Error vaciando carrito:', err);
        notify.info('Error al vaciar el carrito');
      }
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      notify.info('Debes iniciar sesión para finalizar la compra');
      return;
    }

    if (cart.items.length === 0) {
      notify.info('El carrito está vacío');
      return;
    }

    const outOfStockItems = cart.items.filter(item => 
      item.producto?.stock !== undefined && item.cantidad > item.producto.stock
    );

    if (outOfStockItems.length > 0) {
      const productNames = outOfStockItems.map(item => item.nombre).join(', ');
      notify.info(`Los siguientes productos no tienen suficiente stock: ${productNames}`);
      return;
    }

    if (await confirm(`¿Estás listo para finalizar tu compra de ${getTotalItems()} productos por $${getTotalPrice().toFixed(2)}?`)) {
      try {
        const result = await checkout();
        if (result.success) {
          notify.info('¡Compra realizada con éxito! Serás redirigido al pago.');
          onClose();
        } else {
          notify.info('Error en el checkout: ' + result.error);
        }
      } catch (err) {
        console.error('Error en checkout:', err);
        notify.info('Error al procesar el pago');
      }
    }
  };

  const getTotalPrice = () => {
    return cart.total || cart.items.reduce((total, item) => {
      const precio = item.precio || item.precioUnitario || item.producto?.precio || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const calculateItemTotal = (precio, cantidad) => {
    const itemPrecio = precio || 0;
    return (itemPrecio * cantidad).toFixed(2);
  };

  const getStockInfo = (item) => {
    if (item.producto?.stock !== undefined) {
      if (item.cantidad > item.producto.stock) {
        return { status: 'out-of-stock', message: `Solo ${item.producto.stock} disponibles` };
      } else if (item.producto.stock < 5) {
        return { status: 'low-stock', message: `Solo ${item.producto.stock} disponibles` };
      }
    }
    return { status: 'in-stock', message: '' };
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="cart-modal-header">
          <div className="cart-title-section">
            <h2>🛒 Tu Carrito de Compras</h2>
            <span className="cart-items-count">({getTotalItems()} productos)</span>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="cart-error-message">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="cart-loading-overlay">
            <div className="loading-spinner"></div>
            <p>Procesando...</p>
          </div>
        )}

        <div className="cart-items-container">
          {cart.items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega algunos productos deliciosos a tu carrito</p>
              <button 
                className="continue-shopping-btn"
                onClick={onClose}
                disabled={loading}
              >
                Seguir Comprando
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map(item => {
                  const stockInfo = getStockInfo(item);
                  const isOutOfStock = stockInfo.status === 'out-of-stock';
                  const itemPrecio = item.precio || item.precioUnitario || item.producto?.precio || 0;
                  
                  return (
                    <div key={item.id} className={`cart-item ${isOutOfStock ? 'out-of-stock' : ''}`}>
                  
                      <div className="item-image">
                        {item.imagen || item.imagenUrl || item.producto?.imagenUrl ? (
                          <img 
                            src={item.imagen || item.imagenUrl || item.producto?.imagenUrl} 
                            alt={item.nombre}
                          />
                        ) : (
                          <div className="item-image-placeholder">
                            ☕
                          </div>
                        )}
                      </div>
                      
                      <div className="item-details">
                        <h4 className="item-name">{item.nombre}</h4>
                        <p className="item-price">${itemPrecio.toFixed(2)} c/u</p>
                        
                        {stockInfo.message && (
                          <div className={`stock-info ${stockInfo.status}`}>
                            {stockInfo.message}
                          </div>
                        )}
                        
                        <div className="quantity-section">
                          <div className="quantity-controls">
                            <button 
                              onClick={() => handleDecrement(item.id, item.cantidad)}
                              disabled={loading || item.cantidad <= 1}
                              className="quantity-btn decrement"
                            >
                              −
                            </button>
                            
                            <div className="quantity-display">
                              <span className="quantity-number">{item.cantidad}</span>
                              <span className="quantity-label">unidades</span>
                            </div>
                            
                            <button 
                              onClick={() => handleIncrement(item.id, item.cantidad)}
                              disabled={loading || isOutOfStock}
                              className="quantity-btn increment"
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveItem(item.id, item.nombre)}
                            disabled={loading}
                            className="remove-item-btn"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                      
                      <div className="item-right-section">
                        <div className="item-subtotal">
                          ${calculateItemTotal(itemPrecio, item.cantidad)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-footer">
                <div className="price-summary">
                  
                  <div className="summary-row total-row">
                    <span>Total:</span>
                    <span className="total-amount">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-actions">
                  <button 
                    onClick={handleClearCart}
                    disabled={loading}
                    className="clear-cart-btn secondary-btn"
                  >
                    {loading ? 'Procesando...' : ' Vaciar Todo el Carrito'}
                  </button>
                  
                  <div className="checkout-section">
                    <button 
                    
                      onClick={handleCheckout}
                      disabled={loading || !isAuthenticated}
                      className="checkout-btn primary-btn"
                    >
                      {loading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Procesando...
                        </>
                      ) : (
                        {`Finalizar Compra - $${getTotalPrice().toFixed(2)}`}
                      )}
                    </button>
                    
                    {!isAuthenticated && (
                      <div className="auth-warning">
                        🔐 Inicia sesión para finalizar tu compra
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
