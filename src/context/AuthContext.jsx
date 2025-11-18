import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- helpers idénticos a tu contexto ---
const createMockUser = (baseData, source) => ({
  id: source === 'login' ? 1 : Date.now(),
  nombre: baseData.nombre || baseData.usuario,
  apellido: baseData.apellido || 'Usuario',
  usuario: baseData.usuario,
  email: baseData.email || `${baseData.usuario}@example.com`,
  rol: 'COMPRADOR',
  token: `fake-token-${Date.now()}`
});

const simulateApiCall = (delay = 1000) =>
  new Promise(resolve => setTimeout(resolve, delay));

// --- thunks ---
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  try {
    const saved = localStorage.getItem('usuarioLogueado');
    if (saved) return JSON.parse(saved);
    return null;
  } catch {
    localStorage.removeItem('usuarioLogueado');
    return null;
  }
});

export const login = createAsyncThunk('auth/login', async (credentials) => {
  console.log('🔐 Intento de login con:', credentials);
  await simulateApiCall(1000);
  const userData = createMockUser(credentials, 'login');
  localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
  return userData;
});

export const register = createAsyncThunk('auth/register', async (userData) => {
  console.log('📝 Intento de registro con:', userData);
  await simulateApiCall(1000);
  const newUser = createMockUser(userData, 'register');
  localStorage.setItem('usuarioLogueado', JSON.stringify(newUser));
  return newUser;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  console.log('🚪 Cerrando sesión');
  localStorage.removeItem('usuarioLogueado');
  return true;
});

// --- slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,     // igual que tu contexto al montar
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // init
      .addCase(initializeAuth.pending, (s)=>{ s.loading = true; s.error=null; })
      .addCase(initializeAuth.fulfilled, (s,{payload})=>{
        s.user = payload;
        s.loading = false;
      })
      .addCase(initializeAuth.rejected, (s)=>{
        s.user = null; s.loading = false;
      })

      // login
      .addCase(login.pending, (s)=>{ s.loading = true; s.error=null; })
      .addCase(login.fulfilled, (s,{payload})=>{
        s.user = payload; s.loading = false;
      })
      .addCase(login.rejected, (s,{error})=>{
        s.loading = false; s.error = error.message;
      })

      // register
      .addCase(register.pending, (s)=>{ s.loading = true; s.error=null; })
      .addCase(register.fulfilled, (s,{payload})=>{
        s.user = payload; s.loading = false;
      })
      .addCase(register.rejected, (s,{error})=>{
        s.loading = false; s.error = error.message;
      })

      // logout
      .addCase(logout.fulfilled, (s)=>{
        s.user = null;
      });
  }
});

export default authSlice.reducer;

// --- selectores equivalentes a tu contextValue ---
export const selectUser = (s) => s.auth.user;
export const selectLoading = (s) => s.auth.loading;
export const selectIsAuthenticated = (s) => !!s.auth.user;
