const sessionService = require('../services/sessionService');

exports.fetchSessionsByActivityId = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const sessions = await sessionService.fetchSessionsByActivityId(activityId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

exports.fetchSessionById = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const session = await sessionService.fetchSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        next(error);
    }
};

exports.rescheduleSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const session = await sessionService.rescheduleSession(sessionId, req.body);
        res.status(200).json({ message: 'Session rescheduled successfully', session });
    } catch (error) {
        next(error);
    }
};

exports.fetchAllSessions = async (req, res, next) => {
    try {
        const sessions = await sessionService.fetchAllSessions();
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

exports.fetchSessionsForParticipant = async (req, res, next) => {
    try {
        const { childId } = req.params;
        const sessions = await sessionService.fetchSessionsForParticipant(childId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

exports.markAsAbsent = async (req, res, next) => {
    try {
        const { sessionId, childId } = req.params;
        const session = await sessionService.markAsAbsent(sessionId, childId);
        res.status(200).json({ message: 'Child marked as absent', session });
    } catch (error) {
        next(error);
    }
};

exports.unmarkAsAbsent = async (req, res, next) => {
    try {
        const { sessionId, childId } = req.params;
        const session = await sessionService.unmarkAsAbsent(sessionId, childId);
        res.status(200).json({ message: 'Child unmarked as absent', session });
    } catch (error) {
        next(error);
    }
};

exports.fetchSessionsWithParticipants = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const sessionDetails = await sessionService.fetchSessionsWithParticipants(activityId);
        res.json(sessionDetails);
    } catch (error) {
        next(error);
    }
};

exports.fetchSessionsByTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const sessions = await sessionService.fetchSessionsByTeacher(teacherId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};
