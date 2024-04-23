// locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Route to create a new location
router.post('/', locationController.createLocation);

// Route to get all locations
router.get('/', locationController.getAllLocations);

module.exports = router;
