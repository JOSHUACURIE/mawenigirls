// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // ✅ Use centralized API service

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("❌ Failed to parse user from localStorage");
        logout();
      }
    }
    setLoading(false);
  }, []);

  // ✅ Login function
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const userData = res.data; // Already includes _id, name, role, etc.
      const { token } = res.data;

      setUser(userData);
      setToken(token);
      setIsAuthenticated(true);

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      return { success: true };
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";

      return { success: false, message };
    }
  };

  // 🧹 Logout function
  const logout = () => {
    setUser(null);
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // 🔁 Auth state
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);