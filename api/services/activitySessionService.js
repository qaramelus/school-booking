// services/activitySessionService.js
const { calculateSessionsPerTimeslot, calculateSessionsPerTimeslotWithChanges } = require('../utils/sessionCalculator');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const moment = require('moment');

exports.calculateSessionsPerActivity = async (activityId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const { startDate, endDate, timeSlots } = activity;
    const sessions = timeSlots.flatMap(slot =>
        calculateSessionsPerTimeslot(slot, startDate, endDate)
    );

    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sessions;
};

exports.calculateTimeslotsPerActivity = async (activityId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const bookings = await Booking.find({ activityId: activity._id })
        .populate('childId', 'username email')
        .lean();

    let timeSlotsInfo = {};

    activity.timeSlots.forEach(slot => {
        const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
        timeSlotsInfo[key] = {
            participants: [],
            count: 0
        };
    });

    bookings.forEach(booking => {
        booking.timeSlots.forEach(slot => {
            const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
            const isCancelled = booking.cancellations.some(cancellation =>
                cancellation.date.toISOString() === slot.startDate.toISOString() &&
                cancellation.startTime === slot.startTime);

            if (!isCancelled && timeSlotsInfo[key]) {
                timeSlotsInfo[key].participants.push({
                    childId: booking.childId._id,
                    username: booking.childId.username,
                    email: booking.childId.email
                });
                timeSlotsInfo[key].count++;
            }
        });
    });

    return timeSlotsInfo;
};

exports.fetchParticipantsPerTimeSlot = async (activityId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const bookings = await Booking.find({ activityId: activity._id })
        .populate('childId', 'username email')
        .lean();

    let timeSlotParticipants = {};

    activity.timeSlots.forEach(slot => {
        const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
        timeSlotParticipants[key] = [];
    });

    bookings.forEach(booking => {
        booking.timeSlots.forEach(slot => {
            const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
            const isCancelled = booking.cancellations.some(cancellation =>
                cancellation.date.toISOString() === slot.startDate.toISOString() &&
                cancellation.startTime === slot.startTime);

            if (!isCancelled && timeSlotParticipants[key]) {
                timeSlotParticipants[key].push({
                    childId: booking.childId._id,
                    username: booking.childId.username,
                    email: booking.childId.email
                });
            }
        });
    });

    return timeSlotParticipants;
};

exports.calculateSessionsPerTimeSlot = async (activityId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const bookings = await Booking.find({ activityId: activity._id })
        .populate('childId', 'username email')
        .lean();

    let sessionDetails = {};

    activity.timeSlots.forEach(slot => {
        const key = `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`;
        sessionDetails[key] = [];

        let currentDate = new Date(activity.startDate);
        const dayOfWeek = dayOfWeekToNumber(slot.dayOfWeek);
        currentDate = nextDay(currentDate, dayOfWeek);

        while (currentDate <= activity.endDate) {
            const dateString = currentDate.toISOString().split('T')[0];

            sessionDetails[key].push({
                date: dateString,
                startTime: slot.startTime,
                endTime: slot.endTime,
                participants: [],
                count: 0
            });

            currentDate.setDate(currentDate.getDate() + 7);
        }
    });

    bookings.forEach(booking => {
        Object.keys(sessionDetails).forEach(timeSlotKey => {
            sessionDetails[timeSlotKey].forEach(session => {
                if (!booking.cancellations.some(cancellation =>
                    cancellation.date.toISOString().split('T')[0] === session.date)) {
                    session.participants.push({
                        childId: booking.childId._id,
                        username: booking.childId.username,
                        email: booking.childId.email
                    });
                    session.count++;
                }
            });
        });
    });

    return sessionDetails;
};

exports.cancelSession = async (activityId, date, startTime, endTime) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const slotIndex = activity.timeSlots.findIndex(slot =>
        slot.startTime === startTime && slot.endTime === endTime
    );

    if (slotIndex === -1) {
        throw new Error('Slot not found');
    }

    activity.timeSlots[slotIndex].sessionChanges.push({
        date: new Date(date),
        status: 'cancelled'
    });

    await activity.save();
    return { message: 'Session cancelled successfully' };
};

exports.rescheduleSession = async (activityId, currentDate, startTime, endTime, newDate, newStartTime, newEndTime) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const slotIndex = activity.timeSlots.findIndex(slot =>
        slot.startTime === startTime && slot.endTime === endTime
    );

    if (slotIndex === -1) {
        throw new Error('Slot not found');
    }

    activity.timeSlots[slotIndex].sessionChanges.push({
        date: new Date(currentDate),
        status: 'rescheduled',
        rescheduledTo: new Date(newDate),
        newStartTime: newStartTime || startTime,
        newEndTime: newEndTime || endTime
    });

    await activity.save();
    return { message: 'Session rescheduled successfully' };
};

exports.calculateCurrentSessionsPerActivity = async (activityId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }

    const { startDate, endDate, timeSlots } = activity;
    const sessions = timeSlots.flatMap(slot =>
        calculateSessionsPerTimeslotWithChanges(slot, startDate, endDate)
    );

    const currentSessions = sessions.filter(session => session.status !== 'cancelled');
    return currentSessions;
};
