const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, donorController.getAllDonors);
router.post('/', authMiddleware, donorController.createDonor);
router.get('/:id', authMiddleware, donorController.getDonorById);
router.put('/:id', authMiddleware, donorController.updateDonor);

module.exports = router;