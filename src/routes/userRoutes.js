const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin, isVendor, isShipper } = require('../middleware/roleMiddleware');

/**
 * ── PROFILE MANAGEMENT ──
 */

// Lấy thông tin cá nhân hiện tại
router.get('/profile', verifyToken, userController.getProfile);

// Cập nhật thông tin cá nhân (UC04 + Avatar, Student Info)
router.put('/profile', verifyToken, userController.updateProfile);

// Đổi mật khẩu (Chủ động)
router.put('/profile/change-password', verifyToken, userController.changePassword);

/**
 * ── ADDRESS MANAGEMENT ──
 */

// Thêm địa chỉ mới
router.post('/addresses', verifyToken, userController.addAddress);

// Cập nhật địa chỉ
router.put('/addresses/:addressId', verifyToken, userController.updateAddress);

// Xóa địa chỉ
router.delete('/addresses/:addressId', verifyToken, userController.removeAddress);

module.exports = router;
