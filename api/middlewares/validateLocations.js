const Location = require('../models/Location');
const mongoose = require('mongoose');

exports.validateLocations = async (req, res, next) => {
    try {
        const { timeSlots } = req.body;
        if (!timeSlots) return next();

        const locationChecks = timeSlots.map(slot =>
            mongoose.Types.ObjectId.isValid(slot.location) ? Location.findById(slot.location) : null
        );
        const allLocationsExist = (await Promise.all(locationChecks)).every(location => location);

        if (!allLocationsExist) {
            return res.status(400).json({ message: 'One or more locations do not exist.' });
        }

        next();
    } catch (error) {
        next(error);
    }
};
