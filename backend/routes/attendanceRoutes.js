// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to mark or update attendance
router.post('/', attendanceController.markAttendance);

// Route to fetch all attendance records for a specific session
router.get('/session/:sessionId', attendanceController.getAttendanceForSession);

// Route to fetch all sessions with their attendance records for an activity
router.get('/:activityId/sessions-with-attendance', attendanceController.getSessionsWithAttendance);

module.exports = router;

