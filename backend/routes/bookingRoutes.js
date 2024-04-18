// bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Routes related to booking activities
router.post('/bookActivity', authMiddleware, bookingController.createBooking); // Booking an activity
router.delete('/deleteBooking/:bookingId', authMiddleware, bookingController.deleteBooking); // Deleting a booking

// Routes for managing cancellations
router.post('/cancelClass', authMiddleware, bookingController.cancelClass); // Handle cancellation of a class
router.post('/revertCancellation', authMiddleware, bookingController.revertCancellation); // Revert a previous cancellation

// Routes for fetching booking and participant information
router.get('/parent/:parentId/bookings', authMiddleware, bookingController.fetchBookingsForParent); // Fetch bookings for a parent
router.get('/parent/:parentId/child/:childId/bookings', authMiddleware, bookingController.fetchBookingsForParentAndChild); // Fetch bookings for a specific child of a parent
router.get('/activity/:activityId/participants', authMiddleware, bookingController.fetchActivityParticipants); // Get participants for a specific activity
router.get('/activity/:activityId/bookings', bookingController.fetchBookingsForActivity);
router.get('/activities-with-participants', bookingController.fetchActivities); // Get participants count for all activities

// Route to fetch cancellations for a specific child and activity
router.get('/cancellations/:childId/:activityId', authMiddleware, bookingController.fetchCancellations); // Fetch all cancellations for a specific child and activity

// Route to check booking status for a specific activity and parent
router.get('/activity/:activityId/parent/:parentId/booking-status', authMiddleware, bookingController.fetchBookingStatusForActivityAndParent);


module.exports = router;