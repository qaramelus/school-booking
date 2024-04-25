const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const Activity = require('../models/Activity');

// Route to fetch non-cancelled sessions for all activities for a specific child
router.get('/children/:childId/non-cancelled-sessions', authMiddleware, activityController.fetchAllNonCancelledSessionsForChild);

// POST request to create an Activity
router.post('/', authMiddleware, activityController.createActivity);

// GET request to fetch all Activities
router.get('/', authMiddleware, activityController.fetchActivities);

// GET request to fetch all Activities for a specific teacher
router.get('/forteacher/:teacherId', authMiddleware, activityController.fetchActivitiesForTeacher);

// Route to calculate sessions for an activity
router.get('/:activityId/sessions', activityController.calculateSessionsPerActivity);

// GET request for fetching participants per time slot for a specific activity
router.get('/:activityId/participants-per-timeslot', authMiddleware, activityController.fetchParticipantsPerTimeSlot);

// GET request to calculate and fetch all sessions per timeslot for a specific activity
router.get('/:activityId/sessions-info', authMiddleware, activityController.calculateSessionsPerTimeSlot);

// Route to fetch non-cancelled sessions for a specific child in an activity
router.get('/:activityId/:childId/non-cancelled-sessions', authMiddleware, activityController.fetchNonCancelledSessions);

// More specific routes should come before the general ID routes
router.get('/:id/with-participants', authMiddleware, activityController.getActivityWithParticipants);
router.get('/:id/participants', authMiddleware, activityController.getActivityParticipants);
router.get('/:id', authMiddleware, activityController.getActivityById);

// GET request for fetching activities tailored for parents (needs to be correctly placed)
router.get('/parents/:parentId', authMiddleware, activityController.fetchActivitiesForParents);

// DELETE request to delete an Activity
router.delete('/:id', authMiddleware, activityController.deleteActivity);

// PUT request to update an Activity
router.put('/:id', authMiddleware, activityController.updateActivity);

module.exports = router;
