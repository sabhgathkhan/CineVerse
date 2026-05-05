import { Router } from "express";
import {
  getReviewsByMovie,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewLike,
  addComment,
  editComment,
  deleteComment,
  getFollowingFeed,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Feed (private)
router.get("/feed", protect, getFollowingFeed);

// Reviews
router.get("/movie/:movieId", getReviewsByMovie);
router.get("/user/:userId", getReviewsByUser);
router.post("/", protect, createReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

// Likes on reviews
router.post("/:reviewId/like", protect, toggleReviewLike);

// Comments
router.post("/:reviewId/comments", protect, addComment);
router.put("/:reviewId/comments/:commentId", protect, editComment);
router.delete("/:reviewId/comments/:commentId", protect, deleteComment);

export default router;
