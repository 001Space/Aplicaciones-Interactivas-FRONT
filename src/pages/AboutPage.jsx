
import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>Sobre Nosotros</h1>
          <p>Conoce la historia y pasión detrás de CoffeeStore</p>
        </div>
      </div>

      <div className="about-content">
        <div className="container">
          <div className="about-section">
            <h2>Nuestra Historia</h2>
            <p>
              CoffeStore nació en 2010 de la pasión por el café de calidad y el deseo de 
              compartir experiencias únicas con los amantes de esta bebida milenaria. 
              Desde nuestros humildes comienzos, hemos crecido manteniendo nuestro compromiso 
              con la excelencia y la sostenibilidad.
            </p>
          </div>

          <div className="about-section">
            <h2>Nuestra Misión</h2>
            <p>
              Transformar cada taza de café en una experiencia memorable, conectando a los 
              consumidores con los mejores productores y promoviendo prácticas sostenibles 
              en toda nuestra cadena de valor.
            </p>
          </div>

          <div className="about-section">
            <h2>Nuestros Valores</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🌱</div>
                <h3>Sostenibilidad</h3>
                <p>Trabajamos con productores que practican agricultura responsable y respetuosa con el medio ambiente.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⭐</div>
                <h3>Calidad</h3>
                <p>Seleccionamos solo los granos más excepcionales de las mejores regiones cafetaleras del mundo.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💚</div>
                <h3>Pasión</h3>
                <p>Vivimos y respiramos café. Cada grano cuenta una historia que queremos compartir contigo.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Comunidad</h3>
                <p>Creemos en construir relaciones duraderas con nuestros clientes, productores y colaboradores.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>Nuestro Proceso</h2>
            <div className="process-steps">
              <div className="step">
                <span className="step-number">1</span>
                <h3>Selección</h3>
                <p>Seleccionamos cuidadosamente los granos de las mejores fincas cafetaleras.</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <h3>Tueste</h3>
                <p>Utilizamos métodos de tueste artesanales que realzan los sabores naturales.</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <h3>Control de Calidad</h3>
                <p>Cada lote pasa por rigurosos controles de calidad antes del empaque.</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <h3>Entrega</h3>
                <p>Entregamos café fresco directamente a tu puerta, manteniendo toda su esencia.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;