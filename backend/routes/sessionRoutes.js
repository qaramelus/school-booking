// sessionRoutes.js

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Routes for session manipulation
router.post('/cancel/:activityId', sessionController.cancelSession);
router.post('/reschedule/:activityId', sessionController.rescheduleSession);

module.exports = router;
