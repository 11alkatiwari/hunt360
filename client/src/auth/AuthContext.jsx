import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Load stored user on first render
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // ✅ Save auth data
  const saveAuthData = (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setUser(user);
    setIsAuthenticated(true);
  };

  // ✅ Login API callsghs
  const login = async (credentials) => {
    try {
    const res = await api.post("/auth/login", credentials); 

      if (res.data.success) {
        saveAuthData(res.data.user, res.data.token);
        return { success: true };
      }
      return { success: false, error: res.data.error || "Login failed" };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        error:
          err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  // ✅ Signup API call
  const signup = async (newUser) => {
    try {
    const res = await api.post("/auth/signup", newUser); // ✅ FIXED
      
      if (res.data.success) {
        saveAuthData(res.data.user, res.data.token);
        return { success: true };
      }
      return { success: false, error: res.data.error || "Signup failed" };
    } catch (err) {
      console.error("Signup error:", err);
      return {
        success: false,
        error:
          err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  // ✅ Logout API call
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API failed:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
