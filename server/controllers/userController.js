import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Review from "../models/Review.js";

/**
 * @route  GET /api/users/search
 * @desc   Search users by username or bio, with optional genre filter
 * @access Public
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q = "", genre = "", page = 1 } = req.query;
  const limit = 12;
  const skip = (parseInt(page) - 1) * limit;

  const query = {};

  if (q.trim()) {
    query.$or = [
      { username: { $regex: q.trim(), $options: "i" } },
      { bio: { $regex: q.trim(), $options: "i" } },
    ];
  }

  if (genre) {
    query.favoriteGenres = genre;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("username avatar bio favoriteGenres followers following")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route  GET /api/users/:username
 * @desc   Get a user's public profile
 * @access Public
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .select("-password -notifications")
    .populate("followers", "username avatar")
    .populate("following", "username avatar");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Fetch review stats for the user
  const [reviewCount, avgRating] = await Promise.all([
    Review.countDocuments({ author: user._id }),
    Review.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      ...user.toJSON(),
      stats: {
        followerCount: user.followers.length,
        followingCount: user.following.length,
        reviewCount,
        watchlistCount: user.watchlist.length,
        averageRating: avgRating[0]?.avg ? parseFloat(avgRating[0].avg.toFixed(1)) : 0,
      },
    },
  });
});

/**
 * @route  PUT /api/users/profile
 * @desc   Update authenticated user's profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { bio, avatar, favoriteGenres } = req.body;

  const user = await User.findById(req.user._id);

  if (bio !== undefined) {
    if (bio.length > 200) {
      res.status(400);
      throw new Error("Bio cannot exceed 200 characters.");
    }
    user.bio = bio;
  }

  if (avatar !== undefined) user.avatar = avatar;
  if (Array.isArray(favoriteGenres)) user.favoriteGenres = favoriteGenres;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated.",
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      favoriteGenres: user.favoriteGenres,
    },
  });
});

/**
 * @route  POST /api/users/:userId/follow
 * @desc   Follow or unfollow a user
 * @access Private
 */
export const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.userId;
  const currentUserId = req.user._id;

  if (targetId === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot follow yourself.");
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    res.status(404);
    throw new Error("User not found.");
  }

  const isFollowing = targetUser.followers.some(
    (id) => id.toString() === currentUserId.toString()
  );

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
  } else {
    // Follow
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });

    // Create follow notification
    await User.findByIdAndUpdate(targetId, {
      $push: {
        notifications: {
          type: "follow",
          fromUser: currentUserId,
          message: `${req.user.username} started following you.`,
        },
      },
    });
  }

  res.json({
    success: true,
    following: !isFollowing,
    message: isFollowing
      ? `Unfollowed ${targetUser.username}`
      : `Now following ${targetUser.username}`,
  });
});

/**
 * @route  GET /api/users/notifications
 * @desc   Get notifications for the authenticated user
 * @access Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("notifications")
    .populate("notifications.fromUser", "username avatar");

  const sorted = user.notifications.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json({ success: true, data: sorted.slice(0, 50) }); // Return latest 50
});

/**
 * @route  PUT /api/users/notifications/read
 * @desc   Mark all notifications as read
 * @access Private
 */
export const markNotificationsRead = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $set: { "notifications.$[].isRead": true } }
  );
  res.json({ success: true, message: "All notifications marked as read." });
});

/**
 * @route  GET /api/users/:userId/watchlist
 * @desc   Get a user's public watchlist
 * @access Public
 */
export const getUserWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("watchlist username");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json({ success: true, data: user.watchlist, username: user.username });
});
