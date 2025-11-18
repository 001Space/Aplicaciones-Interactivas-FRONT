import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8080/api/auth';

//LOGIN (createAsyncThunk)
//Encapsula la lógica async (fetch) en un lugar y nos da automáticamente acciones: pending, fulfilled, rejected
//rejectWithValue: permite mandar un mensaje de error controlado al reducer

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        //loginUser.rejected: detecta el mensaje de error controlado
        return rejectWithValue(errorData.message || 'Usuario o contraseña incorrectos');
      }

      // Se espera que la API devuelva { user, token }
      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue('Error de conexión con el servidor');
    }
  }
);

/**
 * ✅ REGISTER (createAsyncThunk)
 * - Igual idea que loginUser, pero para /register
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Error al registrarse');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue('Error de conexión con el servidor');
    }
  }
);

/**
 * ✅ createSlice
 * - Nos evita escribir action types a mano (AUTH_LOGIN_SUCCESS, etc.)
 * - Nos permite escribir "mutaciones" que en realidad son inmutables gracias a immer
 */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false, // ✅ usado globalmente para login y register
    error: null,    // ✅ mensaje de error global para mostrar en cualquier componente
  },
  reducers: {
    // ✅ logout centralizado: cualquier componente puede dispatch(logout())
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    // ✅ cargar sesión desde localStorage cuando arranca la app
    loadSession: (state) => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (user && token) {
        state.user = JSON.parse(user);
        state.token = token;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ======================
      // LOGIN
      // ======================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null; // limpiamos error anterior
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // ✅ Persistimos sesión en localStorage para mantener login al recargar
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        // action.payload viene de rejectWithValue
        state.error = action.payload || 'Error al iniciar sesión';
      })

      // ======================
      // REGISTER
      // ======================
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al registrarse';
      });
  },
});

export const { logout, loadSession } = authSlice.actions;
export default authSlice.reducer;
