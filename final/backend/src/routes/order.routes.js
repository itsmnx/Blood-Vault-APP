const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, orderController.getAllOrders);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id/fulfill', authMiddleware, orderController.fulfillOrder);
router.post('/auto-fulfill', authMiddleware, orderController.autoFulfillOrders);

module.exports = router;
