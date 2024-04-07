const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// POST request to create an Activity
router.post('/', activityController.createActivity);

// GET request to fetch all Activities
router.get('/', activityController.fetchActivities);

// DELETE request to delete an Activity
router.delete('/:id', activityController.deleteActivity);

// PUT request to update an Activity
router.put('/:id', activityController.updateActivity);

// GET request to fetch a single Activity by ID
router.get('/:id', activityController.getActivityById);

// GET request to get participants per Activity
router.get('/:id/participants', activityController.getActivityParticipants);

// GET request to get all participants for all Activities
router.get('/', activityController.fetchActivitiesWithParticipants);


module.exports = router;
