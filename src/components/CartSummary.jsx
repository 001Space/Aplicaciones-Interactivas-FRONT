 import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNotify } from '../context/NotifyContext';

const CartSummary = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  const { user } = useAuth();
  const { notify, confirm } = useNotify();

  const handleQuantityChange = async (productId, change) => {
    await updateQuantity(productId, change);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (await confirm({ title: 'Vaciar carrito', message: '¿Estás seguro de que quieres vaciar el carrito?', confirmText: 'Vaciar', cancelText: 'Cancelar' })) {
      await clearCart();
      notify.success('Carrito vaciado correctamente');
    }
  };

  return (
    <div className="group relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full hover:bg-accent-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-text-main" style={{ fontSize: '28px' }}>
          shopping_cart
        </span>
        {getCartCount() > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-white text-sm font-bold">
            {getCartCount()}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl p-6 z-30 border border-divider">
          <p className="font-bold text-lg text-text-main mb-3">Resumen del Carrito</p>
          
          {cart.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-shopping-cart text-3xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-1">
                      {item.imagenUrl ? (
                        <img src={item.imagenUrl} alt={item.nombre} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <i className="fas fa-coffee text-gray-400"></i>
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-sm font-medium block">{item.nombre}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="text-xs text-gray-500 hover:text-accent-primary"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold">{item.cantidad}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="text-xs text-gray-500 hover:text-accent-primary"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        ${((item.precio || 0) * item.cantidad).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-base text-text-main mb-3">
                  <span>Total:</span>
                  <span className="font-bold">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handleClearCart}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors mb-2"
                >
                  <i className="fas fa-trash mr-2"></i>Vaciar Carrito
                </button>
                
                <button className="w-full bg-accent-primary text-white py-3 rounded-lg text-base font-bold hover:bg-hover-highlight transition-colors">
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartSummary;
