import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect Routes middleware
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from Bearer token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found or authorized" });
      }

      if (!req.user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "User account is suspended" });
      }

      if (!req.user.isApproved) {
        return res.status(401).json({
          success: false,
          message: "User account is pending administrator approval",
        });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

// Role-based Access Control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : "none"}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

export { protect, authorize };
