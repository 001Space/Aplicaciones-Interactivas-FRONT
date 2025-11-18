// store.js
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';;

const rootReducer = combineReducers({
  notify: notifyReducer,
  discount: discountReducer,
  cart: cartReducer,
  auth: authReducer,
  products: productsReducer
});

const persistConfig = { key: 'root', storage, whitelist: ['cart','auth'] };
export const store = configureStore({ reducer: persistReducer(persistConfig, rootReducer) });
export const persistor = persistStore(store);
