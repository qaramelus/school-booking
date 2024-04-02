const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/bookActivity', bookingController.createBooking);

router.get('/parent/:parentId/bookings', bookingController.fetchBookingsForParent);



module.exports = router;
