// controllers/attendanceController.js
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');

// Function to mark attendance per session
exports.markAttendance = async (req, res) => {
  try {
    const { activityId, childId, timeSlot, attended } = req.body;
    if (!activityId || !childId || !timeSlot || !attended) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const attendanceRecord = new Attendance({
      activityId: activityId,
      childId: childId,
      timeSlot: timeSlot,
      attended: attended
    });

    await attendanceRecord.save();
    res.status(200).json({ message: 'Attendance marked successfully', attendanceRecord });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

// Function to fetch attendance for a specific activity
exports.getAttendanceForActivity = async (req, res) => {
    try {
      const { activityId } = req.params;
      const attendanceRecords = await Attendance.find({ activityId });
      res.status(200).json({ attendanceRecords });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
    }
  };

// Helper function to calculate all sessions for a given timeslot
function calculateSessionsPerTimeslot(slot, startDate, endDate) {
    let sessions = [];
    let currentDate = nextDay(new Date(startDate), dayOfWeekToNumber(slot.dayOfWeek));

    while (currentDate <= new Date(endDate)) {
        sessions.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: slot.startTime,
            endTime: slot.endTime
        });
        currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
    }

    // Sort sessions by date to ensure they are in chronological order
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sessions;
}


// Converts day of the week to numerical representation (Sunday = 0, Monday = 1, ...)
function dayOfWeekToNumber(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
}

// Calculates the next occurrence of a given weekday from a specified date
function nextDay(date, dayOfWeek) {
    date = new Date(date.getTime()); // Clone the date to avoid modifying the original
    const dayDiff = (dayOfWeek - date.getDay() + 7) % 7;
    if (dayDiff !== 0) {  // If not already on the required day, adjust the date
        date.setDate(date.getDate() + dayDiff);
    }
    return date;
}

// Function to fetch attendance per timeslot for a specific activity
exports.getAttendancePerTimeslot = async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const attendanceRecords = await Attendance.find({ activityId, attended: true }).populate('childId', 'name');
        let timeslotAttendance = {};

        activity.timeSlots.forEach(slot => {
            const sessions = calculateSessionsPerTimeslot(slot, activity.startDate, activity.endDate);
            sessions.forEach(session => {
                const key = `${session.date} ${session.startTime}-${session.endTime}`;
                timeslotAttendance[key] = {
                    date: session.date,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    children: []
                };
            });
        });

        attendanceRecords.forEach(record => {
            const recordDate = new Date(record.timeSlot.startDate).toISOString().split('T')[0];
            const key = `${recordDate} ${record.timeSlot.startTime}-${record.timeSlot.endTime}`;
            if (timeslotAttendance[key]) {
                const childEntry = {
                    childId: record.childId._id,
                    childName: record.childId.name
                };
                if (!timeslotAttendance[key].children.some(child => child.childId.equals(childEntry.childId))) {
                    timeslotAttendance[key].children.push(childEntry);
                }
            }
        });

        res.json(Object.values(timeslotAttendance).sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
        console.error('Error fetching attendance per timeslot:', error);
        res.status(500).json({ message: 'Error fetching attendance per timeslot', error: error.message });
    }
};

// Enhanced function to fetch session information with participant attendance
exports.getEnhancedSessionInfo = async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const bookings = await Booking.find({ activityId: activityId, cancelled: false }).populate('childId');
        const attendanceRecords = await Attendance.find({ activityId: activityId }).populate('childId');

        let sessions = [];

        activity.timeSlots.forEach(slot => {
            let sessionDates = calculateSessionsPerTimeslot(slot, activity.startDate, activity.endDate);
            sessionDates.forEach(session => {
                const sessionKey = `${session.date} ${session.startTime}-${session.endTime}`;
                const participants = bookings.map(booking => ({
                    childId: booking.childId._id.toString(),
                    childName: booking.childId.username,
                    email: booking.childId.email,
                    attended: 'unconfirmed' // Default status
                }));

                participants.forEach(participant => {
                    const attendance = attendanceRecords.find(record =>
                        record.childId._id.toString() === participant.childId &&
                        record.timeSlot.startDate.toISOString().split('T')[0] === session.date &&
                        record.timeSlot.startTime === session.startTime &&
                        record.timeSlot.endTime === session.endTime
                    );
                    if (attendance) {
                        participant.attended = attendance.attended ? 'attended' : 'absent';
                    }
                });

                sessions.push({
                    date: session.date,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    participants: participants
                });
            });
        });

        // Sort the sessions array by date before sending it in the response
        sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching enhanced session info:', error);
        res.status(500).json({ message: 'Error fetching enhanced session info', error: error.message });
    }
};
