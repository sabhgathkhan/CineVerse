import asyncHandler from "express-async-handler";
import * as tmdb from "../utils/tmdbService.js";

/**
 * @route  GET /api/movies/trending
 * @access Public
 */
export const getTrending = asyncHandler(async (req, res) => {
  const { time_window = "week" } = req.query;
  const data = await tmdb.getTrendingMovies(time_window);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/popular
 * @access Public
 */
export const getPopular = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const data = await tmdb.getPopularMovies(page);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/top-rated
 * @access Public
 */
export const getTopRated = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const data = await tmdb.getTopRatedMovies(page);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/upcoming
 * @access Public
 */
export const getUpcoming = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const data = await tmdb.getUpcomingMovies(page);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/now-playing
 * @access Public
 */
export const getNowPlaying = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const data = await tmdb.getNowPlayingMovies(page);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/:id
 * @access Public
 */
export const getMovieById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    res.status(400);
    throw new Error("Invalid movie ID.");
  }
  const data = await tmdb.getMovieDetails(id);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/search
 * @access Public
 */
export const searchMovies = asyncHandler(async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q || q.trim() === "") {
    res.status(400);
    throw new Error("Search query is required.");
  }
  const data = await tmdb.searchMovies(q.trim(), page);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/genre/:genreId
 * @access Public
 */
export const getByGenre = asyncHandler(async (req, res) => {
  const { genreId } = req.params;
  const { page = 1 } = req.query;
  const data = await tmdb.getMoviesByGenre(genreId, page);
  res.json({ success: true, data });
});

/**
 * @route  GET /api/movies/genres
 * @access Public
 */
export const getGenres = asyncHandler(async (req, res) => {
  const data = await tmdb.getGenreList();
  res.json({ success: true, data });
});

/**
 * @route  POST /api/movies/:id/like
 * @desc   Toggle like on a movie for the authenticated user
 * @access Private
 */
export const toggleMovieLike = asyncHandler(async (req, res) => {
  const movieId = parseInt(req.params.id);
  const user = req.user;

  const alreadyLiked = user.likedMovies.includes(movieId);

  if (alreadyLiked) {
    user.likedMovies = user.likedMovies.filter((id) => id !== movieId);
  } else {
    user.likedMovies.push(movieId);
  }

  await user.save();

  res.json({
    success: true,
    liked: !alreadyLiked,
    likedMovies: user.likedMovies,
  });
});

/**
 * @route  POST /api/movies/:id/watchlist
 * @desc   Toggle watchlist entry for authenticated user
 * @access Private
 */
export const toggleWatchlist = asyncHandler(async (req, res) => {
  const movieId = parseInt(req.params.id);
  const { title, posterPath } = req.body;
  const user = req.user;

  const existingEntry = user.watchlist.find((item) => item.movieId === movieId);

  if (existingEntry) {
    user.watchlist = user.watchlist.filter((item) => item.movieId !== movieId);
  } else {
    user.watchlist.push({ movieId, title, posterPath });
  }

  await user.save();

  res.json({
    success: true,
    inWatchlist: !existingEntry,
    watchlist: user.watchlist,
  });
});
