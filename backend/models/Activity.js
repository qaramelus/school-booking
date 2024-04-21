// Activity.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Location = require('./Location'); // Import the Location model

const timeSlotSchema = new Schema({
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location' } // Reference to the Location model
});

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
