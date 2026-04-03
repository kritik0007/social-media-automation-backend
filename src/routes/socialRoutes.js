/**
 * Social Account Routes
 */
const express = require('express');
const router = express.Router();
const { getAccounts, connectAccount, disconnectAccount, connectValidation } = require('../controllers/socialController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All social routes require authentication
router.use(protect);

router.get('/accounts', getAccounts);
router.post('/connect', connectValidation, validate, connectAccount);
router.delete('/accounts/:id', disconnectAccount);

module.exports = router;
