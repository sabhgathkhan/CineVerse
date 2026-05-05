import fetch from "node-fetch";

const TMDB_BASE = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

/**
 * Generic TMDB fetch wrapper with error handling.
 */
const tmdbFetch = async (endpoint, params = {}) => {
  const TMDB_KEY = process.env.TMDB_API_KEY; // ✅ moved inside

  console.log("TMDB KEY:", TMDB_KEY); // debug

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", TMDB_KEY);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, v);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.status_message || "TMDB API error");
  }
  return response.json();
};

export const getTrendingMovies = (timeWindow = "week") =>
  tmdbFetch(`/trending/movie/${timeWindow}`);

export const getPopularMovies = (page = 1) =>
  tmdbFetch("/movie/popular", { page });

export const getTopRatedMovies = (page = 1) =>
  tmdbFetch("/movie/top_rated", { page });

export const getUpcomingMovies = (page = 1) =>
  tmdbFetch("/movie/upcoming", { page });

export const getNowPlayingMovies = (page = 1) =>
  tmdbFetch("/movie/now_playing", { page });

export const getMovieDetails = (movieId) =>
  tmdbFetch(`/movie/${movieId}`, { append_to_response: "credits,videos,similar" });

export const searchMovies = (query, page = 1) =>
  tmdbFetch("/search/movie", { query, page, include_adult: false });

export const getMoviesByGenre = (genreId, page = 1) =>
  tmdbFetch("/discover/movie", { with_genres: genreId, page, sort_by: "popularity.desc" });

export const getGenreList = () =>
  tmdbFetch("/genre/movie/list");
