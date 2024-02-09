const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

// Route for login page
router.get('/login', authController.login);

module.exports = router;