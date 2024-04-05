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
    const { parentId } = req.params;
    const { startDate, endDate } = req.query; // Accepting startDate and endDate as query parameters

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
    
    // Find the children of the parent to ensure the child belongs to the parent making the request
    const children = await User.find({ parent: parentId }).select('_id');
    const childIds = children.map(child => child._id.toString());

    // Check if the requested childId is one of the parent's children
    if (!childIds.includes(childId)) {
      return res.status(404).json({ message: "Child not found for this parent" });
    }

    const bookings = await Booking.find({ 
      childId: childId // Directly use childId
    })
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


