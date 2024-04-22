const express = require('express');
const router = express.Router();
const activityBasicOperationsController = require('../controllers/ActivityBasicOperationsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, activityBasicOperationsController.createActivity);
router.get('/', authMiddleware, activityBasicOperationsController.fetchActivities);
router.get('/:id', authMiddleware, activityBasicOperationsController.getActivityById);
router.delete('/:id', authMiddleware, activityBasicOperationsController.deleteActivity);
router.put('/:id', authMiddleware, activityBasicOperationsController.updateActivity);

module.exports = router;
