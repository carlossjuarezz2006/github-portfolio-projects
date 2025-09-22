/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: Unique username
 *         email:
 *           type: string
 *           format: email
 *           description: Unique email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User password (hashed)
 *         firstName:
 *           type: string
 *           maxLength: 50
 *           description: User's first name
 *         lastName:
 *           type: string
 *           maxLength: 50
 *           description: User's last name
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           default: user
 *           description: User role
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the user account is active
 *         isEmailVerified:
 *           type: boolean
 *           default: false
 *           description: Whether the email is verified
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         phone:
 *           type: string
 *           description: User's phone number
 *         preferences:
 *           type: object
 *           properties:
 *             newsletter:
 *               type: boolean
 *               default: true
 *             notifications:
 *               type: boolean
 *               default: true
 *             language:
 *               type: string
 *               default: en
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         emailVerificationToken:
 *           type: string
 *           description: Token for email verification
 *         passwordResetToken:
 *           type: string
 *           description: Token for password reset
 *         passwordResetExpires:
 *           type: string
 *           format: date-time
 *           description: Password reset token expiration
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         username: "johndoe"
 *         email: "john@example.com"
 *         firstName: "John"
 *         lastName: "Doe"
 *         role: "user"
 *         isActive: true
 *         isEmailVerified: true
 *         phone: "+1234567890"
 *         preferences:
 *           newsletter: true
 *           notifications: true
 *           language: "en"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },

  firstName: {
    type: String,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    trim: true,
  },

  lastName: {
    type: String,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    trim: true,
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  avatar: {
    type: String,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, 'Please enter a valid image URL'],
  },

  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },

  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
  },

  preferences: {
    newsletter: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt'],
      default: 'en',
    },
  },

  lastLogin: {
    type: Date,
  },

  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Account lockout (for security)
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,

}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.emailVerificationToken;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.emailVerificationToken;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.lastLogin = new Date();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    userId: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'bookstore-api',
  });
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      },
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
  });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() },
    ],
  });
};

// Static method for user statistics
userSchema.statics.getStats = async function() {
  const [totalUsers, activeUsers, verifiedUsers, adminUsers] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isActive: true }),
    this.countDocuments({ isEmailVerified: true }),
    this.countDocuments({ role: 'admin' }),
  ]);
  
  const recentUsers = await this.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username email createdAt role');
  
  return {
    total: totalUsers,
    active: activeUsers,
    verified: verifiedUsers,
    admins: adminUsers,
    recent: recentUsers,
  };
};

module.exports = mongoose.model('User', userSchema);

