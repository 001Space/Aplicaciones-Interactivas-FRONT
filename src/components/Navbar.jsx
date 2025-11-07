
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const cartItemsCount = cart ? getTotalItems() : 0;

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setIsMenuOpen(false);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    navigate('/carrito');
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handlePageNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.nav-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const isVendor = isAuthenticated && user?.rol === 'VENDEDOR';
  const isInAdmin = location.pathname.startsWith('/admin');
  const isAdminProductos = location.pathname.startsWith('/admin/productos');
  const isAdminCategorias = location.pathname.startsWith('/admin/categorias');
  const showVendorPanelLink = isVendor && (isAdminProductos || isAdminCategorias);

  React.useEffect(() => {
    // Si es vendedor y navega fuera del área /admin, redirigir al panel
    if (isVendor && !isInAdmin) {
      navigate('/admin');
    }
  }, [isVendor, isInAdmin, navigate]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          
          <div className="nav-logo" onClick={handleLogoClick}>
            <span className="logo-text">Coffee Store</span>
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            {!(isVendor && isInAdmin) && (
              <>
                <button 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  onClick={() => handlePageNavigation('/')}
                >
                  INICIO
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
                  onClick={() => handlePageNavigation('/catalog')}
                >
                  PRODUCTOS
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                  onClick={() => handlePageNavigation('/about')}
                >
                  NOSOTROS
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                  onClick={() => handlePageNavigation('/contact')}
                >
                  CONTACTO
                </button>
              </>
            )}
            {/* Vendor link se muestra a la derecha cuando corresponde */}
          </div>

          <div className="nav-right">
            {/* Cart visible para compradores y visitantes; oculto para vendedores */}
            {!isVendor && (
              <div className="cart-section">
                <button 
                  className="cart-btn" 
                  onClick={handleCartClick}
                  title={`Carrito (${cartItemsCount} items)`}
                  aria-label={`Carrito de compras con ${cartItemsCount} productos`}
                >
                  <img 
                    src="data:image/png;base64,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" 
                    alt="Carrito CoffeeStore" 
                    className="cart-logo"
                  />
                  {cartItemsCount > 0 && (
                    <span className="cart-count">{cartItemsCount > 99 ? '99+' : cartItemsCount}</span>
                  )}
                </button>
              </div>
            )}
            {showVendorPanelLink && (
              <button className="vendor-link" onClick={() => handlePageNavigation('/admin')} title="Panel Vendedor">
                <svg className="vendor-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/>
                </svg>
                <span>Panel Vendedor</span>
              </button>
            )}

            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="welcome-text">HOLA, {user?.nombre || user?.usuario}</span>
                  {user?.rol === 'VENDEDOR' && (
                    <span className="role-badge vendor">VENDEDOR</span>
                  )}
                  {user?.rol === 'COMPRADOR' && (
                    <span className="role-badge buyer">COMPRADOR</span>
                  )}
                </div>
                <button 
                  className="logout-btn" 
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  SALIR
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="login-btn" 
                  onClick={handleLoginClick}
                  aria-label="Iniciar sesión"
                >
                  INICIAR SESIÓN
                </button>
                <button 
                  className="register-btn" 
                  onClick={handleRegisterClick}
                  aria-label="Registrarse"
                >
                  REGISTRARSE
                </button>
              </div>
            )}

            <button 
              className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú de navegación"
              aria-expanded={isMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          {!(isVendor && isInAdmin) && (
            <>
              <button 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => handlePageNavigation('/')}
              >
                INICIO
              </button>
              <button 
                className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
                onClick={() => handlePageNavigation('/catalog')}
              >
                PRODUCTOS
              </button>
              <button 
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                onClick={() => handlePageNavigation('/about')}
              >
                NOSOTROS
              </button>
              <button 
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                onClick={() => handlePageNavigation('/contact')}
              >
                CONTACTO
              </button>
            </>
          )}
          {showVendorPanelLink && (
            <button 
              className="nav-link vendor-link"
              onClick={() => handlePageNavigation('/admin')}
            >
              PANEL VENDEDOR
            </button>
          )}

          {!isAuthenticated && (
            <div className="mobile-auth-buttons">
              <button 
                className="login-btn" 
                onClick={handleLoginClick}
              >
                INICIAR SESIÓN
              </button>
              <button 
                className="register-btn" 
                onClick={handleRegisterClick}
              >
                REGISTRARSE
              </button>
            </div>
          )}
        </div>
      </nav>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={switchToRegister}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Navbar;


