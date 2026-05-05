import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: Number,
      required: [true, "Movie ID is required"],
    },
    movieTitle: {
      type: String,
      required: true,
    },
    moviePosterPath: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [0.5, "Minimum rating is 0.5"],
      max: [5, "Maximum rating is 5"],
    },
    containsSpoilers: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for fast querying ─────────────────────────────────────────────
reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ author: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
