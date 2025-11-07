import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const { user, logout } = useAuth();

  const handleUserIconClick = () => {
    if (user) {
      setUserDropdownOpen(!userDropdownOpen);
    } else {
      setAuthModalOpen(true);
      setUserDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
  };

  return (
    <>
      <header className="bg-background-main/80 backdrop-blur-sm sticky top-0 z-20 border-b border-divider">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <a className="flex items-center gap-3" href="/">
                <img src="/logo.png" alt="CoffeeStore Logo" className="h-16 w-auto rounded-lg"/>
              </a>

              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="font-medium hover:text-accent-primary transition-colors">Home</a>
                <a href="#products" className="font-medium text-accent-primary">Shop</a>
                <a href="#" className="font-medium hover:text-accent-primary transition-colors">About</a>
                <a href="#" className="font-medium hover:text-accent-primary transition-colors">Contact</a>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              
              <div className="user-menu relative">
                <div 
                  onClick={handleUserIconClick}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent-secondary transition-colors cursor-pointer"
                >
                  <i className={`fas ${user ? 'fa-user-check text-accent-primary' : 'fa-user text-text-main'}`}></i>
                  <span className="hidden md:inline text-sm font-medium">
                    {user ? user.nombre : 'Iniciar Sesión'}
                  </span>
                </div>
                
                {userDropdownOpen && user && (
                  <div className="absolute top-full right-0 bg-white rounded-lg shadow-xl py-2 min-w-48 z-30 border border-divider">
                    <a 
                      href="#" 
                      className="block px-4 py-2 hover:bg-accent-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mi Perfil
                    </a>
                    <a 
                      href="#" 
                      className="block px-4 py-2 hover:bg-accent-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mis Pedidos
                    </a>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-accent-secondary transition-colors text-red-600"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-accent-secondary transition-colors"
              >
                <span className="material-symbols-outlined text-text-main">menu</span>
              </button>
              
              <button className="relative p-3 rounded-full hover:bg-accent-secondary transition-colors">
                <span className="material-symbols-outlined text-text-main" style={{ fontSize: '28px' }}>
                  shopping_cart
                </span>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-white text-sm font-bold">
                  0
                </span>
              </button>
            </div>
          </div>
          
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-divider">
              <nav className="flex flex-col gap-4">
                <a href="/" className="font-medium hover:text-accent-primary transition-colors">Home</a>
                <a href="#products" className="font-medium text-accent-primary">Shop</a>
                <a href="#" className="font-medium hover:text-accent-primary transition-colors">About</a>
                <a href="#" className="font-medium hover:text-accent-primary transition-colors">Contact</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;