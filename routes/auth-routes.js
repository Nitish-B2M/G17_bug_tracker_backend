const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

// Route for login page
// router.get('/login', authController.login);

// Route for logout page
router.get('/logout', authController.logout);

// Route for maintaining login
router.get('/maintainLogin', authController.maintainLogin);

module.exports = router;