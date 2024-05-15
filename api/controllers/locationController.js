// locationController.js
const Location = require('../models/Location');

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const { name, address, capacity } = req.body;
    const location = new Location({ name, address, capacity });
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

// Update an existing location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, capacity } = req.body;
    const updatedLocation = await Location.findByIdAndUpdate(
      id, 
      { name, address, capacity }, 
      { new: true }
    );
    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(updatedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller method to delete an existing location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLocation = await Location.findByIdAndDelete(id);
    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(204).json();  // No content to send back
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

