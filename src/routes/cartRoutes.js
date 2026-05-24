const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

// Lấy thông tin giỏ hàng
router.get('/', verifyToken, cartController.getCart);

// Thêm sản phẩm/biến thể vào giỏ hàng
router.post('/add', verifyToken, cartController.addToCart);

// Cập nhật số lượng hoặc ghi chú của mục trong giỏ hàng
router.put('/update', verifyToken, cartController.updateCartItem);

// Xóa một sản phẩm khỏi giỏ hàng
router.delete('/remove/:itemId', verifyToken, cartController.removeCartItem);

// Xóa toàn bộ giỏ hàng
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;
