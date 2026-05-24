const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực tùy chọn (Nếu có token hợp lệ thì gán req.user, nếu không thì bỏ qua để dùng mock data)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // Bỏ qua lỗi token hết hạn/không hợp lệ để cho phép guest xem mock data
    }
  }
  next();
};

// Các routes
router.get('/', optionalAuth, notificationController.getNotifications);
router.put('/:id/read', optionalAuth, notificationController.markAsRead);
router.put('/read-all', optionalAuth, notificationController.markAllAsRead);
router.delete('/clear-all', optionalAuth, notificationController.clearAll);

module.exports = router;
