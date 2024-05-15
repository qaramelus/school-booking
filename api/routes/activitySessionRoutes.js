// activitySessionRoutes.js
const express = require('express');
const router = express.Router();
const activitySessionController = require('../controllers/ActivitySessionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Fetch acticity sessions
router.get('/:activityId/sessions', authMiddleware, activitySessionController.calculateSessionsPerActivity);
router.get('/:activityId/sessions-info', authMiddleware, activitySessionController.calculateSessionsPerTimeSlot);
router.get('/:activityId/current-sessions', authMiddleware, activitySessionController.calculateCurrentSessionsPerActivity);

// New routes for session management
router.post('/:activityId/cancel', authMiddleware, activitySessionController.cancelSession);
router.post('/:activityId/reschedule', authMiddleware, activitySessionController.rescheduleSession);

module.exports = router;