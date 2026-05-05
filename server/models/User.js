import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries
    },
    bio: {
      type: String,
      default: "",
      maxlength: [200, "Bio cannot exceed 200 characters"],
    },
    avatar: {
      type: String,
      default: "", // Empty = use initials fallback on frontend
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    watchlist: [
      {
        movieId: { type: Number, required: true },
        title: String,
        posterPath: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    likedMovies: [
      {
        type: Number, // TMDB movie IDs
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ["follow", "review_like", "comment"],
        },
        fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before saving ──────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare passwords ─────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: stats ────────────────────────────────────────────────────────
userSchema.virtual("stats").get(function () {
  return {
    followerCount: this.followers.length,
    followingCount: this.following.length,
    watchlistCount: this.watchlist.length,
    likedCount: this.likedMovies.length,
  };
});

userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);
export default User;
