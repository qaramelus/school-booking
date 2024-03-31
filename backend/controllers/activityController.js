const Activity = require('../models/activity'); // Ensure this path matches the location of your Activity model

// Existing function to create an Activity
exports.createActivity = async (req, res) => {
  try {
    const newActivity = await Activity.create({
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      createdBy: req.body.createdBy,
    });

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create activity', error: error.message });
  }
};

// Function to fetch all Activities
exports.fetchActivities = async (req, res) => {
  try {
    const activities = await Activity.find({}); // Fetches all activities
    res.json(activities); // Responds with the list of all activities
  } catch (error) {
    res.status(500).send({ message: "Error fetching activities", error: error.message });
  }
};

// Function to delete an activity
exports.deleteActivity = async (req, res) => {
    try {
      // Add authentication and authorization checks here
      await Activity.findByIdAndDelete(req.params.id);
      res.status(200).send({ message: 'Activity deleted successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Failed to delete activity', error: error.toString() });
    }
  };
