const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');
const response = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return response.error(res, {
          statusCode: 401,
          message: 'User not found',
        });
      }

      if (decoded.role) {
        req.user.role = decoded.role;
      } else {
        const userRole = await UserRole.findOne({ user_id: req.user._id }).populate('role_id');
        if (userRole && userRole.role_id && userRole.role_id.name) {
          req.user.role = userRole.role_id.name.toLowerCase();
        } else {
          req.user.role = 'customer';
        }
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return response.error(res, {
        statusCode: 401,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return response.error(res, {
      statusCode: 401,
      message: 'Not authorized, no token',
    });
  }
};

module.exports = { protect, verifyToken: protect };
