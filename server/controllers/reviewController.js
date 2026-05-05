import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { validateReview } from "../middleware/validationMiddleware.js";

/**
 * @route  GET /api/reviews/movie/:movieId
 * @desc   Get all reviews for a movie (paginated)
 * @access Public
 */
export const getReviewsByMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ movieId })
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ movieId }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route  GET /api/reviews/user/:userId
 * @desc   Get all reviews by a specific user
 * @access Public
 */
export const getReviewsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ author: userId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ author: userId }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @route  POST /api/reviews
 * @desc   Create a new review
 * @access Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { movieId, movieTitle, moviePosterPath, content, rating, containsSpoilers } = req.body;

  if (!movieId || !movieTitle) {
    res.status(400);
    throw new Error("Movie ID and title are required.");
  }

  const errors = validateReview(content, rating);
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(" "));
  }

  // Prevent duplicate reviews by same user for same movie
  const existingReview = await Review.findOne({ author: req.user._id, movieId });
  if (existingReview) {
    res.status(409);
    throw new Error("You have already reviewed this movie. Edit your existing review instead.");
  }

  const review = await Review.create({
    author: req.user._id,
    movieId,
    movieTitle,
    moviePosterPath: moviePosterPath || "",
    content: content.trim(),
    rating,
    containsSpoilers: containsSpoilers || false,
  });

  await review.populate("author", "username avatar");

  res.status(201).json({ success: true, data: review });
});

/**
 * @route  PUT /api/reviews/:reviewId
 * @desc   Edit a review (author only)
 * @access Private
 */
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }
  if (review.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit your own reviews.");
  }

  const { content, rating, containsSpoilers } = req.body;
  const errors = validateReview(content, rating);
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(" "));
  }

  review.content = content.trim();
  review.rating = rating;
  review.containsSpoilers = containsSpoilers ?? review.containsSpoilers;
  review.isEdited = true;
  await review.save();

  await review.populate("author", "username avatar");
  await review.populate("comments.author", "username avatar");

  res.json({ success: true, data: review });
});

/**
 * @route  DELETE /api/reviews/:reviewId
 * @desc   Delete a review (author only)
 * @access Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }
  if (review.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own reviews.");
  }

  await review.deleteOne();
  res.json({ success: true, message: "Review deleted successfully." });
});

/**
 * @route  POST /api/reviews/:reviewId/like
 * @desc   Toggle like on a review
 * @access Private
 */
export const toggleReviewLike = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }

  const userId = req.user._id;
  const alreadyLiked = review.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    review.likes = review.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    review.likes.push(userId);

    // Notify review author (skip if user likes their own review)
    if (review.author.toString() !== userId.toString()) {
      await User.findByIdAndUpdate(review.author, {
        $push: {
          notifications: {
            type: "review_like",
            fromUser: userId,
            message: `${req.user.username} liked your review of "${review.movieTitle}"`,
          },
        },
      });
    }
  }

  await review.save();

  res.json({
    success: true,
    liked: !alreadyLiked,
    likeCount: review.likes.length,
  });
});

/**
 * @route  POST /api/reviews/:reviewId/comments
 * @desc   Add a comment to a review
 * @access Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error("Comment content is required.");
  }
  if (content.trim().length > 500) {
    res.status(400);
    throw new Error("Comment cannot exceed 500 characters.");
  }

  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }

  review.comments.push({ author: req.user._id, content: content.trim() });
  await review.save();
  await review.populate("comments.author", "username avatar");

  // Notify review author of new comment
  if (review.author.toString() !== req.user._id.toString()) {
    await User.findByIdAndUpdate(review.author, {
      $push: {
        notifications: {
          type: "comment",
          fromUser: req.user._id,
          message: `${req.user.username} commented on your review of "${review.movieTitle}"`,
        },
      },
    });
  }

  const newComment = review.comments[review.comments.length - 1];
  res.status(201).json({ success: true, data: newComment });
});

/**
 * @route  PUT /api/reviews/:reviewId/comments/:commentId
 * @desc   Edit a comment (author only)
 * @access Private
 */
export const editComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { reviewId, commentId } = req.params;

  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error("Comment content is required.");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }

  const comment = review.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found.");
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit your own comments.");
  }

  comment.content = content.trim();
  comment.isEdited = true;
  await review.save();
  await review.populate("comments.author", "username avatar");

  res.json({ success: true, data: comment });
});

/**
 * @route  DELETE /api/reviews/:reviewId/comments/:commentId
 * @desc   Delete a comment (author only)
 * @access Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { reviewId, commentId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }

  const comment = review.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found.");
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own comments.");
  }

  comment.deleteOne();
  await review.save();

  res.json({ success: true, message: "Comment deleted successfully." });
});

/**
 * @route  GET /api/reviews/feed
 * @desc   Get review feed from followed users
 * @access Private
 */
export const getFollowingFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const followingIds = req.user.following;

  const [reviews, total] = await Promise.all([
    Review.find({ author: { $in: followingIds } })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ author: { $in: followingIds } }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
