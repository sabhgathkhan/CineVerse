import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiSearch, FiHome, FiBookmark, FiUsers, FiBell,
  FiLogOut, FiSettings, FiMenu, FiX, FiFilm
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import UserAvatar from "../common/UserAvatar.jsx";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "text-white bg-dark-600"
        : "text-gray-400 hover:text-white hover:bg-dark-700"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <FiFilm className="text-white" size={16} />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Cine<span className="text-brand-400">Verse</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, people..."
                className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500
                           rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500
                           transition-colors"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <FiHome size={16} /> Home
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              <FiUsers size={16} /> Discover
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/feed" className={navLinkClass}>
                  <FiFilm size={16} /> Feed
                </NavLink>
                <NavLink to="/watchlist" className={navLinkClass}>
                  <FiBookmark size={16} /> Watchlist
                </NavLink>
                <NavLink to="/notifications" className={navLinkClass}>
                  <FiBell size={16} /> Alerts
                </NavLink>
                <NavLink to={`/user/${user?.username}`} className={navLinkClass}>
                  <UserAvatar user={user} size="sm" />
                  <span className="max-w-[80px] truncate">{user?.username}</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClass}>
                  <FiSettings size={16} />
                </NavLink>
                <button onClick={logout} className="btn-ghost text-gray-400 hover:text-red-400">
                  <FiLogOut size={16} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Join Free
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, people..."
              className="input-field py-2 text-sm flex-1"
            />
            <button type="submit" className="btn-primary py-2 px-3">
              <FiSearch size={16} />
            </button>
          </form>

          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <FiHome size={16} /> Home
            </NavLink>
            <NavLink to="/search" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <FiUsers size={16} /> Discover
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/feed" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  <FiFilm size={16} /> Feed
                </NavLink>
                <NavLink to="/watchlist" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  <FiBookmark size={16} /> Watchlist
                </NavLink>
                <NavLink to="/notifications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  <FiBell size={16} /> Notifications
                </NavLink>
                <NavLink to={`/user/${user?.username}`} className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Profile
                </NavLink>
                <NavLink to="/settings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  <FiSettings size={16} /> Settings
                </NavLink>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 text-sm"
                >
                  <FiLogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>
                  Join Free
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
