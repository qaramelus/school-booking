const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// POST request to create an Activity
router.post('/', activityController.createActivity);

// GET request to fetch all Activities
router.get('/', activityController.fetchActivities);

// GET request to fetch all Activities for a specific teacher
router.get('/forteacher/:teacherId', activityController.fetchActivitiesForTeacher);

// More specific routes should come before the general ID routes
router.get('/:id/with-participants', activityController.getActivityWithParticipants);
router.get('/:id/participants', activityController.getActivityParticipants);
router.get('/:id', activityController.getActivityById);

// GET request for fetching activities tailored for parents (needs to be correctly placed)
router.get('/parents/:parentId', authMiddleware, activityController.fetchActivitiesForParents);

// DELETE request to delete an Activity
router.delete('/:id', activityController.deleteActivity);

// PUT request to update an Activity
router.put('/:id', activityController.updateActivity);

module.exports = router;
