
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from './useAuth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && apiClient.isAuthenticated()) {
      console.log('👤 Usuario autenticado, intentando cargar carrito');
      fetchCart();
    } else {
      console.log('👤 Usuario no autenticado, carrito vacío');
      setCart({ items: [], total: 0 });
      setError(null);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!apiClient.isAuthenticated()) {
      return;
    }

    try {
      setLoading(true);
      console.log('🛒 Intentando cargar carrito desde Spring Boot...');
      
      const cartData = await apiClient.getCarrito();
      console.log('✅ Carrito cargado exitosamente desde backend:', cartData);
      
      setCart({
        items: cartData.items || [],
        total: cartData.total || 0
      });
      setError(null);
      
    } catch (error) {
      console.error('❌ Error cargando carrito desde backend:', error);
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        console.log('⚠️ Backend tiene error 500 - activando modo local');
        setError('El carrito no está disponible temporalmente. Usando modo local.');
        
        const carritoLocal = localStorage.getItem('carritoLocal');
        if (carritoLocal) {
          try {
            const parsedCart = JSON.parse(carritoLocal);
            setCart(parsedCart);
            console.log('📦 Carrito local cargado desde localStorage:', parsedCart);
          } catch (e) {
            console.log('❌ Error cargando carrito local, usando vacío');
            setCart({ items: [], total: 0 });
          }
        } else {
          console.log('📦 Inicializando carrito local vacío');
          setCart({ items: [], total: 0 });
        }
      } else {
        setError('Error al conectar con el carrito');
        setCart({ items: [], total: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const guardarCarritoLocal = (nuevoCart) => {
    try {
      localStorage.setItem('carritoLocal', JSON.stringify(nuevoCart));
      console.log('💾 Carrito guardado en localStorage');
    } catch (e) {
      console.error('❌ Error guardando carrito local:', e);
    }
  };

  const addToCart = async (producto, cantidad = 1) => {
    if (!apiClient.isAuthenticated()) {
      const errorMsg = 'Por favor inicia sesión para agregar productos al carrito';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🛒 Intentando agregar producto al backend:', { 
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad 
      });

      await apiClient.addToCart(producto.id, cantidad);
      console.log('✅ Producto agregado al backend exitosamente');
      await fetchCart(); 
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error agregando al carrito backend:', error);
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        console.log('🔄 Usando fallback local para agregar producto');
        
        const existingItem = cart.items.find(item => item.productoId === producto.id);
        let newItems = [];
        
        if (existingItem) {
          newItems = cart.items.map(item =>
            item.productoId === producto.id
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          );
          console.log('📝 Producto existente, cantidad incrementada');
        } else {
          newItems = [...cart.items, {
            itemId: Date.now(), 
            productoId: producto.id,
            producto: producto,
            cantidad: cantidad,
            precioUnitario: producto.precio,
            nombre: producto.nombre,
            imagenUrl: producto.imagenUrl
          }];
          console.log('🆕 Nuevo producto agregado localmente');
        }
        
        const newTotal = newItems.reduce((total, item) => 
          total + (item.precioUnitario * item.cantidad), 0
        );
        
        const nuevoCart = { items: newItems, total: newTotal };
        setCart(nuevoCart);
        guardarCarritoLocal(nuevoCart);
        
        console.log('✅ Producto agregado en modo local');
        
        return { 
          success: true, 
          fallback: true,
          message: 'Producto agregado (modo local)' 
        };
      }
      
      const errorMsg = error.message || 'Error al agregar al carrito';
      setError(errorMsg);
      return { success: false, error: errorMsg };
      
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, cantidad) => {
    console.log('🔄 ACTUALIZANDO CANTIDAD:', { itemId, cantidad });
    
    try {
      setLoading(true);
      
      const numericItemId = parseInt(itemId);
      console.log('🔢 ID convertido:', numericItemId);
      
      const newItems = cart.items.map(item => 
        parseInt(item.itemId) === numericItemId ? { ...item, cantidad } : item
      ).filter(item => item.cantidad > 0);
      
      const newTotal = newItems.reduce((total, item) => 
        total + (item.precioUnitario * item.cantidad), 0
      );
      
      const nuevoCart = { items: newItems, total: newTotal };
      
      setCart(nuevoCart);
      guardarCarritoLocal(nuevoCart);
      
      console.log('✅ CANTIDAD ACTUALIZADA - Estado local:', nuevoCart);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    console.log('🗑️ ELIMINANDO ITEM:', itemId);
    
    try {
      setLoading(true);
      
      const numericItemId = parseInt(itemId);
      console.log('🔢 ID convertido:', numericItemId);
      
      const newItems = cart.items.filter(item => 
        parseInt(item.itemId) !== numericItemId
      );
      
      const newTotal = newItems.reduce((total, item) => 
        total + (item.precioUnitario * item.cantidad), 0
      );
      
      const nuevoCart = { items: newItems, total: newTotal };
      
      setCart(nuevoCart);
      guardarCarritoLocal(nuevoCart);
      
      console.log('✅ ITEM ELIMINADO - Estado local:', nuevoCart);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!apiClient.isAuthenticated()) {
      const errorMsg = 'Usuario no autenticado';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🧹 Intentando vaciar carrito en backend');
      
      const result = await apiClient.clearCart();
      console.log('✅ Carrito vaciado en backend');
      
      setCart({ items: [], total: 0 });
      localStorage.removeItem('carritoLocal');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error vaciando carrito backend:', error);
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error') || error.message.includes('ID no puede ser nulo')) {
        console.log('🔄 Usando fallback local para vaciar carrito');
        
        setCart({ items: [], total: 0 });
        localStorage.removeItem('carritoLocal');
        console.log('✅ Carrito vaciado en modo local');
        
        return { 
          success: true, 
          fallback: true,
          message: 'Carrito vaciado (modo local)' 
        };
      }
      
      const errorMsg = error.message || 'Error al vaciar el carrito';
      setError(errorMsg);
      return { success: false, error: errorMsg };
      
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    if (!apiClient.isAuthenticated()) {
      const errorMsg = 'Por favor inicia sesión para finalizar la compra';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('💰 Intentando checkout en backend');
      
      const result = await apiClient.checkout();
      console.log('✅ Checkout exitoso en backend:', result);
      
      setCart({ items: [], total: 0 });
      localStorage.removeItem('carritoLocal');
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Error en checkout backend:', error);
      
      const errorMsg = error.message || 'Error al procesar el pago';
      setError(errorMsg);
      return { success: false, error: errorMsg };
      
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    const total = cart.items.reduce((total, item) => total + (item.cantidad || 1), 0);
    console.log(`📊 Total items en carrito: ${total}`);
    return total;
  };

  const getTotalPrice = () => {
    return cart.total || cart.items.reduce((total, item) => {
      const precio = item.precioUnitario || item.precio || item.producto?.precio || 0;
      return total + (precio * (item.cantidad || 1));
    }, 0);
  };

  const isInCart = (productoId) => {
    return cart.items.some(item => item.productoId === productoId);
  };

  const getItemByProductId = (productoId) => {
    return cart.items.find(item => item.productoId === productoId);
  };

  const isValidCartItem = (item) => {
    if (!item) return false;
    
    const itemId = item.itemId || item.id;
    return itemId !== null && itemId !== undefined && itemId !== '';
  };

  const getValidCartItems = () => {
    return cart.items.filter(isValidCartItem);
  };

  const value = {
    
    cart,
    loading,
    error,
    
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    
    refreshCart: fetchCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemByProductId,
    
    isValidCartItem,
    getValidCartItems,
    
    isEmpty: cart.items.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};