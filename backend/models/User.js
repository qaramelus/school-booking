// User.js
const mongoose = require('mongoose');
const { generateUsername } = require('../middlewares/userMiddleware');
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
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'parent', 'teacher', 'child']
  },
  parent: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Applying middleware
userSchema.pre('save', generateUsername);

module.exports = mongoose.model('User', userSchema)
