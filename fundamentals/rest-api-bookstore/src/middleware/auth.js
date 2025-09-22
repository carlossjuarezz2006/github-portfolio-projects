/**
 * Authentication and Authorization Middleware
 * 
 * This middleware handles:
 * - JWT token verification
 * - User authentication
 * - Role-based authorization
 * - Account status validation
 * - Rate limiting for sensitive operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    // Also check for token in cookies (if using cookie-based auth)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.',
      });
    }
    
    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated. Please contact support.',
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to too many failed login attempts.',
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please login again.',
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
};

/**
 * Authorize user based on roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    
    next();
  };
};

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Check if user owns resource or is admin
 * @param {string} resourceUserField - Field name that contains the user ID in the resource
 */
const resourceOwnerOrAdmin = (resourceUserField = 'user') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }
    
    try {
      // Get resource ID from params
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'Resource ID required.',
        });
      }
      
      // This is a simplified check - in real implementation,
      // you would fetch the resource and check ownership
      // For now, we'll assume the resource user field is passed in req.resource
      if (req.resource && req.resource[resourceUserField]) {
        if (req.resource[resourceUserField].toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. You can only access your own resources.',
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed.',
      });
    }
  };
};

/**
 * Check if user can modify their own profile or is admin
 */
const profileOwnerOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
  }
  
  const targetUserId = req.params.id || req.params.userId;
  
  // Admin can modify any profile
  if (req.user.role === 'admin') {
    return next();
  }
  
  // User can only modify their own profile
  if (targetUserId && targetUserId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only modify your own profile.',
    });
  }
  
  next();
};

/**
 * Validate email verification status
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required. Please verify your email before accessing this resource.',
    });
  }
  
  next();
};

/**
 * Middleware to check if user has specific permissions
 * @param {string|Array} permissions - Required permissions
 */
const hasPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }
    
    const userPermissions = getUserPermissions(req.user.role);
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}.`,
      });
    }
    
    next();
  };
};

/**
 * Get user permissions based on role
 * @param {string} role - User role
 * @returns {Array} Array of permissions
 */
const getUserPermissions = (role) => {
  const permissions = {
    user: [
      'read:own-profile',
      'update:own-profile',
      'read:books',
      'create:reviews',
      'update:own-reviews',
      'delete:own-reviews',
      'create:orders',
      'read:own-orders',
    ],
    moderator: [
      'read:own-profile',
      'update:own-profile',
      'read:books',
      'update:books',
      'create:books',
      'read:reviews',
      'update:reviews',
      'delete:reviews',
      'read:orders',
      'update:orders',
      'read:users',
    ],
    admin: [
      'read:*',
      'create:*',
      'update:*',
      'delete:*',
    ],
  };
  
  return permissions[role] || permissions.user;
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for successful requests
    return req.rateLimit?.success === true;
  },
});

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  resourceOwnerOrAdmin,
  profileOwnerOrAdmin,
  requireEmailVerification,
  hasPermission,
  getUserPermissions,
  authRateLimit,
};

