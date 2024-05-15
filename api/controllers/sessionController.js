// sessionController.js
const Attendance = require('../models/Attendance'); // Import the Attendance model
const Session = require('../models/Session');


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

exports.fetchSessionsWithParticipants = async (req, res) => {
    try {
        const { activityId } = req.params;
        const sessions = await Session.find({ activityId }).populate({
            path: 'participants',
            model: 'User', // Assuming the model name is 'User'
            select: 'username' // Selecting only the 'username' field of the participant
        }).populate('activityId').populate('locationId');

        // Fetch attendance records for the sessions
        const attendanceRecords = await Attendance.find({ activityId });

        // Map attendance records to session IDs for easier access
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            if (!attendanceMap[record.sessionId]) {
                attendanceMap[record.sessionId] = [];
            }
            attendanceMap[record.sessionId].push(record);
        });

        // Enhance session data to include participant details and attendance status
        const sessionDetails = sessions.map(session => {
            const attendanceForSession = attendanceMap[session._id] || [];
            return {
                sessionId: session._id,
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
                participants: session.participants.map(participant => ({
                    participantId: participant._id,
                    name: participant.username, // Accessing the username field of the participant
                    attended: attendanceForSession.some(record => record.childId.toString() === participant._id.toString())
                    // Add more participant fields as needed
                })),
                // Include other session fields as needed
            };
        });

        res.json(sessionDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions with participants', error: error.message });
    }
};

// Fetch sessions by teacher
exports.fetchSessionsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const sessions = await Session.find({ teachers: teacherId })
            .populate('teachers', 'name')  // Optionally populate teacher details
            .populate('participants', 'name')  // Optionally populate participant details
            .populate('activityId', 'name'); // Populate activity name

        if (!sessions.length) {
            return res.status(404).json({ message: 'No sessions found for this teacher' });
        }

        const formattedSessions = sessions.map(session => ({
            id: session._id,
            activity: session.activityId.name,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            participants: session.participants.map(participant => participant.name),
            numParticipants: session.participants.length, // Calculate number of participants
            status: session.status
        }));

        res.json(formattedSessions);
    } catch (error) {
        console.error('Error fetching sessions by teacher:', error);
        res.status(500).send({ message: 'Failed to fetch sessions', error: error.toString() });
    }
};