import apiClient from "./apiClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const authService = {

  async login(credentials: LoginCredentials) {
    return apiClient.post("/open/api/auth/login", credentials);
  },

  async register(data: RegisterData) {
    return apiClient.post("/open/api/auth/register", data);
  },

  async logout() {
    return apiClient.post("/open/api/auth/logout");
  },

  async getMe() {
    return apiClient.get("/api/me");
  }

};

export default authService;