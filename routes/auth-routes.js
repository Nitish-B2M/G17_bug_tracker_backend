const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

// Route for login page
router.post('/login', authController.loginUser);

// Route for creating a new user
router.post('/register', authController.createUser);

// Route for logout page
router.get('/logout', authController.logout);

// Route for reset password
router.post('/reset', authController.resetPassword);

module.exports = router;