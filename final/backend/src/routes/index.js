const express = require('express');
const router = express.Router();

// Core routes
router.use('/auth', require('./auth.routes'));
router.use('/donors', require('./donor.routes'));
router.use('/recipients', require('./recipient.routes'));
router.use('/blood', require('./blood.routes'));
router.use('/inventory', require('./inventory.routes')); // ✅ fixed
router.use('/orders', require('./order.routes'));

// ML Routes
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/ml/insights', authMiddleware, orderController.getMLInsights);
router.get('/ml/forecast', authMiddleware, orderController.getForecast);
router.get('/ml/match-donors/:recipientId', authMiddleware, orderController.matchDonors);

module.exports = router;
