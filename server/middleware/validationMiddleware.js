/**
 * Input validation helpers used across controllers.
 * Using vanilla JS for lightweight validation (no extra deps).
 */

export const validateRegistration = (username, email, password) => {
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push("Username must be at least 3 characters.");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores.");
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("A valid email address is required.");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  return errors;
};

export const validateReview = (content, rating) => {
  const errors = [];

  if (!content || content.trim().length < 10) {
    errors.push("Review must be at least 10 characters.");
  }
  if (content && content.trim().length > 2000) {
    errors.push("Review cannot exceed 2000 characters.");
  }
  if (rating === undefined || rating < 0.5 || rating > 5) {
    errors.push("Rating must be between 0.5 and 5.");
  }

  return errors;
};
