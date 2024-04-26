// notificationModel.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to the User model
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    readStatus: {
        type: Boolean,
        default: false
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
