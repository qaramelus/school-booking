// Activity.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Location = require('./Location'); // Import the Location model

// New Time Slot Schema including session changes
const timeSlotSchema = new Schema({
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location' },
  // Add session modifications to handle cancellations and reschedules
  sessionChanges: [{
    date: Date,
    status: { type: String, enum: ['cancelled', 'rescheduled'] },
    rescheduledTo: Date
  }]
});

// Updated Activity Schema
const activitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [timeSlotSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  maxParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  waitlistCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Activity', activitySchema);
