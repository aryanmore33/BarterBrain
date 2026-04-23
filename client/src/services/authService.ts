import apiClient from "./apiClient";

const authService = {
  async login(credentials: any) {
    const response: any = await apiClient.post("/open/api/auth/login", credentials);
    return response;
  },

  async register(data: any) {
    const response: any = await apiClient.post("/open/api/auth/register", data);
    return response;
  },

  async logout() {
    const response: any = await apiClient.post("/open/api/auth/logout");
    return response;
  },

  async getMe() {
    const response: any = await apiClient.get("/api/me");
    return response;
  }
};

export default authService;
