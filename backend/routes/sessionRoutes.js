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

// Route to mark a child as absent
router.post('/mark-absent/:sessionId/:childId', sessionController.markAsAbsent);

// Route to unmark a child as absent
router.post('/unmark-absent/:sessionId/:childId', sessionController.unmarkAsAbsent);

// Route to fetch all participants for all sessions of a specific activity
router.get('/:activityId/sessions-with-participants', sessionController.fetchSessionsWithParticipants);

module.exports = router;
