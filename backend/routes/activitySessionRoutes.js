const express = require('express');
const router = express.Router();
const activitySessionController = require('../controllers/ActivitySessionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/:activityId/sessions', authMiddleware, activitySessionController.calculateSessionsPerActivity);
router.get('/:activityId/sessions-info', authMiddleware, activitySessionController.calculateSessionsPerTimeSlot);

module.exports = router;
