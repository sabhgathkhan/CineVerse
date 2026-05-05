import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiUsers, FiFilm, FiBookmark, FiStar, FiUserPlus, FiUserCheck,
  FiHeart, FiMapPin
} from "react-icons/fi";
import { userAPI, reviewAPI } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import UserAvatar from "../components/common/UserAvatar.jsx";
import ReviewCard from "../components/movie/ReviewCard.jsx";
import { PageSpinner, ErrorMessage, EmptyState } from "../components/common/index.jsx";
import { getPosterUrl } from "../utils/helpers.js";
import toast from "react-hot-toast";

const STAT_TABS = ["reviews", "watchlist", "followers", "following"];

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPagination, setReviewPagination] = useState({});
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [activeTab, setActiveTab] = useState("reviews");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  // Load profile
  useEffect(() => {
    const load = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);
      try {
        const res = await userAPI.getProfile(username);
        const data = res.data.data;
        setProfile(data);
        // Check if current user follows this profile
        if (currentUser) {
          setIsFollowing(
            data.followers?.some((f) => f._id === currentUser._id || f === currentUser._id)
          );
        }
      } catch (err) {
        setProfileError(err.response?.data?.message || "User not found.");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    load();
  }, [username, currentUser]);

  // Load reviews
  useEffect(() => {
    if (!profile) return;
    const loadReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const res = await reviewAPI.getByUser(profile._id, reviewPage);
        if (reviewPage === 1) {
          setReviews(res.data.data);
        } else {
          setReviews((prev) => [...prev, ...res.data.data]);
        }
        setReviewPagination(res.data.pagination);
      } catch { /* non-critical */ }
      finally { setIsLoadingReviews(false); }
    };
    loadReviews();
  }, [profile, reviewPage]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error("Sign in to follow users."); return; }
    setFollowLoading(true);
    try {
      const res = await userAPI.toggleFollow(profile._id);
      setIsFollowing(res.data.following);
      // Update local follower count
      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          followerCount: res.data.following
            ? prev.stats.followerCount + 1
            : prev.stats.followerCount - 1,
        },
      }));
      toast.success(res.data.message);
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update follow.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoadingProfile) return <PageSpinner />;
  if (profileError) return <ErrorMessage message={profileError} />;
  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card overflow-visible">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-brand-900 via-purple-900/50 to-dark-700 rounded-t-2xl" />

        <div className="px-6 pb-6">
          {/* Avatar + actions row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="ring-4 ring-dark-800 rounded-full">
              <UserAvatar user={profile} size="xl" />
            </div>

            <div className="flex gap-2 mt-4">
              {isOwnProfile ? (
                <Link to="/settings" className="btn-secondary text-sm flex items-center gap-1.5">
                  Edit Profile
                </Link>
              ) : (
                isAuthenticated && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all ${
                      isFollowing
                        ? "btn-secondary border-brand-600 text-brand-400"
                        : "btn-primary"
                    }`}
                  >
                    {isFollowing ? <FiUserCheck size={15} /> : <FiUserPlus size={15} />}
                    {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Name + bio */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-white">@{profile.username}</h1>
              {profile.bio && (
                <p className="text-gray-400 mt-1 text-sm leading-relaxed max-w-lg">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Favorite genres */}
            {profile.favoriteGenres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.favoriteGenres.map((g) => (
                  <span key={g} className="badge bg-brand-900/50 text-brand-300 border border-brand-800 text-xs">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-5 border-t border-dark-600">
            <StatItem
              icon={<FiFilm size={16} />}
              label="Reviews"
              value={profile.stats?.reviewCount ?? 0}
              onClick={() => setActiveTab("reviews")}
            />
            <StatItem
              icon={<FiStar size={16} />}
              label="Avg. Rating"
              value={profile.stats?.averageRating ? `${profile.stats.averageRating}★` : "—"}
            />
            <StatItem
              icon={<FiBookmark size={16} />}
              label="Watchlist"
              value={profile.stats?.watchlistCount ?? 0}
              onClick={() => setActiveTab("watchlist")}
            />
            <StatItem
              icon={<FiUsers size={16} />}
              label="Followers"
              value={profile.stats?.followerCount ?? 0}
              onClick={() => setActiveTab("followers")}
            />
            <StatItem
              icon={<FiHeart size={16} />}
              label="Following"
              value={profile.stats?.followingCount ?? 0}
              onClick={() => setActiveTab("following")}
            />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-dark-800 rounded-xl p-1 border border-dark-600 w-fit">
        {STAT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-gradient-brand text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {isLoadingReviews && reviewPage === 1 ? (
            <PageSpinner />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={FiFilm}
              title="No reviews yet"
              description={
                isOwnProfile
                  ? "You haven't reviewed any movies yet. Find a movie and share your thoughts!"
                  : `${profile.username} hasn't written any reviews yet.`
              }
              action={
                isOwnProfile && (
                  <Link to="/" className="btn-primary text-sm">
                    Browse Movies
                  </Link>
                )
              }
            />
          ) : (
            <>
              {reviews.map((review) => (
                <div key={review._id} className="space-y-1">
                  {/* Movie link above review */}
                  <Link
                    to={`/movie/${review.movieId}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-400 transition-colors ml-1"
                  >
                    <FiFilm size={12} />
                    <span>{review.movieTitle}</span>
                    {review.moviePosterPath && (
                      <img
                        src={getPosterUrl(review.moviePosterPath, "w92")}
                        alt=""
                        className="w-6 h-9 object-cover rounded"
                      />
                    )}
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
              {reviewPage < (reviewPagination.totalPages || 1) && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    disabled={isLoadingReviews}
                    className="btn-secondary"
                  >
                    {isLoadingReviews ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Watchlist tab */}
      {activeTab === "watchlist" && (
        <WatchlistTab userId={profile._id} username={profile.username} isOwnProfile={isOwnProfile} />
      )}

      {/* Followers tab */}
      {activeTab === "followers" && (
        <UserListTab users={profile.followers} emptyMsg={`${profile.username} has no followers yet.`} />
      )}

      {/* Following tab */}
      {activeTab === "following" && (
        <UserListTab users={profile.following} emptyMsg={`${profile.username} isn't following anyone yet.`} />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatItem({ icon, label, value, onClick }) {
  const content = (
    <div className={`flex flex-col items-center text-center gap-1 ${onClick ? "cursor-pointer" : ""}`}>
      <div className="text-brand-400">{icon}</div>
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
  return onClick ? <button onClick={onClick} className="hover:opacity-80 transition-opacity">{content}</button> : content;
}

function WatchlistTab({ userId, username, isOwnProfile }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getWatchlist(userId)
      .then((res) => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <PageSpinner />;
  if (items.length === 0)
    return (
      <EmptyState
        icon={FiBookmark}
        title="Empty watchlist"
        description={
          isOwnProfile
            ? "Movies you save will appear here."
            : `${username} hasn't saved any movies yet.`
        }
        action={isOwnProfile && <Link to="/" className="btn-primary text-sm">Browse Movies</Link>}
      />
    );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <Link
          key={item.movieId}
          to={`/movie/${item.movieId}`}
          className="group rounded-xl overflow-hidden bg-dark-800 border border-dark-600
                     hover:border-brand-600 transition-all hover:-translate-y-1"
        >
          <div className="aspect-[2/3] bg-dark-700">
            {item.posterPath ? (
              <img
                src={getPosterUrl(item.posterPath, "w185")}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                {item.title}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function UserListTab({ users = [], emptyMsg }) {
  if (users.length === 0)
    return <EmptyState icon={FiUsers} title="Nobody here yet" description={emptyMsg} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {users.map((u) => {
        const userObj = typeof u === "object" && u.username ? u : { _id: u };
        return (
          <Link
            key={userObj._id}
            to={`/user/${userObj.username}`}
            className="card p-4 flex items-center gap-3 hover:border-brand-600 transition-all group"
          >
            <UserAvatar user={userObj} size="md" />
            <div>
              <p className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                @{userObj.username || "unknown"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
