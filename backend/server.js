const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json()); // For parsing application/json

require('dotenv').config(); // Ensure this is at the top of your file

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
}).catch(err => console.log(err));

// Use Routes
app.use('/api/auth', authRoutes); // Use the auth routes

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
