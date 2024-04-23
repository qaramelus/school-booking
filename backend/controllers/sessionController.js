// sessionController.js
const Session = require('../models/Session'); // Ensure path correctness

exports.fetchSessionsByActivityId = async (req, res) => {
    try {
        const { activityId } = req.params;
        const sessions = await Session.find({ activityId }).populate('locationId');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions', error: error.message });
    }
};

exports.fetchSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId).populate('locationId');
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the session', error: error.message });
    }
};

exports.rescheduleSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { newDate, newStartTime, newEndTime, newLocationId } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.date = newDate || session.date;
        session.startTime = newStartTime || session.startTime;
        session.endTime = newEndTime || session.endTime;
        if (newLocationId) session.locationId = newLocationId;
        session.status = 'rescheduled';

        await session.save();
        res.status(200).json({ message: 'Session rescheduled successfully', session });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reschedule session', error: error.message });
    }
};

exports.fetchAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find({}).populate('locationId').populate('activityId', 'name description');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all sessions', error: error.message });
    }
};