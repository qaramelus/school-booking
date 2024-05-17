const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { calculateSessionsPerTimeslot } = require('../utils/sessionCalculator');

exports.getActivityParticipants = async (activityId) => {
    const bookings = await Booking.find({ activityId }).populate('userId');
    return bookings.map(booking => booking.userId);
};

exports.fetchActivitiesWithParticipants = async () => {
    let activities = await Activity.find({});
    return await Promise.all(activities.map(async (activity) => {
        const participantCount = await Booking.countDocuments({ activityId: activity._id });
        return { ...activity.toObject(), participantCount };
    }));
};

exports.getActivityWithParticipants = async (activityId) => {
    const activity = await Activity.findById(activityId);
    if (!activity) {
        throw new Error('Activity not found');
    }
    const participantCount = await Booking.countDocuments({ activityId: activity._id });
    return { ...activity.toObject(), participantCount };
};

exports.fetchActivitiesForTeacher = async (teacherId) => {
    return await Activity.find({ teachers: teacherId })
        .populate('teachers', 'username')
        .exec();
};

exports.fetchActivitiesForParents = async (parentId) => {
    const parent = await User.findById(parentId);
    if (!parent) {
        throw new Error('Parent not found');
    }
    const children = await User.find({ parent: parentId }).select('_id');
    if (!children.length) {
        throw new Error('No children found for this parent');
    }
    const childIds = children.map(child => child._id);
    const bookings = await Booking.find({ childId: { $in: childIds } }).populate({
        path: 'activityId',
        populate: { path: 'teachers', select: 'name username' }
    });
    if (!bookings.length) {
        throw new Error('No bookings found for these children');
    }

    const activities = {};
    bookings.forEach(booking => {
        const activity = booking.activityId;
        if (!activity) return;
        if (!activities[activity._id]) {
            activities[activity._id] = {
                ...activity.toObject(),
                bookings: []
            };
        }
        activities[activity._id].bookings.push({
            bookingId: booking._id,
            childId: booking.childId,
            dateBooked: booking.dateBooked,
            cancellations: booking.cancellations
        });
    });

    return Object.values(activities);
};

exports.fetchAllNonCancelledSessionsForChild = async (childId) => {
    const bookings = await Booking.find({ childId }).populate({
        path: 'activityId',
        select: 'name timeSlots startDate endDate'
    });

    let sessions = [];
    for (let booking of bookings) {
        const { activityId } = booking;
        activityId.timeSlots.forEach(slot => {
            const calculatedSessions = calculateSessionsPerTimeslot(slot, activityId.startDate, activityId.endDate);
            calculatedSessions.forEach(session => {
                const isCancelled = booking.cancellations.some(cancellation =>
                    new Date(session.date).toISOString().split('T')[0] === new Date(cancellation.date).toISOString().split('T')[0] &&
                    session.startTime === cancellation.startTime
                );

                if (!isCancelled) {
                    sessions.push({
                        activityName: activityId.name,
                        date: session.date,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        activityId: activityId._id
                    });
                }
            });
        });
    }

    return sessions;
};

exports.fetchNonCancelledSessions = async (activityId, childId) => {
    const activity = await Activity.findById(activityId);
    const booking = await Booking.findOne({ activityId, childId }, 'cancellations');

    if (!activity) {
        throw new Error('Activity not found');
    }
    if (!booking) {
        throw new Error('Booking not found');
    }

    const calculatedSessions = calculateSessionsPerTimeslot(activity);
    const cancellations = booking.cancellations || [];

    return calculatedSessions.filter(session => {
        return !cancellations.some(cancellation => {
            return session.date === new Date(cancellation.date).toISOString().split('T')[0] && session.startTime === cancellation.startTime;
        });
    });
};
