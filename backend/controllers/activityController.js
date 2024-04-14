// activityController.js
const Activity = require('../models/Activity'); 
const Booking = require('../models/Booking'); 
const User = require('../models/User'); 

// Function to create an Activity with scheduling
exports.createActivity = async (req, res) => {
  try {
    const { name, description, startDate, endDate, timeSlots, createdBy, teachers } = req.body;
    const newActivity = await Activity.create({
      name,
      description,
      startDate,
      endDate,
      timeSlots,
      createdBy,
      teachers
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
    const activity = await Activity.findById(req.params.id)
      .populate('teachers', 'username') 
      .exec();

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
};


// Fetch list of participants per activity
exports.getActivityParticipants = async (req, res) => {
  try {
    const { activityId } = req.params;
    const bookings = await Booking.find({ activityId: activityId }).populate('userId');
    const participants = bookings.map(booking => booking.userId);
    res.json(participants);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching activity participants', error: error.message });
  }
};

// Function to fetch all Activities with participant counts
exports.fetchActivitiesWithParticipants = async (req, res) => {
  try {
    let activities = await Activity.find({});

    activities = await Promise.all(activities.map(async (activity) => {
      const participantCount = await Booking.countDocuments({ activityId: activity._id });
      return { ...activity.toObject(), participantCount }; 
    }));

    res.json(activities);
  } catch (error) {
    res.status(500).send({ message: "Error fetching activities and participant counts", error: error.message });
  }
};

// Function to fetch a single Activity with its participant count
exports.getActivityWithParticipants = async (req, res) => {
  try {
    const activityId = req.params.id; 
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const participantCount = await Booking.countDocuments({ activityId: activity._id });

    res.json({ ...activity.toObject(), participantCount });
  } catch (error) {
    console.error('Error fetching activity with participant count:', error);
    res.status(500).json({ message: 'Error fetching activity with participant count', error: error.message });
  }
};

// Function to fetch all Activities for a specific teacher
exports.fetchActivitiesForTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const activities = await Activity.find({ teachers: teacherId })
      .populate('teachers', 'username') 
      .exec();

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities for teacher:", error);
    res.status(500).send({ message: "Error fetching activities for teacher", error: error.message });
  }
};

exports.fetchActivitiesForParents = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Validate parent existence
    const parent = await User.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Fetch all children IDs for the parent
    const children = await User.find({ parent: parentId }).select('_id');
    if (!children.length) {
      return res.status(404).json({ message: "No children found for this parent" });
    }
    const childIds = children.map(child => child._id);

    // Fetch bookings for these children
    const bookings = await Booking.find({ childId: { $in: childIds } }).populate({
      path: 'activityId',
      populate: { path: 'teachers', select: 'name username' }
    });

    // Check if bookings are found and handle the case where they are not
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for these children" });
    }

    // Deduplicate and extract activity data
    const activities = {};
    bookings.forEach(booking => {
      const activity = booking.activityId;
      if (!activity) {
        console.error('Booking without a valid activity:', booking);
        return;  // Skip this booking
      }
      if (!activities[activity._id]) {
        activities[activity._id] = {
          ...activity.toObject(),
          bookings: []
        };
      }
      activities[activity._id].bookings.push({
        bookingId: booking._id,
        childId: booking.childId,
        dateBooked: booking.dateBooked,
        cancellations: booking.cancellations
      });
    });

    res.json(Object.values(activities));
  } catch (error) {
    console.error("Error fetching activities for parents:", error);
    res.status(500).send({ message: "Error fetching activities for parents", error: error.message });
  }
};
