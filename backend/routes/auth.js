const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcrypt = require('bcryptjs');

// Registration route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

module.exports = router;
