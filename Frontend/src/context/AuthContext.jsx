import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import * as authService from "@/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [rol, setRol] = useState(localStorage.getItem("rol") || null);
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
    const { token: receivedToken, rol: receivedRol } = await authService.loginUser(credentials);
    setToken(receivedToken);
    setRol(receivedRol);
    localStorage.setItem("authToken", receivedToken);
    localStorage.setItem("rol", receivedRol);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    return receivedToken
  };

  const logout = () => {
    setToken(null);
    setRol(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("rol");
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = "/login";
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, rol }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
