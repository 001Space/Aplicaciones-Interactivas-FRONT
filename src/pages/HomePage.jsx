import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import './HomePage.css';
import { useSelector } from "react-redux";


const HomePage = () => {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { 
    addToCart: addToCartHook, 
    loading: cartLoading, 
    error: cartError 
  } = useCart();
const user = useSelector((state) => state.auth.user);

  
  const [notification, setNotification] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const reviews = [
    {
      id: 1,
      user: {
        name: "María Alvarez",
        avatar: "https://i.pravatar.cc/100?img=1",
        location: "Buenos Aires, Argentina"
      },
      rating: 5,
      comment: "¡El mejor café que he probado! Los granos son frescos y el aroma es increíble. Definitivamente volveré a comprar.",
      product: "Café Arábica Premium"
    },
    {
      id: 2,
      user: {
        name: "Carlos Fabian",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        location: "Jujuy, Argentina"
      },
      rating: 4,
      comment: "Muy buena calidad, entrega rápida. El sabor es excelente, aunque esperaba un tostado un poco más intenso.",
      product: "Café Colombia Supremo"
    },
    {
      id: 3,
      user: {
        name: "Ana Wassserman",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        location: "Neuquen, Argentina"
      },
      rating: 5,
      comment: "Increíble sabor y aroma. Mi familia está encantada. La presentación del producto es muy elegante.",
      product: "Blend Especial de la Casa"
    },
    {
      id: 4,
      user: {
        name: "Javier Venturini",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        location: "Chubut, Argentina"
      },
      rating: 5,
      comment: "Calidad premium. Se nota que son granos seleccionados cuidadosamente. El envío fue muy rápido.",
      product: "Café Etiopía Yirgacheffe"
    },
    {
      id: 5,
      user: {
        name: "Laura Garcia",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        location: "Misiones, Argentina"
      },
      rating: 5,
      comment: "Excelente relación calidad-precio. El café tiene un sabor suave y aromático perfecto para mis desayunos.",
      product: "Café Brasil Santos"
    },
    {
      id: 6,
      user: {
        name: "David Rocco",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        location: "Formosa, Argentina"
      },
      rating: 4,
      comment: "Muy buen servicio al cliente y productos de alta calidad. Recomendado 100%.",
      product: "Café Guatemala Antigua"
    }
  ];

  const reviewsPerSlide = 3; 
  const totalSlides = Math.ceil(reviews.length / reviewsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentReviews = () => {
    const startIndex = currentSlide * reviewsPerSlide;
    return reviews.slice(startIndex, startIndex + reviewsPerSlide);
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= rating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      showNotification('Por favor inicia sesión para agregar productos al carrito', 'error');
      return;
    }

    setAddingToCart(product.id);
    
    try {
      const result = await addToCartHook(product);
      
      if (result.success) {
        showNotification(`${product.nombre} agregado al carrito`, 'success');
      } else {
        showNotification(result.error || 'Error al agregar al carrito', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error al agregar al carrito', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getProductImage = (product) => {
    if (product.imagenUrl) return product.imagenUrl;
    if (product.imagen) return product.imagen;
    
    return 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  const getStockStatus = (stock) => {
    if (stock === 0 || stock === '0') return { text: 'Agotado', class: 'out-of-stock' };
    if (stock <= 5) return { text: `Últimas ${stock} unidades`, class: 'low-stock' };
    return { text: 'En stock', class: 'in-stock' };
  };

  const getProductCategory = (product) => {
    if (product.categoria) return product.categoria;
    if (product.tipo) return product.tipo;
    if (product.origen) return product.origen;
    return 'Café Premium';
  };

  return (
    <div className="home-page">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Granos de Café Premium
                <br />Directo a tu Mesa
              </h1>
              <p className="hero-description">
                Descubre nuestra selección exclusiva de granos de café de la más alta calidad. 
                Cultivados con pasión y tostados artesanalmente para los paladares más exigentes.
              </p>
              <div className="hero-buttons">
                <Link 
                  to="/catalog" 
                  className="btn-primary"
                  style={{
                    background: '#1a341a',
                    color: '#ffffff',
                    padding: '15px 35px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    height: '54px',
                    minWidth: '180px'
                  }}
                >
                  Explorar Cafés
                </Link>
                {/* Botón 'Ver Colección' retirado por solicitud */}
              </div>     
            </div>
          </div>
        </div>
      </section>

      <section id="cafes" className="products-section">
        <div className="container">
          {productsLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando nuestros cafés...</p>
            </div>
          )}

          {productsError && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error al cargar los productos</h3>
              <p>{productsError}</p>
            </div>
          )}

          {!productsLoading && !productsError && products.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">☕</div>
              <h3>No hay cafés disponibles</h3>
              <p>Estamos preparando una nueva cosecha de café premium para ti</p>
            </div>
          )}

          {!productsLoading && !productsError && products.length > 0 && (
            <div className="bestsellers-section">
              {cartError && (
                <div className="cart-error-banner">
                  <span>⚠️</span>
                  {cartError}
                </div>
              )}
               
              <div className="bestsellers-wrap">
                <div className="bestsellers-banner">
                  <h2 className="bestsellers-title">
                    <span className="star">★</span> Los más vendidos <span className="star">★</span>
                  </h2>
                  <span className="bestsellers-shimmer" aria-hidden="true"></span>
                </div>
              </div>

              <div className="products-grid-compact">
                {products.slice(0, 6).map((product, index) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  const isAdding = addingToCart === product.id;
                  const productCategory = getProductCategory(product); // Obtener categoría
                  
                  return (
                    <div 
                      key={product.id} 
                      className={`product-card-compact bestseller-item ${index < 3 ? 'top' : ''}`}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <Link 
                        to={`/producto/${product.id}`} 
                        className="product-image-link"
                      >
                        <div className="product-image-compact">
                          <div className="bestseller-rank">#{index + 1}</div>
                          {index < 3 && (
                            <div className="bestseller-popular">🔥 Popular</div>
                          )}
                          <img 
                            src={getProductImage(product)} 
                            alt={product.nombre}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
                            }}
                          />
                          
                          {(product.stock === 0 || product.stock <= 5) && (
                            <div className={`stock-badge-compact ${stockStatus.class}`}>
                              {stockStatus.text}
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="product-info-compact">
                        <Link 
                          to={`/producto/${product.id}`} 
                          className="product-name-link"
                        >
                          <h3 className="product-name-compact">{product.nombre}</h3>
                        </Link>
                        
                        <div className="product-category-compact">
                          <span className="category-badge-compact">
                            {productCategory}
                          </span>
                        </div>
                        
                        <div className="product-price-compact">
                          {formatPrice(product.precio)}
                        </div>

                        <button 
                          className={`add-to-cart-btn-compact ${product.stock === 0 ? 'disabled' : ''} ${isAdding ? 'loading' : ''}`}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0 || cartLoading || isAdding || !user}
                        >
                          {isAdding ? (
                            <div className="loading-spinner-small"></div>
                          ) : product.stock === 0 ? (
                            'Agotado'
                          ) : !user ? (
                            <>
                              <i className="fas fa-lock"></i>
                              Iniciar Sesión
                            </>
                          ) : (
                            <>
                              <i className="fas fa-shopping-cart"></i>
                              Agregar al Carrito
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bestsellers-actions">
                <Link to="/catalog" className="bestsellers-cta">
                  Ver todo
                  <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <section 
        className="reviews-section"
        style={{
          background: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), 
                      url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk94CxcdHWt9QFHU3UA-13A9V4wNuMxvXwZQ&s')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          position: 'relative',
          padding: '80px 0'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.85)',
            zIndex: 1
          }}
        ></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-header">
            <h2 className="section-title" style={{ color: '#1a341a' }}>
              Lo que dicen nuestros clientes
            </h2>
            <p className="section-subtitle">
              Descubre las experiencias de quienes ya han probado nuestros cafés premium
            </p>
          </div>

          <div className="reviews-carousel">
            <button className="carousel-btn prev" onClick={prevSlide}>
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="reviews-track">
              <div 
                className="reviews-slide"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="slide-container">
                    {reviews
                      .slice(slideIndex * reviewsPerSlide, (slideIndex + 1) * reviewsPerSlide)
                      .map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="user-info">
                              <img 
                                src={review.user.avatar} 
                                alt={review.user.name}
                                className="user-avatar"
                              />
                              <div className="user-details">
                                <h4 className="user-name">{review.user.name}</h4>
                                <p className="user-location">{review.user.location}</p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>
                          
                          <div className="review-product">
                            <span className="product-badge">{review.product}</span>
                          </div>
                          
                          <p className="review-comment">"{review.comment}"</p>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            <button className="carousel-btn next" onClick={nextSlide}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="carousel-dots">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
