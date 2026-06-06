import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
});

// Add request interceptor to include JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("localJWT");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;