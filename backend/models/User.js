// User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'parent', 'teacher', 'child'],  // Added 'child' here
  },
  parent: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: function() { return this.role === 'parent'; } 
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'parent'; } 
  }]
});


module.exports = mongoose.model('User', userSchema);
