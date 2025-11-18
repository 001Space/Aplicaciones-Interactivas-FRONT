import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import  {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './store/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </React.StrictMode>,
)