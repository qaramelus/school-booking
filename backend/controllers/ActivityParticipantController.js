// Deals with participants for activities
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const { calculateSessionsPerTimeslot } = require('../utils/sessionCalculator');

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
            activityId.timeSlots.forEach(slot => {
                const calculatedSessions = calculateSessionsPerTimeslot(slot, activityId.startDate, activityId.endDate);
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
            });
        }

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching non-cancelled sessions for the child across all activities:', error);
        res.status(500).json({ message: "Error fetching non-cancelled sessions for the child across all activities", error: error.message });
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