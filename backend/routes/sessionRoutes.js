const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// New route to fetch all sessions
router.get('/all', sessionController.fetchAllSessions);

// Fetch all sessions for a specific activity by activity ID
router.get('/:activityId', sessionController.fetchSessionsByActivityId);

// Fetch a specific session by its session ID
router.get('/session/:sessionId', sessionController.fetchSessionById);

// Reschedule a specific session by its session ID
router.patch('/reschedule/:sessionId', sessionController.rescheduleSession);

// Route to fetch all sessions for a specific participant by child ID
router.get('/participant/:childId', sessionController.fetchSessionsForParticipant);

module.exports = router;
