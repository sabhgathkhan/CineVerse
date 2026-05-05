import apiClient from "./apiClient.js";

export const reviewAPI = {
  getByMovie: (movieId, page = 1) =>
    apiClient.get(`/reviews/movie/${movieId}`, { params: { page } }),

  getByUser: (userId, page = 1) =>
    apiClient.get(`/reviews/user/${userId}`, { params: { page } }),

  getFeed: (page = 1) =>
    apiClient.get("/reviews/feed", { params: { page } }),

  create: (data) =>
    apiClient.post("/reviews", data),

  update: (reviewId, data) =>
    apiClient.put(`/reviews/${reviewId}`, data),

  delete: (reviewId) =>
    apiClient.delete(`/reviews/${reviewId}`),

  toggleLike: (reviewId) =>
    apiClient.post(`/reviews/${reviewId}/like`),

  addComment: (reviewId, content) =>
    apiClient.post(`/reviews/${reviewId}/comments`, { content }),

  editComment: (reviewId, commentId, content) =>
    apiClient.put(`/reviews/${reviewId}/comments/${commentId}`, { content }),

  deleteComment: (reviewId, commentId) =>
    apiClient.delete(`/reviews/${reviewId}/comments/${commentId}`),
};

export const userAPI = {
  search: (query, genre, page = 1) =>
    apiClient.get("/users/search", { params: { q: query, genre, page } }),

  getProfile: (username) =>
    apiClient.get(`/users/${username}`),

  updateProfile: (data) =>
    apiClient.put("/users/profile", data),

  toggleFollow: (userId) =>
    apiClient.post(`/users/${userId}/follow`),

  getNotifications: () =>
    apiClient.get("/users/me/notifications"),

  markNotificationsRead: () =>
    apiClient.put("/users/me/notifications/read"),

  getWatchlist: (userId) =>
    apiClient.get(`/users/${userId}/watchlist`),
};
