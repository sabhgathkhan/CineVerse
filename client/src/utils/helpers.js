// ─── TMDB Image URL Builder ────────────────────────────────────────────────

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const getPosterUrl = (path, size = "w342") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

export const getBackdropUrl = (path, size = "w1280") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

// ─── Date / Time Formatting ────────────────────────────────────────────────

export const formatDate = (dateStr) => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date; // milliseconds

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// ─── Number Formatting ─────────────────────────────────────────────────────

export const formatCurrency = (amount) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

export const formatRuntime = (minutes) => {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Avatar Fallback ───────────────────────────────────────────────────────

/**
 * Returns initials from a username for avatar fallback display.
 * e.g. "john_doe" → "JD"
 */
export const getUserInitials = (username = "") => {
  const parts = username.split(/[_\s-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
};

// ─── Genre Color Map ───────────────────────────────────────────────────────

const genreColors = {
  28: "bg-red-500",      // Action
  12: "bg-yellow-500",   // Adventure
  16: "bg-blue-400",     // Animation
  35: "bg-orange-400",   // Comedy
  80: "bg-gray-500",     // Crime
  99: "bg-green-500",    // Documentary
  18: "bg-purple-500",   // Drama
  10751: "bg-pink-400",  // Family
  14: "bg-indigo-400",   // Fantasy
  36: "bg-amber-600",    // History
  27: "bg-red-700",      // Horror
  10402: "bg-teal-400",  // Music
  9648: "bg-violet-600", // Mystery
  10749: "bg-rose-400",  // Romance
  878: "bg-cyan-500",    // Sci-Fi
  10770: "bg-lime-500",  // TV Movie
  53: "bg-orange-600",   // Thriller
  10752: "bg-green-700", // War
  37: "bg-amber-700",    // Western
};

export const getGenreColor = (genreId) =>
  genreColors[genreId] || "bg-brand-600";
