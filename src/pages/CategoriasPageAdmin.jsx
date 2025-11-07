import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import './AdminPages.css';
import { useNotify } from '../context/NotifyContext';

const CategoriasPageAdmin = () => {
  const { user, isAdmin, isVendedor } = useAuth();
  const { notify, confirm } = useNotify();
  const canManage = isAdmin || isVendedor;
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      await Promise.all([cargarCategorias(), cargarProductos()]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      mostrarNotificacion('❌ Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const categoriasData = await categoryService.getCategorias();
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategorias([]);
    }
  };

  const cargarProductos = async () => {
    try {
      const productosData = await productService.getProductos();
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
    }
  };

  const getProductCountByCategory = (categoriaId) => {
    if (!Array.isArray(productos)) return 0;
     return productos.filter(p => p.categoriaId === categoriaId).length;
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!canManage) {
      mostrarNotificacion('❌ No autorizado: permisos insuficientes', 'error');
      return;
    }
    try {
      setSaving(true);
      await categoryService.createCategoria(categoryFormData);
      await cargarCategorias();
      resetCategoryForm();
      setShowCategoryForm(false);
      mostrarNotificacion('✅ Categoría creada exitosamente', 'success');
    } catch (error) {
      console.error('Error creando categoría:', error);
      const msg = error?.message?.includes('No autorizado')
        ? '❌ No autorizado: requiere rol ADMIN'
        : '❌ Error al crear categoría';
      mostrarNotificacion(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!canManage) {
      mostrarNotificacion('❌ No autorizado: permisos insuficientes', 'error');
      return;
    }
    try {
      setSaving(true);
      await categoryService.updateCategoria(editingCategory.id, categoryFormData);
      await cargarCategorias();
      resetCategoryForm();
      setShowCategoryForm(false);
      mostrarNotificacion('✅ Categoría actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      const msg = error?.message?.includes('No autorizado')
        ? '❌ No autorizado: requiere rol ADMIN'
        : '❌ Error al actualizar categoría';
      mostrarNotificacion(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoriaId) => {
    if (!(await confirm({ title: 'Eliminar categoría', message: '¿Estás seguro de que quieres eliminar esta categoría?', confirmText: 'Eliminar', cancelText: 'Cancelar' }))) return;
    if (!canManage) {
      mostrarNotificacion('❌ No autorizado: permisos insuficientes', 'error');
      return;
    }

    try {
      setSaving(true);
      await categoryService.deleteCategoria(categoriaId);
      await cargarCategorias();
      mostrarNotificacion('✅ Categoría eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      const msg = error?.message?.includes('No autorizado')
        ? '❌ No autorizado: requiere rol ADMIN'
        : '❌ Error al eliminar categoría';
      mostrarNotificacion(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (categoria) => {
    setEditingCategory(categoria);
    setCategoryFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || ''
    });
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      nombre: '',
      descripcion: ''
    });
    setEditingCategory(null);
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    notify.info(mensaje);
  };

  const handleReloadData = async () => {
    try {
      setSaving(true);
      await Promise.all([cargarCategorias(), cargarProductos()]);
      mostrarNotificacion('✅ Datos actualizados', 'success');
    } catch (error) {
      console.error('Error recargando datos:', error);
      mostrarNotificacion('❌ Error al actualizar datos', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page categories-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Gestión de Categorías</h1>
            <p>Administra las categorías de productos</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline btn-icon"
              onClick={handleReloadData}
              disabled={saving}
            >
              Actualizar
            </button>
            <button 
              className="btn btn-primary btn-icon"
              onClick={() => {
                resetCategoryForm();
                setShowCategoryForm(true);
              }}
              disabled={saving}
            >
              + Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">🏷️</div>
          <div className="stat-content">
            <h3>{categorias.length}</h3>
            <p>Total Categorías</p>
          </div>
        </div>
      </div>
      <div className="content-section">
        <div className="section-header">
          <h2>Lista de Categorías</h2>
          <span className="section-badge">{categorias.length} categorías</span>
        </div>

        {categorias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No hay categorías registradas</h3>
            <p>Comienza agregando tu primera categoría</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetCategoryForm();
                setShowCategoryForm(true);
              }}
              disabled={saving}
            >
              + Crear Primera Categoría
            </button>
          </div>
        ) : (
          <div className="categories-grid">
            {categorias.map((categoria) => {
              const productCount = getProductCountByCategory(categoria.id);
              return (
                <div key={categoria.id} className="category-card">
                  <div className="category-header">
                    <div className="category-info">
                      <h3>{categoria.nombre}</h3>
                      <p>{categoria.descripcion || 'Sin descripción'}</p>
                      <span className="category-id">ID: {categoria.id}</span>
                    </div>
                  </div>
                  <div className="category-footer">
                    <div className="category-actions">
                      <button 
                        className="btn btn-edit btn-sm"
                        onClick={() => handleEditCategory(categoria)}
                        disabled={saving || !canManage}
                        title={!canManage ? 'Sin permisos para editar categorías' : ''}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCategoryForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCategoryForm(false);
                  resetCategoryForm();
                }}
                disabled={saving}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre de la Categoría *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={categoryFormData.nombre}
                    onChange={handleCategoryInputChange}
                    required
                    disabled={saving || !canManage}
                    placeholder="Ej: Café en Grano"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={categoryFormData.descripcion}
                    onChange={handleCategoryInputChange}
                    rows="3"
                    disabled={saving || !canManage}
                    placeholder="Descripción de la categoría..."
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCategoryForm(false);
                    resetCategoryForm();
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving || !canManage}
                >
                  {saving ? (
                    <>
                      <div className="btn-spinner"></div>
                      Guardando...
                    </>
                  ) : (
                    editingCategory ? 'Actualizar' : 'Crear'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasPageAdmin;

