// ActivitBasicOperationsController.js
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Session = require('../models/Session');
const User = require('../models/User');
const Location = require('../models/Location');  // Ensure the Location model is imported
const { calculateSessionsPerTimeslot } = require('../utils/sessionCalculator');

// Function to create an Activity with scheduling
exports.createActivity = async (req, res) => {
    try {
        const { name, description, startDate, endDate, timeSlots, createdBy, teachers, maxParticipants } = req.body;

        // Validate teachers
        const teacherChecks = teachers.map(teacherId =>
            mongoose.Types.ObjectId.isValid(teacherId) ? User.findById(teacherId) : null
        );
        const allTeachersExist = (await Promise.all(teacherChecks)).every(user => user);

        // Validate locations
        const locationChecks = timeSlots.map(slot =>
            mongoose.Types.ObjectId.isValid(slot.location) ? Location.findById(slot.location) : null
        );
        const allLocationsExist = (await Promise.all(locationChecks)).every(location => location);

        if (!allTeachersExist || !allLocationsExist) {
            return res.status(400).json({ message: 'One or more teachers or locations do not exist.' });
        }

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

        // After creating the activity, create sessions for each time slot
        await Promise.all(timeSlots.map(slot => {
            const sessions = calculateSessionsPerTimeslot(slot, startDate, endDate);
            return Promise.all(sessions.map(session => Session.create({
                activityId: newActivity._id,
                locationId: slot.location,
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
                teachers,  // Assuming all sessions have the same teachers
                status: 'scheduled'
            })));
        }));

        res.status(201).json(newActivity);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create activity', error: error.message });
    }
};

// Function to fetch all activities
exports.fetchActivities = async (req, res) => {
    try {
        const activities = await Activity.find({}); 
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
};

// Function to delete an activity
exports.deleteActivity = async (req, res) => {
    try {
      const activityId = req.params.id;
      await Activity.findByIdAndDelete(activityId);
      // Also delete associated sessions
      await Session.deleteMany({ activityId });
      res.status(200).send({ message: 'Activity and related sessions deleted successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Failed to delete activity', error: error.toString() });
    }
  };

// Function to update an activity
exports.updateActivity = async (req, res) => {
    try {
      const activityId = req.params.id;
      const { startDate, endDate, timeSlots, teachers } = req.body;
      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }

      // Validate teachers and locations
      const teacherChecks = teachers ? teachers.map(teacherId =>
          mongoose.Types.ObjectId.isValid(teacherId) ? User.findById(teacherId) : null
      ) : [];
      const allTeachersExist = (await Promise.all(teacherChecks)).every(user => user);

      const locationChecks = timeSlots ? timeSlots.map(slot =>
          mongoose.Types.ObjectId.isValid(slot.location) ? Location.findById(slot.location) : null
      ) : [];
      const allLocationsExist = (await Promise.all(locationChecks)).every(location => location);

      if (!allTeachersExist || !allLocationsExist) {
        return res.status(400).json({ message: 'One or more teachers or locations do not exist.' });
      }

      const updatedActivity = await Activity.findByIdAndUpdate(activityId, {
        ...req.body,
        startDate: startDate || activity.startDate,
        endDate: endDate || activity.endDate
      }, { new: true });

      // Recreate sessions
      await Session.deleteMany({ activityId }); // Remove old sessions
      await Promise.all((timeSlots || activity.timeSlots).map(slot => {
          const sessions = calculateSessionsPerTimeslot(slot, startDate || activity.startDate, endDate || activity.endDate);
          return Promise.all(sessions.map(session => Session.create({
              activityId,
              locationId: slot.location,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              teachers,  // Assuming all sessions have the same teachers
              status: 'scheduled'
          })));
      }));

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

  // Function to fetch current activities
exports.fetchCurrentActivities = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Normalize today's date to start of day

    try {
        const currentActivities = await Activity.find({
            startDate: { $lte: today },
            endDate: { $gte: today }
        });
        res.json(currentActivities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current activities', error: error.message });
    }
};

// Function to fetch future activities
exports.fetchFutureActivities = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Normalize today's date to start of day

    try {
        const futureActivities = await Activity.find({
            startDate: { $gt: today }
        });
        res.json(futureActivities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching future activities', error: error.message });
    }
};
