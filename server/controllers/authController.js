import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public / Restricted (Admin/Manager can register Staff, Patients can self-register or be registered)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const userCount = await User.countDocuments();

    // Work out approval status:
    // 1. If very first user, auto-approve
    // 2. If registered by an authenticated Admin or Manager, auto-approve
    // 3. Otherwise (public registration), requires admin approval
    let isApproved = false;
    if (userCount === 0) {
      isApproved = true;
    } else if (
      req.user &&
      (req.user.role === "Admin" || req.user.role === "Manager")
    ) {
      isApproved = true;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      address,
      isApproved,
    });

    if (user) {
      if (!isApproved) {
        return res.status(201).json({
          success: true,
          message:
            "Registration successful! Your account is pending administrator approval before you can log in.",
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: false,
            token: null,
          },
        });
      }

      res.status(201).json({
        success: true,
        message: "Registration successful!",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: true,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if user is approved
      if (!user.isApproved) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is pending administrator approval. Please contact your manager or support.",
        });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          address: user.address,
          token: generateToken(user._id),
        },
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          address: user.address,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, getUserProfile };
