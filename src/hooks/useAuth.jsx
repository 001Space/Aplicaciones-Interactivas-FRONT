
import React, { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

const normalizeAuthority = (str) =>
  (str || '').trim().toUpperCase().replace(/^ROLE_/, '');

const pickRoleFromAuthorities = (authorities = []) => {
  const list = authorities
    .map((a) => (typeof a === 'string' ? a : a?.authority))
    .filter(Boolean)
    .map(normalizeAuthority);

  if (list.includes('ADMIN')) return 'ADMIN';
  if (list.includes('VENDEDOR')) return 'VENDEDOR';
  if (list.includes('COMPRADOR') || list.length) return 'COMPRADOR';
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = apiClient.getAuthToken();
      const savedUser = apiClient.getCurrentUser();

      if (token && savedUser) {
        setUser(savedUser);
        try {
          const who = await apiClient.whoami();
          const resolvedRole =
            pickRoleFromAuthorities(who?.authorities || who?.roles || []) ||
            savedUser?.rol ||
            'COMPRADOR';

          const principal = who?.principal || who?.user || {};
          const merged = {
            ...savedUser,
            id: savedUser.id ?? principal.id ?? principal.userId ?? null,
            rol: resolvedRole,
            usuario: savedUser.usuario || principal.usuario || principal.username || null,
            nombre: savedUser.nombre ?? principal.nombre ?? null,
            apellido: savedUser.apellido ?? principal.apellido ?? null,
            email: savedUser.email ?? principal.email ?? null,
          };

          localStorage.setItem('userData', JSON.stringify(merged));
          setUser(merged);
        } catch {
        }
      } else if (token && !savedUser) {
        try {
          const who = await apiClient.whoami();
          const resolvedRole =
            pickRoleFromAuthorities(who?.authorities || who?.roles || []) || 'COMPRADOR';
          const principal = who?.principal || who?.user || who || {};

          const userData = {
            id: principal.id || principal.userId || null,
            usuario: principal.usuario || principal.username || null,
            nombre: principal.nombre || null,
            apellido: principal.apellido || null,
            email: principal.email || null,
            rol: resolvedRole,
          };

          localStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error('Error obteniendo whoami:', error);
          logout();
        }
      } else {
        logout(false); 
      }
    } catch (error) {
      console.error('Error en checkAuth:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);

      if (response?.success === false) {
        return { success: false, error: response.message || 'Error en el login' };
      }

      const userData =
        response?.user || {
          id: response?.id,
          nombre: response?.nombre,
          usuario: response?.usuario || credentials.usuario,
          email: response?.email,
          rol: response?.rol,
        };

      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));

      window.dispatchEvent(
        new CustomEvent('authStateChange', {
          detail: { isAuthenticated: true, user: userData },
        })
      );

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Usuario o contraseña incorrectos',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userPayload) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userPayload);

      if (response?.success === false) {
        return { success: false, error: response.message || 'Error en el registro' };
      }

      const newUser =
        response?.user || {
          id: response?.id,
          nombre: userPayload.nombre,
          usuario: userPayload.usuario,
          email: userPayload.email,
          rol: 'COMPRADOR',
        };

      setUser(newUser);
      localStorage.setItem('userData', JSON.stringify(newUser));

      window.dispatchEvent(
        new CustomEvent('authStateChange', {
          detail: { isAuthenticated: true, user: newUser },
        })
      );

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = (emitEvent = true) => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    apiClient.logout();

    if (emitEvent) {
      window.dispatchEvent(
        new CustomEvent('authStateChange', {
          detail: { isAuthenticated: false, user: null },
        })
      );
    }

    console.log('✅ Sesión cerrada - carrito será limpiado');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'ADMIN',
    isVendedor: user?.rol === 'VENDEDOR',
    isComprador: user?.rol === 'COMPRADOR' || !user?.rol,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
