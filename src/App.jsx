import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/Catalog';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductDetail from './components/ProductDetail';

import AdminPanel from './pages/AdminPanel';
import CategoriasPageAdmin from './pages/CategoriasPageAdmin';
import ProductosPageAdmin from './pages/ProductosPageAdmin'; 
import './App.css';
import { NotifyProvider } from './context/NotifyContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (roles.length === 0) return children;
  if (user && roles.includes(user.rol)) return children;

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotifyProvider>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                <Route path="/producto/:productId" element={<ProductDetail />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/categorias"
                  element={
                    <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                      <CategoriasPageAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/productos"
                  element={
                    <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                      <ProductosPageAdmin />
                    </ProtectedRoute>
                  }
                />

              </Routes>
            </main>
          </div>
          </NotifyProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
