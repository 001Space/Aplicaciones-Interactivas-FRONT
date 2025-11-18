import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts } from '../../services/productService';

// ✅ Productos temporales (solo mientras no tenés la DB)
const fallbackProducts = [
  { id: 1, name: "Café Espresso", price: 1500, stock: 10, img: "/img/cafe1.png" },
  { id: 2, name: "Latte Vainilla", price: 2000, stock: 15, img: "/img/cafe2.png" },
  { id: 3, name: "Capuccino", price: 1800, stock: 8, img: "/img/cafe3.png" }
];

// ✅ Thunk que intenta usar la DB pero cae al fallback
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProducts(); // 🟣 si la DB no está, esto falla
      return res;
    } catch (err) {
      console.warn("⚠️ fNo se pudo acceder a la base de datos. Usando datos de fallback.");
      return rejectWithValue("fallback");
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    status: 'idle',
    error: null
  },
  reducers: {
    // Opcional: actualizar manualmente si querés
    setProductsLocal: (state, action) => {
      state.list = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.list = payload; // 👈 datos reales del backend
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "offline"; // ✅ indicador útil
        state.error = action.payload;

        // ✅ Setear productos de fallback
        state.list = fallbackProducts;
      });
  }
});

export const { setProductsLocal } = productsSlice.actions;
export const selectProducts = s => s.products.list;
export const selectProductsStatus = s => s.products.status;
export default productsSlice.reducer;
