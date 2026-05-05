import { Router } from "express";
import {
  searchUsers,
  getUserProfile,
  updateProfile,
  toggleFollow,
  getNotifications,
  markNotificationsRead,
  getUserWatchlist,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// ─── IMPORTANT: Static/specific routes MUST come before wildcard /:param routes ─
// Express matches top-to-bottom. If /:username is first, requests like
// GET /me/notifications would match it with username = "me".

// Static public
router.get("/search", searchUsers);

// Static protected (must be ABOVE /:username wildcard)
router.put("/profile", protect, updateProfile);
router.get("/me/notifications", protect, getNotifications);
router.put("/me/notifications/read", protect, markNotificationsRead);

// Wildcard routes (defined last)
router.get("/:username", getUserProfile);
router.get("/:userId/watchlist", getUserWatchlist);
router.post("/:userId/follow", protect, toggleFollow);

export default router;
