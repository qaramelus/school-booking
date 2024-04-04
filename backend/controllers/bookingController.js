const Booking = require('../models/booking');
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

// Fetch bookings for a parent, including detailed activity information
exports.fetchBookingsForParent = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const children = await User.find({ parent: parentId }).select('_id');
    const childIds = children.map(child => child._id);

    // Fetch bookings that belong to these children and populate related fields
    const bookings = await Booking.find({ childId: { $in: childIds } })
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
