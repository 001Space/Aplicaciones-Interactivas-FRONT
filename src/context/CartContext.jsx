import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    initializeCart();
  }, [user]);

  const initializeCart = async () => {
    if (user?.token) {
      try {
        
        const cartData = await apiClient.getCarrito();
        setCart(cartData.items || []);
      } catch (error) {
        console.error('Error cargando carrito:', error);
        loadTemporalCart();
      }
    } else {
      loadTemporalCart();
    }
  };

  const loadTemporalCart = () => {
    const temporalCart = localStorage.getItem('carritoTemporal');
    if (temporalCart) {
      setCart(JSON.parse(temporalCart));
    }
  };

  const saveCart = async (newCart) => {
    setCart(newCart);
    
    if (user?.token) {
      try {
        
        await syncCartWithBackend(newCart);
        localStorage.removeItem('carritoTemporal');
      } catch (error) {
        console.error('Error guardando carrito:', error);
        localStorage.setItem('carritoTemporal', JSON.stringify(newCart));
      }
    } else {
      localStorage.setItem('carritoTemporal', JSON.stringify(newCart));
    }
  };

  const syncCartWithBackend = async (newCart) => {
    try {
    
      await apiClient.clearCart();
      
   
      for (const item of newCart) {
        await apiClient.addToCart(item.id, item.cantidad);
      }
    } catch (error) {
      console.error('Error sincronizando carrito con backend:', error);
      throw error;
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      throw new Error('Debe iniciar sesión para agregar productos al carrito');
    }

    try {
      
      await apiClient.addToCart(product.id, 1);
      
      
      const existingItem = cart.find(item => item.id === product.id);
      let newCart;

      if (existingItem) {
        newCart = cart.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        newCart = [...cart, { ...product, cantidad: 1 }];
      }

      setCart(newCart);
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, change) => {
    if (!user) {
      throw new Error('Debe iniciar sesión para modificar el carrito');
    }

    try {
      const existingItem = cart.find(item => item.id === productId);
      if (!existingItem) return;

      const newQuantity = existingItem.cantidad + change;
      
      if (newQuantity <= 0) {
    
        await apiClient.removeFromCart(productId);
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
      } else {
      
        await apiClient.updateCartItem(productId, newQuantity);
        
        const newCart = cart.map(item =>
          item.id === productId
            ? { ...item, cantidad: newQuantity }
            : item
        );
        setCart(newCart);
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) {
      throw new Error('Debe iniciar sesión para modificar el carrito');
    }

    try {
      await apiClient.removeFromCart(productId);
      const newCart = cart.filter(item => item.id !== productId);
      setCart(newCart);
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      throw new Error('Debe iniciar sesión para modificar el carrito');
    }

    try {
      await apiClient.clearCart();
      setCart([]);
      localStorage.removeItem('carritoTemporal');
    } catch (error) {
      console.error('Error vaciando carrito:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};