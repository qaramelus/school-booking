const activityService = require('../services/activityService');

exports.createActivity = async (req, res, next) => {
    try {
        const newActivity = await activityService.createActivity(req.body);
        res.status(201).json(newActivity);
    } catch (error) {
        next(error);
    }
};

exports.fetchActivities = async (req, res, next) => {
    try {
        const activities = await activityService.fetchActivities();
        res.json(activities);
    } catch (error) {
        next(error);
    }
};

exports.deleteActivity = async (req, res, next) => {
    try {
        await activityService.deleteActivity(req.params.id);
        res.status(200).send({ message: 'Activity and related sessions deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.updateActivity = async (req, res, next) => {
    try {
        const updatedActivity = await activityService.updateActivity(req.params.id, req.body);
        res.status(200).json(updatedActivity);
    } catch (error) {
        next(error);
    }
};

exports.getActivityById = async (req, res, next) => {
    try {
        const activity = await activityService.getActivityById(req.params.id);
        res.json(activity);
    } catch (error) {
        next(error);
    }
};

exports.fetchCurrentActivities = async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const currentActivities = await activityService.fetchCurrentActivities(today);
        res.json(currentActivities);
    } catch (error) {
        next(error);
    }
};

exports.fetchFutureActivities = async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const futureActivities = await activityService.fetchFutureActivities(today);
        res.json(futureActivities);
    } catch (error) {
        next(error);
    }
};
