const Activity = require('../models/activity'); // Adjust the path as necessary

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
