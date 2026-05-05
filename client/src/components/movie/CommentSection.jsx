import { useState } from "react";
import { FiEdit2, FiTrash2, FiSend } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { reviewAPI } from "../../api/index.js";
import UserAvatar from "../common/UserAvatar.jsx";
import { formatRelativeTime } from "../../utils/helpers.js";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function CommentSection({ reviewId, initialComments = [] }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) { toast.error("Sign in to comment."); return; }

    setSubmitting(true);
    try {
      const res = await reviewAPI.addComment(reviewId, newComment.trim());
      setComments((prev) => [...prev, res.data.data]);
      setNewComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await reviewAPI.editComment(reviewId, commentId, editContent.trim());
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editContent.trim(), isEdited: true } : c
        )
      );
      setEditingId(null);
      toast.success("Comment updated.");
    } catch {
      toast.error("Failed to update comment.");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await reviewAPI.deleteComment(reviewId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted.");
    } catch {
      toast.error("Failed to delete comment.");
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-xs text-gray-600 italic">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isOwner = user?._id === comment.author?._id;
            return (
              <div key={comment._id} className="flex gap-2.5">
                <Link to={`/user/${comment.author?.username}`} className="shrink-0">
                  <UserAvatar user={comment.author} size="sm" />
                </Link>
                <div className="flex-1 bg-dark-700 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/user/${comment.author?.username}`}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                    >
                      {comment.author?.username}
                    </Link>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">
                        {formatRelativeTime(comment.createdAt)}
                        {comment.isEdited && " · edited"}
                      </span>
                      {isOwner && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditContent(comment.content);
                            }}
                            className="p-0.5 text-gray-600 hover:text-brand-400 transition-colors"
                          >
                            <FiEdit2 size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="p-0.5 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <FiTrash2 size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === comment._id ? (
                    <div className="mt-1 flex gap-2">
                      <input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input-field py-1 text-xs flex-1"
                      />
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="btn-primary text-xs py-1 px-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 mt-0.5">{comment.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add comment */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-start">
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              className="input-field py-2 text-sm flex-1"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn-primary py-2 px-3"
            >
              <FiSend size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
