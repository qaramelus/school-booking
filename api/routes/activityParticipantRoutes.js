const express = require('express');
const router = express.Router();
const activityParticipantController = require('../controllers/ActivityParticipantController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

router.get('/:id/with-participants', authMiddleware, activityParticipantController.getActivityWithParticipants);
router.get('/:id/participants', authMiddleware, activityParticipantController.getActivityParticipants);
router.get('/forteacher/:teacherId', authMiddleware, activityParticipantController.fetchActivitiesForTeacher);
router.get('/parents/:parentId', authMiddleware, activityParticipantController.fetchActivitiesForParents);
router.get('/children/:childId/non-cancelled-sessions', authMiddleware, activityParticipantController.fetchAllNonCancelledSessionsForChild);

router.use(errorHandler);

module.exports = router;
