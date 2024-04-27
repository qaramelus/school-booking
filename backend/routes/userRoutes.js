// userRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin, isAdminOrParent } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Fetch all users - Admins only
router.get('/', isAdmin, userController.fetchAllUsers);

// Fetch teachers
router.get('/teachers', authMiddleware, userController.fetchTeachers);

// Route for creating a teacher user
router.post('/teachers', isAdmin, userController.createTeacherUser);

// Route for creating a parent user
router.post('/parent', userController.createParentUser);
router.put('/parent/:parentId', userController.updateParentUser);

// Fetch user details by ID - Admins only
router.get('/:userId', isAdminOrParent, userController.fetchUserDetails);

// Create a child user - should be a POST request
router.post('/:parentId/children', isAdminOrParent, userController.createChildUser);

// Fetch children for a parent user - Accessible by Admins and Parents
router.get('/:parentId/children', isAdminOrParent, userController.fetchChildrenForParent);

module.exports = router