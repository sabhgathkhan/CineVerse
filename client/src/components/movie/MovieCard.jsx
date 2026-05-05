import { Link } from "react-router-dom";
import { FiHeart, FiBookmark, FiStar } from "react-icons/fi";
import { getPosterUrl } from "../../utils/helpers.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { movieAPI } from "../../api/movieAPI.js";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MovieCard({ movie }) {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [liked, setLiked] = useState(
    user?.likedMovies?.includes(movie.id) || false
  );
  const [inWatchlist, setInWatchlist] = useState(
    user?.watchlist?.some((w) => w.movieId === movie.id) || false
  );

  const posterUrl = getPosterUrl(movie.poster_path, "w342");
  const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : null;
  const year = movie.release_date?.slice(0, 4) || "";

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to like movies.");
      return;
    }
    try {
      const res = await movieAPI.toggleLike(movie.id);
      setLiked(res.data.liked);
      await refreshUser();
    } catch {
      toast.error("Failed to update like.");
    }
  };

  const handleWatchlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to use your watchlist.");
      return;
    }
    try {
      const res = await movieAPI.toggleWatchlist(movie.id, movie.title, movie.poster_path);
      setInWatchlist(res.data.inWatchlist);
      toast.success(res.data.inWatchlist ? "Added to watchlist" : "Removed from watchlist");
      await refreshUser();
    } catch {
      toast.error("Failed to update watchlist.");
    }
  };

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative block rounded-xl overflow-hidden bg-dark-800
                 border border-dark-600 hover:border-brand-600 transition-all duration-300
                 hover:shadow-lg hover:shadow-brand-900/30 hover:-translate-y-1"
    >
      {/* Poster */}
      <div className="aspect-[2/3] bg-dark-700 overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <span className="text-sm text-center px-2">{movie.title}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Action buttons (appear on hover) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              liked
                ? "bg-red-500/90 text-white"
                : "bg-dark-800/80 text-gray-300 hover:text-red-400"
            }`}
            title="Like"
          >
            <FiHeart size={14} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleWatchlist}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              inWatchlist
                ? "bg-brand-600/90 text-white"
                : "bg-dark-800/80 text-gray-300 hover:text-brand-400"
            }`}
            title="Watchlist"
          >
            <FiBookmark size={14} fill={inWatchlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-brand-300 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-500">{year}</span>
          {rating && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <FiStar size={11} fill="currentColor" />
              {rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
