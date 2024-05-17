// services/SessionService.js
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');

exports.fetchSessionsByActivityId = async (activityId) => {
    return await Session.find({ activityId }).populate('locationId');
};

exports.fetchSessionById = async (sessionId) => {
    return await Session.findById(sessionId).populate('locationId');
};

exports.rescheduleSession = async (sessionId, { newDate, newStartTime, newEndTime, newLocationId }) => {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    session.date = newDate || session.date;
    session.startTime = newStartTime || session.startTime;
    session.endTime = newEndTime || session.endTime;
    if (newLocationId) session.locationId = newLocationId;
    session.status = 'rescheduled';

    await session.save();
    return session;
};

exports.fetchAllSessions = async () => {
    return await Session.find({}).populate('locationId').populate('activityId', 'name description');
};

exports.fetchSessionsForParticipant = async (childId) => {
    const sessions = await Session.find({
        participants: childId,
        status: { $ne: 'cancelled' }
    }).populate({
        path: 'activityId',
        select: 'name description'
    }).populate({
        path: 'locationId',
        select: 'name'
    });

    return sessions.map(session => ({
        ...session.toObject(),
        activityName: session.activityId.name,
        activityDescription: session.activityId.description,
        locationName: session.locationId.name
    }));
};

exports.markAsAbsent = async (sessionId, childId) => {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.absentees.includes(childId)) {
        session.absentees.push(childId);
        await session.save();
    }
    return session;
};

exports.unmarkAsAbsent = async (sessionId, childId) => {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    session.absentees = session.absentees.filter(id => id.toString() !== childId);
    await session.save();
    return session;
};

exports.fetchSessionsWithParticipants = async (activityId) => {
    const sessions = await Session.find({ activityId }).populate({
        path: 'participants',
        model: 'User',
        select: 'username'
    }).populate('activityId').populate('locationId');

    const attendanceRecords = await Attendance.find({ activityId });

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
        if (!attendanceMap[record.sessionId]) {
            attendanceMap[record.sessionId] = [];
        }
        attendanceMap[record.sessionId].push(record);
    });

    return sessions.map(session => {
        const attendanceForSession = attendanceMap[session._id] || [];
        return {
            sessionId: session._id,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            participants: session.participants.map(participant => ({
                participantId: participant._id,
                name: participant.username,
                attended: attendanceForSession.some(record => record.childId.toString() === participant._id.toString())
            })),
        };
    });
};

exports.fetchSessionsByTeacher = async (teacherId) => {
    const sessions = await Session.find({ teachers: teacherId })
        .populate('teachers', 'name')
        .populate('participants', 'name')
        .populate('activityId', 'name');

    if (!sessions.length) throw new Error('No sessions found for this teacher');

    return sessions.map(session => ({
        id: session._id,
        activity: session.activityId.name,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        participants: session.participants.map(participant => participant.name),
        numParticipants: session.participants.length,
        status: session.status
    }));
};
