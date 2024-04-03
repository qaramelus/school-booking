// Activity.js
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true }, // Format: 'HH:MM'
  endTime: { type: String, required: true }, // Format: 'HH:MM'
});

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [timeSlotSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Activity', activitySchema);
