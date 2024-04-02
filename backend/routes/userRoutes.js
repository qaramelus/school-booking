const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin, isAdminOrParent } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Fetch all users - Admins only
router.get('/', isAdmin, userController.fetchAllUsers);

// Fetch user details by ID - Admins only
router.get('/:userId', isAdminOrParent, userController.fetchUserDetails);

// Create a child user - Admins only (or adjust as necessary for your logic)
router.post('/:parentId/children', isAdminOrParent, userController.createChildUser);

// Assuming you have something like this already in your userRoutes.js file
router.get('/users/:parentId/children', isAdminOrParent, userController.fetchChildrenForParent);

// Fetch children for a parent user - Accessible by Admins and Parents
router.get('/children', isAdminOrParent, userController.fetchChildrenForParent);


module.exports = router;
