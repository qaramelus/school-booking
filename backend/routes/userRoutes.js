// userRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin, isAdminOrParent } = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');
const userController = require('../controllers/userController');
const { createTeacherUser } = require('../controllers/userController');

// Fetch all users - Admins only
router.get('/', isAdmin, userController.fetchAllUsers);

// Fetch teachers
router.get('/teachers', authMiddleware, userController.fetchTeachers);

// Route for creating a teacher user
router.post('/teachers', userMiddleware.generateUsername, createTeacherUser);

// Route for updating a teacher user
router.put('/teachers/:teacherId', isAdminOrParent, userController.updateTeacherUser);

// Route for creating a parent user
router.post('/parents', isAdmin, userController.createParentUser);

// Route for updating a parent user
router.put('/parents/:parentId', isAdminOrParent, userController.updateParentUser);

// Update an admin user - typically, only an Admin should have this right
router.put('/admins/:adminId', isAdmin, userController.updateAdminUser);

// Fetch user initials by ID - accessible by Admins and Parents
router.get('/:userId/initials', userController.fetchUserInitials);

// Fetch user details by ID - Admins only
router.get('/:userId', isAdminOrParent, userController.fetchUserDetails);

// Delete a user - ensure this is above the ':userId' parameterized routes
router.delete('/user/:userId', isAdmin, userController.deleteUser);

// Create a child user
router.post('/:parentId/children', isAdminOrParent, userController.createChildUser);

// Update a child user
router.put('/:parentId/children/:childId', isAdminOrParent, userController.updateChildUser);

// Fetch children for a parent user - Accessible by Admins and Parents
router.get('/:parentId/children', isAdminOrParent, userController.fetchChildrenForParent);

module.exports = router;
