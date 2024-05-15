// userRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin, isAdminOrParent, encryptPassword } = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');
const userController = require('../controllers/userController');

// Fetch all users - Admins only
router.get('/', isAdmin, userController.fetchAllUsers);

// Fetch teachers
router.get('/teachers', authMiddleware, userController.fetchTeachers);

// Route for creating a teacher user - Apply generateUsername and encryptPassword middlewares
router.post('/teachers', [userMiddleware.generateUsername, encryptPassword], userController.createTeacherUser);

// Route for updating a teacher user - Apply encryption middleware conditionally
router.put('/teachers/:teacherId', [isAdminOrParent, encryptPassword], userController.updateTeacherUser);

// Route for creating a parent user - Admins only, apply generateUsername and encryptPassword middleware
router.post('/parents', [isAdmin, userMiddleware.generateUsername, encryptPassword], userController.createParentUser);

// Route for updating a parent user - Apply encryption middleware conditionally
router.put('/parents/:parentId', [isAdminOrParent, encryptPassword], userController.updateParentUser);

// Update an admin user - typically, only an Admin should have this right, apply encryption middleware conditionally
router.put('/admins/:adminId', [isAdmin, encryptPassword], userController.updateAdminUser);

// Fetch user initials by ID - accessible by Admins and Parents
router.get('/:userId/initials', isAdminOrParent, userController.fetchUserInitials);

// Fetch user details by ID - Admins only
router.get('/:userId', isAdmin, userController.fetchUserDetails);

// Delete a user - ensure this is above the ':userId' parameterized routes
router.delete('/user/:userId', isAdmin, userController.deleteUser);

// Create a child user - Apply encryption middleware
router.post('/:parentId/children', [isAdminOrParent, encryptPassword], userController.createChildUser);

// Update a child user - Apply encryption middleware conditionally
router.put('/:parentId/children/:childId', [userMiddleware.generateUsername, encryptPassword], userController.updateChildUser);

// Fetch children for a parent user - Accessible by Admins and Parents
router.get('/:parentId/children', isAdminOrParent, userController.fetchChildrenForParent);

module.exports = router;
