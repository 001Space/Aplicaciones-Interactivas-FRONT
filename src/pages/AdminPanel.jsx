
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPages.css';

const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <header className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Panel del Vendedor </h1>
            <p>Gestiona tu catálogo y categorías con estilo Coffeecraft</p>
          </div>
          <div className="header-actions">
           
          </div>
        </div>
      </header>

      <section className="content-section">
        <div className="section-header">
          <h2>Accesos rápidos</h2>
          <p>Atajos para tus tareas más comunes</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/admin/productos')} style={{cursor: 'pointer'}}>
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Productos</h3>
              <p>Crear, editar y administrar tu catálogo</p>
            </div>
            <button className="btn btn-primary">Abrir</button>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/categorias')} style={{cursor: 'pointer'}}>
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>Categorías</h3>
              <p>Organiza productos por categorías</p>
            </div>
            <button className="btn btn-primary">Abrir</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
