
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  isDebug() {
    try {
      return !!(import.meta.env && (import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === 'true'));
    } catch {
      return false;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (this.isDebug()) {
      let bodyPreview = null;
      try {
        bodyPreview = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
      } catch {
        bodyPreview = config.body;
      }

      console.debug('🔍 API Request:', {
        url,
        method: config.method || 'GET',
        body: bodyPreview,
        headers: { ...config.headers, Authorization: token ? `Bearer ${token?.slice(0, 6)}…` : undefined },
      });
    }

    try {
      const response = await fetch(url, config);

      if (this.isDebug()) {
        console.debug('🔍 API Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });
      }

      if (!response.ok) {
        let errorMessage =
          response.status === 500
            ? 'Error en ingreso de datos.'
            : `Error ${response.status}: ${response.statusText}`;

        try {
          const errorText = await response.text();
          console.log('🔍 Error response text:', errorText);

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              if (response.status !== 500) {
                errorMessage = errorData.message || errorData.error || errorMessage;
              }
            } catch {
              if (response.status !== 500) {
                errorMessage = errorText;
              }
            }
          }
        } catch {
          console.log('🔍 No se pudo leer el cuerpo del error');
        }
        const err = new Error(errorMessage);
        try { err.status = response.status; } catch {}
        throw err;
      }

      if (response.status === 204) {
        return { success: true };
      }

      const text = await response.text();
      if (!text) return {};

      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  normalizeAuthority(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().toUpperCase().replace(/^ROLE_/, ''); //
  }

  pickRoleFromAuthorities(authorities = []) {
    const list = authorities
      .map(a => (typeof a === 'string' ? a : a?.authority))
      .filter(Boolean)
      .map(this.normalizeAuthority);

    if (list.includes('ADMIN')) return 'ADMIN';
    if (list.includes('VENDEDOR')) return 'VENDEDOR';
    if (list.includes('COMPRADOR') || list.length) return 'COMPRADOR';
    return null;
  }

  determinarRolUsuario(whoamiData, username, fallbackRole = null) {
    try {
      const authorities =
        whoamiData?.authorities ||
        whoamiData?.roles ||
        whoamiData?.authoritiesList ||
        [];

      const rol = this.pickRoleFromAuthorities(authorities) || fallbackRole || 'COMPRADOR';

      const principal = whoamiData?.principal || whoamiData?.user || whoamiData;
      const usuario = principal?.usuario || principal?.username || username || null;

      const nombre = principal?.nombre || principal?.firstName || null;
      const apellido = principal?.apellido || principal?.lastName || null;
      const email = principal?.email || null;

      return { usuario, nombre, apellido, email, rol };
    } catch (e) {
      console.warn('⚠️ determinarRolUsuario: no se pudo resolver, uso fallback', e);
      return { usuario: username || null, nombre: null, apellido: null, email: null, rol: fallbackRole || 'COMPRADOR' };
    }
  }

  persistSession(token, userData) {
    if (token) localStorage.setItem('authToken', token);
    if (userData) localStorage.setItem('userData', JSON.stringify(userData));
  }

  async hydrateUserFromWhoami(currentUserLike) {
    try {
      const whoami = await this.whoami(); // requiere token
      const username =
        currentUserLike?.usuario ||
        currentUserLike?.username ||
        (typeof currentUserLike === 'string' ? currentUserLike : null);

      const fallbackRole = currentUserLike?.rol || null;
      const userNorm = this.determinarRolUsuario(whoami, username, fallbackRole);

      const merged = {
        ...(currentUserLike || {}),
        ...userNorm,
        email: userNorm.email ?? currentUserLike?.email ?? null,
        nombre: userNorm.nombre ?? currentUserLike?.nombre ?? null,
        apellido: userNorm.apellido ?? currentUserLike?.apellido ?? null,
      };

      this.persistSession(localStorage.getItem('authToken'), merged);
      return merged;
    } catch (e) {
      console.warn('⚠️ No se pudo hidratar usuario desde whoami:', e.message);
      return currentUserLike || null;
    }
  }

  async login(credentials) {
    try {
      const loginData = {
        usuario: credentials.usuario,
        contrasenia: credentials.password,
      };

      console.log('🔍 Login data:', loginData);

      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      console.log('🔍 Login response status:', response.status);

      if (!response.ok) {
        let errorMessage =
          response.status === 500
            ? 'Error en ingreso de datos.'
            : `Error ${response.status}: ${response.statusText}`;

        const errTxt = await response.text().catch(() => '');
        if (errTxt && response.status !== 500) {
          try {
            const errJson = JSON.parse(errTxt);
            errorMessage = errJson.message || errJson.error || errorMessage;
          } catch {
            errorMessage = errTxt || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      const baseUser =
        data.user ||
        data.usuario ||
        {
          usuario: credentials.usuario,
          email: data.email || null,
          nombre: data.nombre || null,
          apellido: data.apellido || null,
          rol: data.rol || null,
        };

      const hydrated = await this.hydrateUserFromWhoami(baseUser);

      this.persistSession(data.token || localStorage.getItem('authToken'), hydrated);

      return { token: localStorage.getItem('authToken'), user: hydrated };
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.logout();
      throw error;
    }
  }

  async register(userData) {
    try {
      const registerData = {
        usuario: userData.usuario,
        email: userData.email,
        contrasenia: userData.password,
        nombre: userData.nombre,
        apellido: userData.apellido,
        rol: 'COMPRADOR', 
      };

      console.log('🔍 Register data:', registerData);

      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      console.log('🔍 Register response status:', response.status);

      if (!response.ok) {
        let errorMessage =
          response.status === 500
            ? 'Ya existe ese usuario o email. Porfavor, elija otro.'
            : `Error ${response.status}: ${response.statusText}`;

        const errTxt = await response.text().catch(() => '');
        if (errTxt && response.status !== 500) {
          try {
            const errJson = JSON.parse(errTxt);
            errorMessage = errJson.message || errJson.error || errorMessage;
          } catch {
            errorMessage = errTxt || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      const baseUser =
        data.user ||
        {
          usuario: registerData.usuario,
          email: registerData.email,
          nombre: registerData.nombre,
          apellido: registerData.apellido,
          rol: 'COMPRADOR',
        };

      const hydrated = await this.hydrateUserFromWhoami(baseUser);

      this.persistSession(data.token || localStorage.getItem('authToken'), hydrated);

      return { token: localStorage.getItem('authToken'), user: hydrated };
    } catch (error) {
      console.error('❌ Register failed:', error);
      this.logout();
      throw error;
    }
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  async whoami() {
    return this.request('/api/auth/whoami');
  }

  async getProductos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/productos?${queryString}`);
  }

  async getProducto(id) {
    return this.request(`/api/productos/${id}`);
  }

  async createProducto(productoData) {
    return this.request('/api/productos', {
      method: 'POST',
      body: JSON.stringify(productoData),
    });
  }

  async updateProducto(id, productoData) {
    return this.request(`/api/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productoData),
    });
  }

  async deleteProducto(id) {
    return this.request(`/api/productos/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategorias() {
    return this.request('/api/categorias');
  }

  async createCategoria(categoriaData) {
    return this.request('/api/categorias', {
      method: 'POST',
      body: JSON.stringify(categoriaData),
    });
  }

  async updateCategoria(id, categoriaData) {
    return this.request(`/api/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData),
    });
  }

  async deleteCategoria(id) {
    return this.request(`/api/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  async getCarrito() {
    try {
      const data = await this.request('/api/carrito');
      console.log('🛒 Carrito obtenido de backend:', data);

      return {
        items: data.items || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.log('🛒 Error obteniendo carrito, usando vacío:', error.message);
      return { items: [], total: 0 };
    }
  }

  async addToCart(productoId, cantidad = 1) {
    try {
      const payload = {
        productoId: this.safeParseInt(productoId),
        cantidad: this.safeParseInt(cantidad),
      };

      console.log('🛒 Agregando al carrito:', payload);

      const result = await this.request('/api/carrito/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('✅ Producto agregado al carrito:', result);
      return result;
    } catch (error) {
      console.error('❌ Error agregando al carrito:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, cantidad) {
    try {
      const payload = { cantidad: this.safeParseInt(cantidad) };
      const safeItemId = this.safeParseInt(itemId);

      console.log('📝 Actualizando cantidad:', {
        itemId: safeItemId,
        cantidad: payload.cantidad,
      });

      const result = await this.request(`/api/carrito/items/${safeItemId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      console.log('✅ Cantidad actualizada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error actualizando cantidad:', error);
      throw error;
    }
  }

  async removeFromCart(itemId) {
    try {
      const safeItemId = this.safeParseInt(itemId);

      if (safeItemId === null) {
        console.warn('⚠️ removeFromCart: ID inválido, saltando eliminación');
        return { success: true, skipped: true, message: 'ID inválido - saltado' };
      }

      console.log('🗑️ Eliminando item del carrito:', safeItemId);

      const result = await this.request(`/api/carrito/items/${safeItemId}`, {
        method: 'DELETE',
      });

      console.log('✅ Item eliminado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error eliminando item:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      console.log('🧹 Vaciando carrito completo');

      const carrito = await this.getCarrito();
      console.log('🔍 Carrito a vaciar:', carrito);

      if (!carrito.items || carrito.items.length === 0) {
        console.log('ℹ️ Carrito ya está vacío');
        return { success: true };
      }

      const itemsValidos = carrito.items.filter((item) => {
        const itemId = this.safeParseInt(item?.id ?? item?.itemId);
        return itemId !== null;
      });

      console.log(
        `🗑️ Eliminando ${itemsValidos.length} items válidos de ${carrito.items.length} totales...`
      );

      const deletePromises = itemsValidos.map((item) => {
        const itemId = item?.id ?? item?.itemId;
        return this.removeFromCart(itemId).catch((error) => {
          console.warn(`⚠️ Error eliminando item ${itemId}:`, error.message);
          return { success: false, error: error.message };
        });
      });

      await Promise.all(deletePromises);
      console.log('✅ Carrito vaciado exitosamente');

      return { success: true };
    } catch (error) {
      console.error('❌ Error vaciando carrito:', error);
      throw error;
    }
  }

  async checkout() {
    try {
      console.log('💳 Procesando checkout...');

      const result = await this.request('/api/carrito/checkout', {
        method: 'POST',
      });

      console.log('✅ Checkout completado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en checkout:', error);
      throw error;
    }
  }

  async getPedidos() {
    return this.request('/api/pedidos');
  }

  async getPedido(id) {
    return this.request(`/api/pedidos/${id}`);
  }

  async crearPedido(pedidoData) {
    return this.request('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    });
  }

  safeParseInt(value) {
    console.log('🔍 safeParseInt recibió:', { value, tipo: typeof value });

    if (value === null || value === undefined || value === '') {
      console.warn('⚠️ safeParseInt: Valor nulo o vacío recibido, retornando null');
      return null;
    }

    if (typeof value === 'object') {
      console.log('🔍 safeParseInt: Es objeto, buscando id...', value);
      const idFromObject = value.id || value.productoId || value.itemId;
      if (idFromObject) {
        value = idFromObject;
      } else {
        console.warn('⚠️ safeParseInt: No se pudo encontrar ID en el objeto');
        return null;
      }
    }

    const stringValue = value.toString().trim();
    if (stringValue === '') {
      console.warn('⚠️ safeParseInt: String vacío después de conversión');
      return null;
    }

    const parsed = parseInt(stringValue, 10);
    if (isNaN(parsed)) {
      console.warn('⚠️ safeParseInt: No es número válido', stringValue);
      return null;
    }

    console.log('✅ safeParseInt convertido:', parsed);
    return parsed;
  }

  async diagnoseCartEndpoints() {
    console.log('🔍 DIAGNÓSTICO: Probando endpoints del carrito...');

    const endpoints = ['/api/carrito', '/api/carrito/items', '/api/carrito/checkout'];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        console.log(`🔍 ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`🔍 ${endpoint}: ERROR -`, error.message);
      }
    }
  }

  validateCartItem(item) {
    console.log('🔍 Validando item:', item);

    if (!item) {
      throw new Error('Item no puede ser nulo');
    }

    if (!item.id && !item.productoId) {
      console.error('❌ Item sin ID válido:', item);
      throw new Error('Item debe tener id o productoId');
    }

    const validated = {
      id: item.id ? this.safeParseInt(item.id) : null,
      productoId: item.productoId ? this.safeParseInt(item.productoId) : null,
      cantidad: item.cantidad ? this.safeParseInt(item.cantidad) : 1,
    };

    console.log('✅ Item validado:', validated);
    return validated;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

}

export const apiClient = new ApiClient();
