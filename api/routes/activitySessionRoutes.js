const express = require('express');
const router = express.Router();
const activitySessionController = require('../controllers/ActivitySessionController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

router.get('/:activityId/sessions', authMiddleware, activitySessionController.calculateSessionsPerActivity);
router.get('/:activityId/sessions-info', authMiddleware, activitySessionController.calculateSessionsPerTimeSlot);
router.get('/:activityId/current-sessions', authMiddleware, activitySessionController.calculateCurrentSessionsPerActivity);
router.post('/:activityId/cancel', authMiddleware, activitySessionController.cancelSession);
router.post('/:activityId/reschedule', authMiddleware, activitySessionController.rescheduleSession);

router.use(errorHandler);

module.exports = router;
