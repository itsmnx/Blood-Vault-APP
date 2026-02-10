const express = require('express');
const router = express.Router();
const bloodController = require('../controllers/blood.controller');
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Blood unit operations
router.post('/', authMiddleware, bloodController.createBloodUnit);
router.get('/units', authMiddleware, bloodController.getAllBloodUnits);
router.delete('/units/:id', authMiddleware, bloodController.deleteBloodUnit);
router.delete('/expired', authMiddleware, bloodController.deleteExpiredBlood);
router.post('/initialize-samples', authMiddleware, bloodController.initializeSampleBloodUnits);

// Expiry monitoring
router.get('/expiry-report', authMiddleware, bloodController.getExpiryReport);
router.get('/expiring', authMiddleware, bloodController.getExpiringUnits);

// Inventory operations
router.get('/inventory', authMiddleware, inventoryController.getInventory);
router.post('/inventory/initialize', authMiddleware, inventoryController.initializeInventory);

module.exports = router;