// activityController.js
const Activity = require('../models/Activity'); 
const Booking = require('../models/Booking'); 
const User = require('../models/User'); 

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
      maxParticipants, // Include the maximum number of participants
      currentParticipants: 0, // Initialize current participants
      waitlistCount: 0 // Initialize waitlist count
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
    const { maxParticipants } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // You may want to add logic here to handle situations where reducing maxParticipants
    // would affect current bookings, e.g., notify users or adjust bookings accordingly.

    const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, {
      ...req.body,
      maxParticipants: maxParticipants || activity.maxParticipants // Ensure maxParticipants is updated or maintained
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

      const bookings = await Booking.find({ activityId: activity._id })
          .populate('childId', 'username email')
          .lean();

      let sessionDetails = {};

      activity.timeSlots.forEach(slot => {
          const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
          sessionDetails[key] = [];

          let currentDate = new Date(activity.startDate);
          const dayOfWeek = dayOfWeekToNumber(slot.dayOfWeek);
          currentDate = nextDay(currentDate, dayOfWeek);

          while (currentDate <= activity.endDate) {
              const dateString = currentDate.toISOString().split('T')[0];

              sessionDetails[key].push({
                  date: dateString,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  participants: [],
                  count: 0
              });

              currentDate.setDate(currentDate.getDate() + 7);
          }
      });

      bookings.forEach(booking => {
          Object.keys(sessionDetails).forEach(timeSlotKey => {
              sessionDetails[timeSlotKey].forEach(session => {
                  if (!booking.cancellations.some(cancellation => 
                      cancellation.date.toISOString().split('T')[0] === session.date)) {
                      session.participants.push({
                          childId: booking.childId._id,
                          username: booking.childId.username,
                          email: booking.childId.email
                      });
                      session.count++;
                  }
              });
          });
      });

      res.json(sessionDetails);
  } catch (error) {
      console.error('Error calculating sessions per time slot:', error);
      res.status(500).send({ message: "Error calculating sessions per time slot", error: error.toString() });
  }
};

// Calculate sessions for an activity
exports.calculateSessionsPerActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const sessions = [];
    const { startDate, endDate, timeSlots } = activity;
    const start = new Date(startDate);
    const end = new Date(endDate);

    timeSlots.forEach(slot => {
      const current = new Date(start);
      const day = dayOfWeekToNumber(slot.dayOfWeek);
      current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));

      while (current <= end) {
        sessions.push({
          date: current.toISOString().split('T')[0],
          startTime: slot.startTime,
          endTime: slot.endTime,
          dayOfWeek: slot.dayOfWeek
        });
        current.setDate(current.getDate() + 7);
      }
    });

    // Sort sessions by date
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(sessions);
  } catch (error) {
    res.status(500).send({ message: "Error calculating sessions", error: error.toString() });
  }
};

exports.fetchNonCancelledSessions = async (req, res) => {
  try {
    const { activityId, childId } = req.params;
    const activity = await Activity.findById(activityId);
    const booking = await Booking.findOne({ activityId, childId }, 'cancellations');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const calculatedSessions = calculateSessions(activity);
    let cancellations = booking.cancellations || [];

    // Debugging: Outputting current data
    console.log("Calculated Sessions: ", calculatedSessions);
    console.log("Cancellations: ", cancellations);

    const nonCancelledSessions = calculatedSessions.filter(session => {
      return !cancellations.some(cancellation => {
        return session.date === new Date(cancellation.date).toISOString().split('T')[0] && session.startTime === cancellation.startTime;
      });
    });

    res.json(nonCancelledSessions);
  } catch (error) {
    console.error('Error fetching non-cancelled sessions:', error);
    res.status(500).json({ message: 'Error fetching non-cancelled sessions', error: error.toString() });
  }
};

function calculateSessions(activity) {
  let sessions = [];
  const { startDate, endDate, timeSlots } = activity;
  timeSlots.forEach(slot => {
    let currentDate = new Date(startDate);
    const dayOffset = (7 + dayOfWeekToNumber(slot.dayOfWeek) - currentDate.getDay()) % 7;
    currentDate.setDate(currentDate.getDate() + dayOffset);

    while (currentDate <= endDate) {
      sessions.push({
        date: currentDate.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        dayOfWeek: slot.dayOfWeek
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }
  });
  return sessions;
}


function dayOfWeekToNumber(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(day);
}

function nextDay(date, dayOfWeek) {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + (dayOfWeek - result.getDay() + 7) % 7);
  return result;
}

exports.fetchAllNonCancelledSessionsForChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const bookings = await Booking.find({ childId }).populate({
      path: 'activityId',
      select: 'name timeSlots startDate endDate'
    });

    let sessions = [];
    for (let booking of bookings) {
      const { activityId } = booking;
      const calculatedSessions = calculateSessions(activityId);

      calculatedSessions.forEach(session => {
        const isCancelled = booking.cancellations.some(cancellation => 
          new Date(session.date).toISOString().split('T')[0] === new Date(cancellation.date).toISOString().split('T')[0] &&
          session.startTime === cancellation.startTime
        );

        if (!isCancelled) {
          sessions.push({
            activityName: activityId.name,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            activityId: activityId._id
          });
        }
      });
    }

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching non-cancelled sessions for the child across all activities:', error);
    res.status(500).json({ message: "Error fetching non-cancelled sessions for the child across all activities", error: error.message });
  }
};
