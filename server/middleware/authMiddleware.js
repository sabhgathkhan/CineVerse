import asyncHandler from "express-async-handler";
import { verifyToken } from "../utils/tokenUtils.js";
import User from "../models/User.js";

/**
 * Protect routes: verifies JWT from Authorization header.
 * Attaches the authenticated user to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. No token provided.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    // Select user without password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found.");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Token is invalid or expired.");
  }
});
