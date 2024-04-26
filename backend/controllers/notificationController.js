// notificationController.js

const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const notification = new Notification({
            recipientId,
            message,
            timestamp: new Date(),
            readStatus: false
        });
        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
};

// Fetch notifications for a user
exports.fetchNotifications = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const notifications = await Notification.find({ recipientId }).sort({ timestamp: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.readStatus = true;
        await notification.save();
        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndDelete(notificationId);
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
};
