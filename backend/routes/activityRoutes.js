const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// POST request to create an Activity
router.post('/', activityController.createActivity);

// GET request to fetch all Activities
router.get('/', activityController.fetchActivities);

module.exports = router;
