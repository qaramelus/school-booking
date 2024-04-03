const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get booking per child
router.get('/parent/:parentId/bookings', authMiddleware, bookingController.fetchBookingsForParent);

// Book activity
router.post('/bookActivity', bookingController.createBooking);

module.exports = router;
