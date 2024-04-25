// Attendance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  childId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  attended: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('Attendance', attendanceSchema);

