const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/', isAdmin, userController.fetchAllUsers);
router.get('/:userId', isAdmin, userController.fetchUserDetails); 

module.exports = router;
