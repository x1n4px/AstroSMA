import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Login from './pages/Auth/Login';
import Home from './pages/basic/Home';
import Dashboard from './pages//basic/Dashboard';
import Layout from './layout/Layout'; // Importamos Layout
import Register from './pages/Auth/Register';
import Report from './pages/astronomy/report';
import Station from './pages/astronomy/Station';
import Bolide from './pages/astronomy/bolide';
import Profile from './pages/basic/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const loginHandler = (token) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logoutHandler = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={loginHandler} />}
        />
        <Route path="/register" element={<Register />} /> {/* Ruta para el registro */}

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout /> // Layout como ruta padre
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          {/* <Route index element={<Home />} /> */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="report/:reportId" element={<Report />} />
          <Route path="station" element={<Station />} />
          <Route path="bolide/:bolideId" element={<Bolide />} />
          <Route path="/report/:reportId/bolide/:bolideId" element={<Bolide />} />
          <Route path="profile" element={<Profile/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;