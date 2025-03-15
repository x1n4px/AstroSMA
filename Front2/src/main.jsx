// src/index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './config/i18next.config'; // Importa la configuración de i18n
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </Suspense>
  </React.StrictMode>
);