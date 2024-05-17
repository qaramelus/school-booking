const User = require('../models/User');
const mongoose = require('mongoose');

exports.validateTeachers = async (req, res, next) => {
    try {
        const { teachers } = req.body;
        if (!teachers) return next();

        const teacherChecks = teachers.map(teacherId =>
            mongoose.Types.ObjectId.isValid(teacherId) ? User.findById(teacherId) : null
        );
        const allTeachersExist = (await Promise.all(teacherChecks)).every(user => user);

        if (!allTeachersExist) {
            return res.status(400).json({ message: 'One or more teachers do not exist.' });
        }

        next();
    } catch (error) {
        next(error);
    }
};
