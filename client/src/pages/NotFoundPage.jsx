import { Link } from "react-router-dom";
import { FiFilm, FiHome } from "react-icons/fi";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        {/* Big 404 */}
        <div className="relative">
          <p className="text-[10rem] font-black text-dark-700 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-900/50">
              <FiFilm className="text-white" size={36} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-gray-500 max-w-sm mx-auto">
            Looks like this scene was cut from the script. The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <FiHome size={16} /> Back to Home
          </Link>
          <Link to="/search" className="btn-secondary flex items-center gap-2">
            <FiFilm size={16} /> Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
