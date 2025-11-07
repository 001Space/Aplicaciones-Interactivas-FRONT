import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-background">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcxGBAJyPhwKCNFUDMLS3Mt3vGidkNGdoatg&s" 
          alt="Café premium de especialidad"
          className="hero-image"
        />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          Café <span className="highlight">premium</span>, directo a tu mesa
        </h1>
        <p className="hero-subtitle">
          Experimenta el mejor café del mundo, de origen ético y tostado a la perfección. 
          Encuentra tu mezcla ideal y empieza el día con Brewtiful.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Descubrir Cafés</button>
          <button className="btn-secondary">Ver Ofertas</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;