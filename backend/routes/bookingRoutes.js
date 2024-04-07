const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Book activity
router.post('/bookActivity', bookingController.createBooking);

// Get booking per child
router.get('/parent/:parentId/bookings', authMiddleware, bookingController.fetchBookingsForParent);

// Get bookings for a specific child of a parent
router.get('/parent/:parentId/child/:childId/bookings', authMiddleware, bookingController.fetchBookingsForParentAndChild);

// Get participants for a specific activity
router.get('/activity/:activityId/participants', authMiddleware, bookingController.fetchActivityParticipants);

// Get participants for all activities
router.get('/activities-with-participants', bookingController.fetchActivities);

// Delete a booking
router.delete('/deleteBooking/:bookingId', authMiddleware, bookingController.deleteBooking);


module.exports = router;