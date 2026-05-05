import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { generateToken } from "../utils/tokenUtils.js";
import { validateRegistration } from "../middleware/validationMiddleware.js";

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate inputs
  const errors = validateRegistration(username, email, password);
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(" "));
  }

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  });
  if (existingUser) {
    res.status(409);
    throw new Error(
      existingUser.email === email.toLowerCase()
        ? "An account with this email already exists."
        : "This username is already taken."
    );
  }

  // Create user (password hashing handled in model pre-save hook)
  const user = await User.create({ username, email: email.toLowerCase(), password });

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

/**
 * @route  POST /api/auth/login
 * @desc   Login with email and password
 * @access Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json({
    success: true,
    message: "Login successful.",
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers,
      following: user.following,
      favoriteGenres: user.favoriteGenres,
      token: generateToken(user._id),
    },
  });
});

/**
 * @route  GET /api/auth/me
 * @desc   Get current authenticated user
 * @access Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("followers", "username avatar")
    .populate("following", "username avatar");

  res.json({ success: true, data: user });
});
