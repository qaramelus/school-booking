const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Session = require('../models/Session');
const { calculateSessionsPerTimeslot } = require('../utils/sessionCalculator');

exports.createActivity = async (activityData) => {
    const {
        name,
        description,
        startDate,
        endDate,
        signupStartDate,
        signupEndDate,
        timeSlots,
        createdBy,
        teachers,
        maxParticipants
    } = activityData;

    const newActivity = await Activity.create({
        name,
        description,
        startDate,
        endDate,
        signupStartDate,
        signupEndDate,
        timeSlots,
        createdBy,
        teachers,
        maxParticipants,
        currentParticipants: 0,
        waitlistCount: 0
    });

    await createSessionsForTimeSlots(newActivity._id, timeSlots, startDate, endDate, teachers);

    return newActivity;
};

const createSessionsForTimeSlots = async (activityId, timeSlots, startDate, endDate, teachers) => {
    await Promise.all(timeSlots.map(slot => {
        const sessions = calculateSessionsPerTimeslot(slot, startDate, endDate);
        return Promise.all(sessions.map(session => Session.create({
            activityId,
            locationId: slot.location,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            teachers,
            status: 'scheduled'
        })));
    }));
};

exports.fetchActivities = async () => {
    return await Activity.find({});
};

exports.deleteActivity = async (activityId) => {
    await Activity.findByIdAndDelete(activityId);
    await Session.deleteMany({ activityId });
};

exports.updateActivity = async (activityId, updateData) => {
    const { startDate, endDate, signupStartDate, signupEndDate, timeSlots, teachers } = updateData;
    const activity = await Activity.findById(activityId);

    if (!activity) {
        throw new Error('Activity not found');
    }

    const updatedActivity = await Activity.findByIdAndUpdate(activityId, {
        ...updateData,
        startDate: startDate || activity.startDate,
        endDate: endDate || activity.endDate,
        signupStartDate: signupStartDate || activity.signupStartDate,
        signupEndDate: signupEndDate || activity.signupEndDate
    }, { new: true });

    await Session.deleteMany({ activityId });
    await createSessionsForTimeSlots(activityId, timeSlots || activity.timeSlots, startDate || activity.startDate, endDate || activity.endDate, teachers);

    return updatedActivity;
};

exports.getActivityById = async (id) => {
    const activity = await Activity.findById(id)
        .populate('teachers', 'username')
        .exec();

    if (!activity) {
        throw new Error('Activity not found');
    }

    activity.timeSlots = activity.timeSlots.map(slot => ({
        ...slot,
        sessions: calculateSessionsPerTimeslot(slot, activity.startDate, activity.endDate)
    }));

    return activity;
};

exports.fetchCurrentActivities = async (today) => {
    return await Activity.find({
        startDate: { $lte: today },
        endDate: { $gte: today }
    });
};

exports.fetchFutureActivities = async (today) => {
    return await Activity.find({
        startDate: { $gt: today }
    });
};
