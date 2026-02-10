// backend/src/routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, inventoryController.getInventory);

module.exports = router;
