// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to mark or update attendance
router.post('/', attendanceController.markAttendance);

// Route to fetch attendance for a specific activity
router.get('/:activityId', attendanceController.getAttendanceForActivity);

// Route to fetch attendance per timeslot for a specific activity
router.get('/:activityId/timeslots', attendanceController.getAttendancePerTimeslot);

// New route to fetch enhanced session information with attendance status
router.get('/:activityId/enhanced-sessions', attendanceController.getEnhancedSessionInfo);


module.exports = router;
