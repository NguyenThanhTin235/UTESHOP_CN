const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadProduct } = require('../config/cloudinary');

// Get products with pagination & filtering
router.get('/products', verifyToken, sellerController.getProducts);

// Export products to excel
router.get('/products/export', verifyToken, sellerController.exportProducts);

// Create new product
router.post('/products', verifyToken, sellerController.createProduct);

// Update product
router.put('/products/:id', verifyToken, sellerController.updateProduct);

// Delete product
router.delete('/products/:id', verifyToken, sellerController.deleteProduct);

// Upload product images
router.post('/products/upload', verifyToken, uploadProduct.array('images', 10), sellerController.uploadProductImages);

// Orders
router.get('/orders', verifyToken, sellerController.getOrders);
router.get('/orders/export', verifyToken, sellerController.exportOrders);
router.get('/orders/:id', verifyToken, sellerController.getOrderById);
router.put('/orders/:id/status', verifyToken, sellerController.updateOrderStatus);

// Cancellations
router.get('/cancellations', verifyToken, sellerController.getCancellations);
router.put('/cancellations/:id/status', verifyToken, sellerController.updateCancellationStatus);

// Analytics
router.get('/analytics', verifyToken, sellerController.getAnalytics);
router.get('/analytics/export', verifyToken, sellerController.exportAnalytics);

// Settings
router.get('/settings', verifyToken, sellerController.getSettings);
router.put('/settings', verifyToken, sellerController.updateSettings);
router.post('/settings/upload', verifyToken, uploadProduct.single('image'), sellerController.uploadShopAssets);
router.delete('/settings', verifyToken, sellerController.deleteShop);

// Wallet
router.get('/wallet', verifyToken, sellerController.getWalletInfo);
router.get('/wallet/transactions', verifyToken, sellerController.getWalletTransactions);
router.get('/wallet/transactions/export', verifyToken, sellerController.exportTransactions);
router.get('/wallet/withdrawals', verifyToken, sellerController.getWithdrawalRequests);
router.get('/wallet/withdrawals/export', verifyToken, sellerController.exportWithdrawals);
router.post('/wallet/withdraw', verifyToken, sellerController.requestWithdrawal);

module.exports = router;
