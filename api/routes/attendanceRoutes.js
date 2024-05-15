// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to mark or update a child's attendance for a session
router.post('/:sessionId/:childId', attendanceController.setAttendance);

// Route to get all attendance records for a particular activity
router.get('/activity/:activityId', attendanceController.getAttendanceForActivity);

// Route to fetch all sessions with their attendance records for an activity
router.get('/sessions/activity/:activityId', attendanceController.getSessionsWithAttendance);

module.exports = router;

