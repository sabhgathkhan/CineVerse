import MovieCard from "./MovieCard.jsx";
import { PageSpinner, EmptyState } from "../common/index.jsx";
import { FiFilm } from "react-icons/fi";

export default function MovieGrid({ movies, isLoading, title, emptyMessage }) {
  if (isLoading) return <PageSpinner />;

  if (!movies || movies.length === 0) {
    return (
      <EmptyState
        icon={FiFilm}
        title="No movies found"
        description={emptyMessage || "Try a different search or filter."}
      />
    );
  }

  return (
    <section>
      {title && (
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
