const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { isVendor } = require('../middleware/roleMiddleware');

// Lấy danh sách lịch sử đơn hàng
router.get('/', verifyToken, orderController.getOrders);

// Seller cancellations routes (must be registered BEFORE parameterized route if there are conflicts, but they are nested under /seller so no conflict with /:orderId)
router.get('/seller/cancellations', verifyToken, isVendor, orderController.getSellerCancellations);
router.post('/seller/cancellations/:orderId/approve', verifyToken, isVendor, orderController.approveSellerCancellation);
router.post('/seller/cancellations/:orderId/reject', verifyToken, isVendor, orderController.rejectSellerCancellation);

// Seller general orders routes
router.get('/seller/orders', verifyToken, isVendor, orderController.getSellerOrders);
router.put('/seller/orders/:orderId/status', verifyToken, isVendor, orderController.updateOrderStatus);

// Lấy thông tin chi tiết đơn hàng
router.get('/:orderId', verifyToken, orderController.getOrderDetail);

// Yêu cầu hủy đơn hàng
router.post('/:orderId/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
