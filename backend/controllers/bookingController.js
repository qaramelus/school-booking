const Booking = require('../models/booking'); 
const User = require('../models/User'); 

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

exports.fetchBookingsForParent = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const children = await User.find({ parent: parentId }).select('_id');
    const childIds = children.map(child => child._id);

    const bookings = await Booking.find({ childId: { $in: childIds } })
    .populate({
        path: 'childId',
        model: 'User', 
        select: 'username'
    })
    .populate({
        path: 'activityId',
        model: 'Activity', 
        select: 'name date description'
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

