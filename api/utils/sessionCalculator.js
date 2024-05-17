// utils/sessionCalculator.js
const moment = require('moment');

function dayOfWeekToNumber(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
}

function nextDay(date, dayOfWeek) {
    date = new Date(date.getTime()); 
    const dayDiff = (dayOfWeek - date.getDay() + 7) % 7;
    if (dayDiff !== 0) {
        date.setDate(date.getDate() + dayDiff);
    }
    return date;
}

// Include teachers in the session details
function calculateSessionsPerTimeslot(slot, startDate, endDate, teachers) {
    let sessions = [];
    let currentDate = nextDay(new Date(startDate), dayOfWeekToNumber(slot.dayOfWeek));

    while (currentDate <= new Date(endDate)) {
        sessions.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: slot.startTime,
            endTime: slot.endTime,
            teachers: teachers
        });
        currentDate.setDate(currentDate.getDate() + 7);
    }

    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sessions;
}

function calculateSessionsPerTimeslotWithChanges(slot, startDate, endDate, teachers) {
    let sessions = [];
    let currentDate = nextDay(new Date(startDate), dayOfWeekToNumber(slot.dayOfWeek));

    while (currentDate <= new Date(endDate)) {
        const dateString = currentDate.toISOString().split('T')[0];
        const change = slot.sessionChanges.find(change => moment(change.date).isSame(dateString, 'day'));
        
        if (!change) {
            sessions.push({
                date: dateString,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'scheduled',
                teachers: teachers
            });
        } else if (change.status === 'cancelled') {
            sessions.push({
                date: dateString,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'cancelled',
                teachers: teachers
            });
        } else if (change.status === 'rescheduled') {
            sessions.push({
                date: moment(change.rescheduledTo).format('YYYY-MM-DD'),
                startTime: change.newStartTime || slot.startTime,
                endTime: change.newEndTime || slot.endTime,
                status: 'rescheduled',
                teachers: teachers
            });
        }
        currentDate.setDate(currentDate.getDate() + 7);
    }

    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sessions;
}

module.exports = {
    calculateSessionsPerTimeslot,
    calculateSessionsPerTimeslotWithChanges
};
