import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiTrash2 } from "react-icons/fi";
import { movieAPI } from "../api/movieAPI.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getPosterUrl, formatDate } from "../utils/helpers.js";
import { PageSpinner, EmptyState } from "../components/common/index.jsx";
import toast from "react-hot-toast";

export default function WatchlistPage() {
  const { user, refreshUser } = useAuth();
  const [watchlist, setWatchlist] = useState(user?.watchlist || []);
  const [removingId, setRemovingId] = useState(null);

  // Sort newest first
  const sortedWatchlist = [...watchlist].sort(
    (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
  );

  const handleRemove = async (movieId, e) => {
    e.preventDefault(); // prevent Link navigation
    setRemovingId(movieId);
    try {
      await movieAPI.toggleWatchlist(movieId, "", "");
      setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
      await refreshUser();
      toast.success("Removed from watchlist");
    } catch {
      toast.error("Failed to remove from watchlist.");
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiBookmark className="text-brand-400" size={22} />
            My Watchlist
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} saved
          </p>
        </div>
      </div>

      {sortedWatchlist.length === 0 ? (
        <EmptyState
          icon={FiBookmark}
          title="Your watchlist is empty"
          description="Save movies you want to watch later. Click the bookmark icon on any movie card."
          action={
            <Link to="/" className="btn-primary text-sm">
              Browse Movies
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedWatchlist.map((item) => (
            <Link
              key={item.movieId}
              to={`/movie/${item.movieId}`}
              className="group relative block rounded-xl overflow-hidden bg-dark-800
                         border border-dark-600 hover:border-brand-600 transition-all duration-300
                         hover:shadow-lg hover:shadow-brand-900/30 hover:-translate-y-1"
            >
              {/* Poster */}
              <div className="aspect-[2/3] bg-dark-700 overflow-hidden">
                {item.posterPath ? (
                  <img
                    src={getPosterUrl(item.posterPath, "w342")}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                    {item.title}
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(item.movieId, e)}
                  disabled={removingId === item.movieId}
                  className="absolute top-2 right-2 p-1.5 bg-dark-900/80 rounded-full
                             text-gray-400 hover:text-red-400 hover:bg-dark-800
                             opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Remove from watchlist"
                >
                  {removingId === item.movieId ? (
                    <span className="w-3 h-3 border border-gray-500 border-t-white rounded-full animate-spin block" />
                  ) : (
                    <FiTrash2 size={13} />
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="text-xs font-medium text-white line-clamp-2 leading-snug group-hover:text-brand-300 transition-colors">
                  {item.title}
                </h3>
                {item.addedAt && (
                  <p className="text-xs text-gray-600 mt-1">
                    Saved {formatDate(item.addedAt)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
