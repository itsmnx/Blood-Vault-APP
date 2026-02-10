const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipient.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, recipientController.getAllRecipients);
router.post('/', authMiddleware, recipientController.createRecipient);
router.get('/:id', authMiddleware, recipientController.getRecipientById);

module.exports = router;