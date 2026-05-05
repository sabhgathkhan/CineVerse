import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiHeart, FiBookmark, FiStar, FiClock, FiCalendar,
  FiDollarSign, FiPlay, FiArrowLeft
} from "react-icons/fi";
import { movieAPI } from "../api/movieAPI.js";
import { reviewAPI } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getPosterUrl, getBackdropUrl, formatDate, formatRuntime, formatCurrency } from "../utils/helpers.js";
import ReviewCard from "../components/movie/ReviewCard.jsx";
import ReviewForm from "../components/movie/ReviewForm.jsx";
import { PageSpinner, ErrorMessage } from "../components/common/index.jsx";
import toast from "react-hot-toast";

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState({});
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [movieError, setMovieError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  // Fetch movie details
  useEffect(() => {
    const load = async () => {
      setIsLoadingMovie(true);
      setMovieError(null);
      try {
        const res = await movieAPI.getById(id);
        const data = res.data.data;
        setMovie(data);
        // Sync like/watchlist state from user
        if (user) {
          setLiked(user.likedMovies?.includes(data.id) || false);
          setInWatchlist(user.watchlist?.some((w) => w.movieId === data.id) || false);
        }
      } catch (err) {
        setMovieError(err.response?.data?.message || "Failed to load movie.");
      } finally {
        setIsLoadingMovie(false);
      }
    };
    load();
  }, [id, user]);

  // Fetch reviews
  useEffect(() => {
    const loadReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const res = await reviewAPI.getByMovie(id, reviewPage);
        if (reviewPage === 1) {
          setReviews(res.data.data);
        } else {
          setReviews((prev) => [...prev, ...res.data.data]);
        }
        setReviewPagination(res.data.pagination);
      } catch {
        // Non-critical
      } finally {
        setIsLoadingReviews(false);
      }
    };
    loadReviews();
  }, [id, reviewPage]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error("Sign in to like movies."); return; }
    try {
      const res = await movieAPI.toggleLike(movie.id);
      setLiked(res.data.liked);
      await refreshUser();
      toast.success(res.data.liked ? "Added to liked movies ❤️" : "Removed from liked movies");
    } catch { toast.error("Failed to update."); }
  };

  const handleWatchlist = async () => {
    if (!isAuthenticated) { toast.error("Sign in to use your watchlist."); return; }
    try {
      const res = await movieAPI.toggleWatchlist(movie.id, movie.title, movie.poster_path);
      setInWatchlist(res.data.inWatchlist);
      await refreshUser();
      toast.success(res.data.inWatchlist ? "Added to watchlist 🔖" : "Removed from watchlist");
    } catch { toast.error("Failed to update."); }
  };

  const handleNewReview = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleReviewDelete = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  const handleReviewUpdate = (updatedReview) => {
    setReviews((prev) =>
      prev.map((r) => (r._id === updatedReview._id ? updatedReview : r))
    );
  };

  if (isLoadingMovie) return <PageSpinner />;
  if (movieError) return <ErrorMessage message={movieError} />;
  if (!movie) return null;

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path, "w500");
  const trailerKey = movie.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  )?.key;
  const tmdbRating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : null;
  const userHasReviewed = reviews.some((r) => r.author?._id === user?._id);

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
        <FiArrowLeft size={16} /> Back
      </Link>

      {/* Hero backdrop */}
      <div className="relative rounded-3xl overflow-hidden min-h-[320px] md:min-h-[420px] bg-dark-800">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row gap-8 p-6 md:p-10 items-end md:items-start">
          {/* Poster */}
          <div className="hidden md:block shrink-0 w-48 rounded-2xl overflow-hidden shadow-2xl border border-dark-600">
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} className="w-full" />
            ) : (
              <div className="w-full aspect-[2/3] bg-dark-700 flex items-center justify-center text-gray-600 text-sm p-4 text-center">
                {movie.title}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-brand-400 italic text-lg">"{movie.tagline}"</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {tmdbRating && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <FiStar size={14} fill="currentColor" />
                  <span className="font-semibold">{tmdbRating}</span>
                  <span className="text-gray-500">/ 5</span>
                </span>
              )}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <FiClock size={14} /> {formatRuntime(movie.runtime)}
                </span>
              )}
              {movie.release_date && (
                <span className="flex items-center gap-1">
                  <FiCalendar size={14} /> {formatDate(movie.release_date)}
                </span>
              )}
              {movie.budget > 0 && (
                <span className="flex items-center gap-1">
                  <FiDollarSign size={14} /> {formatCurrency(movie.budget)}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="badge bg-dark-600 border border-dark-500 text-gray-300"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <p className="text-gray-300 leading-relaxed max-w-2xl">{movie.overview}</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiPlay size={15} /> Watch Trailer
                </button>
              )}
              <button
                onClick={handleLike}
                className={`btn-secondary flex items-center gap-2 ${
                  liked ? "border-red-500 text-red-400" : ""
                }`}
              >
                <FiHeart size={15} fill={liked ? "currentColor" : "none"} />
                {liked ? "Liked" : "Like"}
              </button>
              <button
                onClick={handleWatchlist}
                className={`btn-secondary flex items-center gap-2 ${
                  inWatchlist ? "border-brand-500 text-brand-400" : ""
                }`}
              >
                <FiBookmark size={15} fill={inWatchlist ? "currentColor" : "none"} />
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer modal */}
      {showTrailer && trailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cast */}
      {movie.credits?.cast?.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Top Cast</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {movie.credits.cast.slice(0, 12).map((member) => (
              <div key={member.id} className="shrink-0 w-24 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-700 mx-auto mb-2 border-2 border-dark-600">
                  {member.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      {member.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-white leading-snug">{member.name}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{member.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar movies */}
      {movie.similar?.results?.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Similar Movies</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {movie.similar.results.slice(0, 8).map((m) => (
              <Link
                key={m.id}
                to={`/movie/${m.id}`}
                className="shrink-0 w-32 group"
              >
                <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden bg-dark-700 border border-dark-600 group-hover:border-brand-600 transition-colors">
                  {m.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${m.poster_path}`}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 p-2 text-center">
                      {m.title}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 group-hover:text-white transition-colors">
                  {m.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Community Reviews
            {reviewPagination.total > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({reviewPagination.total})
              </span>
            )}
          </h2>
        </div>

        {/* Write review (auth only, and not already reviewed) */}
        {isAuthenticated && !userHasReviewed && (
          <ReviewForm movie={movie} onSuccess={handleNewReview} />
        )}
        {isAuthenticated && userHasReviewed && (
          <p className="text-sm text-gray-500 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3">
            ✅ You've already reviewed this movie. Scroll down to edit or delete it.
          </p>
        )}
        {!isAuthenticated && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-4 text-sm text-gray-400">
            <Link to="/login" className="text-brand-400 hover:underline font-medium">Sign in</Link>
            {" "}to write a review.
          </div>
        )}

        {/* Review list */}
        {isLoadingReviews && reviewPage === 1 ? (
          <PageSpinner />
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No reviews yet. Be the first to review this film!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onDelete={handleReviewDelete}
                onUpdate={handleReviewUpdate}
              />
            ))}

            {reviewPage < (reviewPagination.totalPages || 1) && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setReviewPage((p) => p + 1)}
                  disabled={isLoadingReviews}
                  className="btn-secondary"
                >
                  {isLoadingReviews ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
