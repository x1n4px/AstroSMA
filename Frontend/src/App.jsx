import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { isTokenExpired } from '@/auth/auth.jsx'

import Login from '@/pages/Auth/Login';
import Dashboard from '@/pages/basic/Dashboard';
import Layout from '@/layout/Layout';
import Register from '@/pages/Auth/Register';
import Station from '@/pages/astronomy/Station';
import Bolide from '@/pages/astronomy/bolide';
import Profile from '@/pages/basic/Profile';
import Report from '@/pages/astronomy/report/report';
import NotFound from '@/pages/basic/NotFound'; // Importa el componente NotFound
import CustomizeSearch from '@/pages/search/customizeSearch';
import ActiveRain from '@/pages/astronomy/activeShower.jsx';
import RadiantReport from '@/pages/astronomy/report/radiantReport';
import PhotometryReport from './pages/astronomy/report/pages/photometryReport';
import QRLogin from './pages/Auth/QRLogin';
import AdminPanel from './pages/Auth/AdminPanel';
import EventComponent from './components/admin/eventComponent';
import Home from './pages/basic/Home';
import AuditPanel from './components/admin/auditPanel';
import ConfigPanel from './components/admin/configPanel';

import {
  QR_USER_ROL,
  BASIC_USER_ROL,
  ADMIN_USER_ROL,
  isNotQRUser,
  isBasicUser,
  isAdminUser,
  isBasicOrAdminUser,
  isQRUser,
  allUser
} from '@/utils/roleMaskUtils';


const ProtectedRoute = ({ children, requiredRoles, requiredRoleMask }) => {
  const token = localStorage.getItem('authToken');
  const userRoleMask = localStorage.getItem('rol');

  if (isTokenExpired(token)) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    return <Navigate to="/login" replace />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verificación por máscara de rol
  if (requiredRoleMask) {
    if (requiredRoleMask === 'ADMIN' && !isAdminUser(userRoleMask)) {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRoleMask === 'BASIC' && !isBasicUser(userRoleMask)) {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRoleMask === 'NOT_QR' && !isNotQRUser(userRoleMask)) {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRoleMask === 'BASIC_OR_ADMIN' && !isBasicOrAdminUser(userRoleMask)) {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRoleMask === 'ALL_USER' && !allUser(userRoleMask)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Verificación tradicional por roles (opcional, puedes usar uno u otro sistema)
  if (requiredRoles && !requiredRoles.includes(userRoleMask)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga inicial



  // Verificar el token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (isTokenExpired(token)) {
      localStorage.removeItem('authToken');
    }

    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Finalizar la carga
  }, []);

  const loginHandler = (token, rol) => {
    const currentTime = new Date().toISOString();
    localStorage.setItem('rol', rol);
    localStorage.setItem('authToken', token);
    localStorage.setItem('loginTime', currentTime);
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
        <Route path="/home" element={<Home />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={loginHandler} />}
        />
        <Route path="/register" element={<Register />} />

        {/* Redirigir desde "/" a "/dashboard" si el usuario está autenticado */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path='/qr-login' element={<QRLogin onLogin={loginHandler} />} />

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
          <Route path="dashboard" 
          element={
            <ProtectedRoute requiredRoleMask="ALL_USER">
              <Dashboard />
            </ProtectedRoute>} 
            />
          <Route path="station" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <Station /></ProtectedRoute>} />
          <Route path="bolide/:bolideId" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <Bolide /></ProtectedRoute>} />
          <Route path="/report/:reportId/bolide/:bolideId" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <Bolide /></ProtectedRoute>} />
          <Route path="profile" element={ <ProtectedRoute requiredRoleMask="NOT_QR"><Profile /></ProtectedRoute>} />
          <Route path="/report/:reportId" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <Report /></ProtectedRoute>} />
          <Route path="/customize-search" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <CustomizeSearch /></ProtectedRoute>} />
          <Route path="/active-rain" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <ActiveRain /></ProtectedRoute>} />
          <Route path="/radiant-report/:reportId" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <RadiantReport /></ProtectedRoute>} />
          <Route path="/photometry-report/:reportId" element={ <ProtectedRoute requiredRoleMask="ALL_USER"> <PhotometryReport /></ProtectedRoute>} />
          <Route path="/admin-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><AdminPanel /></ProtectedRoute>} />
          <Route path="/event-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><EventComponent /></ProtectedRoute>} />
          <Route path="/audit-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><AuditPanel /></ProtectedRoute>} />
          <Route path="/config-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><ConfigPanel /></ProtectedRoute>} />
          {/* Otras rutas protegidas */}
        </Route>

        {/* Ruta comodín para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;