const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');

// Method to mark or update a child's attendance for a session
exports.setAttendance = async (req, res) => {
  const { sessionId, childId } = req.params;
  const { attended } = req.body;

  try {
      const session = await Session.findById(sessionId).populate('activityId');
      if (!session) {
          return res.status(404).json({ message: 'Session not found' });
      }

      let attendance = await Attendance.findOne({ sessionId, childId });
      if (attendance) {
          attendance.attended = attended;
      } else {
          attendance = new Attendance({
              activityId: session.activityId,
              sessionId,
              childId,
              attended
          });
      }
      await attendance.save();
      res.status(200).json({ message: 'Attendance status updated', attendance });
  } catch (error) {
      res.status(500).json({ message: 'Failed to update attendance', error });
  }
};

// Method to get all attendance records for a particular activity
exports.getAttendanceForActivity = async (req, res) => {
  const { activityId } = req.params;

  try {
      const attendances = await Attendance.find({ activityId }).populate('childId', 'name').populate('sessionId');
      res.status(200).json(attendances);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching attendance', error });
  }
};


// Function to fetch all sessions with their attendance records for an activity
exports.getSessionsWithAttendance = async (req, res) => {
    try {
        const { activityId } = req.params;
        const sessions = await Session.find({ activityId }).populate('locationId');
        const attendanceRecords = await Attendance.find({ activityId }).populate('childId', 'name');

        const sessionDetails = sessions.map(session => {
            const attendees = attendanceRecords.filter(record => record.sessionId.toString() === session._id.toString());
            return {
                ...session._doc,
                attendees: attendees.map(a => ({
                    childId: a.childId._id,
                    childName: a.childId.name,
                    attended: a.attended
                }))
            };
        });

        res.json(sessionDetails);
    } catch (error) {
        console.error('Error fetching sessions with attendance:', error);
        res.status(500).json({ message: 'Error fetching sessions with attendance', error: error.message });
    }
};

