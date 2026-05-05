import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiTrendingUp, FiStar, FiCalendar, FiPlay } from "react-icons/fi";
import { movieAPI } from "../api/movieAPI.js";
import MovieGrid from "../components/movie/MovieGrid.jsx";
import { PageSpinner } from "../components/common/index.jsx";

const TABS = [
  { id: "trending", label: "Trending", icon: FiTrendingUp },
  { id: "popular", label: "Popular", icon: FiPlay },
  { id: "top_rated", label: "Top Rated", icon: FiStar },
  { id: "upcoming", label: "Upcoming", icon: FiCalendar },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("trending");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMovies(activeTab, 1);
    setPage(1);
  }, [activeTab]);

  const fetchMovies = async (tab, p) => {
    setIsLoading(true);
    try {
      let res;
      switch (tab) {
        case "trending": res = await movieAPI.getTrending(); break;
        case "popular": res = await movieAPI.getPopular(p); break;
        case "top_rated": res = await movieAPI.getTopRated(p); break;
        case "upcoming": res = await movieAPI.getUpcoming(p); break;
        default: res = await movieAPI.getTrending();
      }
      const data = res.data.data;
      if (p === 1) {
        setMovies(data.results || []);
      } else {
        setMovies((prev) => [...prev, ...(data.results || [])]);
      }
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMovies(activeTab, next);
  };

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900/80 via-dark-800 to-dark-800 border border-dark-600 p-8 md:p-12">
        <div className="max-w-lg relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Discover & Review<br />
            <span className="text-brand-400">Films You Love</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Join a community of film lovers. Rate movies, write reviews, and
            follow critics whose taste matches yours.
          </p>
          <div className="flex gap-3">
            <Link to="/search" className="btn-primary">
              Explore Movies
            </Link>
            <Link to="/register" className="btn-secondary">
              Join Free
            </Link>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-brand-700/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-40 h-40 rounded-full bg-purple-700/15 blur-2xl pointer-events-none" />
      </section>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-dark-800 rounded-xl p-1 w-fit border border-dark-600">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-gradient-brand text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Movies grid */}
      <MovieGrid movies={movies} isLoading={isLoading && page === 1} />

      {/* Load more */}
      {!isLoading && page < totalPages && movies.length > 0 && (
        <div className="flex justify-center pt-4">
          <button onClick={handleLoadMore} className="btn-secondary px-8">
            Load More
          </button>
        </div>
      )}

      {isLoading && page > 1 && (
        <div className="flex justify-center pt-4">
          <PageSpinner />
        </div>
      )}
    </div>
  );
}
