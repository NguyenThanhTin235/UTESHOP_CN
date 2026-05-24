const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { verifyToken } = require('../middleware/authMiddleware');

// Lấy thông tin xem trước đơn hàng (preview)
router.post('/preview', verifyToken, checkoutController.previewCheckout);

// Đặt hàng (place order)
router.post('/place-order', verifyToken, checkoutController.placeOrder);

// Callback giả lập từ VNPAY Mock Gateway
router.post('/vnpay-callback', verifyToken, checkoutController.vnpayCallback);

// Xác thực giao dịch VNPAY thực tế
router.post('/vnpay-verify', verifyToken, checkoutController.verifyVnpay);

// Khởi tạo lại thanh toán VNPAY
router.post('/repay-vnpay', verifyToken, checkoutController.repayVnpay);

// Lấy thông tin chi tiết đơn hàng phục vụ trang thành công
router.get('/order-details/:paymentCode', verifyToken, checkoutController.getOrderDetails);

module.exports = router;
