const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate OTP
UserSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 5;

  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + expireMinutes * 60 * 1000),
    attempts: 0,
  };

  return otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = function (inputOTP) {
  if (!this.otp.code || !this.otp.expiresAt) {
    return { valid: false, message: "No OTP found. Please request a new one." };
  }

  if (new Date() > this.otp.expiresAt) {
    return { valid: false, message: "OTP has expired. Please request a new one." };
  }

  if (this.otp.attempts >= 3) {
    return { valid: false, message: "Too many attempts. Please request a new OTP." };
  }

  if (this.otp.code !== inputOTP) {
    this.otp.attempts += 1;
    return { valid: false, message: "Invalid OTP." };
  }

  return { valid: true, message: "OTP verified successfully." };
};

// Clear OTP after successful verification
UserSchema.methods.clearOTP = function () {
  this.otp = {
    code: null,
    expiresAt: null,
    attempts: 0,
  };
};

module.exports = mongoose.model("User", UserSchema);