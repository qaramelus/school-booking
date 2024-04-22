// sessionController.js
const Activity = require('../models/Activity');

// Function to cancel a session
exports.cancelSession = async (req, res) => {
    const { activityId, slotId, date } = req.body;
    try {
        const activity = await Activity.findById(activityId);
        const slotIndex = activity.timeSlots.findIndex(slot => slot._id.toString() === slotId);
        if (slotIndex === -1) throw new Error('Slot not found');

        // Add cancellation info
        activity.timeSlots[slotIndex].sessionChanges.push({
            date: new Date(date),
            status: 'cancelled'
        });

        await activity.save();
        res.status(200).json({ message: 'Session cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel session', error: error.toString() });
    }
};

// Function to reschedule a session
exports.rescheduleSession = async (req, res) => {
    const { activityId, slotId, currentDate, newDate } = req.body;
    try {
        const activity = await Activity.findById(activityId);
        const slotIndex = activity.timeSlots.findIndex(slot => slot._id.toString() === slotId);
        if (slotIndex === -1) throw new Error('Slot not found');

        // Add reschedule info
        activity.timeSlots[slotIndex].sessionChanges.push({
            date: new Date(currentDate),
            status: 'rescheduled',
            rescheduledTo: new Date(newDate)
        });

        await activity.save();
        res.status(200).json({ message: 'Session rescheduled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reschedule session', error: error.toString() });
    }
};
