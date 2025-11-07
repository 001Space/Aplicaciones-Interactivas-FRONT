import React from 'react';
import { useCart } from '../hooks/useCart';

const Cart = () => {
  const { 
    cart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    loading,
    getTotalItems 
  } = useCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleIncrement = (itemId, currentQuantity) => {
    handleQuantityChange(itemId, currentQuantity + 1);
  };

  const handleDecrement = (itemId, currentQuantity) => {
    handleQuantityChange(itemId, currentQuantity - 1);
  };

  if (cart.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-600">Tu carrito está vacío</h3>
        <p className="text-gray-500">Agrega algunos productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Carrito de Compras ({getTotalItems()} items)</h2>
      
      <div className="space-y-4">
        {cart.items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
            <img 
              src={item.imagen || item.producto?.imagenUrl} 
              alt={item.nombre} 
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-grow">
              <h4 className="font-semibold">{item.nombre}</h4>
              <p className="text-gray-600">${item.precio} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleDecrement(item.id, item.cantidad)}
                disabled={loading || item.cantidad <= 1}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded disabled:opacity-50"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold">{item.cantidad}</span>
              <button 
                onClick={() => handleIncrement(item.id, item.cantidad)}
                disabled={loading}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded disabled:opacity-50"
              >
                +
              </button>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              disabled={loading}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Total:</h3>
          <span className="text-2xl font-bold text-accent-primary">${cart.total.toFixed(2)}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={clearCart}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Vaciar Carrito
          </button>
          <button 
            onClick={() => alert('Proceso de checkout no implementado')}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-accent-primary text-white rounded hover:bg-hover-highlight disabled:opacity-50"
          >
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;