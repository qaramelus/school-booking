// Manages session-related operations
const { calculateSessionsPerTimeslot } = require('../utils/sessionCalculator');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

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