// User.js
const mongoose = require('mongoose');
const { generateUsername } = require('../middlewares/userMiddleware');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  firstName: { type: String, required: function() { return this.role === 'parent'; } },
  lastName: { type: String, required: function() { return this.role === 'parent'; } },
  address: {
    street: { type: String, required: function() { return this.role === 'parent'; } },
    city: { type: String, required: function() { return this.role === 'parent'; } },
    zipCode: { type: String, required: function() { return this.role === 'parent'; } }
  },
  phone: { type: String, required: function() { return this.role === 'parent'; } },
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
    ref: 'User',
    required: function() { return this.role === 'child'; }
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'parent'; } 
  }]
});

// Applying middleware
userSchema.pre('save', generateUsername);

module.exports = mongoose.model('User', userSchema);
