import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "https://hunt360new-3371.onrender.com";

const api = axios.create({
  baseURL, // No hardcoded /auth here, keep it generic
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10-second timeout
});

// Request Interceptorjbbubu
api.interceptors.request.use(
  (config) => {
    console.log(`🔗 Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error);

    if (error.code === "ECONNREFUSED") {
      error.message = "Unable to connect to the server. Please try again later.";
    } else if (error.code === "ETIMEDOUT") {
      error.message = "Request timed out. Check your connection.";
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login"; // Optional: Replace with React Router navigate
          break;
        case 404:
          error.message = "Requested resource not found.";
          break;
        default:
          if (error.response.status >= 500) {
            error.message = "Server error. Please try again later.";
          }
          break;
      }
    } else if (error.request) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
