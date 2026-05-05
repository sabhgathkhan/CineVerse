import { Router } from "express";
import {
  getTrending,
  getPopular,
  getTopRated,
  getUpcoming,
  getNowPlaying,
  getMovieById,
  searchMovies,
  getByGenre,
  getGenres,
  toggleMovieLike,
  toggleWatchlist,
} from "../controllers/movieController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/trending", getTrending);
router.get("/popular", getPopular);
router.get("/top-rated", getTopRated);
router.get("/upcoming", getUpcoming);
router.get("/now-playing", getNowPlaying);
router.get("/search", searchMovies);
router.get("/genres", getGenres);
router.get("/genre/:genreId", getByGenre);
router.get("/:id", getMovieById);

// Protected routes (require auth)
router.post("/:id/like", protect, toggleMovieLike);
router.post("/:id/watchlist", protect, toggleWatchlist);

export default router;
