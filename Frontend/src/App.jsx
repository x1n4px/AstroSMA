import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { isTokenExpired } from '@/auth/auth.jsx'

const Login = lazy(() => import('@/pages/Auth/Login'));
const Dashboard = lazy(() => import('@/pages/basic/Dashboard'));
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
const QRLogin = lazy(() => import('./pages/Auth/QRLogin'));
const AdminPanel = lazy(() => import('./pages/Auth/AdminPanel'));
const EventComponent = lazy(() => import('./components/admin/eventPanel'));
const Home = lazy(() => import('./pages/basic/Home'));
const AuditPanel = lazy(() => import('./components/admin/auditPanel'));
const ConfigPanel = lazy(() => import('./components/admin/configPanel'));
const UserPanel = lazy(() => import('./components/admin/userPanel'));
const ShowerInfo = lazy(() => import('./pages/astronomy/report/showerInfo.jsx'));
const Dashb2 = lazy(() => import('./pages/basic/dashb2.jsx'));

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


const ProtectedRoute = ({ children, requiredRoles, requiredRoleMask }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [userRoleMask, setUserRoleMask] = useState(localStorage.getItem('rol'));


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
  const token = localStorage.getItem('authToken');
  const userRoleMask = localStorage.getItem('rol');


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
    if (token) {
      setIsAuthenticated(true);
    }

    // window.location.href = '/dashboard';
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
      <Suspense fallback={<div>Cargando página...</div>}>
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
                  <Dashb2 />
                </ProtectedRoute>}
            />
            <Route path="station" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Station /></ProtectedRoute>} />
            <Route path="bolide/:bolideId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Bolide /></ProtectedRoute>} />
            <Route path="/report/:reportId/bolide/:bolideId" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <Bolide /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute requiredRoleMask="NOT_QR"><Profile /></ProtectedRoute>} />
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
            <Route path="/shower-info/:selectedCode?" element={<ProtectedRoute requiredRoleMask="ALL_USER"> <ShowerInfo /></ProtectedRoute>} />


            {/* Otras rutas protegidas */}
          </Route>

          {/* Ruta comodín para páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;