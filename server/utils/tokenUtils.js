import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT for a given user ID.
 * Token expires in 7 days.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Verify and decode a JWT string.
 * Returns the decoded payload or throws an error.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
