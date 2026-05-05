import apiClient from "./apiClient.js";

export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getMe: () => apiClient.get("/auth/me"),
};
