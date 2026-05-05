import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiFilm, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      errs.username = "Only letters, numbers, and underscores allowed.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "A valid email is required.";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const result = await register(form.username.trim(), form.email.trim(), form.password);
    if (result.success) {
      navigate("/", { replace: true });
    }
  };

  // Password strength indicator
  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"][passwordStrength];

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-900/50">
              <FiFilm className="text-white" size={22} />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Join CineVerse</h1>
          <p className="text-gray-500 mt-2 text-sm">Create your free account in seconds</p>
        </div>

        <div className="card p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="john_doe"
                  autoComplete="username"
                  maxLength={30}
                  className={`input-field pl-10 ${errors.username ? "border-red-500" : ""}`}
                />
              </div>
              {errors.username
                ? <p className="mt-1 text-xs text-red-400">{errors.username}</p>
                : <p className="mt-1 text-xs text-gray-600">Letters, numbers, underscores only</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`input-field pl-10 pr-11 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength ? strengthColor : "bg-dark-500"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`input-field pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <FiCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400" size={16} />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Favorite genres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favorite Genres <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const active = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        active
                          ? "bg-brand-600 border-brand-500 text-white"
                          : "border-dark-500 text-gray-400 hover:border-brand-600 hover:text-white"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-500" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-600">
              <span className="bg-dark-800 px-3">Already have an account?</span>
            </div>
          </div>

          <Link to="/login" className="btn-secondary w-full py-3 text-center block text-sm">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
