import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import * as authService from "@/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      // Configura axios para que envíe el token en todas las peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    const { token: receivedToken, role: receivedRole } = await authService.loginUser(credentials);
    setToken(receivedToken);
    setRole(receivedRole);
    localStorage.setItem("authToken", receivedToken);
    localStorage.setItem("role", receivedRole);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    return token
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = "/login";
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};