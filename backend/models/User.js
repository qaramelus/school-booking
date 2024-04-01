const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  // Reference to parent User
  parent: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Set to false because a parent user won't have this field.
  },
  // Optional: References to children Users
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('User', userSchema);
