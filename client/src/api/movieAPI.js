import apiClient from "./apiClient.js";

export const movieAPI = {
  getTrending: (timeWindow = "week") =>
    apiClient.get("/movies/trending", { params: { time_window: timeWindow } }),

  getPopular: (page = 1) =>
    apiClient.get("/movies/popular", { params: { page } }),

  getTopRated: (page = 1) =>
    apiClient.get("/movies/top-rated", { params: { page } }),

  getUpcoming: (page = 1) =>
    apiClient.get("/movies/upcoming", { params: { page } }),

  getNowPlaying: (page = 1) =>
    apiClient.get("/movies/now-playing", { params: { page } }),

  getById: (id) =>
    apiClient.get(`/movies/${id}`),

  search: (query, page = 1) =>
    apiClient.get("/movies/search", { params: { q: query, page } }),

  getByGenre: (genreId, page = 1) =>
    apiClient.get(`/movies/genre/${genreId}`, { params: { page } }),

  getGenres: () =>
    apiClient.get("/movies/genres"),

  toggleLike: (movieId) =>
    apiClient.post(`/movies/${movieId}/like`),

  toggleWatchlist: (movieId, title, posterPath) =>
    apiClient.post(`/movies/${movieId}/watchlist`, { title, posterPath }),
};
