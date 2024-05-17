const express = require('express');
const router = express.Router();
const activityBasicOperationsController = require('../controllers/ActivityBasicOperationsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateTeachers } = require('../middlewares/validateTeachers');
const { validateLocations } = require('../middlewares/validateLocations');
const { errorHandler } = require('../middlewares/errorHandler');

router.post('/', authMiddleware, validateTeachers, validateLocations, activityBasicOperationsController.createActivity);
router.get('/', authMiddleware, activityBasicOperationsController.fetchActivities);
router.get('/current', authMiddleware, activityBasicOperationsController.fetchCurrentActivities);
router.get('/future', authMiddleware, activityBasicOperationsController.fetchFutureActivities);
router.get('/:id', authMiddleware, activityBasicOperationsController.getActivityById);
router.delete('/:id', authMiddleware, activityBasicOperationsController.deleteActivity);
router.put('/:id', authMiddleware, validateTeachers, validateLocations, activityBasicOperationsController.updateActivity);

router.use(errorHandler);

module.exports = router;
