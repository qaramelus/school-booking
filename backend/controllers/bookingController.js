// bookingController.js
const Booking = require('../models/Booking'); 
const User = require('../models/User');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const newBooking = await Booking.create({
      childId: req.body.childId,
      activityId: req.body.activityId,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: 'Failed to book activity', error: error.message });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully', deletedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
};

// Fetch bookings for a parent, including detailed activity information
exports.fetchBookingsForParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { startDate, endDate } = req.query;

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
      cancellations: { $size: 0 } // Ensure no cancellations are present
    }).populate('childId', 'username');

    // Map results to include necessary details
    const bookingDetails = bookings.map(booking => {
      return {
        bookingId: booking._id,
        activityId: activityId,
        childName: booking.childId.username,
        status: 'Booked' // Only booked entries are returned, hence status is always 'Booked'
      };
    });

    if (bookingDetails.length === 0) {
      res.status(200).json([]); // Return an empty array with a 200 OK status
    } else {
      res.json(bookingDetails);
    }
  } catch (error) {
    console.error('Error fetching booking status:', error);
    res.status(500).json({ message: "Error fetching booking status", error: error.message });
  }
};