import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-dark-700 py-6 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} <span className="text-brand-400 font-semibold">CineVerse</span>{" "}
          — Built with ❤️ for film lovers
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Movie data provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:underline"
          >
            TMDB
          </a>
        </p>
      </footer>
    </div>
  );
}
