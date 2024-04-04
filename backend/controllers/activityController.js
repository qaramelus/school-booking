const Activity = require('../models/Activity'); // Ensure this path matches the location of your Activity model

// Function to create an Activity with scheduling
exports.createActivity = async (req, res) => {
  try {
    const { name, description, startDate, endDate, timeSlots, createdBy } = req.body;
    const newActivity = await Activity.create({
      name,
      description,
      startDate,
      endDate,
      timeSlots,
      createdBy,
    });

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create activity', error: error.message });
  }
};

// Function to fetch all Activities
exports.fetchActivities = async (req, res) => {
  try {
    const activities = await Activity.find({});
    res.json(activities);
  } catch (error) {
    res.status(500).send({ message: "Error fetching activities", error: error.message });
  }
};

// Function to delete an activity
exports.deleteActivity = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to delete activity', error: error.toString() });
  }
};

// Function to update an activity
exports.updateActivity = async (req, res) => {
  try {
    const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedActivity);
  } catch (error) {
    res.status(500).send({ message: 'Failed to update activity', error: error.toString() });
  }
};

// Function to fetch a single Activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
};
