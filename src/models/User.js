/**
 * User Model
 * Handles user data, password hashing, and JWT token generation.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for fast email lookups


/**
 * Pre-save hook: Hash password before saving
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT access token
 */


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id },
    jwtConfig.secret, // ✅ CORRECT
    { expiresIn: '15m' }
  );
};

/**
 * Generate JWT refresh token
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET, // ✅ CORRECT
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
