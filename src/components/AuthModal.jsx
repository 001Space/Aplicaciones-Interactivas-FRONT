import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeForm, setActiveForm] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const [loginForm, setLoginForm] = useState({
    usuario: '',
    contrasenia: ''
  });

  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    email: '',
    contrasenia: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginForm);
    if (result.success) {
      onClose();
      resetForms();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerForm.contrasenia !== registerForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (registerForm.contrasenia.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = registerForm;
    const result = await register({ ...userData, rol: 'COMPRADOR' });
    
    if (result.success) {
      onClose();
      resetForms();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const resetForms = () => {
    setLoginForm({ usuario: '', contrasenia: '' });
    setRegisterForm({
      nombre: '', apellido: '', usuario: '', email: '', contrasenia: '', confirmPassword: ''
    });
    setError('');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative mx-4">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        
        <div className={activeForm === 'login' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <label htmlFor="loginUsuario" className="block mb-2 font-medium">Usuario:</label>
              <input
                type="text"
                id="loginUsuario"
                value={loginForm.usuario}
                onChange={(e) => setLoginForm({...loginForm, usuario: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="Tu nombre de usuario"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="loginPassword" className="block mb-2 font-medium">Contraseña:</label>
              <input
                type="password"
                id="loginPassword"
                value={loginForm.contrasenia}
                onChange={(e) => setLoginForm({...loginForm, contrasenia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary text-white py-3 rounded font-bold hover:bg-hover-highlight transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
          <p className="text-center mt-4">
            ¿No tienes cuenta?{' '}
            <button 
              onClick={() => setActiveForm('register')}
              className="text-accent-primary hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        <div className={activeForm === 'register' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold text-center mb-6">Registrarse</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-4">
              <label htmlFor="registerNombre" className="block mb-2 font-medium">Nombre:</label>
              <input
                type="text"
                id="registerNombre"
                value={registerForm.nombre}
                onChange={(e) => setRegisterForm({...registerForm, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="registerApellido" className="block mb-2 font-medium">Apellido:</label>
              <input
                type="text"
                id="registerApellido"
                value={registerForm.apellido}
                onChange={(e) => setRegisterForm({...registerForm, apellido: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="registerUsuario" className="block mb-2 font-medium">Usuario:</label>
              <input
                type="text"
                id="registerUsuario"
                value={registerForm.usuario}
                onChange={(e) => setRegisterForm({...registerForm, usuario: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="registerEmail" className="block mb-2 font-medium">Email:</label>
              <input
                type="email"
                id="registerEmail"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="registerPassword" className="block mb-2 font-medium">Contraseña:</label>
              <input
                type="password"
                id="registerPassword"
                value={registerForm.contrasenia}
                onChange={(e) => setRegisterForm({...registerForm, contrasenia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary text-white py-3 rounded font-bold hover:bg-hover-highlight transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Registrarse'}
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('login')}
              className="w-full bg-gray-500 text-white py-3 rounded font-bold hover:bg-gray-600 transition-colors mt-2"
            >
              <i className="fas fa-arrow-left mr-2"></i>Volver a Iniciar Sesión
            </button>
          </form>
          <p className="text-center mt-4">
            ¿Ya tienes cuenta?{' '}
            <button 
              onClick={() => setActiveForm('login')}
              className="text-accent-primary hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;