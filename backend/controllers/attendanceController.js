// controllers/attendanceController.js
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');


// Function to mark attendance per session
exports.markAttendance = async (req, res) => {
  try {
    const { activityId, childId, timeSlot, attended } = req.body; 

    // Check if all required fields are provided
    if (!activityId || !childId || !timeSlot || !attended) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create a new attendance record
    const attendanceRecord = new Attendance({
      activityId: activityId,
      childId: childId,
      timeSlot: timeSlot,
      attended: attended
    });

    // Save the attendance record to the database
    await attendanceRecord.save();

    console.log('Attendance marked successfully:', attendanceRecord);
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

    // Fetch attendance records for the given activityId
    const attendanceRecords = await Attendance.find({ activityId });

    res.status(200).json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Function to fetch attendance per timeslot for a specific activity
exports.getAttendancePerTimeslot = async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Fetch attendance records for the given activity
        const attendanceRecords = await Attendance.find({ activityId, attended: true }).populate('childId', 'name');

        let timeslotAttendance = {};

        // Generate all possible sessions for each timeslot and initialize attendance tracking
        activity.timeSlots.forEach(slot => {
            const sessions = calculateSessionsPerTimeslot(slot, activity.startDate, activity.endDate);
            sessions.forEach(session => {
                const key = `${session.date} ${slot.startTime}-${slot.endTime}`;
                timeslotAttendance[key] = {
                    date: session.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    children: []
                };
            });
        });

        // Map attendance records to their corresponding timeslot sessions ensuring unique entries
        attendanceRecords.forEach(record => {
            const recordDate = new Date(record.timeSlot.startDate).toISOString().split('T')[0]; // Handling Date object
            const key = `${recordDate} ${record.timeSlot.startTime}-${record.timeSlot.endTime}`;
            if (timeslotAttendance[key]) {
                const childEntry = {
                    childId: record.childId._id,
                    childName: record.childId.name
                };
                // Ensure that the child is only added once per session
                if (!timeslotAttendance[key].children.some(child => child.childId.equals(childEntry.childId))) {
                    timeslotAttendance[key].children.push(childEntry);
                }
            }
        });

        res.json(Object.values(timeslotAttendance));
    } catch (error) {
        console.error('Error fetching attendance per timeslot:', error);
        res.status(500).json({ message: 'Error fetching attendance per timeslot', error: error.message });
    }
};

// Helper function to calculate all sessions for a given timeslot
function calculateSessionsPerTimeslot(slot, startDate, endDate) {
    let sessions = [];
    let currentDate = new Date(startDate);
    currentDate = nextDay(currentDate, dayOfWeekToNumber(slot.dayOfWeek));

    while (currentDate <= new Date(endDate)) {
        sessions.push({
            date: currentDate.toISOString().split('T')[0], // Ensuring date format matches
            startTime: slot.startTime,
            endTime: slot.endTime
        });
        currentDate.setDate(currentDate.getDate() + 7);  // Move to the next week
    }

    return sessions;
}

function dayOfWeekToNumber(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
}

function nextDay(date, dayOfWeek) {
    date = new Date(date.getTime());  // Create a new date object to modify
    date.setDate(date.getDate() + (dayOfWeek - date.getDay() + 7) % 7);
    if (date.getDay() !== dayOfWeek) {
        date.setDate(date.getDate() + 7);
    }
    return date;
}

// Enhanced function to fetch session information with participant attendance
exports.getEnhancedSessionInfo = async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Fetch bookings and attendance records for the given activity
        const bookings = await Booking.find({ activityId }).populate('childId');
        const attendanceRecords = await Attendance.find({ activityId }).populate('childId');

        let timeslotAttendance = {};

        // Generate timeslot sessions and initialize attendance tracking
        activity.timeSlots.forEach(slot => {
            const sessions = calculateSessionsPerTimeslot(slot, activity.startDate, activity.endDate);
            sessions.forEach(session => {
                const key = `${session.date} ${session.startTime}-${session.endTime}`;
                timeslotAttendance[key] = {
                    date: session.date,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    participants: []
                };
            });
        });

        // Overlay attendance information on bookings
        bookings.forEach(booking => {
            const participant = {
                childId: booking.childId._id,
                childName: booking.childId.name,
                email: booking.childId.email,
                attended: 'unconfirmed'
            };
            const key = `${booking.date} ${booking.startTime}-${booking.endTime}`;
            if (timeslotAttendance[key]) {
                timeslotAttendance[key].participants.push(participant);
            }
        });

        // Update attendance status for participants
        attendanceRecords.forEach(record => {
            const key = `${record.date} ${record.startTime}-${record.endTime}`;
            const participant = timeslotAttendance[key].participants.find(participant => participant.childId.equals(record.childId));
            if (participant) {
                participant.attended = record.attended ? 'attended' : 'absent';
            }
        });

        res.json(Object.values(timeslotAttendance));
    } catch (error) {
        console.error('Error fetching enhanced session info:', error);
        res.status(500).json({ message: 'Error fetching enhanced session info', error: error.message });
    }
};


function calculateSessionsPerTimeslot(slot, startDate, endDate) {
    let sessions = [];
    let currentDate = new Date(startDate);
    currentDate = nextDay(currentDate, dayOfWeekToNumber(slot.dayOfWeek));

    while (currentDate <= new Date(endDate)) {
        sessions.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: slot.startTime,
            endTime: slot.endTime
        });
        currentDate.setDate(currentDate.getDate() + 7);
    }

    return sessions;
}

function dayOfWeekToNumber(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
}

function nextDay(date, dayOfWeek) {
    date = new Date(date.getTime());
    date.setDate(date.getDate() + (dayOfWeek - date.getDay() + 7) % 7);
    if (date.getDay() !== dayOfWeek) {
        date.setDate(date.getDate() + 7);
    }
    return date;
}
