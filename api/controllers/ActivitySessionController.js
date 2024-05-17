const activitySessionService = require('../services/activitySessionService');

exports.calculateSessionsPerActivity = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const sessions = await activitySessionService.calculateSessionsPerActivity(activityId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

exports.calculateTimeslotsPerActivity = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const timeSlotsInfo = await activitySessionService.calculateTimeslotsPerActivity(activityId);
        res.json(timeSlotsInfo);
    } catch (error) {
        next(error);
    }
};

exports.fetchParticipantsPerTimeSlot = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const participants = await activitySessionService.fetchParticipantsPerTimeSlot(activityId);
        res.json(participants);
    } catch (error) {
        next(error);
    }
};

exports.calculateSessionsPerTimeSlot = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const sessionDetails = await activitySessionService.calculateSessionsPerTimeSlot(activityId);
        res.json(sessionDetails);
    } catch (error) {
        next(error);
    }
};

exports.cancelSession = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const { date, startTime, endTime } = req.body;
        const response = await activitySessionService.cancelSession(activityId, date, startTime, endTime);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.rescheduleSession = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const { currentDate, startTime, endTime, newDate, newStartTime, newEndTime } = req.body;
        const response = await activitySessionService.rescheduleSession(activityId, currentDate, startTime, endTime, newDate, newStartTime, newEndTime);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.calculateCurrentSessionsPerActivity = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const currentSessions = await activitySessionService.calculateCurrentSessionsPerActivity(activityId);
        res.json(currentSessions);
    } catch (error) {
        next(error);
    }
};
