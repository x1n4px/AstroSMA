import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './pages/Auth/Login';
import Dashboard from './pages/basic/Dashboard';
import Layout from './layout/Layout';
import Register from './pages/Auth/Register';
import Report from './pages/astronomy/report';
import Station from './pages/astronomy/Station';
import Bolide from './pages/astronomy/bolide';
import Profile from './pages/basic/Profile';
import Report2 from './pages/astronomy/example';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga inicial

  // Verificar el token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Finalizar la carga
  }, []);

  const loginHandler = (token) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logoutHandler = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  // Si está cargando, muestra un mensaje de carga
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={loginHandler} />}
        />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={logoutHandler} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="report/:reportId" element={<Report />} />
          <Route path="station" element={<Station />} />
          <Route path="bolide/:bolideId" element={<Bolide />} />
          <Route path="/report/:reportId/bolide/:bolideId" element={<Bolide />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/example" element={<Report2 />} />
          {/* Opcional: Ruta por defecto o "no encontrado" */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;