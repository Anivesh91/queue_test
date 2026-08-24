const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const protectOwner = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'queueless_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists.');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Your account is suspended. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired session. Please log in again.'));
    }
    next(error);
  }
};

module.exports = {
  protectOwner,
};
