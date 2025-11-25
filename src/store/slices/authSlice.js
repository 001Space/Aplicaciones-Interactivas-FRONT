import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";
// LOGIN

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al iniciar sesión");
    }
  }
);
// REGISTRO

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      return response.data; // AuthResponse
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error al registrarse");
    }
  }
);


//Whoami/Tokens
export const fetchWhoAmI = createAsyncThunk(
  "auth/whoami",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue("Token inválido o expirado");
    }
  }
);

//Slides

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        // Guarda token
        state.token = action.payload.token;
        localStorage.setItem("authToken", action.payload.token);

        // Guarda user
        state.user = {
          username: action.payload.username,
          rol: action.payload.rol,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTRO
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;

        state.token = action.payload.token;
        localStorage.setItem("authToken", action.payload.token);

        state.user = {
          username: action.payload.username,
          rol: action.payload.rol,
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchWhoAmI.fulfilled, (state, action) => {
        state.user = {
          username: action.payload.username,
          authorities: action.payload.authorities,
        };
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
