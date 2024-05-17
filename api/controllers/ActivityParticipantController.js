const activityParticipantService = require('../services/activityParticipantService');

exports.getActivityParticipants = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const participants = await activityParticipantService.getActivityParticipants(activityId);
        res.json(participants);
    } catch (error) {
        next(error);
    }
};

exports.fetchActivitiesWithParticipants = async (req, res, next) => {
    try {
        const activities = await activityParticipantService.fetchActivitiesWithParticipants();
        res.json(activities);
    } catch (error) {
        next(error);
    }
};

exports.getActivityWithParticipants = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const activity = await activityParticipantService.getActivityWithParticipants(activityId);
        res.json(activity);
    } catch (error) {
        next(error);
    }
};

exports.fetchActivitiesForTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const activities = await activityParticipantService.fetchActivitiesForTeacher(teacherId);
        res.json(activities);
    } catch (error) {
        next(error);
    }
};

exports.fetchActivitiesForParents = async (req, res, next) => {
    try {
        const { parentId } = req.params;
        const activities = await activityParticipantService.fetchActivitiesForParents(parentId);
        res.json(activities);
    } catch (error) {
        next(error);
    }
};

exports.fetchAllNonCancelledSessionsForChild = async (req, res, next) => {
    try {
        const { childId } = req.params;
        const sessions = await activityParticipantService.fetchAllNonCancelledSessionsForChild(childId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

exports.fetchNonCancelledSessions = async (req, res, next) => {
    try {
        const { activityId, childId } = req.params;
        const sessions = await activityParticipantService.fetchNonCancelledSessions(activityId, childId);
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};
