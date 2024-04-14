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

exports.calculateTimeslotsPerActivity = async (req, res) => {
  try {
      const { activityId } = req.params;
      const activity = await Activity.findById(activityId);

      if (!activity) {
          return res.status(404).json({ message: 'Activity not found' });
      }

      // Fetch all bookings for the given activity
      const bookings = await Booking.find({ activityId: activity._id })
          .populate('childId', 'username email')
          .lean();

      let timeSlotsInfo = {};

      // Initialize each timeslot with an empty array of participants and count
      activity.timeSlots.forEach(slot => {
          const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
          timeSlotsInfo[key] = {
              participants: [],
              count: 0
          };
      });

      // Aggregate participants and counts for each timeslot
      bookings.forEach(booking => {
          booking.timeSlots.forEach(slot => {
              const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
              const isCancelled = booking.cancellations.some(cancellation => 
                  cancellation.date.toISOString() === slot.startDate.toISOString() &&
                  cancellation.startTime === slot.startTime);

              if (!isCancelled && timeSlotsInfo[key]) {
                  timeSlotsInfo[key].participants.push({
                      childId: booking.childId._id,
                      username: booking.childId.username,
                      email: booking.childId.email
                  });
                  timeSlotsInfo[key].count++;
              }
          });
      });

      res.json(timeSlotsInfo);
  } catch (error) {
      console.error('Error calculating timeslots per activity:', error);
      res.status(500).send({ message: "Error calculating timeslots per activity", error: error.toString() });
  }
};


exports.fetchParticipantsPerTimeSlot = async (req, res) => {
  try {
      const { activityId } = req.params;
      const activity = await Activity.findById(activityId);

      if (!activity) {
          return res.status(404).json({ message: 'Activity not found' });
      }

      // Fetch all bookings for the given activity
      const bookings = await Booking.find({ activityId: activity._id })
          .populate('childId', 'username email')
          .lean();

      let timeSlotParticipants = {};

      // Initialize each timeslot with an empty array of participants
      activity.timeSlots.forEach(slot => {
          const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
          timeSlotParticipants[key] = [];
      });

      bookings.forEach(booking => {
          booking.timeSlots.forEach(slot => {
              // Form a key that uniquely identifies each timeslot
              const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
              const isCancelled = booking.cancellations.some(cancellation => 
                  cancellation.date.toISOString() === slot.startDate.toISOString() &&
                  cancellation.startTime === slot.startTime);

              if (!isCancelled && timeSlotParticipants[key]) {
                  timeSlotParticipants[key].push({
                      childId: booking.childId._id,
                      username: booking.childId.username,
                      email: booking.childId.email
                  });
              }
          });
      });

      res.json(timeSlotParticipants);
  } catch (error) {
      console.error('Error fetching participants per time slot:', error);
      res.status(500).send({ message: "Error fetching participants per time slot", error: error.toString() });
  }
};

exports.calculateSessionsPerTimeSlot = async (req, res) => {
  try {
      const { activityId } = req.params;
      const activity = await Activity.findById(activityId);

      if (!activity) {
          return res.status(404).json({ message: 'Activity not found' });
      }

      // Fetch all bookings for the given activity
      const bookings = await Booking.find({ activityId: activity._id })
          .populate('childId', 'username email')
          .lean();

      let sessionDetails = {};

      // Calculate all occurrences for each timeslot
      activity.timeSlots.forEach(slot => {
          const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
          sessionDetails[key] = [];
          const dayOfWeek = dayOfWeekToNumber(slot.dayOfWeek);

          // Generate dates for each occurrence of the time slot
          let currentDate = new Date(activity.startDate);
          currentDate = nextDay(currentDate, dayOfWeek); // Adjust to the first correct day of the week

          while (currentDate <= activity.endDate) {
              const dateString = currentDate.toISOString().split('T')[0];

              // Initialize session details
              sessionDetails[key].push({
                  date: dateString,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  participants: [],
                  count: 0
              });

              // Move to the next week
              currentDate.setDate(currentDate.getDate() + 7);
          }
      });

      // Map participants to each session based on date only
      bookings.forEach(booking => {
          Object.keys(sessionDetails).forEach(timeSlotKey => {
              sessionDetails[timeSlotKey].forEach(session => {
                  if (booking.cancellations.some(cancellation => 
                      cancellation.date.toISOString().split('T')[0] === session.date)) {
                      // This session is cancelled for this booking, skip adding participants
                      return;
                  }
                  
                  // If not cancelled, add participant to the session
                  session.participants.push({
                      childId: booking.childId._id,
                      username: booking.childId.username,
                      email: booking.childId.email
                  });
                  session.count++;
              });
          });
      });

      res.json(sessionDetails);
  } catch (error) {
      console.error('Error calculating sessions per time slot:', error);
      res.status(500).send({ message: "Error calculating sessions per time slot", error: error.toString() });
  }
};

function dayOfWeekToNumber(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(day);
}

function nextDay(date, dayOfWeek) {
  date = new Date(date);
  const resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + (dayOfWeek + 7 - date.getDay()) % 7);
  return resultDate;
}
