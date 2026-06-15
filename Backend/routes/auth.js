const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect, generateToken } = require("../middleware/auth");

// ============================================
// Helper function to check email or phone
// ============================================
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value) => /^[6-9]\d{9}$/.test(value);

// ============================================
// @route   POST /api/auth/login
// @desc    Send OTP to email or phone
// @access  Public
// ============================================
router.post(
  "/login",
  [
    body("identifier")
      .notEmpty()
      .withMessage("Email or phone number is required")
      .trim(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { identifier } = req.body;

    try {
      let query = {};
      let identifierType = "";

      // Determine if identifier is email or phone
      if (isEmail(identifier)) {
        query = { email: identifier.toLowerCase() };
        identifierType = "email";
      } else if (isPhone(identifier)) {
        query = { phone: identifier };
        identifierType = "phone";
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Invalid format. Please enter a valid email address or 10-digit phone number.",
        });
      }

      // Find or create user
      let user = await User.findOne(query);

      if (!user) {
        // Create new user
        const userData = { isVerified: false };
        if (identifierType === "email") {
          userData.email = identifier.toLowerCase();
        } else {
          userData.phone = identifier;
        }
        user = new User(userData);
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Generate OTP
      const otp = user.generateOTP();
      await user.save();

      // In production: send OTP via email/SMS service
      // For development: return OTP in response
      console.log(`📱 OTP for ${identifier}: ${otp}`);

      res.status(200).json({
        success: true,
        message: `OTP sent successfully to your ${identifierType}.`,
        data: {
          identifier,
          identifierType,
          otpExpiresIn: `${process.env.OTP_EXPIRE_MINUTES || 5} minutes`,
          // REMOVE in production - only for development/testing
          otp: process.env.NODE_ENV === "development" ? otp : undefined,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ============================================
// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return JWT token
// @access  Public
// ============================================
router.post(
  "/verify-otp",
  [
    body("identifier")
      .notEmpty()
      .withMessage("Email or phone number is required")
      .trim(),
    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { identifier, otp } = req.body;

    try {
      let query = {};

      if (isEmail(identifier)) {
        query = { email: identifier.toLowerCase() };
      } else if (isPhone(identifier)) {
        query = { phone: identifier };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid identifier format.",
        });
      }

      const user = await User.findOne(query);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please login first.",
        });
      }

      // Verify OTP
      const result = user.verifyOTP(otp);

      if (!result.valid) {
        await user.save(); // Save updated attempt count
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      // OTP verified - clear OTP and update user
      user.clearOTP();
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
          },
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ============================================
// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
// ============================================
router.post(
  "/resend-otp",
  [
    body("identifier")
      .notEmpty()
      .withMessage("Email or phone number is required")
      .trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { identifier } = req.body;

    try {
      let query = {};
      let identifierType = "";

      if (isEmail(identifier)) {
        query = { email: identifier.toLowerCase() };
        identifierType = "email";
      } else if (isPhone(identifier)) {
        query = { phone: identifier };
        identifierType = "phone";
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid identifier format.",
        });
      }

      const user = await User.findOne(query);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please login first.",
        });
      }

      // Check if previous OTP is still valid (cooldown of 20 seconds)
      if (user.otp.expiresAt) {
        const otpAge = Date.now() - (user.otp.expiresAt - (parseInt(process.env.OTP_EXPIRE_MINUTES) || 5) * 60 * 1000);
        if (otpAge < 20000) {
          return res.status(429).json({
            success: false,
            message: "Please wait 20 seconds before requesting a new OTP.",
          });
        }
      }

      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();

      console.log(`📱 Resent OTP for ${identifier}: ${otp}`);

      res.status(200).json({
        success: true,
        message: `OTP resent successfully to your ${identifierType}.`,
        data: {
          identifier,
          identifierType,
          otpExpiresIn: `${process.env.OTP_EXPIRE_MINUTES || 5} minutes`,
          otp: process.env.NODE_ENV === "development" ? otp : undefined,
        },
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
      });
    }
  }
);

// ============================================
// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
// ============================================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-otp");

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

// ============================================
// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
// ============================================
router.put(
  "/update-profile",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { name, email } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email.toLowerCase();

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-otp");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ============================================
// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal)
// @access  Private
// ============================================
router.post("/logout", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

module.exports = router;