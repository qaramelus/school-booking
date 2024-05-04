const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Pre-save middleware to generate username if not present
userSchema.pre('save', function(next) {
    if (!this.username && this.firstName && this.lastName) {
        this.username = `${this.firstName.toLowerCase()}${this.lastName.toLowerCase()}`;
    }
    next();
});

// Pre-save middleware to encrypt password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
