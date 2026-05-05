import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { reviewAPI } from "../../api/index.js";
import UserAvatar from "../common/UserAvatar.jsx";
import { StarDisplay } from "../common/index.jsx";
import { formatRelativeTime } from "../../utils/helpers.js";
import CommentSection from "./CommentSection.jsx";
import toast from "react-hot-toast";

export default function ReviewCard({ review, onDelete, onUpdate }) {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(
    review.likes?.some((id) => id === user?._id || id?._id === user?._id) || false
  );
  const [likeCount, setLikeCount] = useState(review.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [editRating, setEditRating] = useState(review.rating);
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = user?._id === review.author?._id;

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error("Sign in to like reviews."); return; }
    try {
      const res = await reviewAPI.toggleLike(review._id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {
      toast.error("Failed to update like.");
    }
  };

  const handleSaveEdit = async () => {
    if (editContent.trim().length < 10) {
      toast.error("Review must be at least 10 characters.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await reviewAPI.update(review._id, {
        content: editContent.trim(),
        rating: editRating,
        containsSpoilers: review.containsSpoilers,
      });
      toast.success("Review updated!");
      setIsEditing(false);
      onUpdate?.(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    try {
      await reviewAPI.delete(review._id);
      toast.success("Review deleted.");
      onDelete?.(review._id);
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  return (
    <article className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={`/user/${review.author?.username}`}>
            <UserAvatar user={review.author} size="md" />
          </Link>
          <div>
            <Link
              to={`/user/${review.author?.username}`}
              className="font-semibold text-white hover:text-brand-400 transition-colors"
            >
              {review.author?.username}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={review.rating} />
              <span className="text-xs text-gray-500">
                {formatRelativeTime(review.createdAt)}
                {review.isEdited && " · edited"}
              </span>
            </div>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 text-gray-500 hover:text-brand-400 hover:bg-dark-700 rounded-lg transition-colors"
              title="Edit review"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
              title="Delete review"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Spoiler badge */}
      {review.containsSpoilers && (
        <span className="badge bg-yellow-900/50 text-yellow-400 border border-yellow-800">
          ⚠️ Contains Spoilers
        </span>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          {/* Star picker for edit */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setEditRating(star)}
                className={`text-2xl transition-colors ${
                  star <= editRating ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="input-field resize-none text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="btn-primary text-sm py-1.5"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm py-1.5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 text-sm leading-relaxed">{review.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-dark-600">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? "text-red-400" : "text-gray-500 hover:text-red-400"
          }`}
        >
          <FiHeart size={15} fill={liked ? "currentColor" : "none"} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-400 transition-colors"
        >
          <FiMessageCircle size={15} />
          <span>{review.comments?.length || 0}</span>
          {showComments ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection reviewId={review._id} initialComments={review.comments} />
      )}
    </article>
  );
}
