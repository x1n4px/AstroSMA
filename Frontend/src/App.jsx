import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AstronomyLoader } from './components/loader/AstronomyLoader.jsx';
import { isTokenExpired } from '@/auth/auth.jsx'

const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const Station = lazy(() => import('@/pages/astronomy/Station'));
const Bolide = lazy(() => import('@/pages/astronomy/bolide'));
const Profile = lazy(() => import('@/pages/basic/Profile'));
const Report = lazy(() => import('@/pages/astronomy/report/report'));
const NotFound = lazy(() => import('@/pages/basic/NotFound'));
const CustomizeSearch = lazy(() => import('@/pages/search/customizeSearch'));
const ActiveRain = lazy(() => import('@/pages/astronomy/activeShower.jsx'));
const RadiantReport = lazy(() => import('@/pages/astronomy/report/radiantReport'));
const PhotometryReport = lazy(() => import('./pages/astronomy/report/pages/photometryReport'));
const QRLogin = lazy(() => import('./pages/Auth/PasswordlessLogin.jsx'));
const AdminPanel = lazy(() => import('./pages/Auth/AdminPanel'));
const EventComponent = lazy(() => import('./components/admin/eventPanel'));
const Home = lazy(() => import('./pages/basic/Home'));
const AuditPanel = lazy(() => import('./components/admin/auditPanel'));
const ConfigPanel = lazy(() => import('./components/admin/configPanel'));
const UserPanel = lazy(() => import('./components/admin/userPanel'));
const ShowerInfo = lazy(() => import('./pages/astronomy/report/showerInfo.jsx'));
const Dashboard = lazy(() => import('./pages/basic/Dashboard.jsx'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const Request = lazy(() => import('./pages/basic/Request.jsx'));
const ActiveRainPanel = lazy(() => import('./components/admin/activeRainPanel.jsx'));
const Layout = lazy(() => import('./layout/Layout.jsx'));

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

// Función para limpiar completamente la sesión
const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('rol');
  // Agregar aquí cualquier otro item del localStorage relacionado con la sesión
  // localStorage.removeItem('userData');
  // localStorage.removeItem('preferences');
};

const ProtectedRoute = ({ children, requiredRoles, requiredRoleMask }) => {
  const token = localStorage.getItem('authToken');
  const userRoleMask = localStorage.getItem('rol');

  // Verificar si el token está expirado
  if (!token || isTokenExpired(token)) {
    clearSession();
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
  const [isLoading, setIsLoading] = useState(true);

  // Verificar el token al cargar la aplicación
  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('authToken');
      
      if (!token || isTokenExpired(token)) {
        clearSession();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  // Hook para verificar periodicamente si el token ha expirado
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenPeriodically = setInterval(() => {
      const token = localStorage.getItem('authToken');
      
      if (!token || isTokenExpired(token)) {
        clearSession();
        setIsAuthenticated(false);
        // Forzar redirección al login
        window.location.href = '/login';
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(checkTokenPeriodically);
  }, [isAuthenticated]);

  const loginHandler = (token, rol) => {
    if (token) {
      localStorage.setItem('authToken', token);
      if (rol) {
        localStorage.setItem('rol', rol);
      }
      setIsAuthenticated(true);
    }
  };

  const logoutHandler = () => {
    clearSession();
    setIsAuthenticated(false);
  };

  // Si está cargando, muestra el loader
  if (isLoading) {
    return <AstronomyLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<div>Cargando página...</div>}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:uuid" element={<ResetPassword />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={loginHandler} />}
          />
          <Route path="/register" element={<Register />} />

          {/* Redirigir desde "/" */}
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

          <Route path='/qr-login/:code?' element={<QRLogin onLogin={loginHandler} />} />

          {/* Rutas protegidas con Layout */}
          {isAuthenticated && (
            <Route
              path="/"
              element={<Layout onLogout={logoutHandler} />}
            >
              <Route path="dashboard"
                element={
                  <ProtectedRoute requiredRoleMask="ALL_USER">
                    <Dashboard />
                  </ProtectedRoute>}
              />
              <Route path="station" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Station /></ProtectedRoute>} />
              <Route path="bolide/:bolideId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Bolide /></ProtectedRoute>} />
              <Route path="/report/:reportId/bolide/:bolideId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Bolide /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute requiredRoleMask="NOT_QR"><Profile /></ProtectedRoute>} />
              <Route path="/report/:reportId/:tab?" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Report /></ProtectedRoute>} />
              <Route path="/report/:reportId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Report /></ProtectedRoute>} />
              <Route path="/customize-search" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <CustomizeSearch /></ProtectedRoute>} />
              <Route path="/active-rain" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <ActiveRain /></ProtectedRoute>} />
              <Route path="/radiant-report/:reportId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <RadiantReport /></ProtectedRoute>} />
              <Route path="/photometry-report/:reportId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <PhotometryReport /></ProtectedRoute>} />
              <Route path="/admin-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><AdminPanel /></ProtectedRoute>} />
              <Route path="/admin-panel/event-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><EventComponent /></ProtectedRoute>} />
              <Route path="/admin-panel/audit-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><AuditPanel /></ProtectedRoute>} />
              <Route path="/admin-panel/config-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><ConfigPanel /></ProtectedRoute>} />
              <Route path="/admin-panel/user-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"><UserPanel /></ProtectedRoute>} />
              <Route path="/admin-panel/station-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"> <Station /></ProtectedRoute>} />
              <Route path="/shower-info/:selectedCode?" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <ShowerInfo /></ProtectedRoute>} />
              <Route path="/request" element={<ProtectedRoute requiredRoleMask="ALL_USER"><Request /></ProtectedRoute>} />
              <Route path="/admin-panel/request-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"> <Request /></ProtectedRoute>} />
              <Route path="/admin-panel/active-rain-panel" element={<ProtectedRoute requiredRoleMask="ADMIN"> <ActiveRainPanel /></ProtectedRoute>} />
            </Route>
          )}

          {/* Ruta comodín para páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;