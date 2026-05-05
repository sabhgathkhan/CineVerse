import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { reviewAPI } from "../../api/index.js";
import toast from "react-hot-toast";

export default function ReviewForm({ movie, onSuccess }) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating."); return; }
    if (content.trim().length < 10) { toast.error("Review must be at least 10 characters."); return; }

    setIsSubmitting(true);
    try {
      const res = await reviewAPI.create({
        movieId: movie.id,
        movieTitle: movie.title,
        moviePosterPath: movie.poster_path || "",
        content: content.trim(),
        rating,
        containsSpoilers,
      });
      toast.success("Review posted! 🎉");
      setContent("");
      setRating(0);
      setContainsSpoilers(false);
      onSuccess?.(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-semibold text-white">Write Your Review</h3>

      {/* Star picker */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => {}}
              className={`text-3xl transition-colors hover:scale-110 ${
                star <= rating ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"
              }`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-400 self-center">{rating}.0 / 5.0</span>
          )}
        </div>
      </div>

      {/* Text area */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">
          Your Review
          <span className="ml-1 text-gray-600">({content.length}/2000)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Share your thoughts on this film..."
          className="input-field resize-none text-sm"
        />
      </div>

      {/* Spoiler toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            checked={containsSpoilers}
            onChange={(e) => setContainsSpoilers(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-5 rounded-full transition-colors ${
            containsSpoilers ? "bg-yellow-500" : "bg-dark-500"
          }`} />
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            containsSpoilers ? "translate-x-5" : "translate-x-0"
          }`} />
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <FiAlertTriangle size={13} className={containsSpoilers ? "text-yellow-400" : ""} />
          Contains spoilers
        </div>
      </label>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="btn-primary w-full"
      >
        {isSubmitting ? "Posting..." : "Post Review"}
      </button>
    </form>
  );
}
