import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiFilm, FiUsers } from "react-icons/fi";
import { reviewAPI } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import ReviewCard from "../components/movie/ReviewCard.jsx";
import { PageSpinner, EmptyState } from "../components/common/index.jsx";
import { getPosterUrl } from "../utils/helpers.js";

export default function FeedPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const isFollowingAnyone = user?.following?.length > 0;

  useEffect(() => {
    if (!isFollowingAnyone) {
      setIsLoading(false);
      return;
    }
    fetchFeed(1);
  }, [isFollowingAnyone]);

  const fetchFeed = async (p) => {
    setIsLoading(true);
    try {
      const res = await reviewAPI.getFeed(p);
      if (p === 1) {
        setReviews(res.data.data);
      } else {
        setReviews((prev) => [...prev, ...res.data.data]);
      }
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next);
  };

  if (isLoading && page === 1) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Feed</h1>
        <p className="text-gray-500 text-sm mt-1">
          Reviews from people you follow
        </p>
      </div>

      {!isFollowingAnyone ? (
        <EmptyState
          icon={FiUsers}
          title="Follow people to see their reviews"
          description="When you follow other film lovers, their reviews will appear here."
          action={
            <Link to="/search?tab=people" className="btn-primary text-sm">
              Find People to Follow
            </Link>
          }
        />
      ) : reviews.length === 0 && !isLoading ? (
        <EmptyState
          icon={FiFilm}
          title="Feed is quiet"
          description="The people you follow haven't posted reviews yet. Check back soon!"
          action={
            <Link to="/" className="btn-secondary text-sm">
              Browse Movies
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="space-y-1">
              {/* Movie reference */}
              <Link
                to={`/movie/${review.movieId}`}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-400 transition-colors ml-1"
              >
                {review.moviePosterPath && (
                  <img
                    src={getPosterUrl(review.moviePosterPath, "w92")}
                    alt={review.movieTitle}
                    className="w-6 h-9 object-cover rounded border border-dark-600"
                  />
                )}
                <FiFilm size={12} />
                <span className="font-medium">{review.movieTitle}</span>
              </Link>
              <ReviewCard
                review={review}
                onDelete={(id) => setReviews((prev) => prev.filter((r) => r._id !== id))}
                onUpdate={(updated) =>
                  setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))
                }
              />
            </div>
          ))}

          {page < (pagination.totalPages || 1) && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="btn-secondary px-10"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
