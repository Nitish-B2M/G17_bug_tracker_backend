const express = require('express');
const router = express.Router();
const User = require('../controllers/users-controller');

// GET all users
router.get('/', User.getAllUsers);

// GET a single user
router.get('/:userId', User.getUser);

// PUT update a user
router.put('/:userId', User.updateUser);

// // DELETE a user
router.delete('/:userId', User.deleteUser);

// PUT update last seen
router.put('/lastseen/:userId', User.updateLastSeen);

// GET user [role: developer or manager]
router.get('/role/:role', User.getUsersByRole);

module.exports = router;
