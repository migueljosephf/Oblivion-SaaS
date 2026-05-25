const { verifyToken } = require('../config/jwt');
const prisma = require('../config/database');

/**
 * Authentication middleware - Protect routes
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { business: true },
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this resource' 
      });
    }

    next();
  };
};

/**
 * Check subscription status middleware
 */
const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.businessId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No business associated with account' 
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { businessId: req.user.businessId },
    });

    if (!subscription) {
      return res.status(403).json({ 
        success: false, 
        message: 'No active subscription' 
      });
    }

    // Check if subscription is expired
    if (subscription.status === 'EXPIRED' || 
        (subscription.status === 'TRIAL' && new Date() > new Date(subscription.trialEndDate))) {
      return res.status(403).json({ 
        success: false, 
        message: 'Subscription expired. Please renew to continue.',
        subscriptionExpired: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking subscription' 
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkSubscription,
};
