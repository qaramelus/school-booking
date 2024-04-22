// utils/sessionCalculator.js

const Activity = require('../models/Activity');

// Converts day of the week to numerical representation (Sunday = 0, Monday = 1, ...)
function dayOfWeekToNumber(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
}

// Calculates the next occurrence of a given weekday from a specified date
function nextDay(date, dayOfWeek) {
    date = new Date(date.getTime()); // Clone the date to avoid modifying the original
    const dayDiff = (dayOfWeek - date.getDay() + 7) % 7;
    if (dayDiff !== 0) {  // If not already on the required day, adjust the date
        date.setDate(date.getDate() + dayDiff);
    }
    return date;
}

// Helper function to calculate all sessions for a given timeslot
function calculateSessionsPerTimeslot(slot, startDate, endDate) {
    let sessions = [];
    let currentDate = nextDay(new Date(startDate), dayOfWeekToNumber(slot.dayOfWeek));

    while (currentDate <= new Date(endDate)) {
        sessions.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: slot.startTime,
            endTime: slot.endTime
        });
        currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
    }

    // Sort sessions by date to ensure they are in chronological order
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sessions;
}

module.exports = {
    calculateSessionsPerTimeslot
};
