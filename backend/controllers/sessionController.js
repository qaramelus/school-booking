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

exports.fetchSessionsForParticipant = async (req, res) => {
    try {
        const { childId } = req.params; // childId passed as URL parameter
        const sessions = await Session.find({
            participants: childId,
            status: { $ne: 'cancelled' } // Excludes cancelled sessions
        }).populate({
            path: 'activityId',
            select: 'name description' // Only fetch the name and description of the activity
        }).populate({
            path: 'locationId',
            select: 'name' // Assuming you might also want to show the location name
        });

        res.json(sessions.map(session => ({
            ...session.toObject(),
            activityName: session.activityId.name, // Flatten the activity name for easier access
            activityDescription: session.activityId.description,
            locationName: session.locationId.name
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions for participant', error: error.message });
    }
};

// Method to mark a child as absent for a session
exports.markAsAbsent = async (req, res) => {
    try {
        const { sessionId, childId } = req.params;
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        // Add childId to the absentees array if not already present
        if (!session.absentees.includes(childId)) {
            session.absentees.push(childId);
            await session.save();
        }
        res.status(200).json({ message: 'Child marked as absent', session });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark as absent', error: error.message });
    }
};

// Method to unmark a child as absent for a session
exports.unmarkAsAbsent = async (req, res) => {
    try {
        const { sessionId, childId } = req.params;
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        // Remove childId from the absentees array if present
        session.absentees = session.absentees.filter(id => id.toString() !== childId);
        await session.save();
        res.status(200).json({ message: 'Child unmarked as absent', session });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unmark as absent', error: error.message });
    }
};