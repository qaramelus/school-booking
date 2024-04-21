// locationController.js
const Location = require('../models/Location');

// Controller method to create a new location
exports.createLocation = async (req, res) => {
  try {
    const { name, address } = req.body;
    const location = new Location({ name, address });
    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller method to retrieve all locations from the database
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
