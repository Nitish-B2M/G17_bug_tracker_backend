const express = require('express');
const router = express.Router();
const User = require('../controllers/users-controller');

// GET all users
router.get('/', User.getAllUsers);

// GET a single user
router.get('/:username', User.getUser);

// POST a new user (register)
router.post('/register', User.createUser);

// PUT update a user
router.put('/:username', User.updateUser);

// // DELETE a user
router.delete('/:username', User.deleteUser);

module.exports = router;
