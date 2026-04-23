import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  withCredentials: true, // 🍪 Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
