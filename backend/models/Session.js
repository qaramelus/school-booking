// Sessions.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Session Schema
const sessionSchema = new Schema({
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    date: { type: Date, required: true }, // The specific date the session is held
    startTime: { type: String, required: true }, // Start time of the session
    endTime: { type: String, required: true }, // End time of the session
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    rescheduledTo: { type: Date }, // New date if the session is rescheduled
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Who created the session
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Teachers for the session
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Children booked into the session
});

module.exports = mongoose.model('Session', sessionSchema);
