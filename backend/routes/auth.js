const express = require('express');
const router = express.Router();
const { login, signup } = require('../controllers/authController');
const authController = require('../controllers/authController');
router.post('/login', login);
router.post('/signup', signup);
router.post('/verify-identity', authController.verifyIdentity);
router.post('/reset-password', authController.resetPassword);
module.exports = router;