const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/homepage', publicController.getHomepageData);
router.get('/categories', publicController.getCategories);
router.get('/products', publicController.searchProducts);
router.get('/product/:slug', publicController.getProductDetail);

module.exports = router;
