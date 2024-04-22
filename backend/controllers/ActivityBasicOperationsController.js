// Handles basic CRUD operations
const Activity = require('../models/Activity');
const { calculateSessionsPerTimeslot } = require('../utils/sessionCalculator');

// Function to create an Activity with scheduling
exports.createActivity = async (req, res) => {
    try {
      const { name, description, startDate, endDate, timeSlots, createdBy, teachers, maxParticipants } = req.body;
      const newActivity = await Activity.create({
        name,
        description,
        startDate,
        endDate,
        timeSlots,
        createdBy,
        teachers,
        maxParticipants, 
        currentParticipants: 0, 
        waitlistCount: 0 
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
      const { maxParticipants, location } = req.body; 
      const activity = await Activity.findById(req.params.id);
  
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
  
      // You may want to add logic here to handle situations where reducing maxParticipants
      // would affect current bookings, e.g., notify users or adjust bookings accordingly.
  
      const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, {
        ...req.body,
        maxParticipants: maxParticipants || activity.maxParticipants, 
        location: location || activity.location 
      }, { new: true });
  
      res.status(200).json(updatedActivity);
    } catch (error) {
      res.status(500).send({ message: 'Failed to update activity', error: error.toString() });
    }
  };

// Function to fetch a single Activity by ID
exports.getActivityById = async (req, res) => {
    try {
      const activity = await Activity.findById(req.params.id)
        .populate('teachers', 'username')
        .exec();
  
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      activity.timeSlots = activity.timeSlots.map(slot => ({
        ...slot,
        sessions: calculateSessionsPerTimeslot(slot, activity.startDate, activity.endDate)
      }));
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching activity', error: error.message });
    }
  };
