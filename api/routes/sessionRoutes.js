const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

router.get('/all', sessionController.fetchAllSessions);
router.get('/:activityId', sessionController.fetchSessionsByActivityId);
router.get('/session/:sessionId', sessionController.fetchSessionById);
router.patch('/reschedule/:sessionId', sessionController.rescheduleSession);
router.get('/participant/:childId', sessionController.fetchSessionsForParticipant);
router.post('/mark-absent/:sessionId/:childId', sessionController.markAsAbsent);
router.post('/unmark-absent/:sessionId/:childId', sessionController.unmarkAsAbsent);
router.get('/:activityId/sessions-with-participants', sessionController.fetchSessionsWithParticipants);
router.get('/teacher/:teacherId', sessionController.fetchSessionsByTeacher);

router.use(errorHandler);

module.exports = router;
