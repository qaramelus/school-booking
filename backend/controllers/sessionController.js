const Session = require('../models/Session');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');

exports.cancelSession = async (req, res) => {
  try {
    const { activityId, date, startTime, endTime, cancellationReason } = req.body;

    // Create a new session with the provided details
    const session = new Session({
      activityId,
      date,
      startTime,
      endTime,
      cancelled: true,
      cancellationReason
    });

    // Save the session
    await session.save();

    res.status(200).json({ message: 'Session cancelled successfully', session });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ message: 'Error cancelling session', error: error.message });
  }
};

exports.rescheduleSession = async (req, res) => {
  try {
    const { activityId, oldDate, oldStartTime, oldEndTime, newDate, newStartTime, newEndTime } = req.body;

    // Assuming you have logic to find the session to be rescheduled based on old date, start time, and end time
    const sessionToReschedule = await Session.findOne({
      activityId,
      date: oldDate,
      startTime: oldStartTime,
      endTime: oldEndTime
    });

    if (!sessionToReschedule) {
      return res.status(404).json({ message: 'Session not found for rescheduling' });
    }

    // Update session details with new start and end times
    sessionToReschedule.date = newDate;
    sessionToReschedule.startTime = newStartTime;
    sessionToReschedule.endTime = newEndTime;
    sessionToReschedule.rescheduled = true;

    // Save the updated session
    await sessionToReschedule.save();

    res.status(200).json({ message: 'Session rescheduled successfully', session: sessionToReschedule });
  } catch (error) {
    console.error('Error rescheduling session:', error);
    res.status(500).json({ message: 'Error rescheduling session', error: error.message });
  }
};
