// bookingController.js
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const User = require('../models/User'); 


// Create a new booking
exports.createBooking = async (req, res) => {
  try {
      const { childId, activityId } = req.body;
      const activity = await Activity.findById(activityId);
      if (!activity) {
          return res.status(404).json({ message: 'Activity not found' });
      }

      const currentBookings = await Booking.countDocuments({
          activityId,
          status: 'confirmed'
      });

      let newBooking;
      if (currentBookings < activity.maxParticipants) {
          const sessions = await Session.find({ activityId });
          newBooking = await Booking.create({
              childId,
              activityId,
              status: 'confirmed',
              sessions: sessions.map(session => session._id)  // Store session IDs in the booking
          });

          await Activity.findByIdAndUpdate(activityId, { $inc: { currentParticipants: 1 } });
          sessions.forEach(async session => {
              session.participants.push(childId);
              await session.save();
          });
      } else {
          newBooking = await Booking.create({
              childId,
              activityId,
              status: 'waitlisted'
          });

          await Activity.findByIdAndUpdate(activityId, { $inc: { waitlistCount: 1 } });
      }

      res.status(201).json(newBooking);
  } catch (error) {
      console.error('Failed to create booking:', error);
      res.status(400).json({ message: 'Failed to book activity', error: error.message });
  }
};

// Delete a booking and potentially promote someone from the waiting list
exports.deleteBooking = async (req, res) => {
  try {
      const bookingId = req.params.bookingId;
      const booking = await Booking.findById(bookingId);
      if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.status === 'confirmed') {
          const sessions = await Session.find({ _id: { $in: booking.sessions } });
          sessions.forEach(async session => {
              session.participants.pull(booking.childId);
              await session.save();
          });
      }

      await Booking.findByIdAndDelete(bookingId);
      const update = booking.status === 'confirmed' ? { $inc: { currentParticipants: -1 } } : { $inc: { waitlistCount: -1 } };
      await Activity.findByIdAndUpdate(booking.activityId, update);

      if (booking.status === 'confirmed') {
          const waitlistedBooking = await Booking.findOneAndUpdate(
              { activityId: booking.activityId, status: 'waitlisted' },
              { status: 'confirmed' },
              { new: true }
          );

          if (waitlistedBooking) {
              await Activity.findByIdAndUpdate(booking.activityId, { $inc: { currentParticipants: 1, waitlistCount: -1 } });
              const waitlistSessions = await Session.find({ activityId: booking.activityId });
              waitlistSessions.forEach(async session => {
                  session.participants.push(waitlistedBooking.childId);
                  await session.save();
              });
              waitlistedBooking.sessions = waitlistSessions.map(session => session._id);
              await waitlistedBooking.save();
          }
      }

      res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
      console.error('Failed to delete booking:', error);
      res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
};


// Function to fetch all bookings for a specific activity
exports.fetchBookingsForActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const bookings = await Booking.find({ activityId: activityId }).populate('childId');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings for activity:', error);
    res.status(500).json({ message: "Error fetching bookings for activity", error: error.message });
  }
};

// Fetch bookings for a parent, including detailed activity information
exports.fetchBookingsForParent = async (req, res) => {
  try {
      const { parentId } = req.params;
      const { startDate, endDate } = req.query;

      // Ensure User model is imported and used correctly
      const User = require('../models/User'); // Adjust the path to where User model is defined
      
      const children = await User.find({ parent: parentId }).select('_id');
      const childIds = children.map(child => child._id);

      let query = {
          childId: { $in: childIds },
          ...(startDate && endDate ? {
              'timeSlots.startDate': { $gte: new Date(startDate) },
              'timeSlots.endDate': { $lte: new Date(endDate) },
          } : {})
      };

      const bookings = await Booking.find(query)
          .populate({
              path: 'childId',
              model: 'User',
              select: 'username'
          })
          .populate({
              path: 'activityId',
              model: 'Activity',
              select: 'name description startDate endDate timeSlots'
          });

      res.json(bookings);
  } catch (error) {
      res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};


exports.fetchBookingsForParentAndChild = async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    
    const children = await User.find({ parent: parentId }).select('_id');
    const childIds = children.map(child => child._id.toString());

    if (!childIds.includes(childId)) {
      return res.status(404).json({ message: "Child not found for this parent" });
    }

    const bookings = await Booking.find({ childId: childId })
      .populate({
        path: 'childId',
        model: 'User',
        select: 'username'
      })
      .populate({
        path: 'activityId',
        model: 'Activity',
        select: 'name description startDate endDate timeSlots'
      });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Error fetching bookings');
  }
};

exports.fetchActivityParticipants = async (req, res) => {
  try {
    const activityId = req.params.activityId;
    const bookings = await Booking.find({ activityId: activityId }).populate('childId');

    if (!bookings.length) {
      return res.json([]);
    }

    const participants = bookings.map(booking => {
      return booking.childId ? {
        bookingId: booking._id.toString(), 
        id: booking.childId._id,
        username: booking.childId.username,
        email: booking.childId.email,
      } : null;
    }).filter(participant => participant !== null);

    res.json(participants);
  } catch (error) {
    console.error('Error fetching activity participants:', error);
    res.status(500).json({ message: "Error fetching activity participants", error: error.message });
  }
};

exports.fetchActivities = async (req, res) => {
  try {
    const activities = await Activity.find({});

    const activitiesWithParticipantCounts = await Promise.all(activities.map(async (activity) => {
      const participantCount = await Booking.countDocuments({ activityId: activity._id });
      return { ...activity.toObject(), participantCount };
    }));

    res.json(activitiesWithParticipantCounts);
  } catch (error) {
    res.status(500).send({ message: "Error fetching activities with participant counts", error: error.message });
  }
};

// Method to cancel a class
exports.cancelClass = async (req, res) => {
  const { childId, activityId, slotDate, startTime } = req.body;
  
  console.log("Received cancellation:", req.body);  // Debugging line to check incoming data

  if (!slotDate || !startTime) {
      return res.status(400).json({ message: 'Date and start time are required for cancellation.' });
  }

  try {
      const updatedBooking = await Booking.findOneAndUpdate(
          { childId: childId, activityId: activityId },
          { $push: { cancellations: { date: new Date(slotDate), startTime: startTime, reason: 'Parent cancellation' } } },
          { new: true }
      );
      
      if (!updatedBooking) {
          return res.status(404).json({ message: 'Booking not found' });
      }

      res.json({ message: 'Class cancelled successfully.', updatedBooking });
  } catch (error) {
      res.status(500).json({ message: 'Failed to cancel class', error: error.message });
  }
};


// Method to revert a cancellation
exports.revertCancellation = async (req, res) => {
  const { childId, activityId, slotDate } = req.body;  
  
  try {
    // Update the booking document by pulling a cancellation record based only on date
    const updatedBooking = await Booking.findOneAndUpdate(
      { childId: childId, activityId: activityId },
      { $pull: { cancellations: { date: new Date(slotDate) } } },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Cancellation reverted successfully.', updatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to revert cancellation', error: error.message });
  }
};

// Fetch cancellations for a specific child and activity
exports.fetchCancellations = async (req, res) => {
  try {
    const { childId, activityId } = req.params;

    // Ensure both childId and activityId are provided
    if (!childId || !activityId) {
      return res.status(400).json({ message: "Child ID and Activity ID are required" });
    }

    const bookings = await Booking.find({
      childId: childId,
      activityId: activityId
    }, 'cancellations')
    .populate({
      path: 'childId',
      select: 'username'
    })
    .populate({
      path: 'activityId',
      select: 'name'
    });

    // Filter to only return bookings with cancellations
    const filteredBookings = bookings.filter(booking => booking.cancellations.length > 0);

    res.json(filteredBookings);
  } catch (error) {
    console.error('Error fetching cancellations:', error);
    res.status(500).json({ message: "Error fetching cancellations", error: error.message });
  }
};

exports.fetchBookingStatusForActivityAndParent = async (req, res) => {
  try {
    const { activityId, parentId } = req.params;
    
    // Find all children of the parent
    const children = await User.find({ parent: parentId }).select('_id');
    const childIds = children.map(child => child._id);

    // Find bookings for the activity made by any of the parent's children
    const bookings = await Booking.find({
      activityId: activityId,
      childId: { $in: childIds },
      cancellations: { $size: 0 } 
    }).populate('childId', 'username');

    // Map results to include necessary details
    const bookingDetails = bookings.map(booking => {
      return {
        bookingId: booking._id,
        activityId: activityId,
        childName: booking.childId.username,
        status: 'Booked' 
      };
    });

    if (bookingDetails.length === 0) {
      res.status(200).json([]); 
    } else {
      res.json(bookingDetails);
    }
  } catch (error) {
    console.error('Error fetching booking status:', error);
    res.status(500).json({ message: "Error fetching booking status", error: error.message });
  }
};

exports.fetchBookingStatusForActivityAndParent = async (req, res) => {
  const { activityId, parentId } = req.params;

  try {
      // Fetch parent to confirm they have the childId
      const parent = await User.findById(parentId);
      if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
      }

      // Fetch children of the parent
      const children = parent.children; // Assuming 'children' are stored directly in the User model

      // Fetch bookings for the activity made by any of the parent's children
      const bookings = await Booking.find({
          activityId: activityId,
          childId: { $in: children }
      }).populate('childId', 'username');

      if (!bookings.length) {
          return res.status(404).json({ message: "No bookings found for this activity and parent's children" });
      }

      // Mapping the results to return relevant booking information
      const bookingDetails = bookings.map(booking => ({
          bookingId: booking._id,
          activityId: activityId,
          childName: booking.childId.username,
          status: booking.status
      }));

      res.json(bookingDetails);
  } catch (error) {
      console.error('Error fetching booking status:', error);
      res.status(500).json({ message: "Error fetching booking status", error: error.message });
  }
};
