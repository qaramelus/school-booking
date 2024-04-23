const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');

// Function to mark attendance per session
exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, childId, attended } = req.body;
        if (!sessionId || !childId || attended === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const attendanceRecord = new Attendance({
            activityId: session.activityId,
            childId: childId,
            sessionId: sessionId,
            attended: attended
        });

        await attendanceRecord.save();
        res.status(200).json({ message: 'Attendance marked successfully', attendanceRecord });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
    }
};

// Function to fetch all attendance records for a specific session
exports.getAttendanceForSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const attendanceRecords = await Attendance.find({ sessionId }).populate('childId', 'name');
        res.status(200).json({ attendanceRecords });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
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

