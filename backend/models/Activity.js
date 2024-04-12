// Activity.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeSlotSchema = new Schema({
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true }, // Format: 'HH:MM'
  endTime: { type: String, required: true }, // Format: 'HH:MM'
});

const activitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [timeSlotSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teachers: [{ 
     type: Schema.Types.ObjectId, 
     ref: 'User', 
     required: true 
   }],
});

module.exports = mongoose.model('Activity', activitySchema);
