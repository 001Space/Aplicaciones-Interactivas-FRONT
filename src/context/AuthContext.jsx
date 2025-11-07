import React, { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

const createMockUser = (baseData, source) => ({
  id: source === 'login' ? 1 : Date.now(),
  nombre: baseData.nombre || baseData.usuario,
  apellido: baseData.apellido || 'Usuario',
  usuario: baseData.usuario,
  email: baseData.email || `${baseData.usuario}@example.com`,
  rol: 'COMPRADOR',
  token: `fake-token-${Date.now()}`
});

const simulateApiCall = (delay = 1000) => 
  new Promise(resolve => setTimeout(resolve, delay));

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);


  const initializeAuth = () => {
    try {
      const savedUser = localStorage.getItem('usuarioLogueado');
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error al cargar usuario guardado:', error);
      localStorage.removeItem('usuarioLogueado');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    console.log('🔐 Intento de login con:', credentials);
    
    await simulateApiCall(1000);
    
    const userData = createMockUser(credentials, 'login');
    
    setUser(userData);
    localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
    
    return { success: true, user: userData };
  };

  const register = async (userData) => {
    console.log('📝 Intento de registro con:', userData);
    
    await simulateApiCall(1000);
    
    const newUser = createMockUser(userData, 'register');
    
    setUser(newUser);
    localStorage.setItem('usuarioLogueado', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión');
    setUser(null);
    localStorage.removeItem('usuarioLogueado');
  };


  const contextValue = {

    user,
    loading,
    
    isAuthenticated: !!user,
    
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;