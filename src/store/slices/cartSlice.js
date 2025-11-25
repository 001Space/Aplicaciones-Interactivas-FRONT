import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/api";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      if (!apiClient.isAuthenticated()) {
        return { items: [], total: 0 };
      }

      const cartData = await apiClient.getCarrito();
      return cartData;
    } catch (err) {
      return rejectWithValue("No se pudo cargar el carrito");
    }
  }
);

//Agregar el productor al backend

export const addToCartThunk = createAsyncThunk(
  "cart/addToCart",
  async ({ producto, cantidad }, { rejectWithValue }) => {
    try {
      await apiClient.addToCart(producto.id, cantidad);
      const updated = await apiClient.getCarrito();
      return updated;
    } catch (err) {
      // Fallback locaaaa
      return rejectWithValue({ fallback: true, producto, cantidad });
    }
  }
);

//Actualiza la acantidad de productos en el backend y local
export const updateCartItemThunk = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, cantidad }, { rejectWithValue }) => {
    try {
      await apiClient.updateCartItem(itemId, cantidad);
      const updated = await apiClient.getCarrito();
      return updated;
    } catch (err) {
      return rejectWithValue({ fallback: true, itemId, cantidad });
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  "cart/removeItem",
  async ({ itemId }, { rejectWithValue }) => {
    try {
      await apiClient.removeFromCart(itemId);
      const updated = await apiClient.getCarrito();
      return updated;
    } catch (err) {
      return rejectWithValue({ fallback: true, itemId });
    }
  }
);


export const clearCartThunk = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.clearCart();
      return { items: [], total: 0 };
    } catch (err) {
      return rejectWithValue({ fallback: true });
    }
  }
);
export const checkoutThunk = createAsyncThunk(
  "cart/checkout",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.checkout();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

const calcTotal = (items) => {
  return items.reduce((sum, item) => {
    const precio = item.precioUnitario || item.precio || item.producto?.precio || 0;
    return sum + precio * (item.cantidad || 1);
  }, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Fallback local — Agregar
    addLocal(state, action) {
      const { producto, cantidad } = action.payload;

      const existing = state.items.find(
        (i) =>
          i.productoId === producto.id ||
          i.id === producto.id ||
          i.itemId === producto.id
      );

      if (existing) {
        existing.cantidad += cantidad;
      } else {
        state.items.push({
          itemId: Date.now(),
          productoId: producto.id,
          producto,
          cantidad,
          precioUnitario: producto.precio,
          nombre: producto.nombre,
          imagenUrl: producto.imagenUrl,
        });
      }

      state.total = calcTotal(state.items);
      localStorage.setItem(
        "carritoLocal",
        JSON.stringify({ items: state.items, total: state.total })
      );
    },

    // Fallback local — Actualizar cantidad
    updateLocal(state, action) {
      const { itemId, cantidad } = action.payload;

      state.items = state.items
        .map((item) =>
          item.itemId === itemId || item.id === itemId
            ? { ...item, cantidad }
            : item
        )
        .filter((item) => item.cantidad > 0);

      state.total = calcTotal(state.items);

      localStorage.setItem(
        "carritoLocal",
        JSON.stringify({ items: state.items, total: state.total })
      );
    },

    // Fallback local — Eliminar
    removeLocal(state, action) {
      const { itemId } = action.payload;

      state.items = state.items.filter(
        (item) =>
          item.itemId !== itemId &&
          item.id !== itemId &&
          item.productoId !== itemId
      );

      state.total = calcTotal(state.items);

      localStorage.setItem(
        "carritoLocal",
        JSON.stringify({ items: state.items, total: state.total })
      );
    },

    // Fallback local — Vaciar
    clearLocal(state) {
      state.items = [];
      state.total = 0;
      localStorage.removeItem("carritoLocal");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.fallback) {
          cartSlice.caseReducers.addLocal(state, {
            payload: {
              producto: action.payload.producto,
              cantidad: action.payload.cantidad,
            },
          });
        } else {
          state.error = action.payload;
        }
      })

        //Actualizar cantidades
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        if (action.payload?.fallback) {
          cartSlice.caseReducers.updateLocal(state, {
            payload: {
              itemId: action.payload.itemId,
              cantidad: action.payload.cantidad,
            },
          });
        }
      })

      //Remove itemss
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(removeFromCartThunk.rejected, (state, action) => {
        if (action.payload?.fallback) {
          cartSlice.caseReducers.removeLocal(state, {
            payload: { itemId: action.payload.itemId },
          });
        }
      })
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        if (action.payload?.fallback) {
          cartSlice.caseReducers.clearLocal(state);
        }
      });
  },
});

export const { addLocal, updateLocal, removeLocal, clearLocal } =
  cartSlice.actions;

export default cartSlice.reducer;
