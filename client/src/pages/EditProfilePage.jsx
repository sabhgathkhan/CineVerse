import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiSave, FiLink } from "react-icons/fi";
import { userAPI } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import UserAvatar from "../components/common/UserAvatar.jsx";
import toast from "react-hot-toast";

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
];

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    favoriteGenres: user?.favoriteGenres || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "avatar") setPreviewAvatar(value);
  };

  const toggleGenre = (genre) => {
    setForm((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.bio.length > 200) {
      toast.error("Bio cannot exceed 200 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await userAPI.updateProfile({
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
        favoriteGenres: form.favoriteGenres,
      });
      await refreshUser();
      toast.success("Profile updated! ✨");
      navigate(`/user/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Update your public profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar section */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Profile Picture
          </h2>
          <div className="flex items-center gap-6">
            {/* Live preview */}
            <div className="shrink-0">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-dark-600"
                  onError={() => setPreviewAvatar("")}
                />
              ) : (
                <UserAvatar user={user} size="xl" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Avatar URL
              </label>
              <div className="relative">
                <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                <input
                  type="url"
                  name="avatar"
                  value={form.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/your-photo.jpg"
                  className="input-field pl-10 text-sm"
                />
              </div>
              <p className="text-xs text-gray-600">
                Paste a direct image URL. Leave blank to use initials avatar.
              </p>
            </div>
          </div>
        </div>

        {/* Bio section */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            About You
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-300">Bio</label>
              <span className={`text-xs ${form.bio.length > 180 ? "text-yellow-400" : "text-gray-600"}`}>
                {form.bio.length}/200
              </span>
            </div>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              maxLength={200}
              placeholder="Tell the world about your taste in films..."
              className="input-field resize-none text-sm"
            />
          </div>
        </div>

        {/* Favorite genres */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Favorite Genres
          </h2>
          <p className="text-xs text-gray-500">
            Choose genres to appear on your profile and help others find you.
          </p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const active = form.favoriteGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border transition-all ${
                    active
                      ? "bg-brand-600 border-brand-500 text-white shadow-sm shadow-brand-900/30"
                      : "border-dark-500 text-gray-400 hover:border-brand-600 hover:text-white"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account info (read-only) */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Account Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Username</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-dark-700 rounded-xl border border-dark-600">
                <FiUser size={14} className="text-gray-500" />
                <span className="text-sm text-gray-400">@{user?.username}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <div className="px-3 py-2.5 bg-dark-700 rounded-xl border border-dark-600">
                <span className="text-sm text-gray-400">{user?.email}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Username and email cannot be changed after registration.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(`/user/${user?.username}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            <FiSave size={15} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
