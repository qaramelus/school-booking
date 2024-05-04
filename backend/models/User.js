const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: {
        street: { type: String },
        city: { type: String },
        zipCode: { type: String }
    },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'parent', 'teacher', 'child'] },
    username: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);
