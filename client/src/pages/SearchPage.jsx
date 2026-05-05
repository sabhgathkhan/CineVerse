import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiSearch, FiFilm, FiUsers, FiFilter } from "react-icons/fi";
import { movieAPI } from "../api/movieAPI.js";
import { userAPI } from "../api/index.js";
import { useDebounce } from "../hooks/useDebounce.js";
import MovieGrid from "../components/movie/MovieGrid.jsx";
import UserAvatar from "../components/common/UserAvatar.jsx";
import { PageSpinner, EmptyState } from "../components/common/index.jsx";
import { getPosterUrl } from "../utils/helpers.js";

const GENRE_OPTIONS = [
  { id: "", label: "All Genres" },
  { id: "28", label: "Action" },
  { id: "12", label: "Adventure" },
  { id: "16", label: "Animation" },
  { id: "35", label: "Comedy" },
  { id: "80", label: "Crime" },
  { id: "18", label: "Drama" },
  { id: "14", label: "Fantasy" },
  { id: "27", label: "Horror" },
  { id: "9648", label: "Mystery" },
  { id: "10749", label: "Romance" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // Tab: "movies" | "people"
  const [activeTab, setActiveTab] = useState("movies");
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 450);

  // Movie search state
  const [movies, setMovies] = useState([]);
  const [moviePage, setMoviePage] = useState(1);
  const [movieTotalPages, setMovieTotalPages] = useState(1);
  const [movieTotal, setMovieTotal] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);

  // User search state
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userGenreFilter, setUserGenreFilter] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // ── Movie search / genre browse ─────────────────────────────────────────
  useEffect(() => {
    setMoviePage(1);
    setMovies([]);
    fetchMovies(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedGenre]);

  const fetchMovies = async (page, reset = false) => {
    setIsLoadingMovies(true);
    try {
      let res;
      if (debouncedQuery.trim()) {
        res = await movieAPI.search(debouncedQuery.trim(), page);
      } else if (selectedGenre) {
        res = await movieAPI.getByGenre(selectedGenre, page);
      } else {
        res = await movieAPI.getPopular(page);
      }
      const data = res.data.data;
      setMovies((prev) => reset ? (data.results || []) : [...prev, ...(data.results || [])]);
      setMovieTotalPages(data.total_pages || 1);
      setMovieTotal(data.total_results || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const handleLoadMoreMovies = () => {
    const next = moviePage + 1;
    setMoviePage(next);
    fetchMovies(next, false);
  };

  // ── User search ─────────────────────────────────────────────────────────
  useEffect(() => {
    setUserPage(1);
    setUsers([]);
    fetchUsers(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, userGenreFilter]);

  const fetchUsers = async (page, reset = false) => {
    setIsLoadingUsers(true);
    try {
      const res = await userAPI.search(debouncedQuery, userGenreFilter, page);
      const data = res.data;
      setUsers((prev) => reset ? data.data : [...prev, ...data.data]);
      setUserTotalPages(data.pagination.totalPages);
      setUserTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLoadMoreUsers = () => {
    const next = userPage + 1;
    setUserPage(next);
    fetchUsers(next, false);
  };

  // Sync URL query param
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Discover</h1>
        <p className="text-gray-500 text-sm">Search movies, browse by genre, or find fellow film lovers</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={
            activeTab === "movies"
              ? "Search movies by title..."
              : "Search users by username or bio..."
          }
          className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500
                     rounded-2xl pl-11 pr-4 py-3.5 text-base focus:outline-none focus:border-brand-500
                     transition-colors"
          autoFocus
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-dark-800 rounded-xl p-1 w-fit border border-dark-600">
        <button
          onClick={() => setActiveTab("movies")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "movies"
              ? "bg-gradient-brand text-white shadow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiFilm size={14} /> Movies
          {movieTotal > 0 && activeTab === "movies" && (
            <span className="bg-white/20 text-xs rounded-full px-1.5 py-0.5">
              {movieTotal.toLocaleString()}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("people")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "people"
              ? "bg-gradient-brand text-white shadow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiUsers size={14} /> People
          {userTotal > 0 && activeTab === "people" && (
            <span className="bg-white/20 text-xs rounded-full px-1.5 py-0.5">{userTotal}</span>
          )}
        </button>
      </div>

      {/* ── MOVIES TAB ── */}
      {activeTab === "movies" && (
        <div className="space-y-5">
          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiFilter size={14} />
              <span>Filter:</span>
            </div>
            {/* Genre filter */}
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); }}
              className="bg-dark-700 border border-dark-500 text-white rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>

            {/* Active filters display */}
            {(debouncedQuery || selectedGenre) && (
              <button
                onClick={() => { setQuery(""); setSelectedGenre(""); setSearchParams({}); }}
                className="text-xs text-brand-400 hover:text-brand-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Results label */}
          {debouncedQuery && !isLoadingMovies && (
            <p className="text-sm text-gray-500">
              {movieTotal > 0
                ? `${movieTotal.toLocaleString()} results for "${debouncedQuery}"`
                : `No results for "${debouncedQuery}"`}
            </p>
          )}

          <MovieGrid
            movies={movies}
            isLoading={isLoadingMovies && moviePage === 1}
            emptyMessage={
              debouncedQuery
                ? `No movies found for "${debouncedQuery}". Try a different search.`
                : "No movies found for this genre."
            }
          />

          {/* Load more */}
          {!isLoadingMovies && moviePage < movieTotalPages && movies.length > 0 && (
            <div className="flex justify-center pt-2">
              <button onClick={handleLoadMoreMovies} className="btn-secondary px-10">
                Load More Movies
              </button>
            </div>
          )}
          {isLoadingMovies && moviePage > 1 && (
            <div className="flex justify-center pt-4">
              <PageSpinner />
            </div>
          )}
        </div>
      )}

      {/* ── PEOPLE TAB ── */}
      {activeTab === "people" && (
        <div className="space-y-5">
          {/* Genre filter for users */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiFilter size={14} />
              <span>Favorite genre:</span>
            </div>
            <select
              value={userGenreFilter}
              onChange={(e) => setUserGenreFilter(e.target.value)}
              className="bg-dark-700 border border-dark-500 text-white rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g.id} value={g.label === "All Genres" ? "" : g.label}>
                  {g.label}
                </option>
              ))}
            </select>
            {userGenreFilter && (
              <button
                onClick={() => setUserGenreFilter("")}
                className="text-xs text-brand-400 hover:text-brand-300 underline"
              >
                Clear
              </button>
            )}
          </div>

          {isLoadingUsers && userPage === 1 ? (
            <PageSpinner />
          ) : users.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="No users found"
              description={
                debouncedQuery
                  ? `Nobody matches "${debouncedQuery}". Try a broader search.`
                  : "No users to show."
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <UserCard key={u._id} user={u} />
              ))}
            </div>
          )}

          {!isLoadingUsers && userPage < userTotalPages && users.length > 0 && (
            <div className="flex justify-center pt-2">
              <button onClick={handleLoadMoreUsers} className="btn-secondary px-10">
                Load More People
              </button>
            </div>
          )}
          {isLoadingUsers && userPage > 1 && (
            <div className="flex justify-center pt-4">
              <PageSpinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inline UserCard ──────────────────────────────────────────────────────────
function UserCard({ user }) {
  return (
    <Link
      to={`/user/${user.username}`}
      className="card p-4 flex items-start gap-4 hover:border-brand-600 transition-all
                 hover:shadow-lg hover:shadow-brand-900/20 group"
    >
      <UserAvatar user={user} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white group-hover:text-brand-300 transition-colors truncate">
          @{user.username}
        </p>
        {user.bio ? (
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{user.bio}</p>
        ) : (
          <p className="text-sm text-gray-600 mt-0.5 italic">No bio yet</p>
        )}
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          <span>{user.followers?.length ?? 0} followers</span>
          <span>{user.following?.length ?? 0} following</span>
        </div>
        {user.favoriteGenres?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {user.favoriteGenres.slice(0, 3).map((g) => (
              <span key={g} className="badge bg-brand-900/50 text-brand-300 border border-brand-800 text-xs">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
