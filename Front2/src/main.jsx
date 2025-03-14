// src/index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './config/i18next.config'; // Importa la configuración de i18n

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);