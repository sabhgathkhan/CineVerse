import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/authAPI.js";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const TOKEN_KEY = "cv_token";
const USER_KEY = "cv_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  // Persist auth state in localStorage
  const persistAuth = (userData, tokenValue) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, tokenValue);
    setUser(userData);
    setToken(tokenValue);
  };

  const clearAuth = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: newToken, ...userData } = res.data.data;
      persistAuth(userData, newToken);
      toast.success(`Welcome back, ${userData.username}! 🎬`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register({ username, email, password });
      const { token: newToken, ...userData } = res.data.data;
      persistAuth(userData, newToken);
      toast.success(`Welcome to CineVerse, ${userData.username}! 🎉`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    toast.success("Logged out successfully.");
  };

  // Update local user state (after profile edits)
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authAPI.getMe();
      const updatedUser = res.data.data;
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      // Token expired or invalid
      clearAuth();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
