// Manages session-related operations
const { calculateSessionsPerTimeslot, calculateSessionsPerTimeslotWithChanges } = require('../utils/sessionCalculator');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const moment = require('moment'); 

// Calculate sessions for an activity
exports.calculateSessionsPerActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const { startDate, endDate, timeSlots } = activity;
        const sessions = timeSlots.flatMap(slot =>
            calculateSessionsPerTimeslot(slot, startDate, endDate)
        );

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

// Function to cancel a session
exports.cancelSession = async (req, res) => {
    const { activityId, date, startTime, endTime } = req.body;
    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            throw new Error('Activity not found');
        }

        // Find the correct timeslot based on date, startTime, and endTime
        const slotIndex = activity.timeSlots.findIndex(slot =>
            slot.startTime === startTime && slot.endTime === endTime
        );

        if (slotIndex === -1) {
            throw new Error('Slot not found');
        }

        // Add cancellation info
        activity.timeSlots[slotIndex].sessionChanges.push({
            date: new Date(date),
            status: 'cancelled'
        });

        await activity.save();
        res.status(200).json({ message: 'Session cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel session', error: error.toString() });
    }
};

// Function to reschedule a session
exports.rescheduleSession = async (req, res) => {
    const { activityId, currentDate, startTime, endTime, newDate, newStartTime, newEndTime } = req.body;

    // Convert string dates to Date objects
    const parsedCurrentDate = new Date(currentDate);
    const parsedNewDate = new Date(newDate);

    // Check if dates are valid
    if (isNaN(parsedCurrentDate.getTime()) || isNaN(parsedNewDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format provided" });
    }

    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            throw new Error('Activity not found');
        }

        const slotIndex = activity.timeSlots.findIndex(slot =>
            slot.startTime === startTime && slot.endTime === endTime
        );

        if (slotIndex === -1) {
            throw new Error('Slot not found');
        }

        // Add reschedule info
        activity.timeSlots[slotIndex].sessionChanges.push({
            date: parsedCurrentDate,
            status: 'rescheduled',
            rescheduledTo: parsedNewDate,
            newStartTime: newStartTime || startTime,
            newEndTime: newEndTime || endTime
        });

        await activity.save();
        res.status(200).json({ message: 'Session rescheduled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reschedule session', error: error.toString() });
    }
};

// Calculate the current state of sessions per activity with session changes considered
exports.calculateCurrentSessionsPerActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const { startDate, endDate, timeSlots } = activity;
        const sessions = timeSlots.flatMap(slot =>
            calculateSessionsPerTimeslotWithChanges(slot, startDate, endDate)
        );

        // Filter out cancelled sessions if they should not be shown
        const currentSessions = sessions.filter(session => session.status !== 'cancelled');

        res.json(currentSessions);
    } catch (error) {
        res.status(500).send({ message: "Error calculating current sessions", error: error.toString() });
    }
};
