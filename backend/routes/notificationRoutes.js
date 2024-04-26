// notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Create a new notification
router.post('/', notificationController.createNotification);

// Fetch notifications for a user
router.get('/:recipientId', notificationController.fetchNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
