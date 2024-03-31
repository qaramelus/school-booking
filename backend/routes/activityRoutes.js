const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// POST request to create an Activity
router.post('/', activityController.createActivity);

module.exports = router;
