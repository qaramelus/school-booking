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

const fetchBookingsForChild = async () => {
  try {
    const parentId = localStorage.getItem('parent-id');
    if (!parentId) throw new Error("Parent ID is undefined.");

    const { data } = await API.get(`/parent/${parentId}/bookings`);
    const events = data.map(booking => ({
      title: booking.activityId.name,
      start: booking.activityId.startDate,
      end: booking.activityId.endDate,
    }));

    if (calendarEl.value) {
      let calendar = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
      });
      calendar.removeAllEvents(); 
      calendar.addEventSource(events); 
      calendar.render();
    }
  } catch (error) {
    console.error("There was an error fetching the bookings:", error.message);
  }
};
